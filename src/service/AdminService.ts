import { AdminRepository } from '../repository/AdminRepository';

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

export class AdminService {
  constructor(private adminRepository: AdminRepository) {}

  async getAllOrders(filters: OrderFilters) {
    return this.adminRepository.getAllOrders(filters);
  }

  async getOrderById(id: string) {
    return this.adminRepository.getOrderById(id);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.adminRepository.updateOrderStatus(id, status);
  }

  async searchOrders(filters: SearchFilters) {
    return this.adminRepository.searchOrders(filters);
  }
} 