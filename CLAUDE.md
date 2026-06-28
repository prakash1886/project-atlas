# Project Atlas

## Typechecking

`npx tsc --noEmit -p .` only checks the frontend (root `tsconfig.json` references `tsconfig.app.json`/`tsconfig.node.json`). It does **not** check `server/` at all — a real type error there can pass this check yet fail the actual Railway build.

The server is typechecked separately via `tsconfig.server.json` (this is what `npm run build`'s `server:build` step runs).

Always run **both** before considering a change typesafe:

```
npm run typecheck
```

which runs `tsc -p . --noEmit && tsc -p tsconfig.server.json --noEmit`. Don't rely on `tsc --noEmit -p .` alone.

There is no CI pipeline yet — this is the only safety net until one exists.
