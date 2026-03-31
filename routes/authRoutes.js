const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { login, logout, createUser, getUsers, getCoaches, updateUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, 'profile-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.post('/login', login);
router.post('/logout', logout);

// Admin only: manage users
router.post('/users', adminOnly, upload.single('photo'), createUser);
router.get('/users', adminOnly, getUsers);
router.put('/users/:id', adminOnly, upload.single('photo'), updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

// Any authenticated: get coaches list (for planning)
router.get('/coaches', protect, getCoaches);

module.exports = router;