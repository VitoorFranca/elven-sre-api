import { Router } from 'express';
import healthRoutes from './healthRoutes';
import productRoutes from './productRoutes';
import orderRoutes from './orderRoutes';
import { createMetricsRoutes } from './metricsRoutes';
import adminRoutes from './adminRoutes';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

const dependencies = initializeDependencies();

// Health check
router.use('/health', healthRoutes);

// API v1 routes
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/metrics', createMetricsRoutes(dependencies.metricsHandler));
router.use('/admin', adminRoutes);

export default router; 