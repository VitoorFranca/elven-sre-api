import { DataSource } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Product } from '../domain/entities/Product';
import { Order } from '../domain/entities/Order';

// Repositories
import { ProductRepository } from '../repository/ProductRepository';
import { OrderRepository } from '../repository/OrderRepository';
import { AdminRepository } from '../repository/AdminRepository';

// Services
import { ProductService } from '../service/ProductService';
import { OrderService } from '../service/OrderService';
import { AdminService } from '../service/AdminService';
import { MetricsService } from '../service/MetricsService';

// Use Cases
import { ProductUseCase } from '../usecase/ProductUseCase';
import { OrderUseCase } from '../usecase/OrderUseCase';
import { AdminUseCase } from '../usecase/AdminUseCase';

// Handlers
import { ProductHandler } from '../handler/v1/ProductHandler';
import { OrderHandler } from '../handler/v1/OrderHandler';
import { AdminHandler } from '../handler/v1/AdminHandler';
import { MetricsHandler } from '../handler/v1/MetricsHandler';
import { HealthHandler } from '../handler/v1/HealthHandler';

export function initializeDependencies() {
  // Repositories
  const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
  const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));
  const adminRepository = new AdminRepository(AppDataSource);

  // Services
  const productService = new ProductService(productRepository);
  const orderService = new OrderService(orderRepository);
  const adminService = new AdminService(adminRepository);
  const metricsService = new MetricsService(AppDataSource);

  // Use Cases
  const productUseCase = new ProductUseCase(productRepository);
  const orderUseCase = new OrderUseCase(orderRepository);
  const adminUseCase = new AdminUseCase(adminService);

  // Handlers
  const productHandler = new ProductHandler(productUseCase);
  const orderHandler = new OrderHandler(orderUseCase);
  const adminHandler = new AdminHandler(adminUseCase);
  const metricsHandler = new MetricsHandler(metricsService);
  const healthHandler = new HealthHandler(AppDataSource);

  return {
    productHandler,
    orderHandler,
    adminHandler,
    metricsHandler,
    healthHandler,
    dataSource: AppDataSource
  };
} 