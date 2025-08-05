import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int' })
  stock!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image!: string;

  @Column({ type: 'varchar', length: 100 })
  category!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  author!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  isbn!: string;

  @Column({ type: 'int', nullable: true })
  pages!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  language!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  publisher!: string;

  @Column({ type: 'int', nullable: true })
  publicationYear!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 