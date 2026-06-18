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
        
        const encrypted = Buffer.concat([
          cipher.update(Buffer.from(payload.data)),
          cipher.final(),
        ]);
        const authTag = cipher.getAuthTag();

        // Package iv, authTag, and encrypted data together
        const data = Buffer.concat([iv, authTag, encrypted]);

        return {
          metadata: {
            ...payload.metadata,
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
        if (!payload.data || payload.metadata?.encoding?.toString() !== 'binary/encrypted') {
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

        const metadata = { ...payload.metadata };
        delete metadata.encoding;

        return {
          metadata,
          data: decrypted,
        };
      })
    );
  }
}
