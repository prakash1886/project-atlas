import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Worker, NativeConnection } from '@temporalio/worker';
import { DefaultFailureConverter } from '@temporalio/common';
import { fileURLToPath } from 'url';
import { AdAutomationActivities } from './modules/temporal/activities/ad-automation.activities.js';
import { DsStarScientistActivities } from './modules/temporal/activities/ds-star-scientists.activities.js';
import { TrendSignalsActivities } from './modules/temporal/activities/trend-signals.activities.js';
import { GraphActivities } from './modules/graph/graph.activities.js';
import { QualityLoopActivities } from './modules/quality-loop/quality-loop.activities.js';
import { EncryptionCodec } from './modules/temporal/crypto/encryption-codec.js';

async function bootstrap() {
  console.log('[Worker] Bootstrapping NestJS Application Context...');
  // Create application context (registers providers, services, modules without HTTP listener)
  const app = await NestFactory.createApplicationContext(AppModule);

  const activitiesInstance = app.get(AdAutomationActivities);
  const scientistActivitiesInstance = app.get(DsStarScientistActivities);
  const trendSignalsInstance = app.get(TrendSignalsActivities);
  const graphActivitiesInstance = app.get(GraphActivities);
  const qualityLoopActivitiesInstance = app.get(QualityLoopActivities);
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const secretKey = process.env.TEMPORAL_ENCRYPTION_KEY || 'default-temporary-insecure-32-chars-key';

  // Resolve absolute path to the workflows module cleanly across all OS platforms
  const workflowsPath = fileURLToPath(
    new URL('./modules/temporal/workflows/index.js', import.meta.url)
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

  const adAutomationWorker = await Worker.create({
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

  const trendSignalsWorker = await Worker.create({
    connection,
    workflowsPath,
    activities: {
      fetchSignals: trendSignalsInstance.fetchSignals.bind(trendSignalsInstance),
      computeCoverageGap: trendSignalsInstance.computeCoverageGap.bind(trendSignalsInstance),
      calculateOpportunityScore: trendSignalsInstance.calculateOpportunityScore.bind(trendSignalsInstance),
    },
    taskQueue: 'trend-signals',
    dataConverter: secureDataConverter,
  });

  const dsStarScienceWorker = await Worker.create({
    connection,
    workflowsPath,
    activities: {
      runContentOpportunityScientist: scientistActivitiesInstance.runContentOpportunityScientist.bind(scientistActivitiesInstance),
      runAudienceScientist: scientistActivitiesInstance.runAudienceScientist.bind(scientistActivitiesInstance),
      runStoryUniverseScientist: scientistActivitiesInstance.runStoryUniverseScientist.bind(scientistActivitiesInstance),
      runArchetypeScientist: scientistActivitiesInstance.runArchetypeScientist.bind(scientistActivitiesInstance),
      runGeographicScientist: scientistActivitiesInstance.runGeographicScientist.bind(scientistActivitiesInstance),
      runHiddenLegendsScientist: scientistActivitiesInstance.runHiddenLegendsScientist.bind(scientistActivitiesInstance),
      runYouTubeScientist: scientistActivitiesInstance.runYouTubeScientist.bind(scientistActivitiesInstance),
      runBacklogScientist: scientistActivitiesInstance.runBacklogScientist.bind(scientistActivitiesInstance),
    },
    taskQueue: 'ds-star-science',
    dataConverter: secureDataConverter,
  });

  const knowledgeGraphWorker = await Worker.create({
    connection,
    workflowsPath,
    activities: {
      querySemanticNodes: graphActivitiesInstance.querySemanticNodes.bind(graphActivitiesInstance),
      autolinkEntities: graphActivitiesInstance.autolinkEntities.bind(graphActivitiesInstance),
    },
    taskQueue: 'knowledge-graph',
    dataConverter: secureDataConverter,
  });

  const editorialReviewWorker = await Worker.create({
    connection,
    workflowsPath,
    activities: {},
    taskQueue: 'editorial-review',
    dataConverter: secureDataConverter,
  });

  const qualityLoopWorker = await Worker.create({
    connection,
    workflowsPath,
    activities: {
      createContentAsset: qualityLoopActivitiesInstance.createContentAsset.bind(qualityLoopActivitiesInstance),
      updateContentAsset: qualityLoopActivitiesInstance.updateContentAsset.bind(qualityLoopActivitiesInstance),
      gatherCitations: qualityLoopActivitiesInstance.gatherCitations.bind(qualityLoopActivitiesInstance),
      generatePsychProfile: qualityLoopActivitiesInstance.generatePsychProfile.bind(qualityLoopActivitiesInstance),
      draftVideoScript: qualityLoopActivitiesInstance.draftVideoScript.bind(qualityLoopActivitiesInstance),
      verifyClaims: qualityLoopActivitiesInstance.verifyClaims.bind(qualityLoopActivitiesInstance),
      scoreFromVerification: qualityLoopActivitiesInstance.scoreFromVerification.bind(qualityLoopActivitiesInstance),
    },
    taskQueue: 'quality-loop',
    dataConverter: secureDataConverter,
  });

  console.log('[Worker] Temporal Workers initialized. Polling task queues: "ad-automation", "trend-signals", "ds-star-science", "knowledge-graph", "editorial-review", "quality-loop"...');
  await Promise.all([
    adAutomationWorker.run(),
    trendSignalsWorker.run(),
    dsStarScienceWorker.run(),
    knowledgeGraphWorker.run(),
    editorialReviewWorker.run(),
    qualityLoopWorker.run(),
  ]);
}

bootstrap().catch((err) => {
  console.error('[Worker] Fatal error running Temporal Worker:', err);
  process.exit(1);
});
