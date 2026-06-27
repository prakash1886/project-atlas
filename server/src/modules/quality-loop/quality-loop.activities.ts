import { Injectable } from '@nestjs/common';
import { QualityLoopService, type VerifyClaimsResult } from './quality-loop.service.js';

/** Temporal activity wrappers for the quality-loop task queue (orchestrate-content-run's loop). */
@Injectable()
export class QualityLoopActivities {
  constructor(private readonly qualityLoop: QualityLoopService) {}

  createContentAsset(topic: string): Promise<number> {
    return this.qualityLoop.createContentAsset(topic);
  }

  updateContentAsset(id: number, fields: { script_content?: string; status?: string }): Promise<void> {
    return this.qualityLoop.updateContentAsset(id, fields);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  gatherCitations(topic: string): Promise<any> {
    return this.qualityLoop.gatherCitations(topic);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generatePsychProfile(subjectEntity: string): Promise<any> {
    return this.qualityLoop.generatePsychProfile(subjectEntity);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  draftVideoScript(dossier: any, psychProfile: any, durationMinutes: number, revisionNotes?: any): Promise<any> {
    return this.qualityLoop.draftVideoScript(dossier, psychProfile, durationMinutes, revisionNotes);
  }

  verifyClaims(draftText: string): Promise<VerifyClaimsResult> {
    return this.qualityLoop.verifyClaims(draftText);
  }

  scoreFromVerification(result: VerifyClaimsResult): number {
    return this.qualityLoop.scoreFromVerification(result);
  }
}
