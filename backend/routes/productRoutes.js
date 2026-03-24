import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, getAdminProducts } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/admin').get(protect, admin, getAdminProducts);
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct);

export default router;
