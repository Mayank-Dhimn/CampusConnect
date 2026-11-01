const router = require('express').Router();
const ctrl = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, ctrl.getWishlist);
router.post('/', protect, ctrl.addToWishlist);
router.delete('/:productId', protect, ctrl.removeFromWishlist);

module.exports = router;
