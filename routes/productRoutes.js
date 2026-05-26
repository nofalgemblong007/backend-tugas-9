const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Public routes (authenticated users can view)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Protected routes (pemilik only)
router.post('/', roleMiddleware('pemilik'), productController.createProduct);
router.put('/:id', roleMiddleware('pemilik'), productController.updateProduct);
router.delete('/:id', roleMiddleware('pemilik'), productController.deleteProduct);

// Get owner's products
router.get('/my/products', roleMiddleware('pemilik'), productController.getMyProducts);

module.exports = router;