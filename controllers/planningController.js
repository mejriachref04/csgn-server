const Planning = require('../models/Planning');
const Admin = require('../models/Admin');

// GET all sessions (admin sees all, coach sees only their own)
exports.getSessions = async (req, res) => {
    try {
        const where = req.admin.role === 'coach' ? { coachId: req.admin.id } : {};
        const sessions = await Planning.findAll({
            where,
            include: [{ model: Admin, as: 'coach', attributes: ['id', 'fullName', 'specialty', 'photo_url'] }],
            order: [['date', 'ASC'], ['startTime', 'ASC']]
        });
        res.json(sessions);
    } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
};

// CREATE session — admin only
exports.createSession = async (req, res) => {
    try {
        const { title, description, date, startTime, endTime, location, group, coachId } = req.body;
        const session = await Planning.create({ title, description, date, startTime, endTime, location, group, coachId: coachId || null });
        const full = await Planning.findByPk(session.id, {
            include: [{ model: Admin, as: 'coach', attributes: ['id', 'fullName', 'specialty', 'photo_url'] }]
        });
        res.status(201).json(full);
    } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
};

// UPDATE session — admin only
exports.updateSession = async (req, res) => {
    try {
        const session = await Planning.findByPk(req.params.id);
        if (!session) return res.status(404).json({ message: 'Session non trouvée' });
        await session.update(req.body);
        res.json(session);
    } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
};

// DELETE session — admin only
exports.deleteSession = async (req, res) => {
    try {
        const deleted = await Planning.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({ message: 'Session non trouvée' });
        res.json({ message: 'Session supprimée avec succès' });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur', error: e.message }); }
};