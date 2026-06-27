import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type {AtlasStoryVideoProps} from "./schema";

const isImageUrl = (url: string) => /\.(png|jpe?g|webp|gif)$/i.test(url);

function ClipLayer({clips}: {clips: string[]}) {
  const {durationInFrames, fps} = useVideoConfig();
  if (clips.length === 0) return null;
  const framesPerClip = Math.floor(durationInFrames / clips.length);

  return (
    <>
      {clips.map((url, i) => {
        const from = i * framesPerClip;
        const isLast = i === clips.length - 1;
        const duration = isLast ? durationInFrames - from : framesPerClip;
        if (duration <= 0) return null;
        return (
          <Sequence key={url + i} from={from} durationInFrames={duration} layout="none">
            <AbsoluteFill>
              {isImageUrl(url) ? (
                <Img src={url} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              ) : (
                <OffthreadVideo src={url} style={{width: "100%", height: "100%", objectFit: "cover"}} />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </>
  );
}

function Captions({cues}: {cues: AtlasStoryVideoProps["captionCues"]}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const active = cues.find((c) => seconds >= c.start_seconds && seconds < c.end_seconds);
  if (!active) return null;

  return (
    <AbsoluteFill style={{justifyContent: "flex-end", alignItems: "center", paddingBottom: 160}}>
      <div
        style={{
          maxWidth: "85%",
          padding: "12px 20px",
          background: "rgba(0,0,0,0.55)",
          borderRadius: 12,
          color: "white",
          fontSize: 42,
          fontWeight: 600,
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        {active.text}
      </div>
    </AbsoluteFill>
  );
}

export function AtlasStoryVideo({clips, narrationUrl, musicUrl, captionCues}: AtlasStoryVideoProps) {
  return (
    <AbsoluteFill style={{backgroundColor: "black"}}>
      <ClipLayer clips={clips} />
      <Captions cues={captionCues} />
      <Audio src={narrationUrl} />
      {musicUrl ? <Audio src={musicUrl} volume={0.15} /> : null}
    </AbsoluteFill>
  );
}
