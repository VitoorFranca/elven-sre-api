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
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [Product, Order],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
  subscribers: [],
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established successfully');
    
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

  const existingProducts = await productRepository.count();
  if (existingProducts === 0) {
    const sampleProducts = [
      {
        name: 'O Senhor dos Anéis - A Sociedade do Anel',
        description: 'Primeiro volume da trilogia épica de J.R.R. Tolkien, uma obra-prima da fantasia',
        price: 89.90,
        stock: 50,
        category: 'Fantasia',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      },
      {
        name: '1984 - George Orwell',
        description: 'Distopia clássica que retrata uma sociedade totalitária e vigilante',
        price: 65.50,
        stock: 30,
        category: 'Ficção Científica',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      },
      {
        name: 'O Pequeno Príncipe',
        description: 'Clássico da literatura mundial que encanta leitores de todas as idades',
        price: 120.00,
        stock: 20,
        category: 'Infantil',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      },
      {
        name: 'A Arte da Guerra - Sun Tzu',
        description: 'Tratado militar chinês que se tornou referência em estratégia e liderança',
        price: 75.00,
        stock: 25,
        category: 'Filosofia',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
      }
    ];

    await productRepository.save(sampleProducts);
    console.log('Sample books inserted');
  }

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
        shippingAddress: 'Rua dos Livros, 123 - São Paulo, SP'
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