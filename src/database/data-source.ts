import { DataSource } from 'typeorm';
import { Product } from '../domain/entities/Product';
import { Order, OrderStatus } from '../domain/entities/Order';
import 'reflect-metadata';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'elven_sre',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [Product, Order],
  migrations: [],
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
    
    // Inserir dados de exemplo se estiver em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      await insertSampleData();
    }
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

const insertSampleData = async (): Promise<void> => {
  const productRepository = AppDataSource.getRepository(Product);
  const orderRepository = AppDataSource.getRepository(Order);

  // Verificar se já existem produtos
  const existingProducts = await productRepository.count();
  if (existingProducts === 0) {
    const sampleProducts = [
      {
        name: 'Bouquet de Rosas Vermelhas',
        description: 'Lindo bouquet com 12 rosas vermelhas, perfeito para declarações de amor',
        price: 89.90,
        stock: 50,
        category: 'Flores',
        image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400'
      },
      {
        name: 'Bouquet de Girassóis',
        description: 'Bouquet vibrante com girassóis frescos, ideal para presentear',
        price: 65.50,
        stock: 30,
        category: 'Flores',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'
      },
      {
        name: 'Orquídea Phalaenopsis',
        description: 'Elegante orquídea em vaso, perfeita para decoração',
        price: 120.00,
        stock: 20,
        category: 'Plantas',
        image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400'
      },
      {
        name: 'Cesta de Frutas Especiais',
        description: 'Cesta com frutas selecionadas, ideal para presentear',
        price: 75.00,
        stock: 25,
        category: 'Frutas',
        image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=400'
      }
    ];

    await productRepository.save(sampleProducts);
    console.log('Sample products inserted');
  }

  // Verificar se já existem pedidos
  const existingOrders = await orderRepository.count();
  if (existingOrders === 0) {
    const sampleOrders = [
      {
        customerName: 'Maria Silva',
        customerEmail: 'maria@email.com',
        items: JSON.stringify([
          { productId: 1, quantity: 2, price: 89.90 }
        ]),
        totalAmount: 179.80,
        status: OrderStatus.PENDING,
        shippingAddress: 'Rua das Flores, 123 - São Paulo, SP'
      },
      {
        customerName: 'João Santos',
        customerEmail: 'joao@email.com',
        items: JSON.stringify([
          { productId: 2, quantity: 1, price: 65.50 }
        ]),
        totalAmount: 65.50,
        status: OrderStatus.PROCESSING,
        shippingAddress: 'Av. Principal, 456 - Rio de Janeiro, RJ'
      }
    ];

    await orderRepository.save(sampleOrders);
    console.log('Sample orders inserted');
  }
}; 