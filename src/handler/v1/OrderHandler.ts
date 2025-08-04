import { Request, Response } from 'express';
import { OrderUseCase } from '../../usecase/OrderUseCase';
import { OrderStatus } from '../../domain/entities/Order';
import { logger } from '../../utils/logger';
import { captureBusinessMetric } from '../../middleware/telemetry';

export class OrderHandler {
  constructor(private orderUseCase: OrderUseCase) {}

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      logger.info('📋 Buscando todos os pedidos');
      
      const orders = await this.orderUseCase.getAllOrders();
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_all_orders',
        table: 'orders'
      });

      logger.info(`✅ Pedidos encontrados: ${orders.length} pedidos em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: orders,
        count: orders.length,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao buscar pedidos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const startTime = Date.now();
      
      logger.info(`📋 Buscando pedido com ID: ${id}`);
      
      const order = await this.orderUseCase.getOrderById(parseInt(id));
      
      if (!order) {
        logger.warn(`⚠️ Pedido não encontrado: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Pedido não encontrado',
          message: `Pedido com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_order_by_id',
        table: 'orders',
        order_id: id
      });

      logger.info(`✅ Pedido encontrado: ${order.customerName} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: order,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao buscar pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { customerName, customerEmail, totalAmount, items } = req.body;
      const startTime = Date.now();
      
      logger.info('📋 Criando novo pedido:', { customerName, totalAmount });
      
      const order = await this.orderUseCase.createOrder({
        customerName,
        customerEmail,
        totalAmount: parseFloat(totalAmount),
        items
      });
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de negócio
      captureBusinessMetric('orders_created', 1, {
        customer_name: customerName,
        total_amount: totalAmount
      });
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'create_order',
        table: 'orders'
      });

      logger.info(`✅ Pedido criado: ${order.customerName} (ID: ${order.id}) em ${duration}ms`);
      
      res.status(201).json({
        success: true,
        data: order,
        message: 'Pedido criado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao criar pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const startTime = Date.now();
      
      logger.info(`📋 Atualizando status do pedido ${id} para: ${status}`);
      
      const order = await this.orderUseCase.updateOrderStatus(parseInt(id), status);
      
      if (!order) {
        logger.warn(`⚠️ Pedido não encontrado para atualização: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Pedido não encontrado',
          message: `Pedido com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de negócio
      captureBusinessMetric('orders_status_changed', 1, {
        order_id: id,
        old_status: order.status,
        new_status: status
      });
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'update_order_status',
        table: 'orders',
        order_id: id
      });

      logger.info(`✅ Status do pedido atualizado: ${order.customerName} para ${status} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: order,
        message: 'Status do pedido atualizado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao atualizar status do pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 