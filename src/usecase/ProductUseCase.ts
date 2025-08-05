import { Product } from '../domain/entities/Product';
import { IProductRepository } from '../repository/ProductRepository';
import { getTracer } from '../utils/telemetry';
import { getCustomMetrics } from '../utils/telemetry';

export interface IProductUseCase {
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
  createProduct(product: Partial<Product>): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: number): Promise<boolean>;
}

export class ProductUseCase implements IProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async getAllProducts(): Promise<Product[]> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('get_all_products', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'get_all_products');
        span.setAttribute('repository', 'ProductRepository');
        
        const products = await this.productRepository.findAll();
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'find_all',
          entity: 'products'
        });
        
        span.setAttribute('products.count', products.length);
        span.setStatus({ code: 1 });
        
        return products;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async getProductById(id: number): Promise<Product | null> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('get_product_by_id', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'get_product_by_id');
        span.setAttribute('product.id', id);
        span.setAttribute('repository', 'ProductRepository');
        
        const product = await this.productRepository.findById(id);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'find_by_id',
          entity: 'products'
        });
        
        if (product) {
          span.setAttribute('product.found', true);
          span.setAttribute('product.name', product.name);
        } else {
          span.setAttribute('product.found', false);
        }
        
        span.setStatus({ code: 1 });
        
        return product;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('create_product', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'create_product');
        span.setAttribute('product.name', product.name || 'unknown');
        span.setAttribute('product.price', product.price || 0);
        span.setAttribute('repository', 'ProductRepository');
        
        const newProduct = await this.productRepository.create(product);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'create',
          entity: 'products'
        });
        
        metrics.productsCreated.add(1, {
          product_name: newProduct.name,
          category: newProduct.category
        });
        
        span.setAttribute('product.id', newProduct.id);
        span.setAttribute('product.created_at', newProduct.createdAt.toISOString());
        span.setStatus({ code: 1 });
        
        return newProduct;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('update_product', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'update_product');
        span.setAttribute('product.id', id);
        span.setAttribute('product.name', product.name || 'unknown');
        span.setAttribute('repository', 'ProductRepository');
        
        const updatedProduct = await this.productRepository.update(id, product);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'update',
          entity: 'products'
        });
        
        if (updatedProduct) {
          metrics.productsUpdated.add(1, {
            product_name: updatedProduct.name,
            category: updatedProduct.category
          });
          
          span.setAttribute('product.updated_at', updatedProduct.updatedAt.toISOString());
        }
        
        span.setStatus({ code: 1 });
        
        return updatedProduct;
      } catch (error) {
        span.setStatus({ code: 2, message: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  async deleteProduct(id: number): Promise<boolean> {
    const tracer = getTracer();
    const metrics = getCustomMetrics();
    
    return tracer.startActiveSpan('delete_product', async (span) => {
      try {
        const startTime = Date.now();
        
        span.setAttribute('operation', 'delete_product');
        span.setAttribute('product.id', id);
        span.setAttribute('repository', 'ProductRepository');
        
        const result = await this.productRepository.delete(id);
        
        const duration = (Date.now() - startTime) / 1000;
        metrics.databaseQueryDuration.record(duration, {
          operation: 'delete',
          entity: 'products'
        });
        
        if (result) {
          metrics.productsDeleted.add(1, {
            product_id: id.toString()
          });
        }
        
        span.setAttribute('product.deleted', result);
        span.setStatus({ code: 1 });
        
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