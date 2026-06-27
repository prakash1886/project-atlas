import { defineSignal, setHandler, condition } from '@temporalio/workflow';

/** A human reviewer's PASS/REJECT decision on a content_assets row (submit-editorial-review skill). */
export interface EditorialVote {
  decision: 'PASS' | 'REJECT';
  notes?: string;
}

export const editorialVoteSignal = defineSignal<[EditorialVote]>('editorialVote');

/**
 * Suspends until a human signals a PASS/REJECT vote via the editorialVote signal (sent through
 * the /api/reviews/:id/vote REST endpoint, or directly via temporal-bridge's signal_workflow).
 * No activities -- this workflow only waits.
 */
export async function editorialReviewWorkflow(input: { contentAssetId: string }): Promise<EditorialVote> {
  let vote: EditorialVote | null = null;
  setHandler(editorialVoteSignal, (v) => {
    vote = v;
  });

  await condition(() => vote !== null, '30 days');
  if (!vote) {
    throw new Error(`editorial review timed out for contentAssetId=${input.contentAssetId}`);
  }
  return vote;
}
