import { proxyActivities } from '@temporalio/workflow';
import type { QualityLoopActivities } from '../../quality-loop/quality-loop.activities.js';

const {
  createContentAsset,
  updateContentAsset,
  gatherCitations,
  generatePsychProfile,
  draftVideoScript,
  verifyClaims,
  scoreFromVerification,
} = proxyActivities<QualityLoopActivities>({
  taskQueue: 'quality-loop',
  startToCloseTimeout: '3 minutes',
  retry: {
    maximumAttempts: 3,
    initialInterval: '5s',
    backoffCoefficient: 2,
    maximumInterval: '30s',
  },
});

const QUALITY_THRESHOLD = 90;
const MAX_ITERATIONS = 3;

export interface QualityLoopResult {
  contentAssetId: number;
  finalScore: number;
  passed: boolean;
}

/**
 * orchestrate-content-run's quality loop (SOUL.md: "never let a run loop forever -- respect
 * max-iterations"), made durable: the iteration count and accumulated revision feedback live in
 * Temporal workflow history, so a worker restart resumes exactly where it left off instead of
 * losing all progress, the same way every other workflow in this codebase is durable.
 */
export async function qualityLoopWorkflow(input: {
  topic: string;
  subjectEntity: string;
  durationMinutes: number;
}): Promise<QualityLoopResult> {
  const contentAssetId = await createContentAsset(input.topic);

  const [dossier, psychProfile] = await Promise.all([
    gatherCitations(input.topic),
    generatePsychProfile(input.subjectEntity),
  ]);

  let finalScore = 0;
  let revisionNotes: unknown = undefined;

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    const draft = await draftVideoScript(dossier, psychProfile, input.durationMinutes, revisionNotes);
    const verification = await verifyClaims(draft.script_text);
    finalScore = await scoreFromVerification(verification);

    if (finalScore >= QUALITY_THRESHOLD) {
      await updateContentAsset(contentAssetId, { script_content: draft.script_text, status: 'DRAFT' });
      return { contentAssetId, finalScore, passed: true };
    }

    revisionNotes = verification.contradictions;
    await updateContentAsset(contentAssetId, { script_content: draft.script_text, status: 'NEEDS_REVISION' });
  }

  return { contentAssetId, finalScore, passed: false };
}
