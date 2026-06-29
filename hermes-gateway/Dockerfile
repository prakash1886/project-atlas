FROM python:3.11-slim

# aiohttp is needed by gateway/platforms/api_server.py (confirmed in its
# source comments); the [mcp] extra (mcp==1.26.0, starlette==1.0.1, per
# hermes-agent's pyproject.toml) is required for any MCP server reached over
# HTTP transport (NexLev) -- a bare install pulls no mcp package at all, and
# `hermes mcp login` fails with "mcp.client.streamable_http is not available"
# without it.
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir aiohttp "hermes-agent[mcp] @ git+https://github.com/NousResearch/hermes-agent.git"

WORKDIR /app
COPY config.yaml /app/config.template.yaml
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# HERMES_HOME (a directory, NOT a file path -- hermes_cli's get_config_path()
# always returns get_hermes_home() / "config.yaml", it does not read
# HERMES_CONFIG at all) must point inside the mounted Railway volume so the
# config (and the OAuth token cache hermes_cli writes alongside it) survive
# redeploys. entrypoint.sh seeds $HERMES_HOME/config.yaml from
# config.template.yaml on first boot only -- it never overwrites an existing
# config on the volume, since that would wipe a completed OAuth login.
ENV HERMES_HOME=/data/hermes

EXPOSE 8642
CMD ["/app/entrypoint.sh"]
