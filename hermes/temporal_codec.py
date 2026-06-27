"""Python port of server/src/modules/temporal/crypto/encryption-codec.ts.
Same AES-256-GCM scheme and TEMPORAL_ENCRYPTION_KEY env var as the TS side
(12-byte IV + 16-byte auth tag + ciphertext), so Hermes's workflow history is
encrypted at rest identically to the NestJS-side ad-automation/trend-signals/
ds-star-science workers on the same Temporal cluster.
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
            # Encrypt the *entire* original payload (metadata + data), not just
            # data. Encrypting only payload.data and then overwriting the
            # "encoding" metadata key with our own "binary/encrypted" marker
            # permanently destroys the original encoding (e.g. "json/plain")
            # that the default payload converter needs to deserialize the bytes
            # after decryption -- decode() had no way to recover it. Wrapping the
            # whole payload as the plaintext lets decode() restore it exactly.
            envelope = json.dumps({
                "metadata": {k: base64.b64encode(v).decode("ascii") for k, v in payload.metadata.items()},
                "data": base64.b64encode(payload.data).decode("ascii"),
            }).encode("utf-8")
            # AESGCM.encrypt appends the 16-byte auth tag to the ciphertext,
            # matching Node's cipher.getAuthTag() + Buffer.concat layout.
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
