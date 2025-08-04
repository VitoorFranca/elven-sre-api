import { AppDataSource } from '../database/data-source';
import { Product } from '../domain/entities/Product';
import { Order } from '../domain/entities/Order';
import { ProductRepository } from '../repository/ProductRepository';
import { OrderRepository } from '../repository/OrderRepository';
import { ProductUseCase } from '../usecase/ProductUseCase';
import { OrderUseCase } from '../usecase/OrderUseCase';
import { ProductHandler } from '../handler/v1/ProductHandler';
import { OrderHandler } from '../handler/v1/OrderHandler';
import { HealthHandler } from '../handler/v1/HealthHandler';

export const initializeDependencies = () => {
  // Repositories
  const productRepository = new ProductRepository(AppDataSource.getRepository(Product));
  const orderRepository = new OrderRepository(AppDataSource.getRepository(Order));

  // Use Cases
  const productUseCase = new ProductUseCase(productRepository);
  const orderUseCase = new OrderUseCase(orderRepository);

  // Handlers
  const productHandler = new ProductHandler(productUseCase);
  const orderHandler = new OrderHandler(orderUseCase);
  const healthHandler = new HealthHandler(AppDataSource);

  return {
    productHandler,
    orderHandler,
    healthHandler
  };
}; 