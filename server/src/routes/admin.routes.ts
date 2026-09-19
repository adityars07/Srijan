import { Router } from 'express';
import { getAdminMetrics } from '../controllers/admin.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/metrics', verifyToken, requireAdmin, getAdminMetrics);

export default router;
