import { Router } from 'express';
import {
  createCustomRequest,
  getAllCustomRequests,
  updateCustomRequest,
} from '../controllers/customRequest.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.post('/', createCustomRequest);
router.get('/', verifyToken, requireAdmin, getAllCustomRequests);
router.patch('/:id', verifyToken, requireAdmin, updateCustomRequest);

export default router;
