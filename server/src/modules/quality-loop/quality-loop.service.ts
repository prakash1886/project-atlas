import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Pool } from 'pg';
import { LlmService } from '../llm/llm.service.js';

export interface VerifyClaimsResult {
  generated_at: string;
  contradictions: { claim: string; issue: string; severity: 'low' | 'medium' | 'high' }[];
  overall_verdict: 'pass' | 'needs_review' | 'fail';
}

const SEVERITY_PENALTY: Record<string, number> = { high: 30, medium: 10, low: 5 };

/**
 * orchestrate-content-run's quality loop: gather-citations + generate-psych-profile -> draft-video-script
 * -> verify-claims, scored deterministically (not by asking the LLM to grade itself), looped up to
 * 3 times with feedback, durable via qualityLoopWorkflow.
 */
@Injectable()
export class QualityLoopService {
  private readonly logger = new Logger(QualityLoopService.name);

  constructor(
    @Inject('DATABASE_POOL') private readonly db: Pool,
    private readonly llm: LlmService
  ) {}

  /** Computation-first scoring (same precedent as P3's calculateOpportunityScore) -- no LLM self-grading. */
  scoreFromVerification(result: VerifyClaimsResult): number {
    const penalty = (result.contradictions ?? []).reduce((sum, c) => sum + (SEVERITY_PENALTY[c.severity] ?? 0), 0);
    const score = Math.max(0, 100 - penalty);
    this.logger.log(`[scoreFromVerification] ${result.contradictions?.length ?? 0} contradictions -> score=${score}`);
    return score;
  }

  async createContentAsset(topic: string): Promise<number> {
    const result = await this.db.query(`INSERT INTO content_assets (topic, status) VALUES ($1, 'DRAFT') RETURNING id`, [topic]);
    return result.rows[0].id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateContentAsset(id: number, fields: { script_content?: string; status?: string }): Promise<void> {
    await this.db.query(`UPDATE content_assets SET script_content = COALESCE($1, script_content), status = COALESCE($2, status) WHERE id = $3`, [
      fields.script_content ?? null,
      fields.status ?? null,
      id,
    ]);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gatherCitations(topic: string): Promise<any> {
    return this.llm.runJudgmentAgent('gather-citations', `gather facts about ${topic}`, { topic });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatePsychProfile(subjectEntity: string): Promise<any> {
    return this.llm.runJudgmentAgent('generate-psych-profile', `profile ${subjectEntity}`, { subject_entity: subjectEntity });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draftVideoScript(dossier: any, psychProfile: any, durationMinutes: number, revisionNotes?: any): Promise<any> {
    return this.llm.runJudgmentAgent('script', 'draft the documentary script', {
      narrative_outline: JSON.stringify({ dossier, psych_profile: psychProfile }),
      format: 'long_form',
      duration_minutes: durationMinutes,
      revision_notes: revisionNotes,
    });
  }

  verifyClaims(draftText: string): Promise<VerifyClaimsResult> {
    return this.llm.runJudgmentAgent('verify-claims', 'audit this draft for factual contradictions', { draft_text: draftText });
  }
}
