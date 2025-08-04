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

    // Configurar CORS - Solução para problema de CORS com Chrome cache
    app.use(cors({
      origin: function (origin, callback) {
        // Permitir requisições sem origin (como mobile apps ou Postman)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          process.env.FRONTEND_URL || 'http://localhost:5173'
        ];
        
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`🚫 Origin não permitida: ${origin}`);
          callback(null, true); // Temporariamente permitir todas as origins para debug
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Origin', 
        'Accept', 
        'X-Requested-With',
        'Cache-Control'
      ],
      exposedHeaders: ['Content-Length', 'X-Requested-With'],
      preflightContinue: false,
      optionsSuccessStatus: 200
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