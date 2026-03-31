const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const getToken = (req) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer '))
        return req.headers.authorization.split(' ')[1];
    if (req.cookies && req.cookies.token) return req.cookies.token;
    return null;
};

// Any authenticated user (admin OR coach)
exports.protect = async (req, res, next) => {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'Non autorisé, pas de token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        if (!req.admin) return res.status(401).json({ message: 'Utilisateur non trouvé' });
        next();
    } catch (e) { res.status(401).json({ message: 'Token invalide' }); }
};

// Admin role only
exports.adminOnly = async (req, res, next) => {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'Non autorisé, pas de token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = await Admin.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        if (!req.admin) return res.status(401).json({ message: 'Utilisateur non trouvé' });
        if (req.admin.role !== 'admin') return res.status(403).json({ message: 'Accès refusé — réservé aux administrateurs' });
        next();
    } catch (e) { res.status(401).json({ message: 'Token invalide' }); }
};