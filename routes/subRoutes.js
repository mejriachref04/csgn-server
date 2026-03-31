const express = require('express');
const router = express.Router();
const { createSubscription, getSubscriptions, deleteSubscription } = require('../controllers/subController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, getSubscriptions);          // coach + admin can view
router.post('/', adminOnly, createSubscription);     // admin only
router.delete('/:id', adminOnly, deleteSubscription);// admin only

module.exports = router;