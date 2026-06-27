#!/usr/bin/env node
// Thin CLI wrapper around @remotion/lambda's client SDK, invoked by
// hermes/integrations/remotion_client.py via subprocess. AWS credentials are picked
// up automatically by the AWS SDK from the standard AWS_ACCESS_KEY_ID /
// AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN env vars — not handled here.
//
// Usage:
//   node render.mjs start '<json inputProps + composition>'
//   node render.mjs progress '<json {renderId, bucketName}>'
import { renderMediaOnLambda, getRenderProgress } from "@remotion/lambda/client";

const [, , action, rawArgs] = process.argv;
const args = JSON.parse(rawArgs || "{}");

const region = process.env.REMOTION_AWS_REGION;
const functionName = process.env.REMOTION_LAMBDA_FUNCTION_NAME;
const serveUrl = process.env.REMOTION_SERVE_URL;

if (!region || !functionName || !serveUrl) {
  console.error(JSON.stringify({
    error: "REMOTION_AWS_REGION / REMOTION_LAMBDA_FUNCTION_NAME / REMOTION_SERVE_URL must be set "
      + "(output of `npx remotion lambda functions deploy` and `npx remotion lambda sites create`)."
  }));
  process.exit(1);
}

try {
  if (action === "start") {
    const result = await renderMediaOnLambda({
      region,
      functionName,
      serveUrl,
      composition: args.composition,
      inputProps: args.inputProps,
      codec: args.codec || "h264",
    });
    console.log(JSON.stringify(result));
  } else if (action === "progress") {
    const result = await getRenderProgress({
      renderId: args.renderId,
      bucketName: args.bucketName,
      functionName,
      region,
    });
    console.log(JSON.stringify(result));
  } else {
    throw new Error(`Unknown action '${action}', expected 'start' or 'progress'`);
  }
} catch (err) {
  console.error(JSON.stringify({ error: err.message || String(err) }));
  process.exit(1);
}
