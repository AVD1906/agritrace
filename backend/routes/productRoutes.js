const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// 🔥 MUST HAVE middleware here
router.post('/', authMiddleware, productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;