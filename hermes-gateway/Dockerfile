FROM python:3.11-slim

# aiohttp is the only extra dependency gateway/platforms/api_server.py needs
# beyond the base hermes-agent install (confirmed in its source comments).
RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir aiohttp git+https://github.com/NousResearch/hermes-agent.git

WORKDIR /app
COPY config.yaml /app/config.template.yaml
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# HERMES_CONFIG must point at a path on the mounted Railway volume so the
# config (and the OAuth token cache hermes_cli writes alongside it) survive
# redeploys. entrypoint.sh seeds it from config.template.yaml on first boot
# only -- it never overwrites an existing config on the volume, since that
# would wipe a completed OAuth login.
ENV HERMES_CONFIG=/data/hermes/config.yaml

EXPOSE 8642
CMD ["/app/entrypoint.sh"]
