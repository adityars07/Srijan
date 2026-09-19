import { Router } from 'express';
import {
  createOrder,
  trackOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { verifyToken, optionalAuth, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.get('/track/:orderNumberOrTracking', trackOrder);
router.get('/my-orders', verifyToken, getMyOrders);
router.get('/', verifyToken, requireAdmin, getAllOrders);
router.patch('/:id/status', verifyToken, requireAdmin, updateOrderStatus);

export default router;
