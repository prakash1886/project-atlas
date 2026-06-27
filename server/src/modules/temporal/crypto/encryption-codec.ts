import { PayloadCodec, Payload } from '@temporalio/common';
import * as crypto from 'crypto';

export class EncryptionCodec implements PayloadCodec {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(secretKeyString: string) {
    this.key = crypto.createHash('sha256').update(secretKeyString).digest();
  }

  async encode(payloads: Payload[]): Promise<Payload[]> {
    return Promise.all(
      payloads.map(async (payload) => {
        if (!payload.data) return payload;

        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        // Encrypt the *entire* original payload (metadata + data), not just data.
        // Encrypting only payload.data and then overwriting `metadata.encoding`
        // with our own 'binary/encrypted' marker permanently destroys the
        // original encoding (e.g. 'json/plain') that the default PayloadConverter
        // needs to deserialize the bytes after decryption -- decode() had no way
        // to recover it. Wrapping the whole payload as the plaintext lets decode()
        // restore it byte-for-byte.
        const envelope = Buffer.from(
          JSON.stringify({
            metadata: Object.fromEntries(
              Object.entries(payload.metadata ?? {}).map(([k, v]) => [
                k,
                Buffer.from(v as Uint8Array).toString('base64'),
              ])
            ),
            data: Buffer.from(payload.data).toString('base64'),
          }),
          'utf8'
        );

        const encrypted = Buffer.concat([cipher.update(envelope), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // Package iv, authTag, and encrypted data together
        const data = Buffer.concat([iv, authTag, encrypted]);

        return {
          metadata: {
            encoding: Buffer.from('binary/encrypted'),
          },
          data,
        };
      })
    );
  }

  async decode(payloads: Payload[]): Promise<Payload[]> {
    return Promise.all(
      payloads.map(async (payload) => {
        // payload.metadata.encoding arrives as a plain Uint8Array (not a Node Buffer) when
        // deserialized from a real workflow activation -- Uint8Array.prototype.toString() joins
        // byte values with commas instead of decoding UTF-8, so the comparison must go through
        // Buffer.from() first. Without this, decode() always took the early-return path below,
        // silently leaving every real activation payload encrypted (only round-trip tests calling
        // encode()/decode() directly in the same process, where encoding was already a Buffer, passed).
        const encoding = payload.metadata?.encoding ? Buffer.from(payload.metadata.encoding).toString() : undefined;
        if (!payload.data || encoding !== 'binary/encrypted') {
          return payload;
        }

        const raw = Buffer.from(payload.data);
        const iv = raw.subarray(0, 12);
        const authTag = raw.subarray(12, 28);
        const encrypted = raw.subarray(28);

        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
          decipher.update(encrypted),
          decipher.final(),
        ]);

        const envelope = JSON.parse(decrypted.toString('utf8')) as { metadata: Record<string, string>; data: string };

        return {
          metadata: Object.fromEntries(
            Object.entries(envelope.metadata).map(([k, v]) => [k, Buffer.from(v, 'base64')])
          ),
          data: Buffer.from(envelope.data, 'base64'),
        };
      })
    );
  }
}
