import { Router } from 'express';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

const { adminHandler } = initializeDependencies();

router.get('/orders', (req, res) => adminHandler.getAllOrders(req, res));
router.get('/orders/:id', (req, res) => adminHandler.getOrderById(req, res));
router.put('/orders/:id/status', (req, res) => adminHandler.updateOrderStatus(req, res));
router.get('/orders/search', (req, res) => adminHandler.searchOrders(req, res));

export default router; 