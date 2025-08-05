import { DataSource } from 'typeorm';
import { Product } from '../domain/entities/Product';
import { Order } from '../domain/entities/Order';
import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

export const AppDataSourceProd = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elven_sre',
  synchronize: false, // Não usar synchronize em produção
  logging: false,
  entities: [Product, Order],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  subscribers: [],
}); 