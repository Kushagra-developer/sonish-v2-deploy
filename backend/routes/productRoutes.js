import express from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getAdminProducts, getProductQRCode, backfillSKUs } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
router.route('/admin').get(protect, admin, getAdminProducts);
router.post('/backfill-skus', protect, admin, backfillSKUs);
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);
router.get('/:id/qrcode', getProductQRCode);

export default router;
