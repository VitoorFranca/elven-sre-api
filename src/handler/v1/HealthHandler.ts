import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { logger } from '../../utils/logger';

export class HealthHandler {
  constructor(private dataSource: DataSource) {}

  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      logger.info('🏥 Health check solicitado');
      
      // Verificar conexão com o banco de dados
      const isDatabaseConnected = this.dataSource.isInitialized;

      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: isDatabaseConnected,
          type: 'mysql'
        },
        version: '1.0.0'
      };

      if (!isDatabaseConnected) {
        healthStatus.status = 'unhealthy';
        logger.warn('⚠️ Health check falhou - banco de dados não conectado');
        
        res.status(503).json({
          success: false,
          message: 'Serviço indisponível',
          data: healthStatus
        });
        return;
      }

      logger.info('✅ Health check bem-sucedido');
      
      res.status(200).json({
        success: true,
        message: 'Serviço funcionando normalmente',
        data: healthStatus
      });
      
    } catch (error) {
      logger.error('❌ Erro no health check:', error);
      res.status(500).json({
        success: false,
        message: 'Erro no health check',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      logger.info('📊 Métricas solicitadas');
      
      // Obter informações de memória
      const memUsage = process.memoryUsage();
      
      // Obter informações do sistema
      const systemInfo = {
        uptime: process.uptime(),
        memory: {
          heapUsed: memUsage.heapUsed,
          heapTotal: memUsage.heapTotal,
          rss: memUsage.rss,
          external: memUsage.external
        },
        cpu: process.cpuUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.version,
        platform: process.platform,
        arch: process.arch
      };

      logger.info('✅ Métricas obtidas com sucesso');
      
      res.status(200).json({
        success: true,
        message: 'Métricas do sistema',
        data: {
          system: systemInfo,
          timestamp: new Date().toISOString(),
          metrics_available: [
            'products_created_total',
            'products_updated_total', 
            'products_deleted_total',
            'orders_created_total',
            'orders_updated_total',
            'orders_status_changed_total',
            'database_query_duration_seconds',
            'api_request_duration_seconds',
            'active_database_connections',
            'memory_usage_bytes'
          ]
        }
      });
      
    } catch (error) {
      logger.error('❌ Erro ao obter métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao obter métricas',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 