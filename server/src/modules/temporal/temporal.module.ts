import { Module, Global } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';
import { DefaultFailureConverter } from '@temporalio/common';
import { EncryptionCodec } from './crypto/encryption-codec.js';
import { LlmModule } from '../llm/llm.module.js';
import { AdAutomationActivities } from './activities/ad-automation.activities.js';
import { TemporalController } from './temporal.controller.js';

@Global()
@Module({
  imports: [LlmModule],
  controllers: [TemporalController],
  providers: [
    AdAutomationActivities,
    {
      provide: 'TEMPORAL_CLIENT',
      useFactory: async () => {
        const address = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const secretKey = process.env.TEMPORAL_ENCRYPTION_KEY || 'default-temporary-insecure-32-chars-key';

        console.log(`[TemporalModule] Connecting to Temporal Cluster at ${address}...`);

        // Configure secure data converter with payload encryption and failure masking
        const secureDataConverter = {
          payloadCodecs: [new EncryptionCodec(secretKey)],
          failureConverter: new DefaultFailureConverter({
            encodeCommonAttributes: true,
          }),
        };

        try {
          const connection = await Connection.connect({ address });
          const client = new Client({
            connection,
            dataConverter: secureDataConverter,
          });
          console.log('[TemporalModule] Connected to Temporal Cluster successfully.');
          return client;
        } catch (err) {
          console.error(`[TemporalModule] Failed to connect to Temporal: ${err}`);
          // Return a mock/stub client so the application can run in offline mode
          return {
            workflow: {
              start: async () => {
                console.warn('[TemporalModule] Stub: Starting mock workflow.');
                return { workflowId: 'mock-workflow-id' };
              },
            },
          };
        }
      },
    },
  ],
  exports: ['TEMPORAL_CLIENT', AdAutomationActivities],
})
export class TemporalModule {}
