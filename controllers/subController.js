const Subscription = require('../models/Subscription');
const Swimmer = require('../models/Swimmer');

// @desc    Create subscription for swimmer
// @route   POST /api/subscriptions
exports.createSubscription = async (req, res) => {
    try {
        const { startDate, endDate, price, SwimmerId } = req.body;

        const swimmer = await Swimmer.findByPk(SwimmerId);
        if (!swimmer) return res.status(404).json({ message: 'Nageur non trouvé' });

        const newSub = await Subscription.create({ startDate, endDate, price, SwimmerId, status: 'active' });

        // Auto-update swimmer status based on subscription
        await swimmer.update({ endSub: endDate, status: 'Active' });

        res.status(201).json(newSub);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
    }
};

// @desc    Get all subscriptions with swimmer info
// @route   GET /api/subscriptions
exports.getSubscriptions = async (req, res) => {
    try {
        const subs = await Subscription.findAll({
            include: [{ model: Swimmer, attributes: ['id', 'firstName', 'lastName', 'group', 'photo_url'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json(subs);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération', error: error.message });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
exports.deleteSubscription = async (req, res) => {
    try {
        const deleted = await Subscription.destroy({ where: { id: req.params.id } });
        if (deleted === 0) return res.status(404).json({ message: 'Abonnement non trouvé' });
        res.json({ message: 'Abonnement supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};