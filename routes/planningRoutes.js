const express = require('express');
const router = express.Router();
const { getSessions, createSession, updateSession, deleteSession } = require('../controllers/planningController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', protect, getSessions);           // admin sees all, coach sees own
router.post('/', adminOnly, createSession);      // admin only
router.put('/:id', adminOnly, updateSession);    // admin only
router.delete('/:id', adminOnly, deleteSession); // admin only

module.exports = router;