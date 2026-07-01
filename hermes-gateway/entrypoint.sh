#!/bin/sh
# Seeds $HERMES_HOME/config.yaml from the image's template on first boot
# only. Never overwrites an existing config -- the volume is where hermes_cli
# also writes the NexLev OAuth token cache after the one-time
# `hermes mcp login nexlev` handshake (run manually via `railway ssh` per the
# deployment notes), and clobbering it on every deploy would force
# re-authentication every time this service redeploys.
set -e

mkdir -p "$HERMES_HOME"

if [ ! -f "$HERMES_HOME/config.yaml" ]; then
    cp /app/config.template.yaml "$HERMES_HOME/config.yaml"
fi

# Patch-in step for mcp_servers entries added to the template *after* this
# service's first boot -- there's no real shell access into the deployed
# container (railway shell only injects env vars into a local subshell, it
# does not exec into the running instance), so config.yaml on the volume
# can't be hand-edited. Each new entry gets its own idempotent check here,
# inserted right after nexlev's block (NOT appended at end-of-file -- this
# config has an unrelated top-level `agent:` key after mcp_servers, and
# appending past that would de-nest the new entry from mcp_servers: and
# produce invalid YAML). Leaves the rest of the file, including nexlev's
# OAuth token cache, untouched.
if ! grep -q '^  vidiq:' "$HERMES_HOME/config.yaml"; then
    sed -i '/^    auth: oauth$/a\
  vidiq:\
    url: "https://mcp.vidiq.com/mcp"\
    headers:\
      Authorization: "Bearer ${VIDIQ_API_KEY}"' "$HERMES_HOME/config.yaml"
fi

if ! grep -q '^  brightdata:' "$HERMES_HOME/config.yaml"; then
    sed -i '/^    Authorization: "Bearer \${VIDIQ_API_KEY}"$/a\
  brightdata:\
    url: "https://mcp.brightdata.com/mcp?token=${BRIGHTDATA_API_KEY}"' "$HERMES_HOME/config.yaml"
fi

exec hermes gateway run --no-supervise
