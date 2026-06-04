const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRole');

router.post('/', authMiddleware, checkRole('Farmer', 'Admin'), productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

module.exports = router;