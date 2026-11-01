const router = require('express').Router();
const ctrl = require('../controllers/enquiryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, ctrl.sendEnquiry);
router.get('/sent', protect, ctrl.getSent);
router.get('/received', protect, ctrl.getReceived);
router.put('/:id', protect, ctrl.updateStatus);

module.exports = router;
