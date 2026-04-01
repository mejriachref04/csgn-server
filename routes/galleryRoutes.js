const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { createUpload, deleteFromCloudinary } = require('../config/cloudinary');
const { sequelize } = require('../config/db');
const { QueryTypes } = require('sequelize');

const upload = createUpload('gallery');

// GET all images (public)
router.get('/', async (req, res) => {
    try {
        const images = await sequelize.query(
            'SELECT * FROM gallery ORDER BY createdAt DESC',
            { type: QueryTypes.SELECT }
        );
        res.json(images);
    } catch (err) {
        console.error('Gallery GET error:', err.message);
        res.json([]); // Return empty array instead of crashing
    }
});

// POST new image (protected)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title } = req.body;
        if (!req.file) return res.status(400).json({ message: 'Aucun fichier fourni.' });
        const url = req.file.path;
        await sequelize.query(
            'INSERT INTO gallery (title, url) VALUES (?, ?)',
            { replacements: [title || '', url], type: QueryTypes.INSERT }
        );
        res.json({ title, url });
    } catch (err) {
        console.error('Gallery POST error:', err.message);
        res.status(500).json({ message: "Erreur lors de l'upload." });
    }
});

// DELETE image (protected)
router.delete('/:id', protect, async (req, res) => {
    try {
        const rows = await sequelize.query(
            'SELECT * FROM gallery WHERE id = ?',
            { replacements: [req.params.id], type: QueryTypes.SELECT }
        );
        if (!rows || rows.length === 0) return res.status(404).json({ message: 'Image non trouvée.' });
        const image = rows[0];
        if (image.url) await deleteFromCloudinary(image.url);
        await sequelize.query('DELETE FROM gallery WHERE id = ?', {
            replacements: [req.params.id], type: QueryTypes.DELETE
        });
        res.json({ message: 'Image supprimée avec succès.' });
    } catch (err) {
        console.error('Gallery DELETE error:', err.message);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
});

module.exports = router;