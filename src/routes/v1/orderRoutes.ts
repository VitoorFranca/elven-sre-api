import { Router } from 'express';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

const { orderHandler } = initializeDependencies();

router.get('/', (req, res) => orderHandler.getAllOrders(req, res));
router.get('/:id', (req, res) => orderHandler.getOrderById(req, res));
router.post('/', (req, res) => orderHandler.createOrder(req, res));
router.put('/:id/status', (req, res) => orderHandler.updateOrderStatus(req, res));

export default router; 