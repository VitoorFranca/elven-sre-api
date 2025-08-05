import { Request, Response } from 'express';
import { ProductUseCase } from '../../usecase/ProductUseCase';
import { logger } from '../../utils/logger';
import { captureBusinessMetric } from '../../middleware/telemetry';

export class ProductHandler {
  constructor(private productUseCase: ProductUseCase) {}

  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const startTime = Date.now();
      
      logger.info('Buscando todos os livros');
      
      const products = await this.productUseCase.getAllProducts();
      
      const duration = Date.now() - startTime;
      
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_all_products',
        table: 'products'
      });

      logger.info(`Livros encontrados: ${products.length} livros em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('Erro ao buscar livros:', error);
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
      
      logger.info(`Buscando livro com ID: ${id}`);
      
      const product = await this.productUseCase.getProductById(parseInt(id));
      
      if (!product) {
        logger.warn(`Livro não encontrado: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Livro não encontrado',
          message: `Livro com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'get_product_by_id',
        table: 'products',
        product_id: id
      });

      logger.info(`Livro encontrado: ${product.name} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: product,
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('Erro ao buscar livro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { 
        name, 
        description, 
        price, 
        stock, 
        category,
        author,
        isbn,
        pages,
        language,
        publisher,
        publicationYear,
        imageUrl
      } = req.body;
      const startTime = Date.now();
      
      logger.info('Criando novo livro:', { name, price, category });
      
      const product = await this.productUseCase.createProduct({
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        author,
        isbn,
        pages: pages ? parseInt(pages) : undefined,
        language,
        publisher,
        publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
        image: imageUrl
      });
      
      const duration = Date.now() - startTime;
      
      captureBusinessMetric('products_created', 1, {
        product_name: name,
        product_price: price
      });
      
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'create_product',
        table: 'products'
      });

      logger.info(`Livro criado: ${product.name} (ID: ${product.id}) em ${duration}ms`);
      
      res.status(201).json({
        success: true,
        data: product,
        message: 'Livro criado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('Erro ao criar livro:', error);
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
      const { 
        name, 
        description, 
        price, 
        stock,
        category,
        author,
        isbn,
        pages,
        language,
        publisher,
        publicationYear,
        imageUrl
      } = req.body;
      const startTime = Date.now();
      
      logger.info(`Atualizando livro com ID: ${id}`, { name, price, category });
      
      const product = await this.productUseCase.updateProduct(parseInt(id), {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        author,
        isbn,
        pages: pages ? parseInt(pages) : undefined,
        language,
        publisher,
        publicationYear: publicationYear ? parseInt(publicationYear) : undefined,
        image: imageUrl
      });
      
      if (!product) {
        logger.warn(`Livro não encontrado para atualização: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Livro não encontrado',
          message: `Livro com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      captureBusinessMetric('products_updated', 1, {
        product_id: id,
        product_name: name,
        product_price: price
      });
      
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'update_product',
        table: 'products',
        product_id: id
      });

      logger.info(`Livro atualizado: ${product.name} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        data: product,
        message: 'Livro atualizado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('Erro ao atualizar livro:', error);
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
      
      logger.info(`Deletando livro com ID: ${id}`);
      
      const deleted = await this.productUseCase.deleteProduct(parseInt(id));
      
      if (!deleted) {
        logger.warn(`Livro não encontrado para deleção: ${id}`);
        res.status(404).json({
          success: false,
          error: 'Livro não encontrado',
          message: `Livro com ID ${id} não foi encontrado`
        });
        return;
      }
      
      const duration = Date.now() - startTime;
      
      captureBusinessMetric('products_deleted', 1, {
        product_id: id
      });
      
      captureBusinessMetric('database_query_duration', duration / 1000, {
        operation: 'delete_product',
        table: 'products',
        product_id: id
      });

      logger.info(`Livro deletado com ID: ${id} em ${duration}ms`);
      
      res.status(200).json({
        success: true,
        message: 'Livro deletado com sucesso',
        duration: `${duration}ms`
      });
      
    } catch (error) {
      logger.error('Erro ao deletar livro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 