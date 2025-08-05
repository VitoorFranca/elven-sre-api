import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context, Span } from '@opentelemetry/api';
import { logger } from './logger';

let sdk: NodeSDK | null = null;
let customMetrics: ReturnType<typeof createCustomMetrics> | null = null;

export async function initializeTelemetry(): Promise<void> {
  if (sdk) {
    logger.info('OpenTelemetry já foi inicializado');
    return;
  }

  logger.info('Iniciando configuração do OpenTelemetry...');
  logger.info(`OTEL_EXPORTER_OTLP_ENDPOINT: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT}`);
  logger.info(`OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: ${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT}`);

  try {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'elven-api',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://collector:4318/v1/traces',
    });

    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://collector:4318/v1/metrics',
    });

    const metricReader = new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 60000,
    });

    sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: metricReader as any,
      instrumentations: getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': { enabled: true },
        '@opentelemetry/instrumentation-express': { enabled: true },
        '@opentelemetry/instrumentation-mysql': { enabled: true },
      }),
    });

    await sdk.start();

    logger.info('OpenTelemetry inicializado com sucesso');
    logger.info(`Endpoint OTLP (traces): ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://collector:4318/v1/traces'}`);
    logger.info(`Endpoint OTLP (metrics): ${process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://collector:4318/v1/metrics'}`);
    logger.info(`Service Name: ${process.env.OTEL_SERVICE_NAME || 'elven-api'}`);

    customMetrics = createCustomMetrics();

    process.on('SIGTERM', async () => {
      await shutdownTelemetry();
    });

  } catch (error) {
    logger.error('Erro ao configurar OpenTelemetry:', error);
  }
}

export async function shutdownTelemetry(): Promise<void> {
  if (!sdk) return;

  try {
    await sdk.shutdown();
    logger.info('OpenTelemetry SDK desligado com sucesso');
  } catch (error) {
    logger.error('Erro ao desligar OpenTelemetry SDK:', error);
  }
}

export function getTracer() {
  return trace.getTracer('elven-api');
}

export function getMeter() {
  const { metrics } = require('@opentelemetry/api');
  return metrics.getMeter('elven-api');
}

export function getCustomMetrics() {
  if (!customMetrics) {
    customMetrics = createCustomMetrics();
  }
  return customMetrics;
}

function createCustomMetrics() {
  const meter = getMeter();

  return {
    productsCreated: meter.createCounter('products_created_total', {
      description: 'Total de livros criados',
    }),
    productsUpdated: meter.createCounter('products_updated_total', {
      description: 'Total de livros atualizados',
    }),
    productsDeleted: meter.createCounter('products_deleted_total', {
      description: 'Total de livros deletados',
    }),
    ordersCreated: meter.createCounter('orders_created_total', {
      description: 'Total de pedidos criados',
    }),
    ordersUpdated: meter.createCounter('orders_updated_total', {
      description: 'Total de pedidos atualizados',
    }),
    ordersStatusChanged: meter.createCounter('orders_status_changed_total', {
      description: 'Total de mudanças de status de pedidos',
    }),
    databaseQueryDuration: meter.createHistogram('database_query_duration_seconds', {
      description: 'Duração das queries do banco de dados',
      unit: 's',
    }),
    apiRequestDuration: meter.createHistogram('api_request_duration_seconds', {
      description: 'Duração das requisições da API',
      unit: 's',
    }),
    activeConnections: meter.createUpDownCounter('active_database_connections', {
      description: 'Conexões ativas com o banco de dados',
    }),
    memoryUsage: meter.createUpDownCounter('memory_usage_bytes', {
      description: 'Uso de memória da aplicação',
      unit: 'By',
    }),
    httpRequestsTotal: meter.createCounter('http_requests_total', {
      description: 'Total de requisições HTTP',
    }),
    httpErrorsTotal: meter.createCounter('http_errors_total', {
      description: 'Total de erros HTTP',
    }),
  };
}

export function captureResponsePayload(payload: any, statusCode?: number) {
  const span = trace.getActiveSpan();
  if (!span) return;

  try {
    const payloadStr = JSON.stringify(payload);
    span.setAttribute('http.response.payload', payloadStr);
    if (statusCode) span.setAttribute('http.status_code', statusCode);
    span.setAttribute('http.response.size_bytes', payloadStr.length);

    logger.debug('Payload capturado no span:', { size: payloadStr.length, statusCode });
  } catch (error) {
    logger.error('Erro ao capturar payload no span:', error);
  }
}

export function captureError(error: Error, statusCode?: number) {
  const span = trace.getActiveSpan();
  if (!span) return;

  try {
    span.setAttribute('error', true);
    span.setAttribute('error.message', error.message);
    span.setAttribute('error.stack', error.stack || '');
    if (statusCode) span.setAttribute('http.status_code', statusCode);
    span.recordException(error);

    logger.error('Erro capturado no span:', error.message);
  } catch (captureError) {
    logger.error('Erro ao capturar erro no span:', captureError);
  }
}

export function createCustomSpan(name: string, attributes?: Record<string, any>): Span {
  return getTracer().startSpan(name, { attributes });
}
