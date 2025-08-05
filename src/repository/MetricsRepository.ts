import { DataSource } from 'typeorm';
import { Product } from '../domain/entities/Product';
import { Order } from '../domain/entities/Order';

export class MetricsRepository {
  constructor(private dataSource: DataSource) {}

  async getTotalProducts(): Promise<number> {
    return this.dataSource.getRepository(Product).count();
  }

  async getTotalOrders(): Promise<number> {
    return this.dataSource.getRepository(Order).count();
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();
    
    return result?.total || 0;
  }

  async getTotalCustomers(): Promise<number> {
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customerEmail)', 'count')
      .getRawOne();
    
    return result?.count || 0;
  }

  async getOrdersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();
  }

  async getRevenueToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt >= :today', { today })
      .getRawOne();
    
    return result?.total || 0;
  }

  async getTopProducts(): Promise<Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>> {
    // Simular dados para demonstração
    return [
      { id: '1', name: 'O Senhor dos Anéis', sales: 45, revenue: 2250.00 },
      { id: '2', name: 'Harry Potter', sales: 38, revenue: 1900.00 },
      { id: '3', name: 'Duna', sales: 32, revenue: 1600.00 },
      { id: '4', name: '1984', sales: 28, revenue: 1400.00 },
      { id: '5', name: 'O Hobbit', sales: 25, revenue: 1250.00 }
    ];
  }

  async getRecentOrders(): Promise<Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    date: string;
  }>> {
    const orders = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .limit(10)
      .getMany();

    return orders.map(order => ({
      id: order.id.toString(),
      customerName: order.customerName,
      total: order.totalAmount,
      status: order.status,
      date: order.createdAt.toISOString()
    }));
  }

  async getMonthlyRevenue(): Promise<Array<{
    month: string;
    revenue: number;
  }>> {
    // Simular dados para demonstração
    return [
      { month: 'Jan', revenue: 8500 },
      { month: 'Fev', revenue: 9200 },
      { month: 'Mar', revenue: 7800 },
      { month: 'Abr', revenue: 10500 },
      { month: 'Mai', revenue: 11200 },
      { month: 'Jun', revenue: 12500 }
    ];
  }

  async getProductsByCategory(): Promise<Array<{
    category: string;
    count: number;
  }>> {
    const result = await this.dataSource
      .getRepository(Product)
      .createQueryBuilder('product')
      .select('product.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('product.category')
      .getRawMany();

    return result.map(item => ({
      category: item.category,
      count: parseInt(item.count)
    }));
  }

  async getLowStockProducts(): Promise<Array<{
    id: string;
    name: string;
    stock: number;
  }>> {
    const products = await this.dataSource
      .getRepository(Product)
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold: 10 })
      .orderBy('product.stock', 'ASC')
      .getMany();

    return products.map(product => ({
      id: product.id.toString(),
      name: product.name,
      stock: product.stock
    }));
  }

  async getTopSellingProducts(): Promise<Array<{
    id: string;
    name: string;
    sales: number;
  }>> {
    // Simular dados para demonstração
    return [
      { id: '1', name: 'O Senhor dos Anéis', sales: 45 },
      { id: '2', name: 'Harry Potter', sales: 38 },
      { id: '3', name: 'Duna', sales: 32 },
      { id: '4', name: '1984', sales: 28 },
      { id: '5', name: 'O Hobbit', sales: 25 }
    ];
  }

  async getOrdersByStatus(): Promise<Array<{
    status: string;
    count: number;
  }>> {
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    return result.map(item => ({
      status: item.status,
      count: parseInt(item.count)
    }));
  }

  async getAverageOrderValue(): Promise<number> {
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('AVG(order.totalAmount)', 'average')
      .getRawOne();
    
    return result?.average || 0;
  }

  async getRevenueByProduct(): Promise<Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>> {
    // Simular dados para demonstração
    return [
      { productId: '1', productName: 'O Senhor dos Anéis', revenue: 2250.00 },
      { productId: '2', productName: 'Harry Potter', revenue: 1900.00 },
      { productId: '3', productName: 'Duna', revenue: 1600.00 },
      { productId: '4', productName: '1984', revenue: 1400.00 },
      { productId: '5', productName: 'O Hobbit', revenue: 1250.00 }
    ];
  }

  async getNewCustomersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customerEmail)', 'count')
      .where('order.createdAt >= :today', { today })
      .getRawOne();
    
    return result?.count || 0;
  }

  async getCustomersByOrderCount(): Promise<Array<{
    orderCount: number;
    customerCount: number;
  }>> {
    // Simular dados para demonstração
    return [
      { orderCount: 1, customerCount: 45 },
      { orderCount: 2, customerCount: 23 },
      { orderCount: 3, customerCount: 12 },
      { orderCount: 4, customerCount: 5 },
      { orderCount: 5, customerCount: 2 }
    ];
  }

  async getTopCustomers(): Promise<Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
  }>> {
    const result = await this.dataSource
      .getRepository(Order)
      .createQueryBuilder('order')
      .select('order.customerEmail', 'customerId')
      .addSelect('order.customerName', 'customerName')
      .addSelect('SUM(order.totalAmount)', 'totalSpent')
      .addSelect('COUNT(*)', 'orderCount')
      .groupBy('order.customerEmail')
      .addGroupBy('order.customerName')
      .orderBy('totalSpent', 'DESC')
      .limit(10)
      .getRawMany();

    return result.map(item => ({
      customerId: item.customerId,
      customerName: item.customerName,
      totalSpent: parseFloat(item.totalSpent),
      orderCount: parseInt(item.orderCount)
    }));
  }
} 