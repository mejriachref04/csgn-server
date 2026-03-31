const Swimmer = require('../models/Swimmer');
const path = require('path');
const fs = require('fs');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// @desc    Create new swimmer (with optional photo)
// @route   POST /api/swimmers
exports.createSwimmer = asyncHandler(async (req, res) => {
    const { firstName, lastName, birthDate, phoneNumber, parentPhoneNumber, group, status, endSub } = req.body;
    const photo_url = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-avatar.png';
    const newSwimmer = await Swimmer.create({
        firstName, lastName,
        birthDate: birthDate || null,
        phoneNumber: phoneNumber || null,
        parentPhoneNumber: parentPhoneNumber || null,
        group,
        status: status || 'Active',
        endSub: endSub || null,
        photo_url
    });
    res.status(201).json(newSwimmer);
});

// @desc    Get all swimmers
// @route   GET /api/swimmers
exports.getSwimmers = asyncHandler(async (req, res) => {
    const swimmers = await Swimmer.findAll({ order: [['createdAt', 'DESC']] });
    res.json(swimmers);
});

// @desc    Update swimmer (with optional new photo)
// @route   PUT /api/swimmers/:id
exports.updateSwimmer = asyncHandler(async (req, res) => {
    const swimmer = await Swimmer.findByPk(req.params.id);
    if (!swimmer) return res.status(404).json({ message: 'Nageur non trouvé' });
    if (req.file) {
        if (swimmer.photo_url && !swimmer.photo_url.includes('default-avatar')) {
            const oldPath = path.join(__dirname, '..', swimmer.photo_url);
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        req.body.photo_url = `/uploads/${req.file.filename}`;
    }
    await swimmer.update(req.body);
    res.json(swimmer);
});

// @desc    Delete swimmer (also deletes photo)
// @route   DELETE /api/swimmers/:id
exports.deleteSwimmer = asyncHandler(async (req, res) => {
    const swimmer = await Swimmer.findByPk(req.params.id);
    if (!swimmer) return res.status(404).json({ message: 'Nageur non trouvé' });
    if (swimmer.photo_url && !swimmer.photo_url.includes('default-avatar')) {
        const filePath = path.join(__dirname, '..', swimmer.photo_url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await swimmer.destroy();
    res.json({ message: 'Nageur supprimé avec succès' });
});