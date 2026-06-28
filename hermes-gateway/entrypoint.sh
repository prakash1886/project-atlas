#!/bin/sh
# Seeds the persistent volume's config.yaml from the image's template on
# first boot only. Never overwrites an existing config -- the volume is
# where hermes_cli also writes the NexLev OAuth token cache after the
# one-time `hermes mcp login nexlev` handshake (run manually via `railway
# shell` per the deployment notes), and clobbering it on every deploy would
# force re-authentication every time this service redeploys.
set -e

CONFIG_DIR="$(dirname "$HERMES_CONFIG")"
mkdir -p "$CONFIG_DIR"

if [ ! -f "$HERMES_CONFIG" ]; then
    cp /app/config.template.yaml "$HERMES_CONFIG"
fi

exec hermes gateway run --no-supervise
