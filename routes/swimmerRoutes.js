const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { createSwimmer, getSwimmers, updateSwimmer, deleteSwimmer } = require('../controllers/swimmerController');
const { createUpload } = require('../config/cloudinary');

const upload = createUpload('swimmers');

router.get('/', protect, getSwimmers);
router.post('/', adminOnly, upload.single('photo'), createSwimmer);
router.put('/:id', adminOnly, upload.single('photo'), updateSwimmer);
router.delete('/:id', adminOnly, deleteSwimmer);

module.exports = router;