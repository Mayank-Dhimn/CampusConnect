const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', ctrl.getCategories);
router.post('/', protect, adminOnly, ctrl.createCategory);
router.put('/:id', protect, adminOnly, ctrl.updateCategory);
router.delete('/:id', protect, adminOnly, ctrl.deleteCategory);

module.exports = router;
