import { Router } from 'express';
import {
  getAllProducts,
  getProductBySlugOrId,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/', getAllProducts);
router.get('/:idOrSlug', getProductBySlugOrId);
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

export default router;
