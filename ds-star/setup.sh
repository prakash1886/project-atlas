#!/bin/bash
# DS-STAR Hostinger Setup Script
# Installs Python dependencies and runs the FastAPI sidecar server

set -e

echo "=== DS-STAR Setup script running ==="

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is not installed. Please install Python 3.9+ first."
    exit 1
fi

# Create python virtual environment if not present
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment .venv..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install pip packages
echo "Installing dependencies..."
pip install --upgrade pip
pip install fastapi uvicorn pyyaml pydantic litellm google-generativeai

# Create data directory for CSV/JSON files
mkdir -p data

echo "=== Installation complete ==="
echo ""
echo "To run the DS-STAR sidecar API server, run:"
echo "  source .venv/bin/activate"
echo "  export GEMINI_API_KEY=\"your-gemini-key\""
echo "  export DSSTAR_API_KEY=\"default-ds-star-api-secret-key-12345\""
echo "  python api.py"
echo ""
echo "Or configure a systemd service file on Hostinger to keep it running permanently."
