import React from "react";
import {Composition, type CalculateMetadataFunction} from "remotion";
import {AtlasStoryVideo} from "./AtlasStoryVideo";
import {atlasStoryVideoSchema, type AtlasStoryVideoProps} from "./schema";
import {FPS, MAX_DURATION_SECONDS, MAX_CLIPS, WIDTH, HEIGHT} from "./limits";

// Cost guard: durationInFrames is derived from captionCues (which captioner.py
// already times to the known, real narration duration) and then hard-clamped to
// MAX_DURATION_SECONDS. This runs before Lambda allocates any rendering compute,
// so a bad upstream value can never turn into a money leak.
const calculateMetadata: CalculateMetadataFunction<AtlasStoryVideoProps> = ({props}) => {
  const lastCueEnd = props.captionCues.length > 0
    ? props.captionCues[props.captionCues.length - 1].end_seconds
    : 1;
  const cappedSeconds = Math.min(Math.max(lastCueEnd, 1), MAX_DURATION_SECONDS);
  const clips = props.clips.slice(0, MAX_CLIPS);

  return {
    durationInFrames: Math.round(cappedSeconds * FPS),
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    props: {...props, clips},
  };
};

export function RemotionRoot() {
  return (
    <Composition
      id="AtlasStoryVideo"
      component={AtlasStoryVideo}
      schema={atlasStoryVideoSchema}
      durationInFrames={MAX_DURATION_SECONDS * FPS}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        clips: [],
        narrationUrl: "",
        musicUrl: null,
        captionCues: [],
      }}
    />
  );
}
