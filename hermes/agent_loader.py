"""Shared executor-loading helper for the deterministic video-production agents.
Used by both app.py's /v1/produce/{agent_id} route and orchestrator.py, which
chains several of these agents together for a full content run.
"""
import os
import sys
import importlib.util

_HERMES_ROOT = os.path.dirname(__file__)


def load_executor(agent_id: str):
    """Agent directories use hyphenated ids (visual-generation, etc.), which aren't
    valid Python module names, so executor.py is loaded by file path rather than
    `import`. hermes/ itself is added to sys.path so each executor's
    `from integrations import ...` resolves regardless of the process's cwd."""
    if _HERMES_ROOT not in sys.path:
        sys.path.insert(0, _HERMES_ROOT)
    executor_path = os.path.join(_HERMES_ROOT, "agents", agent_id, "executor.py")
    if not os.path.exists(executor_path):
        raise FileNotFoundError(f"No executor.py found for production agent '{agent_id}'")
    spec = importlib.util.spec_from_file_location(f"hermes_agent_{agent_id.replace('-', '_')}", executor_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module
