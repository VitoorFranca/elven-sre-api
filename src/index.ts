import { config } from 'dotenv';

// Carregar variáveis de ambiente PRIMEIRO
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
import { initializeDatabase } from './database/data-source';
import healthRoutes from './routes/v1/healthRoutes';
import productRoutes from './routes/v1/productRoutes';
import orderRoutes from './routes/v1/orderRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Função para inicializar a aplicação
async function initializeApp() {
  try {
    // Inicializar telemetria primeiro
    await initializeTelemetry();
    logger.info('✅ Telemetria inicializada com sucesso');

    // Middleware de segurança
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));

    // Configurar CORS
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100, // limite por IP
      message: 'Muitas requisições deste IP, tente novamente mais tarde.'
    });
    app.use(limiter);

    // Middleware de telemetria (deve vir antes do logging)
    app.use(telemetryMiddleware);

    // Middleware de logging
    app.use(requestLogger);

    // Parsers
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Rotas
    app.use('/api/health', healthRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/orders', orderRoutes);

    // Middleware de erro com telemetria
    app.use(errorTelemetryMiddleware);
    app.use(errorHandler);

    // Inicializar banco de dados
    await initializeDatabase();
    logger.info('✅ Banco de dados inicializado com sucesso');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`📊 OpenTelemetry configurado`);
      logger.info(`🔒 CORS configurado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      logger.info(`📈 Telemetria avançada ativa - capturando payloads e métricas detalhadas`);
    });

  } catch (error) {
    logger.error('❌ Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

// Inicializar aplicação
initializeApp();

export default app; 