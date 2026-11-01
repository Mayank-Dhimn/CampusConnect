const router = require('express').Router();
const ctrl = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', ctrl.getProducts);
router.get('/my-listings', protect, ctrl.getMyListings); // must be before /:id
router.get('/:id', optionalAuth, ctrl.getProductById);
router.post('/', protect, upload.single('image'), ctrl.createProduct);
router.put('/:id', protect, upload.single('image'), ctrl.updateProduct);
router.delete('/:id', protect, ctrl.deleteProduct);
router.post('/:id/report', protect, ctrl.reportProduct);

module.exports = router;
