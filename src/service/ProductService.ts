import { ProductRepository } from '../repository/ProductRepository';
import { ProductUseCase } from '../usecase/ProductUseCase';
import { Product } from '../domain/entities/Product';

export class ProductService {
  private productRepository: ProductRepository;
  private productUseCase: ProductUseCase;

  constructor(productRepository: ProductRepository) {
    this.productRepository = productRepository;
    this.productUseCase = new ProductUseCase(productRepository);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.productUseCase.getAllProducts();
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.productUseCase.getProductById(id);
  }

  async createProduct(product: Partial<Product>): Promise<Product> {
    return this.productUseCase.createProduct(product);
  }

  async updateProduct(id: number, product: Partial<Product>): Promise<Product | null> {
    return this.productUseCase.updateProduct(id, product);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.productUseCase.deleteProduct(id);
  }
} 