import { DataSource } from 'typeorm';
import { logger } from '../utils/logger';
import { getCustomMetrics } from '../utils/telemetry';

export class MetricsService {
  constructor(private dataSource: DataSource) {}

  async getSystemMetrics() {
    try {
      const metrics = getCustomMetrics();
      
      // Métricas do sistema
      const systemMetrics = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch
      };

      // Métricas do banco de dados
      const dbMetrics = await this.getDatabaseMetrics();

      // Métricas de negócio
      const businessMetrics = await this.getBusinessMetrics();

      // Métricas de performance
      const performanceMetrics = await this.getPerformanceMetrics();

      return {
        system: systemMetrics,
        database: dbMetrics,
        business: businessMetrics,
        performance: performanceMetrics,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Erro ao obter métricas do sistema:', error);
      throw error;
    }
  }

  // Métodos adicionados para resolver erros do MetricsUseCase
  async getTotalProducts(): Promise<number> {
    const result = await this.dataSource
      .getRepository('Product')
      .createQueryBuilder('product')
      .getCount();
    return result;
  }

  async getTotalOrders(): Promise<number> {
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .getCount();
    return result;
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getTotalCustomers(): Promise<number> {
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customerEmail)', 'count')
      .getRawOne();
    return parseInt(result?.count || '0');
  }

  async getOrdersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .getCount();
    return result;
  }

  async getRevenueToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.createdAt >= :today', { today })
      .getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getTopProducts(): Promise<Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>> {
    // Simular dados para demonstração
    return [
      { id: '1', name: 'O Senhor dos Anéis', sales: 45, revenue: 4050 },
      { id: '2', name: 'Harry Potter', sales: 38, revenue: 3420 },
      { id: '3', name: 'Duna', sales: 32, revenue: 2880 },
      { id: '4', name: '1984', sales: 28, revenue: 2520 },
      { id: '5', name: 'O Hobbit', sales: 25, revenue: 2250 }
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
      .getRepository('Order')
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
      .getRepository('Product')
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
      .getRepository('Product')
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
      .getRepository('Order')
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
      .getRepository('Order')
      .createQueryBuilder('order')
      .select('AVG(order.totalAmount)', 'average')
      .getRawOne();
    return parseFloat(result?.average || '0');
  }

  async getRevenueByProduct(): Promise<Array<{
    productId: string;
    productName: string;
    revenue: number;
  }>> {
    // Simular dados para demonstração
    return [
      { productId: '1', productName: 'O Senhor dos Anéis', revenue: 4050 },
      { productId: '2', productName: 'Harry Potter', revenue: 3420 },
      { productId: '3', productName: 'Duna', revenue: 2880 },
      { productId: '4', productName: '1984', revenue: 2520 },
      { productId: '5', productName: 'O Hobbit', revenue: 2250 }
    ];
  }

  async getNewCustomersToday(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await this.dataSource
      .getRepository('Order')
      .createQueryBuilder('order')
      .select('COUNT(DISTINCT order.customerEmail)', 'count')
      .where('order.createdAt >= :today', { today })
      .getRawOne();
    return parseInt(result?.count || '0');
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
      { orderCount: 4, customerCount: 8 },
      { orderCount: 5, customerCount: 5 }
    ];
  }

  async getTopCustomers(): Promise<Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    orderCount: number;
  }>> {
    // Simular dados para demonstração
    return [
      { customerId: '1', customerName: 'João Silva', totalSpent: 1250, orderCount: 5 },
      { customerId: '2', customerName: 'Maria Santos', totalSpent: 980, orderCount: 4 },
      { customerId: '3', customerName: 'Pedro Costa', totalSpent: 750, orderCount: 3 },
      { customerId: '4', customerName: 'Ana Oliveira', totalSpent: 620, orderCount: 3 },
      { customerId: '5', customerName: 'Carlos Lima', totalSpent: 580, orderCount: 2 }
    ];
  }

  private async getDatabaseMetrics() {
    try {
      const connection = this.dataSource;
      
      // Verificar conexões ativas
      const activeConnections = await connection.query(
        "SELECT COUNT(*) as active_connections FROM information_schema.processlist WHERE command != 'Sleep'"
      );

      // Métricas de performance do banco
      const dbPerformance = await connection.query(`
        SELECT 
          VARIABLE_NAME,
          VARIABLE_VALUE
        FROM performance_schema.global_status 
        WHERE VARIABLE_NAME IN (
          'Threads_connected',
          'Threads_running',
          'Queries',
          'Slow_queries',
          'Uptime'
        )
      `);

      // Tamanho das tabelas
      const tableSizes = await connection.query(`
        SELECT 
          table_name,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
      `);

      return {
        activeConnections: activeConnections[0]?.active_connections || 0,
        performance: dbPerformance,
        tableSizes,
        connectionStatus: connection.isInitialized ? 'connected' : 'disconnected'
      };
    } catch (error) {
      logger.error('Erro ao obter métricas do banco:', error as Error);
      return {
        activeConnections: 0,
        performance: [],
        tableSizes: [],
        connectionStatus: 'error',
        error: (error as Error).message
      };
    }
  }

  private async getBusinessMetrics() {
    try {
      const connection = this.dataSource;

      // Total de produtos
      const totalProducts = await connection
        .getRepository('Product')
        .createQueryBuilder('product')
        .getCount();

      // Produtos em estoque
      const inStockProducts = await connection
        .getRepository('Product')
        .createQueryBuilder('product')
        .where('product.stock > 0')
        .getCount();

      // Produtos sem estoque
      const outOfStockProducts = await connection
        .getRepository('Product')
        .createQueryBuilder('product')
        .where('product.stock = 0')
        .getCount();

      // Preço médio dos produtos
      const avgPriceResult = await connection
        .getRepository('Product')
        .createQueryBuilder('product')
        .select('AVG(product.price)', 'avg_price')
        .getRawOne();

      // Total de estoque
      const totalStockResult = await connection
        .getRepository('Product')
        .createQueryBuilder('product')
        .select('SUM(product.stock)', 'total_stock')
        .getRawOne();

      // Total de pedidos
      const totalOrders = await connection
        .getRepository('Order')
        .createQueryBuilder('order')
        .getCount();

      // Pedidos por status
      const ordersByStatus = await connection
        .getRepository('Order')
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .groupBy('order.status')
        .getRawMany();

      // Calcular pedidos por status
      const pendingOrders = ordersByStatus.find(o => o.status === 'pending')?.count || 0;
      const processingOrders = ordersByStatus.find(o => o.status === 'processing')?.count || 0;
      const shippedOrders = ordersByStatus.find(o => o.status === 'shipped')?.count || 0;
      const deliveredOrders = ordersByStatus.find(o => o.status === 'delivered')?.count || 0;
      const cancelledOrders = ordersByStatus.find(o => o.status === 'cancelled')?.count || 0;

      // Receita total
      const totalRevenue = await connection
        .getRepository('Order')
        .createQueryBuilder('order')
        .select('SUM(order.totalAmount)', 'total')
        .getRawOne();

      // Valor médio dos pedidos
      const avgOrderValue = await connection
        .getRepository('Order')
        .createQueryBuilder('order')
        .select('AVG(order.totalAmount)', 'avg')
        .getRawOne();

      // Produtos mais vendidos (simulado)
      const topProducts = [
        { name: 'O Senhor dos Anéis', sales_count: 45, total_revenue: 4050 },
        { name: 'Harry Potter', sales_count: 38, total_revenue: 3420 },
        { name: 'Duna', sales_count: 32, total_revenue: 2880 },
        { name: '1984', sales_count: 28, total_revenue: 2520 },
        { name: 'O Hobbit', sales_count: 25, total_revenue: 2250 }
      ];

      // Pedidos por dia (simulado)
      const ordersByDay = [
        { date: '2024-01-01', count: 15 },
        { date: '2024-01-02', count: 22 },
        { date: '2024-01-03', count: 18 },
        { date: '2024-01-04', count: 25 },
        { date: '2024-01-05', count: 30 }
      ];

      return {
        products: {
          total_products: totalProducts,
          in_stock: inStockProducts,
          out_of_stock: outOfStockProducts,
          avg_price: parseFloat(avgPriceResult?.avg_price || '0'),
          total_stock: parseInt(totalStockResult?.total_stock || '0')
        },
        orders: {
          total_orders: totalOrders,
          pending_orders: parseInt(pendingOrders),
          processing_orders: parseInt(processingOrders),
          shipped_orders: parseInt(shippedOrders),
          delivered_orders: parseInt(deliveredOrders),
          cancelled_orders: parseInt(cancelledOrders),
          avg_order_value: parseFloat(avgOrderValue?.avg || '0'),
          total_revenue: parseFloat(totalRevenue?.total || '0')
        },
        ordersByDay,
        topProducts
      };
    } catch (error) {
      logger.error('Erro ao obter métricas de negócio:', error as Error);
      return {
        products: {
          total_products: 0,
          in_stock: 0,
          out_of_stock: 0,
          avg_price: 0,
          total_stock: 0
        },
        orders: {
          total_orders: 0,
          pending_orders: 0,
          processing_orders: 0,
          shipped_orders: 0,
          delivered_orders: 0,
          cancelled_orders: 0,
          avg_order_value: 0,
          total_revenue: 0
        },
        ordersByDay: [],
        topProducts: []
      };
    }
  }

  private async getPerformanceMetrics() {
    try {
      const connection = this.dataSource;

      // Queries lentas
      const slowQueries = await connection.query(`
        SELECT 
          sql_text,
          exec_count,
          avg_timer_wait/1000000000 as avg_time_ms
        FROM performance_schema.events_statements_summary_by_digest 
        WHERE avg_timer_wait > 1000000000
        ORDER BY avg_timer_wait DESC
        LIMIT 10
      `);

      // Estatísticas das tabelas
      const tableStats = await connection.query(`
        SELECT 
          table_name,
          table_rows,
          ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'size_mb'
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
        ORDER BY (data_length + index_length) DESC
        LIMIT 10
      `);

      // Uso de índices
      const indexUsage = await connection.query(`
        SELECT 
          table_name,
          index_name,
          cardinality
        FROM information_schema.statistics 
        WHERE table_schema = DATABASE()
        ORDER BY cardinality DESC
        LIMIT 10
      `);

      return {
        slowQueries,
        tableStats,
        indexUsage
      };
    } catch (error) {
      logger.error('Erro ao obter métricas de performance:', error as Error);
      return {
        slowQueries: [],
        tableStats: [],
        indexUsage: [],
        error: (error as Error).message
      };
    }
  }

  async getTracesSummary() {
    try {
      // Aqui você pode integrar com Jaeger API para obter traces
      // Por enquanto, retornamos métricas de traces baseadas nos spans capturados
      
      const tracesSummary = {
        totalSpans: 0,
        errorSpans: 0,
        avgSpanDuration: 0,
        spansByService: {},
        recentTraces: []
      };

      return tracesSummary;
    } catch (error) {
      logger.error('Erro ao obter resumo de traces:', error);
      throw error;
    }
  }

  private getMemoryUsagePercent(): number {
    const memory = process.memoryUsage()
    return (memory.heapUsed / memory.heapTotal) * 100
  }

  async getAlerts() {
    const alerts = []
    
    // Verificar métricas do sistema
    const memoryUsage = this.getMemoryUsagePercent()
    if (memoryUsage > 80) {
      alerts.push({
        level: 'warning',
        message: 'Uso de memória alto',
        metric: 'memory_usage',
        value: memoryUsage
      })
    }
    
    // Verificar conexões do banco
    const dbMetrics = await this.getDatabaseMetrics()
    if (dbMetrics.activeConnections > 10) {
      alerts.push({
        level: 'warning',
        message: 'Muitas conexões ativas no banco',
        metric: 'db_connections',
        value: dbMetrics.activeConnections
      })
    }
    
    // Verificar produtos sem estoque
    const businessMetrics = await this.getBusinessMetrics()
    if (businessMetrics.products.out_of_stock > 5) {
      alerts.push({
        level: 'info',
        message: 'Produtos sem estoque',
        metric: 'out_of_stock_products',
        value: businessMetrics.products.out_of_stock
      })
    }
    
    return alerts
  }

  async getTracesFromJaeger() {
    try {
      // Fazer proxy para a API do Jaeger
      // Usar o nome do serviço quando rodando em Docker, ou localhost quando em desenvolvimento
      const jaegerHost = process.env.NODE_ENV === 'production' ? 'jaeger' : 'localhost'
      const response = await fetch(`http://${jaegerHost}:16686/api/traces?service=elven-api&limit=20`)
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar traces do Jaeger: ${response.status}`)
      }

      const data = await response.json() as any
      return data.data || []
    } catch (error) {
      logger.error('Erro ao buscar traces do Jaeger:', error as Error)
      return []
    }
  }
} 