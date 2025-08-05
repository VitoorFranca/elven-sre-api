import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTrackingNumberToOrders1700000000001 implements MigrationInterface {
  name = 'AddTrackingNumberToOrders1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'orders',
      new TableColumn({
        name: 'trackingNumber',
        type: 'varchar',
        length: '20',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('orders', 'trackingNumber');
  }
} 