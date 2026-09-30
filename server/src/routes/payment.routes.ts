import { Router } from 'express';
import { createPaymentOrder, verifyPaymentSignature } from '../controllers/payment.controller.js';
import { optionalAuth } from '../middlewares/auth.js';

const router = Router();

router.post('/create-order', optionalAuth, createPaymentOrder);
router.post('/verify', verifyPaymentSignature);

export default router;
