import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

process.env.OTEL_SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'project-atlas-api';

const sdk = new NodeSDK({
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false,
      },
    }),
  ],
});

sdk.start();
console.log('[OpenTelemetry] SDK initialized');

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('[OpenTelemetry] SDK shut down successfully'))
    .catch((error: unknown) => console.log('[OpenTelemetry] Error shutting down', error))
    .finally(() => process.exit(0));
});

export default sdk;
