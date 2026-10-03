import { Router } from 'express';
import { register, login, verifyOtp, resendOtp, getMe } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', verifyToken, getMe);

export default router;
