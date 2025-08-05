import { Request, Response } from 'express';
import { AdminUseCase } from '../../usecase/AdminUseCase';

export class AdminHandler {
  constructor(private adminUseCase: AdminUseCase) {}

  async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const orders = await this.adminUseCase.getAllOrders({
        page: Number(page),
        limit: Number(limit),
        status: status as string
      });
      res.json(orders);
    } catch (error) {
      console.error('Error getting all orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const order = await this.adminUseCase.getOrderById(id);
      
      if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      res.json(order);
    } catch (error) {
      console.error('Error getting order by id:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }
      
      const updatedOrder = await this.adminUseCase.updateOrderStatus(id, status);
      
      if (!updatedOrder) {
        res.status(404).json({ error: 'Order not found' });
        return;
      }
      
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async searchOrders(req: Request, res: Response): Promise<void> {
    try {
      const { q, status, startDate, endDate } = req.query;
      const orders = await this.adminUseCase.searchOrders({
        query: q as string,
        status: status as string,
        startDate: startDate as string,
        endDate: endDate as string
      });
      res.json(orders);
    } catch (error) {
      console.error('Error searching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
} 