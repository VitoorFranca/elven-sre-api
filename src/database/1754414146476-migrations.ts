import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1754414146476 implements MigrationInterface {
    name = 'Migrations1754414146476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`price\` decimal(10,2) NOT NULL, \`stock\` int NOT NULL, \`image\` varchar(255) NULL, \`category\` varchar(100) NOT NULL, \`author\` varchar(255) NULL, \`isbn\` varchar(20) NULL, \`pages\` int NULL, \`language\` varchar(50) NULL, \`publisher\` varchar(255) NULL, \`publicationYear\` int NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`customerName\` varchar(255) NOT NULL, \`customerEmail\` varchar(255) NOT NULL, \`items\` text NOT NULL, \`totalAmount\` decimal(10,2) NOT NULL, \`status\` enum ('pending', 'processing', 'shipped', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending', \`shippingAddress\` varchar(255) NULL, \`trackingNumber\` varchar(20) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`products\``);
    }

}
