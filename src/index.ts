import { config } from 'dotenv';

config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger';
import { initializeTelemetry } from './utils/telemetry';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { telemetryMiddleware, errorTelemetryMiddleware } from './middleware/telemetry';
import { corsMiddleware, corsDebugMiddleware } from './middleware/cors';
import { initializeDatabase } from './database/data-source';
import healthRoutes from './routes/v1/healthRoutes';
import productRoutes from './routes/v1/productRoutes';
import orderRoutes from './routes/v1/orderRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

async function initializeApp() {
  try {
    await initializeTelemetry();
    logger.info('Telemetria inicializada com sucesso');

    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));

    app.use(corsMiddleware);
    
    if (process.env.NODE_ENV !== 'production') {
      app.use(corsDebugMiddleware);
    }

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    });
    app.use(limiter);

    app.use(telemetryMiddleware);
    app.use(requestLogger);

    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/health', healthRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    app.use(errorTelemetryMiddleware);
    app.use(errorHandler);

    await initializeDatabase();
    logger.info('Banco de dados inicializado com sucesso');

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
      logger.info('OpenTelemetry configurado');
      logger.info('CORS configurado com middleware personalizado');
      logger.info('Telemetria avançada ativa - capturando payloads e métricas detalhadas');
    });

  } catch (error) {
    logger.error('Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

initializeApp();

export default app; 