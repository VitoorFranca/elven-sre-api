import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../domain/entities/Order';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  create(order: Partial<Order>): Promise<Order>;
  update(id: number, order: Partial<Order>): Promise<Order | null>;
  updateStatus(id: number, status: OrderStatus): Promise<Order | null>;
  delete(id: number): Promise<boolean>;
}

export class OrderRepository implements IOrderRepository {
  constructor(private repository: Repository<Order>) {}

  async findAll(): Promise<Order[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: number): Promise<Order | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(order: Partial<Order>): Promise<Order> {
    const newOrder = this.repository.create(order);
    return this.repository.save(newOrder);
  }

  async update(id: number, order: Partial<Order>): Promise<Order | null> {
    await this.repository.update(id, order);
    return this.findById(id);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<Order | null> {
    await this.repository.update(id, { status });
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }
} 