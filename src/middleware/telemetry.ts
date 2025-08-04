import { Request, Response, NextFunction } from 'express';
import { captureResponsePayload, captureError, getCustomMetrics } from '../utils/telemetry';
import { logger } from '../utils/logger';

export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const metrics = getCustomMetrics();

  // Incrementar contador de requisições
  metrics.httpRequestsTotal.add(1, {
    method: req.method,
    path: req.path,
  });

  // Capturar informações da requisição
  logger.debug('📥 Requisição recebida:', {
    method: req.method,
    url: req.url,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Interceptar a resposta para capturar payload
  const originalSend = res.send;
  res.send = function(body: any) {
    try {
      // Capturar payload da resposta
      if (body && typeof body === 'object') {
        captureResponsePayload(body, res.statusCode);
      } else if (typeof body === 'string') {
        try {
          const parsedBody = JSON.parse(body);
          captureResponsePayload(parsedBody, res.statusCode);
        } catch {
          // Se não for JSON válido, capturar como string
          captureResponsePayload({ content: body }, res.statusCode);
        }
      }

      // Registrar métricas de duração
      const duration = Date.now() - startTime;
      metrics.apiRequestDuration.record(duration / 1000, {
        method: req.method,
        path: req.path,
        status_code: res.statusCode.toString(),
      });

      // Registrar erros se status code >= 400
      if (res.statusCode >= 400) {
        metrics.httpErrorsTotal.add(1, {
          method: req.method,
          path: req.path,
          status_code: res.statusCode.toString(),
        });
      }

      logger.debug('📤 Resposta enviada:', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

    } catch (error) {
      logger.error('❌ Erro ao capturar payload da resposta:', error);
    }

    return originalSend.call(this, body);
  };

  // Interceptar erros
  const originalJson = res.json;
  res.json = function(body: any) {
    try {
      captureResponsePayload(body, res.statusCode);
    } catch (error) {
      logger.error('❌ Erro ao capturar JSON da resposta:', error);
    }
    return originalJson.call(this, body);
  };

  // Capturar erros não tratados
  res.on('error', (error: Error) => {
    captureError(error, res.statusCode);
    logger.error('❌ Erro na resposta:', error);
  });

  next();
}

// Middleware para capturar erros de forma mais detalhada
export function errorTelemetryMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
  const metrics = getCustomMetrics();

  // Capturar erro no span
  captureError(error, res.statusCode || 500);

  // Incrementar contador de erros
  metrics.httpErrorsTotal.add(1, {
    method: req.method,
    path: req.path,
    status_code: (res.statusCode || 500).toString(),
    error_type: error.name,
  });

  logger.error('❌ Erro capturado pelo middleware:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode || 500,
  });

  next(error);
}

// Função para capturar métricas de negócio
export function captureBusinessMetric(metricName: string, value: number = 1, attributes?: Record<string, any>) {
  try {
    const metrics = getCustomMetrics();
    
    switch (metricName) {
      case 'products_created':
        metrics.productsCreated.add(value, attributes);
        break;
      case 'products_updated':
        metrics.productsUpdated.add(value, attributes);
        break;
      case 'products_deleted':
        metrics.productsDeleted.add(value, attributes);
        break;
      case 'orders_created':
        metrics.ordersCreated.add(value, attributes);
        break;
      case 'orders_updated':
        metrics.ordersUpdated.add(value, attributes);
        break;
      case 'orders_status_changed':
        metrics.ordersStatusChanged.add(value, attributes);
        break;
      case 'database_query_duration':
        metrics.databaseQueryDuration.record(value, attributes);
        break;
      default:
        logger.warn(`⚠️ Métrica desconhecida: ${metricName}`);
    }

    logger.debug('📊 Métrica de negócio capturada:', { metricName, value, attributes });
  } catch (error) {
    logger.error('❌ Erro ao capturar métrica de negócio:', error);
  }
} 