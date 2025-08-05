import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = 'CreateInitialTables1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'name', type: 'varchar', length: '255' },
          { name: 'description', type: 'text' },
          { name: 'price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'stock', type: 'int' },
          { name: 'image', type: 'varchar', length: '255', isNullable: true },
          { name: 'category', type: 'varchar', length: '100' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    );

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'int', isPrimary: true, isGenerated: true, generationStrategy: 'increment' },
          { name: 'customerName', type: 'varchar', length: '255' },
          { name: 'customerEmail', type: 'varchar', length: '255' },
          { name: 'items', type: 'text' },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'status', type: 'enum', enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: "'PENDING'" },
          { name: 'shippingAddress', type: 'text' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_CATEGORY',
        columnNames: ['category'],
      })
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_STATUS',
        columnNames: ['status'],
      })
    );

    await queryRunner.createIndex(
      'orders',
      new TableIndex({
        name: 'IDX_ORDERS_CUSTOMER_EMAIL',
        columnNames: ['customerEmail'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
    await queryRunner.dropTable('products');
  }
} 