// Hard cost-control caps for the AtlasStoryVideo composition. These are enforced
// inside calculateMetadata (see Root.tsx) so a bad/buggy input from
// video-assembly/executor.py can never produce a render longer or larger than
// this regardless of what it requests — the Lambda function bills by duration x
// memory, so this is the actual money-leak guard, not just a UX limit.
export const FPS = 30;
export const MAX_DURATION_SECONDS = 180; // 3 min hard ceiling per render
export const MAX_CLIPS = 20;
export const WIDTH = 1080;
export const HEIGHT = 1920;
