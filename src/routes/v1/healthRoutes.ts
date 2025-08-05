import { Router } from 'express';
import { initializeDependencies } from '../../config/dependencies';

const router = Router();

const { healthHandler } = initializeDependencies();

router.get('/', (req, res) => healthHandler.healthCheck(req, res));
router.get('/metrics', (req, res) => healthHandler.getMetrics(req, res));

export default router; 