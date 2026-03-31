const Swimmer = require('../models/Swimmer');
const { deleteFromCloudinary } = require('../config/cloudinary');

const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

exports.createSwimmer = asyncHandler(async (req, res) => {
    const { firstName, lastName, birthDate, phoneNumber, parentPhoneNumber, group, status, endSub } = req.body;
    // Cloudinary returns the URL in req.file.path
    const photo_url = req.file ? req.file.path : null;

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

exports.getSwimmers = asyncHandler(async (req, res) => {
    const swimmers = await Swimmer.findAll({ order: [['createdAt', 'DESC']] });
    res.json(swimmers);
});

exports.updateSwimmer = asyncHandler(async (req, res) => {
    const swimmer = await Swimmer.findByPk(req.params.id);
    if (!swimmer) return res.status(404).json({ message: 'Nageur non trouvé' });

    if (req.file) {
        // Delete old photo from Cloudinary
        if (swimmer.photo_url) await deleteFromCloudinary(swimmer.photo_url);
        req.body.photo_url = req.file.path;
    }

    await swimmer.update(req.body);
    res.json(swimmer);
});

exports.deleteSwimmer = asyncHandler(async (req, res) => {
    const swimmer = await Swimmer.findByPk(req.params.id);
    if (!swimmer) return res.status(404).json({ message: 'Nageur non trouvé' });

    if (swimmer.photo_url) await deleteFromCloudinary(swimmer.photo_url);
    await swimmer.destroy();
    res.json({ message: 'Nageur supprimé avec succès' });
});