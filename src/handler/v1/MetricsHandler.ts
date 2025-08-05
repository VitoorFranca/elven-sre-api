import { Request, Response } from 'express';
import { MetricsService } from '../../service/MetricsService';
import { logger } from '../../utils/logger';

export class MetricsHandler {
  constructor(private metricsService: MetricsService) {}

  async getSystemMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      
      logger.info('Métricas do sistema obtidas com sucesso');
      
      res.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter métricas do sistema:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getDatabaseMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      
      logger.info('Métricas do banco de dados obtidas com sucesso');
      
      res.json({
        success: true,
        data: metrics.database,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter métricas do banco:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getBusinessMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      
      logger.info('Métricas de negócio obtidas com sucesso');
      
      res.json({
        success: true,
        data: metrics.business,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter métricas de negócio:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getPerformanceMetrics(req: Request, res: Response) {
    try {
      const metrics = await this.metricsService.getSystemMetrics();
      
      logger.info('Métricas de performance obtidas com sucesso');
      
      res.json({
        success: true,
        data: metrics.performance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter métricas de performance:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getTracesSummary(req: Request, res: Response) {
    try {
      const traces = await this.metricsService.getTracesSummary();
      
      logger.info('Resumo de traces obtido com sucesso');
      
      res.json({
        success: true,
        data: traces,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter resumo de traces:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getAlerts(req: Request, res: Response) {
    try {
      const alerts = await this.metricsService.getAlerts();
      
      logger.info('Alertas obtidos com sucesso');
      
      res.json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter alertas:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getTraces(req: Request, res: Response) {
    try {
      const traces = await this.metricsService.getTracesFromJaeger();
      
      logger.info('Traces obtidos com sucesso');
      
      res.json({
        success: true,
        data: traces,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter traces:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getDashboard(req: Request, res: Response) {
    try {
      const [systemMetrics, alerts] = await Promise.all([
        this.metricsService.getSystemMetrics(),
        this.metricsService.getAlerts()
      ]);
      
      logger.info('Dashboard SRE obtido com sucesso');
      
      res.json({
        success: true,
        data: {
          system: systemMetrics,
          alerts
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Erro ao obter dashboard SRE:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 