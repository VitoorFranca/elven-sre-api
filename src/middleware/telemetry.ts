import { Request, Response, NextFunction } from 'express';
import { captureResponsePayload, captureError, getCustomMetrics } from '../utils/telemetry';
import { logger } from '../utils/logger';

export function telemetryMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const metrics = getCustomMetrics();

  metrics.httpRequestsTotal.add(1, {
    method: req.method,
    path: req.path,
  });

  logger.debug('Requisição recebida:', {
    method: req.method,
    url: req.url,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  const originalSend = res.send;
  res.send = function(body: any) {
    try {
      if (body && typeof body === 'object') {
        captureResponsePayload(body, res.statusCode);
      } else if (typeof body === 'string') {
        try {
          const parsedBody = JSON.parse(body);
          captureResponsePayload(parsedBody, res.statusCode);
        } catch {
          captureResponsePayload({ content: body }, res.statusCode);
        }
      }

      const duration = Date.now() - startTime;
      metrics.apiRequestDuration.record(duration / 1000, {
        method: req.method,
        path: req.path,
        status_code: res.statusCode.toString(),
      });

      if (res.statusCode >= 400) {
        metrics.httpErrorsTotal.add(1, {
          method: req.method,
          path: req.path,
          status_code: res.statusCode.toString(),
        });
      }

      logger.debug('Resposta enviada:', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });

    } catch (error) {
      logger.error('Erro ao capturar payload da resposta:', error);
    }

    return originalSend.call(this, body);
  };

  const originalJson = res.json;
  res.json = function(body: any) {
    try {
      captureResponsePayload(body, res.statusCode);
    } catch (error) {
      logger.error('Erro ao capturar JSON da resposta:', error);
    }
    return originalJson.call(this, body);
  };

  res.on('error', (error: Error) => {
    captureError(error, res.statusCode);
    logger.error('Erro na resposta:', error);
  });

  next();
}

export function errorTelemetryMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
  const metrics = getCustomMetrics();

  captureError(error, res.statusCode || 500);

  metrics.httpErrorsTotal.add(1, {
    method: req.method,
    path: req.path,
    status_code: (res.statusCode || 500).toString(),
    error_type: error.name,
  });

  logger.error('Erro capturado pelo middleware:', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    path: req.path,
    statusCode: res.statusCode || 500,
  });

  next(error);
}

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
        logger.warn(`Métrica desconhecida: ${metricName}`);
    }

    logger.debug('Métrica de negócio capturada:', { metricName, value, attributes });
  } catch (error) {
    logger.error('Erro ao capturar métrica de negócio:', error);
  }
} 