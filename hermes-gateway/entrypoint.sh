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

exec hermes gateway run --no-supervise
