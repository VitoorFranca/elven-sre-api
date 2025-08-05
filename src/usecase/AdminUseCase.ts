import { AdminService } from '../service/AdminService';

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

export class AdminUseCase {
  constructor(private adminService: AdminService) {}

  async getAllOrders(filters: OrderFilters) {
    return this.adminService.getAllOrders(filters);
  }

  async getOrderById(id: string) {
    return this.adminService.getOrderById(id);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.adminService.updateOrderStatus(id, status);
  }

  async searchOrders(filters: SearchFilters) {
    return this.adminService.searchOrders(filters);
  }
} 