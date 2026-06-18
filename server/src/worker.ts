import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Worker, NativeConnection } from '@temporalio/worker';
import { DefaultFailureConverter } from '@temporalio/common';
import { fileURLToPath } from 'url';
import { AdAutomationActivities } from './modules/temporal/activities/ad-automation.activities.js';
import { EncryptionCodec } from './modules/temporal/crypto/encryption-codec.js';

async function bootstrap() {
  console.log('[Worker] Bootstrapping NestJS Application Context...');
  // Create application context (registers providers, services, modules without HTTP listener)
  const app = await NestFactory.createApplicationContext(AppModule);

  const activitiesInstance = app.get(AdAutomationActivities);
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const secretKey = process.env.TEMPORAL_ENCRYPTION_KEY || 'default-temporary-insecure-32-chars-key';

  // Resolve absolute path to the workflows module cleanly across all OS platforms
  const workflowsPath = fileURLToPath(
    new URL('./modules/temporal/workflows/ad-automation.workflow.js', import.meta.url)
  );

  console.log(`[Worker] Connecting to Temporal Cluster at ${temporalAddress}...`);
  const connection = await NativeConnection.connect({
    address: temporalAddress,
  });

  console.log('[Worker] Initializing secure Temporal Worker...');

  const secureDataConverter = {
    payloadCodecs: [new EncryptionCodec(secretKey)],
    failureConverter: new DefaultFailureConverter({
      encodeCommonAttributes: true,
    }),
  };

  const worker = await Worker.create({
    connection,
    workflowsPath,
    activities: {
      scanTrends: activitiesInstance.scanTrends.bind(activitiesInstance),
      generateAdContent: activitiesInstance.generateAdContent.bind(activitiesInstance),
      registerPrintOnDemand: activitiesInstance.registerPrintOnDemand.bind(activitiesInstance),
      publishToShopify: activitiesInstance.publishToShopify.bind(activitiesInstance),
    },
    taskQueue: 'ad-automation',
    dataConverter: secureDataConverter,
  });

  console.log('[Worker] Temporal Worker registered. Polling task queue: "ad-automation"...');
  await worker.run();
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error running Temporal Worker:', err);
  process.exit(1);
});
