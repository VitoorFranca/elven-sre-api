import { Router } from 'express';
import { MetricsHandler } from '../../handler/v1/MetricsHandler';

export function createMetricsRoutes(metricsHandler: MetricsHandler): Router {
  const router = Router();

  // Dashboard SRE principal
  router.get('/dashboard', metricsHandler.getDashboard.bind(metricsHandler));

  // Métricas do sistema
  router.get('/system', metricsHandler.getSystemMetrics.bind(metricsHandler));

  // Métricas do banco de dados
  router.get('/database', metricsHandler.getDatabaseMetrics.bind(metricsHandler));

  // Métricas de negócio
  router.get('/business', metricsHandler.getBusinessMetrics.bind(metricsHandler));

  // Métricas de performance
  router.get('/performance', metricsHandler.getPerformanceMetrics.bind(metricsHandler));

  // Resumo de traces
  router.get('/traces', metricsHandler.getTraces.bind(metricsHandler));

  // Alertas
  router.get('/alerts', metricsHandler.getAlerts.bind(metricsHandler));

  return router;
} 