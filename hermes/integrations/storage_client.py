"""S3 upload client — the missing link between agents that write bytes locally
(narration-synthesis, music-generation, asset-sourcing all download/synthesize to
/tmp on the Hermes/Railway box) and Video Assembly's Remotion-on-Lambda render,
which executes in AWS's own sandbox and cannot read a path on the Railway
filesystem. Every asset Remotion's inputProps references must be a URL it can
fetch over HTTPS; this client is what makes that true.

Uses a presigned GET URL rather than a public bucket/ACL, since the asset only
needs to be reachable for the few minutes between upload and the Lambda render
actually fetching it.
"""
import os
import uuid
import boto3

BUCKET = os.getenv("ASSET_UPLOAD_S3_BUCKET", "")
REGION = os.getenv("ASSET_UPLOAD_AWS_REGION") or os.getenv("REMOTION_AWS_REGION", "us-east-1")
PRESIGNED_URL_EXPIRY_SECONDS = int(os.getenv("ASSET_UPLOAD_URL_EXPIRY_SECONDS", "86400"))

_client = None


def _get_client():
    global _client
    if _client is None:
        _client = boto3.client("s3", region_name=REGION)
    return _client


def upload_and_get_url(local_path: str, key_prefix: str) -> str:
    if not BUCKET:
        raise RuntimeError("ASSET_UPLOAD_S3_BUCKET not set")
    extension = os.path.splitext(local_path)[1]
    key = f"{key_prefix}/{uuid.uuid4().hex}{extension}"
    client = _get_client()
    client.upload_file(local_path, BUCKET, key)
    return client.generate_presigned_url(
        "get_object", Params={"Bucket": BUCKET, "Key": key}, ExpiresIn=PRESIGNED_URL_EXPIRY_SECONDS
    )
