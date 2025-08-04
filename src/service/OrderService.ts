import { OrderRepository } from '../repository/OrderRepository';
import { OrderUseCase } from '../usecase/OrderUseCase';
import { Order, OrderStatus } from '../domain/entities/Order';

export class OrderService {
  private orderRepository: OrderRepository;
  private orderUseCase: OrderUseCase;

  constructor(orderRepository: OrderRepository) {
    this.orderRepository = orderRepository;
    this.orderUseCase = new OrderUseCase(orderRepository);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.orderUseCase.getAllOrders();
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.orderUseCase.getOrderById(id);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.orderUseCase.createOrder(order);
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | null> {
    return this.orderUseCase.updateOrder(id, order);
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null> {
    return this.orderUseCase.updateOrderStatus(id, status);
  }

  async deleteOrder(id: number): Promise<boolean> {
    return this.orderUseCase.deleteOrder(id);
  }
} 