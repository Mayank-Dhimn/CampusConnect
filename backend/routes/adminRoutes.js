const router = require('express').Router();
const ctrl = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/products', ctrl.getAllProducts);
router.put('/products/:id/status', ctrl.updateProductStatus);
router.get('/reports', ctrl.getReports);
router.put('/reports/:id', ctrl.updateReportStatus);

module.exports = router;
