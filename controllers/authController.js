const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { deleteFromCloudinary } = require('../config/cloudinary');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: 'Username et mot de passe requis' });

        const admin = await Admin.findOne({ where: { username } });
        if (!admin) return res.status(401).json({ message: 'Identifiants invalides' });

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ message: 'Identifiants invalides' });

        const token = jwt.sign(
            { id: admin.id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 86400000
        });

        res.json({
            id: admin.id,
            username: admin.username,
            fullName: admin.fullName,
            role: admin.role,
            photo_url: admin.photo_url,
            token,
            message: 'Connexion réussie'
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });
    res.json({ message: 'Déconnexion réussie' });
};

exports.createUser = async (req, res) => {
    try {
        const { username, password, fullName, role, specialty, phoneNumber } = req.body;
        if (!username || !password) return res.status(400).json({ message: 'Username et mot de passe requis' });
        if (password.length < 6) return res.status(400).json({ message: 'Mot de passe: minimum 6 caractères' });
        if (!['admin', 'coach'].includes(role)) return res.status(400).json({ message: 'Rôle invalide' });

        const existing = await Admin.findOne({ where: { username } });
        if (existing) return res.status(409).json({ message: "Ce nom d'utilisateur est déjà pris" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const photo_url = req.file ? req.file.path : null; // Cloudinary URL

        const newUser = await Admin.create({ username, password: hashedPassword, fullName, role, specialty, phoneNumber, photo_url });

        res.status(201).json({
            id: newUser.id, username: newUser.username, fullName: newUser.fullName,
            role: newUser.role, specialty: newUser.specialty, photo_url: newUser.photo_url
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await Admin.findAll({
            attributes: ['id', 'username', 'fullName', 'role', 'specialty', 'phoneNumber', 'photo_url', 'createdAt']
        });
        res.json(users);
    } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
};

exports.getCoaches = async (req, res) => {
    try {
        const coaches = await Admin.findAll({
            where: { role: 'coach' },
            attributes: ['id', 'username', 'fullName', 'specialty', 'photo_url']
        });
        res.json(coaches);
    } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await Admin.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (req.file) {
            if (user.photo_url) await deleteFromCloudinary(user.photo_url);
            req.body.photo_url = req.file.path;
        }

        delete req.body.password; // Never update password via this route
        await user.update(req.body);

        res.json({
            id: user.id, username: user.username, fullName: user.fullName,
            role: user.role, specialty: user.specialty, photo_url: user.photo_url
        });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (parseInt(id) === req.admin.id)
            return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });

        const user = await Admin.findByPk(id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

        if (user.photo_url) await deleteFromCloudinary(user.photo_url);
        await Admin.destroy({ where: { id } });

        res.json({ message: 'Compte supprimé avec succès' });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur' }); }
};