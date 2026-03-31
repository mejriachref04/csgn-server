const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middlewares/authMiddleware');

// Use shared mysql2 pool via env variables (not hardcoded)
const mysql = require('mysql2/promise');
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'marsa_natation'
});

// Multer storage config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'img-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// GET all images (public - used by Home page)
router.get('/', async (req, res) => {
  try {
    const [images] = await db.query('SELECT * FROM gallery ORDER BY createdAt DESC');
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// POST new image (protected)
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni.' });
    }
    const url = `/uploads/${req.file.filename}`;
    await db.query('INSERT INTO gallery (title, url) VALUES (?, ?)', [title, url]);
    res.json({ title, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de l'upload." });
  }
});

// DELETE image by id (protected)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the image record first to delete the file from disk
    const [rows] = await db.query('SELECT * FROM gallery WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Image non trouvée.' });
    }

    const imageUrl = rows[0].url; // e.g. /uploads/img-123.png
    const filePath = path.join(__dirname, '..', imageUrl);

    // Delete from DB
    await db.query('DELETE FROM gallery WHERE id = ?', [id]);

    // Delete file from disk (ignore error if file doesn't exist)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: 'Image supprimée avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

module.exports = router;