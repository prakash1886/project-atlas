import os
import subprocess
import sys

def main():
    project_root = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(project_root, ".venv", "Scripts", "python.exe")
    graphify_bin = os.path.join(project_root, ".venv", "Scripts", "graphify.exe")
    
    if not os.path.exists(graphify_bin):
        print(f"Error: Graphify binary not found at {graphify_bin}. Please run 'npm install' and ensure the venv is set up.")
        sys.exit(1)
        
    has_api_key = any(env in os.environ for env in ["GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY", "CLAUDE_API_KEY", "ANTHROPIC_API_KEY"])
    
    if has_api_key:
        print("API Key found in environment. Running full project graphify extraction...")
        cmd = [graphify_bin, "extract", ".", "--no-cluster"]
    else:
        print("No LLM API keys found. Running structural AST-only extraction on code directories ('server' and 'src')...")
        cmd = [graphify_bin, "extract", "server", "src", "--out", ".", "--no-cluster"]
        
    print(f"Running command: {' '.join(cmd)}")
    try:
        result = subprocess.run(cmd, cwd=project_root, shell=True, capture_output=True, text=True)
        print("STDOUT:\n", result.stdout)
        if result.stderr:
            print("STDERR:\n", result.stderr)
        if result.returncode == 0:
            print("Graphify execution completed successfully.")
        else:
            print(f"Graphify exited with code {result.returncode}")
    except Exception as e:
        print(f"Error running graphify: {e}")

if __name__ == "__main__":
    main()
