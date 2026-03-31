const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    fullName: { type: DataTypes.STRING, allowNull: true },
    role: {
        type: DataTypes.ENUM('admin', 'coach'),
        allowNull: false,
        defaultValue: 'admin'
    },
    specialty: { type: DataTypes.STRING, allowNull: true },   // e.g. "Nage avec palmes"
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    photo_url: { type: DataTypes.STRING, allowNull: true }
}, { timestamps: true });

module.exports = Admin;