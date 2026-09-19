import { Router } from 'express';
import { submitContact, getContactMessages, markMessageRead } from '../controllers/contact.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', submitContact);
router.get('/', verifyToken, requireAdmin, getContactMessages);
router.patch('/:id/read', verifyToken, requireAdmin, markMessageRead);

export default router;
