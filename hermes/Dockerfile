FROM python:3.11-slim

# ffmpeg provides both ffmpeg and ffprobe, needed by narration-synthesis,
# music-generation and render-qc. Node is needed to run render.mjs, the
# @remotion/lambda CLI wrapper video-assembly shells out to (Railway's
# Railpack builder doesn't honor nixpacks.toml, so this Dockerfile is the
# reliable way to get both runtimes into the same image).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg curl git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY integrations/remotion/package.json integrations/remotion/package-lock.json integrations/remotion/
RUN npm install --prefix integrations/remotion

COPY . .

EXPOSE 8080
CMD ["python", "app.py"]
