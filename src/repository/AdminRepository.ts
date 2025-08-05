import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '../domain/entities/Order';

interface OrderFilters {
  page: number;
  limit: number;
  status?: string;
}

interface SearchFilters {
  query?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class AdminRepository {
  constructor(private dataSource: DataSource) {}

  async getAllOrders(filters: OrderFilters) {
    const { page, limit, status } = filters;
    const skip = (page - 1) * limit;

    const queryBuilder = this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      queryBuilder.where('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getOrderById(id: string) {
    return this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .where('order.id = :id', { id })
      .getOne();
  }

  async updateOrderStatus(id: string, status: string) {
    const order = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .where('order.id = :id', { id })
      .getOne();

    if (!order) {
      return null;
    }

    order.status = status as OrderStatus;
    order.updatedAt = new Date();

    return this.dataSource.getRepository(Order).save(order);
  }

  async searchOrders(filters: SearchFilters) {
    const { query, status, startDate, endDate } = filters;

    const queryBuilder = this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC');

    if (query) {
      queryBuilder.andWhere(
        '(order.customerName ILIKE :query OR order.customerEmail ILIKE :query OR order.id ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    return queryBuilder.getMany();
  }
} 