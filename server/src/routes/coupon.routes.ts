import { Router } from 'express';
import { validateCoupon, getAllCoupons, createCoupon } from '../controllers/coupon.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', verifyToken, requireAdmin, getAllCoupons);
router.post('/', verifyToken, requireAdmin, createCoupon);

export default router;
