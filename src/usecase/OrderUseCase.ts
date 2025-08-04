import { Order, OrderStatus } from '../domain/entities/Order';
import { IOrderRepository } from '../repository/OrderRepository';
import { getTracer } from '../utils/telemetry';
import { getCustomMetrics } from '../utils/telemetry';

export interface IOrderUseCase {
  getAllOrders(): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | null>;
  createOrder(order: Partial<Order>): Promise<Order>;
  updateOrder(id: number, order: Partial<Order>): Promise<Order | null>;
  updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null>;
  deleteOrder(id: number): Promise<boolean>;
}

export class OrderUseCase implements IOrderUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async getAllOrders(): Promise<Order[]> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('get_all_orders', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'get_all_orders');
        span.setAttribute('repository', 'OrderRepository');
        
        const orders = await this.orderRepository.findAll();
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'find_all',
          entity: 'orders'
        });
        
        span.setAttribute('orders.count', orders.length);
        span.setStatus({ code: 1 }); // OK
        
        return orders;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async getOrderById(id: number): Promise<Order | null> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('get_order_by_id', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'get_order_by_id');
        span.setAttribute('order.id', id);
        span.setAttribute('repository', 'OrderRepository');
        
        const order = await this.orderRepository.findById(id);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'find_by_id',
          entity: 'orders'
        });
        
        if (order) {
          span.setAttribute('order.found', true);
          span.setAttribute('order.customer_name', order.customerName);
          span.setAttribute('order.status', order.status);
          span.setAttribute('order.total_amount', order.totalAmount);
        } else {
          span.setAttribute('order.found', false);
        }
        
        span.setStatus({ code: 1 }); // OK
        
        return order;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('create_order', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'create_order');
        span.setAttribute('order.customer_name', order.customerName || 'unknown');
        span.setAttribute('order.customer_email', order.customerEmail || 'unknown');
        span.setAttribute('order.total_amount', order.totalAmount || 0);
        span.setAttribute('order.status', order.status || 'pending');
        span.setAttribute('repository', 'OrderRepository');
        
        const newOrder = await this.orderRepository.create(order);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'create',
          entity: 'orders'
        });
        
        // Incrementar contador de pedidos criados
        metrics.ordersCreated.add(1, {
          customer_name: newOrder.customerName,
          status: newOrder.status,
          total_amount: newOrder.totalAmount.toString()
        });
        
        span.setAttribute('order.id', newOrder.id);
        span.setAttribute('order.created_at', newOrder.createdAt.toISOString());
        span.setStatus({ code: 1 }); // OK
        
        return newOrder;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order | null> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('update_order', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'update_order');
        span.setAttribute('order.id', id);
        span.setAttribute('order.customer_name', order.customerName || 'unknown');
        span.setAttribute('repository', 'OrderRepository');
        
        const updatedOrder = await this.orderRepository.update(id, order);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'update',
          entity: 'orders'
        });
        
        if (updatedOrder) {
          // Incrementar contador de pedidos atualizados
          metrics.ordersUpdated.add(1, {
            customer_name: updatedOrder.customerName,
            status: updatedOrder.status,
            total_amount: updatedOrder.totalAmount.toString()
          });
          
          span.setAttribute('order.updated_at', updatedOrder.updatedAt.toISOString());
        }
        
        span.setStatus({ code: 1 }); // OK
        
        return updatedOrder;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async updateOrderStatus(id: number, status: OrderStatus): Promise<Order | null> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('update_order_status', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'update_order_status');
        span.setAttribute('order.id', id);
        span.setAttribute('order.new_status', status);
        span.setAttribute('repository', 'OrderRepository');
        
        const updatedOrder = await this.orderRepository.updateStatus(id, status);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'update_status',
          entity: 'orders'
        });
        
        if (updatedOrder) {
          // Incrementar contador de mudanças de status
          metrics.ordersStatusChanged.add(1, {
            order_id: id.toString(),
            old_status: updatedOrder.status,
            new_status: status,
            customer_name: updatedOrder.customerName
          });
          
          span.setAttribute('order.updated_at', updatedOrder.updatedAt.toISOString());
        }
        
        span.setStatus({ code: 1 }); // OK
        
        return updatedOrder;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async deleteOrder(id: number): Promise<boolean> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('delete_order', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'delete_order');
        span.setAttribute('order.id', id);
        span.setAttribute('repository', 'OrderRepository');
        
        const result = await this.orderRepository.delete(id);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'delete',
          entity: 'orders'
        });
        
        span.setAttribute('order.deleted', result);
        span.setStatus({ code: 1 }); // OK
        
        return result;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }
} 