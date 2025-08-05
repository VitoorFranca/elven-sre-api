import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://elven-sre.store', 'https://www.elven-sre.store']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    logger.warn(`Origin não permitida: ${origin}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  
  const allowedHeaders = [
    'Content-Type',
    'Authorization', 
    'Origin',
    'Accept',
    'X-Requested-With',
    'Cache-Control',
    'X-Forwarded-For',
    'X-Real-IP',
    'X-Forwarded-Proto',
    'Pragma',
    'Expires',
    'If-Modified-Since',
    'If-None-Match',
    'User-Agent',
    'Referer'
  ];
  
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));
  res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-Requested-With, Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Access-Control-Allow-Methods, Access-Control-Allow-Headers');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    logger.info(`Preflight request para ${req.path} de ${origin}`);
    res.status(200).end();
    return;
  }

  next();
}

export function corsDebugMiddleware(req: Request, res: Response, next: NextFunction) {
  logger.info(`CORS Debug - Method: ${req.method}, Origin: ${req.headers.origin}, Path: ${req.path}`);
  logger.info('Request Headers:', req.headers);
  
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, cb?: () => void) {
    logger.info('Response Headers:', res.getHeaders());
    return originalEnd.call(this, chunk, encoding, cb);
  };
  
  next();
} 