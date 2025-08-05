import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  
  // Lista de origins permitidas
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://elven-sre.store', 'https://www.elven-sre.store']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  // Verificar se a origin está permitida
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Permitir requisições sem origin (como mobile apps ou Postman)
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    logger.warn(`🚫 Origin não permitida: ${origin}`);
    res.header('Access-Control-Allow-Origin', '*'); // Temporariamente permitir todas
  }

  // Headers padrão de CORS
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Origin, Accept, X-Requested-With, Cache-Control, X-Forwarded-For, X-Real-IP, X-Forwarded-Proto, Pragma');
  res.header('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Access-Control-Allow-Headers');
  res.header('Access-Control-Max-Age', '86400'); // Cache por 24 horas

  // Responder imediatamente a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    logger.info(`🔄 Preflight request para ${req.path} de ${origin}`);
    res.status(200).end();
    return;
  }

  next();
}

// Middleware específico para debug de CORS
export function corsDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  logger.info(`🌐 CORS Debug - Method: ${req.method}, Origin: ${req.headers.origin}, Path: ${req.path}`);
  logger.info(`📋 Request Headers:`, req.headers);
  
  // Log dos headers de resposta após a requisição
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    logger.info(`📋 Response Headers:`, res.getHeaders());
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
} 