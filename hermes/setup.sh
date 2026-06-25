#!/bin/bash
# Setup script for the Hermes self-improving science agents service
set -e

echo "=== Setting up Hermes Science Service ==="

# Check Python 3
if ! command -v python3 &> /dev/null; then
    echo "ERROR: python3 is not found. Please install Python 3.9+ first."
    exit 1
fi

# Create virtual environment if missing
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment .venv..."
    python3 -m venv .venv
fi

# Activate virtual environment and install dependencies
source .venv/bin/activate
echo "Installing pip requirements..."
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Hermes setup completed successfully! ==="
echo "To run the service locally, execute:"
echo "  source .venv/bin/activate"
echo "  python app.py"
