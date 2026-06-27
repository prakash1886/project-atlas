"""Verbatim copy of hermes/temporal_codec.py -- kept in sync manually since this
MCP server is deployed independently of Hermes, but both must agree on the same
AES-256-GCM scheme/TEMPORAL_ENCRYPTION_KEY to decode payloads on the same
Temporal cluster as Hermes's worker and the NestJS-side TS workers.
"""
import base64
import hashlib
import json
import os
from typing import List

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from temporalio.api.common.v1 import Payload
from temporalio.converter import PayloadCodec

_ENCODING_KEY = "encoding"
_ENCRYPTED_ENCODING = b"binary/encrypted"


def _derive_key(secret_key_string: str) -> bytes:
    return hashlib.sha256(secret_key_string.encode("utf-8")).digest()


class EncryptionCodec(PayloadCodec):
    def __init__(self, secret_key_string: str = None):
        secret_key_string = secret_key_string or os.getenv(
            "TEMPORAL_ENCRYPTION_KEY", "default-temporary-insecure-32-chars-key"
        )
        self._aesgcm = AESGCM(_derive_key(secret_key_string))

    async def encode(self, payloads: List[Payload]) -> List[Payload]:
        encoded = []
        for payload in payloads:
            if not payload.data:
                encoded.append(payload)
                continue
            iv = os.urandom(12)
            envelope = json.dumps({
                "metadata": {k: base64.b64encode(v).decode("ascii") for k, v in payload.metadata.items()},
                "data": base64.b64encode(payload.data).decode("ascii"),
            }).encode("utf-8")
            ciphertext_and_tag = self._aesgcm.encrypt(iv, envelope, None)
            new_payload = Payload()
            new_payload.metadata[_ENCODING_KEY] = _ENCRYPTED_ENCODING
            new_payload.data = iv + ciphertext_and_tag
            encoded.append(new_payload)
        return encoded

    async def decode(self, payloads: List[Payload]) -> List[Payload]:
        decoded = []
        for payload in payloads:
            encoding = payload.metadata.get(_ENCODING_KEY)
            if not payload.data or encoding != _ENCRYPTED_ENCODING:
                decoded.append(payload)
                continue
            raw = payload.data
            iv, ciphertext_and_tag = raw[:12], raw[12:]
            envelope = json.loads(self._aesgcm.decrypt(iv, ciphertext_and_tag, None).decode("utf-8"))
            new_payload = Payload()
            for key, value in envelope["metadata"].items():
                new_payload.metadata[key] = base64.b64decode(value)
            new_payload.data = base64.b64decode(envelope["data"])
            decoded.append(new_payload)
        return decoded
