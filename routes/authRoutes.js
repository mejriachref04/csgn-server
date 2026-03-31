const express = require('express');
const router = express.Router();
const { login, logout, createUser, getUsers, getCoaches, updateUser, deleteUser } = require('../controllers/authController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { createUpload } = require('../config/cloudinary');

const upload = createUpload('profiles');

router.post('/login', login);
router.post('/logout', logout);

router.post('/users', adminOnly, upload.single('photo'), createUser);
router.get('/users', adminOnly, getUsers);
router.put('/users/:id', adminOnly, upload.single('photo'), updateUser);
router.delete('/users/:id', adminOnly, deleteUser);

router.get('/coaches', protect, getCoaches);

module.exports = router;