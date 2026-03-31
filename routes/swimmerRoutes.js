const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');
const { createSwimmer, getSwimmers, updateSwimmer, deleteSwimmer } = require('../controllers/swimmerController');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'swimmer-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.post('/', protect, upload.single('photo'), createSwimmer);
router.get('/', protect, getSwimmers);
router.put('/:id', protect, upload.single('photo'), updateSwimmer);
router.delete('/:id', protect, deleteSwimmer);

module.exports = router;