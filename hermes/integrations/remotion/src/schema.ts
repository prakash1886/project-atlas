import {z} from "zod";
import {MAX_CLIPS} from "./limits";

const captionCueSchema = z.object({
  start_seconds: z.number().nonnegative(),
  end_seconds: z.number().nonnegative(),
  text: z.string(),
});

export const atlasStoryVideoSchema = z.object({
  clips: z.array(z.string().url()).max(MAX_CLIPS),
  narrationUrl: z.string().url(),
  musicUrl: z.string().url().nullable(),
  captionCues: z.array(captionCueSchema),
});

export type AtlasStoryVideoProps = z.infer<typeof atlasStoryVideoSchema>;
