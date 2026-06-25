"""
Quick auth check for Plane API.
Loads PLANE_API token from .env (never prints it) and verifies access
to the 'cgos' workspace.
"""
import os
import sys
from dotenv import load_dotenv
import requests

load_dotenv()

API_KEY = os.getenv("PLANE_API")
WORKSPACE_SLUG = os.getenv("PLANE_WORKSPACE_SLUG", "cgos")
BASE_URL = os.getenv("PLANE_BASE_URL", "https://api.plane.so")

if not API_KEY:
    print("ERROR: PLANE_API not found in .env")
    sys.exit(1)

headers = {
    "x-api-key": API_KEY,
    "Content-Type": "application/json",
}

def check_user():
    resp = requests.get(f"{BASE_URL}/api/v1/users/me/", headers=headers, timeout=15)
    print(f"GET /users/me/ -> {resp.status_code}")
    if resp.ok:
        data = resp.json()
        print(f"  Authenticated as: {data.get('email') or data.get('display_name')}")
    else:
        print(f"  Response: {resp.text[:300]}")
    return resp.ok

def check_workspace():
    resp = requests.get(f"{BASE_URL}/api/v1/workspaces/{WORKSPACE_SLUG}/", headers=headers, timeout=15)
    print(f"GET /workspaces/{WORKSPACE_SLUG}/ -> {resp.status_code}")
    if resp.ok:
        data = resp.json()
        print(f"  Workspace: {data.get('name')} (id={data.get('id')})")
    else:
        print(f"  Response: {resp.text[:300]}")
    return resp.ok

if __name__ == "__main__":
    ok1 = check_user()
    ok2 = check_workspace()
    sys.exit(0 if (ok1 and ok2) else 1)
