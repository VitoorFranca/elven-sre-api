import { MetricsService } from '../service/MetricsService';

export class MetricsUseCase {
  constructor(private metricsService: MetricsService) {}

  async getDashboardMetrics() {
    const [
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers,
      ordersToday,
      revenueToday,
      topProducts,
      recentOrders,
      monthlyRevenue
    ] = await Promise.all([
      this.metricsService.getTotalProducts(),
      this.metricsService.getTotalOrders(),
      this.metricsService.getTotalRevenue(),
      this.metricsService.getTotalCustomers(),
      this.metricsService.getOrdersToday(),
      this.metricsService.getRevenueToday(),
      this.metricsService.getTopProducts(),
      this.metricsService.getRecentOrders(),
      this.metricsService.getMonthlyRevenue()
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers,
      ordersToday,
      revenueToday,
      topProducts,
      recentOrders,
      monthlyRevenue
    };
  }

  async getProductMetrics() {
    const [
      totalProducts,
      productsByCategory,
      lowStockProducts,
      topSellingProducts
    ] = await Promise.all([
      this.metricsService.getTotalProducts(),
      this.metricsService.getProductsByCategory(),
      this.metricsService.getLowStockProducts(),
      this.metricsService.getTopSellingProducts()
    ]);

    return {
      totalProducts,
      productsByCategory,
      lowStockProducts,
      topSellingProducts
    };
  }

  async getOrderMetrics() {
    const [
      totalOrders,
      ordersByStatus,
      ordersToday,
      averageOrderValue,
      recentOrders
    ] = await Promise.all([
      this.metricsService.getTotalOrders(),
      this.metricsService.getOrdersByStatus(),
      this.metricsService.getOrdersToday(),
      this.metricsService.getAverageOrderValue(),
      this.metricsService.getRecentOrders()
    ]);

    return {
      totalOrders,
      ordersByStatus,
      ordersToday,
      averageOrderValue,
      recentOrders
    };
  }

  async getRevenueMetrics() {
    const [
      totalRevenue,
      revenueToday,
      monthlyRevenue,
      revenueByProduct,
      averageOrderValue
    ] = await Promise.all([
      this.metricsService.getTotalRevenue(),
      this.metricsService.getRevenueToday(),
      this.metricsService.getMonthlyRevenue(),
      this.metricsService.getRevenueByProduct(),
      this.metricsService.getAverageOrderValue()
    ]);

    return {
      totalRevenue,
      revenueToday,
      monthlyRevenue,
      revenueByProduct,
      averageOrderValue
    };
  }

  async getCustomerMetrics() {
    const [
      totalCustomers,
      newCustomersToday,
      customersByOrderCount,
      topCustomers
    ] = await Promise.all([
      this.metricsService.getTotalCustomers(),
      this.metricsService.getNewCustomersToday(),
      this.metricsService.getCustomersByOrderCount(),
      this.metricsService.getTopCustomers()
    ]);

    return {
      totalCustomers,
      newCustomersToday,
      customersByOrderCount,
      topCustomers
    };
  }
} 