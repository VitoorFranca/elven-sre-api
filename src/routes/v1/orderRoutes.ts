import { Router } from 'express';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

// Inicializar dependências
const { orderHandler } = initializeDependencies();

// Rotas
router.get('/', (req, res) => orderHandler.getAllOrders(req, res));
router.get('/:id', (req, res) => orderHandler.getOrderById(req, res));
router.post('/', (req, res) => orderHandler.createOrder(req, res));
router.patch('/:id/status', (req, res) => orderHandler.updateOrderStatus(req, res));

export default router; 