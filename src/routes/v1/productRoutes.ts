import { Router } from 'express';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

const { productHandler } = initializeDependencies();

router.get('/', (req, res) => productHandler.getAllProducts(req, res));
router.get('/:id', (req, res) => productHandler.getProductById(req, res));
router.post('/', (req, res) => productHandler.createProduct(req, res));

export default router; 