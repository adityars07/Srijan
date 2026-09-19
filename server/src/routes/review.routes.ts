import { Router } from 'express';
import { getProductReviews, submitReview, getAllReviews } from '../controllers/review.controller.js';
import { optionalAuth, verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, submitReview);
router.get('/', verifyToken, requireAdmin, getAllReviews);

export default router;
