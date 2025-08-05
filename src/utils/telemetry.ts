import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { trace, context } from '@opentelemetry/api';
import { logger } from './logger';

let sdk: NodeSDK | null = null;
let customMetrics: any = null;

export function setupOpenTelemetry() {
  console.log('setupOpenTelemetry');
  console.log(process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
  // Verificar se já foi inicializado
  if (sdk) {
    logger.info('OpenTelemetry já foi inicializado');
    return;
  }

  try {
    // Configurar recursos
    const resource = new Resource({
      serviceName: 'elven-api',
      serviceVersion: '1.0.0',
      deploymentEnvironment: process.env.NODE_ENV || 'development',
    });

    // Configurar exportador de traces
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces',
      headers: {},
    });

    // Criar SDK
    sdk = new NodeSDK({
      serviceName: 'elven-api',
      resource: resource,
      traceExporter: traceExporter,
      instrumentations: [
        getNodeAutoInstrumentations({
          // Configurar instrumentações específicas
          '@opentelemetry/instrumentation-http': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-express': {
            enabled: true,
          },
          '@opentelemetry/instrumentation-mysql': {
            enabled: true,
          },
        }),
      ],
    });

    // Inicializar SDK
    sdk.start();
    logger.info('✅ OpenTelemetry inicializado com sucesso');
    logger.info(`📊 Endpoint OTLP: ${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'}`);

    // Inicializar métricas customizadas
    customMetrics = createCustomMetrics();

    // Configurar graceful shutdown
    process.on('SIGTERM', () => {
      sdk?.shutdown()
        .then(() => {
          logger.info('OpenTelemetry SDK desligado com sucesso');
          process.exit(0);
        })
        .catch((error: Error) => {
          logger.error('Erro ao desligar OpenTelemetry SDK:', error);
          process.exit(1);
        });
    });

  } catch (error: unknown) {
    logger.error('❌ Erro na configuração do OpenTelemetry:', error);
  }
}

export function getTracer() {
  return trace.getTracer('elven-api');
}

export function getMeter() {
  const { metrics } = require('@opentelemetry/api');
  return metrics.getMeter('elven-api');
}

// Função para capturar payload de resposta
export function captureResponsePayload(payload: any, statusCode?: number) {
  try {
    const span = trace.getActiveSpan();
    if (span) {
      // Capturar payload da resposta
      span.setAttribute('http.response.payload', JSON.stringify(payload));
      
      // Capturar status code se fornecido
      if (statusCode) {
        span.setAttribute('http.status_code', statusCode);
      }
      
      // Capturar tamanho da resposta
      const payloadSize = JSON.stringify(payload).length;
      span.setAttribute('http.response.size_bytes', payloadSize);
      
      logger.debug('📊 Payload capturado no span:', { payloadSize, statusCode });
    }
  } catch (error) {
    logger.error('❌ Erro ao capturar payload:', error);
  }
}

// Função para capturar informações de erro
export function captureError(error: Error, statusCode?: number) {
  try {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute('error', true);
      span.setAttribute('error.message', error.message);
      span.setAttribute('error.stack', error.stack || '');
      
      if (statusCode) {
        span.setAttribute('http.status_code', statusCode);
      }
      
      // Registrar erro no span
      span.recordException(error);
      
      logger.error('❌ Erro capturado no span:', error.message);
    }
  } catch (captureError) {
    logger.error('❌ Erro ao capturar erro no span:', captureError);
  }
}

// Função para criar span customizado
export function createCustomSpan(name: string, attributes?: Record<string, any>) {
  const tracer = getTracer();
  return tracer.startSpan(name, { attributes });
}

// Métricas customizadas
export function createCustomMetrics() {
  const meter = getMeter();
  
  // Contadores de negócio
  const productsCreated = meter.createCounter('products_created_total', {
    description: 'Total de livros criados'
  });
  
  const productsUpdated = meter.createCounter('products_updated_total', {
    description: 'Total de livros atualizados'
  });
  
  const productsDeleted = meter.createCounter('products_deleted_total', {
    description: 'Total de livros deletados'
  });
  
  const ordersCreated = meter.createCounter('orders_created_total', {
    description: 'Total de pedidos criados'
  });
  
  const ordersUpdated = meter.createCounter('orders_updated_total', {
    description: 'Total de pedidos atualizados'
  });
  
  const ordersStatusChanged = meter.createCounter('orders_status_changed_total', {
    description: 'Total de mudanças de status de pedidos'
  });
  
  // Histogramas de performance
  const databaseQueryDuration = meter.createHistogram('database_query_duration_seconds', {
    description: 'Duração das queries do banco de dados',
    unit: 's'
  });
  
  const apiRequestDuration = meter.createHistogram('api_request_duration_seconds', {
    description: 'Duração das requisições da API',
    unit: 's'
  });
  
  // Gauges para status
  const activeConnections = meter.createUpDownCounter('active_database_connections', {
    description: 'Conexões ativas com o banco de dados'
  });
  
  const memoryUsage = meter.createUpDownCounter('memory_usage_bytes', {
    description: 'Uso de memória da aplicação',
    unit: 'By'
  });
  
  // Contadores de status HTTP
  const httpRequestsTotal = meter.createCounter('http_requests_total', {
    description: 'Total de requisições HTTP'
  });
  
  const httpErrorsTotal = meter.createCounter('http_errors_total', {
    description: 'Total de erros HTTP'
  });
  
  return {
    productsCreated,
    productsUpdated,
    productsDeleted,
    ordersCreated,
    ordersUpdated,
    ordersStatusChanged,
    databaseQueryDuration,
    apiRequestDuration,
    activeConnections,
    memoryUsage,
    httpRequestsTotal,
    httpErrorsTotal
  };
}

export function getCustomMetrics() {
  if (!customMetrics) {
    customMetrics = createCustomMetrics();
  }
  return customMetrics;
}

// Função para inicializar telemetria de forma assíncrona
export async function initializeTelemetry() {
  return new Promise<void>((resolve) => {
    setupOpenTelemetry();
    // Aguardar um pouco para garantir que o SDK foi inicializado
    setTimeout(() => {
      logger.info('🚀 Telemetria inicializada com sucesso');
      resolve();
    }, 100);
  });
} 