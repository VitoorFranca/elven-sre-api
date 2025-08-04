import { Request, Response } from 'express';
import { ProductUseCase } from '../../usecase/ProductUseCase';
import { logger } from '../../utils/logger';
import { captureBusinessMetric } from '../../middleware/telemetry';

export class ProductHandler {
  constructor(private productUseCase: ProductUseCase) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      logger.info('📦 Buscando todos os produtos');
      
      const products = await this.productUseCase.getAllProducts();
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_all_products',
        table: 'products'
      });

      logger.info(`✅ Produtos encontrados: ${products.length} produtos em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao buscar produtos:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const startTime = Date.now();
      
      logger.info(`📦 Buscando produto com ID: ${id}`);
      
      const product = await this.productUseCase.getProductById(parseInt(id));
      
      if (!product) {
        logger.warn(`⚠️ Produto não encontrado: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Produto com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_product_by_id',
        table: 'products',
        product_id: id
      });

      logger.info(`✅ Produto encontrado: ${product.name} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: product,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao buscar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, price, stock } = req.body;
      const startTime = Date.now();
      
      logger.info('📦 Criando novo produto:', { name, price });
      
      const product = await this.productUseCase.createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock)
      });
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de negócio
      captureBusinessMetric('products_created', 1, {
        product_name: name,
        product_price: price
      });
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'create_product',
        table: 'products'
      });

      logger.info(`✅ Produto criado: ${product.name} (ID: ${product.id}) em ${duration}ms`);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Produto criado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao criar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, price, stock } = req.body;
      const startTime = Date.now();
      
      logger.info(`📦 Atualizando produto com ID: ${id}`, { name, price });
      
      const product = await this.productUseCase.updateProduct(parseInt(id), {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock)
      });
      
      if (!product) {
        logger.warn(`⚠️ Produto não encontrado para atualização: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Produto com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de negócio
      captureBusinessMetric('products_updated', 1, {
        product_id: id,
        product_name: name,
        product_price: price
      });
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'update_product',
        table: 'products',
        product_id: id
      });

      logger.info(`✅ Produto atualizado: ${product.name} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Produto atualizado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao atualizar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const startTime = Date.now();
      
      logger.info(`📦 Deletando produto com ID: ${id}`);
      
      const deleted = await this.productUseCase.deleteProduct(parseInt(id));
      
      if (!deleted) {
        logger.warn(`⚠️ Produto não encontrado para deleção: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Produto não encontrado',
          message: `Produto com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      // Capturar métrica de negócio
      captureBusinessMetric('products_deleted', 1, {
        product_id: id
      });
      
      // Capturar métrica de duração da query
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'delete_product',
        table: 'products',
        product_id: id
      });

      logger.info(`✅ Produto deletado com ID: ${id} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        message: 'Produto deletado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('❌ Erro ao deletar produto:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 