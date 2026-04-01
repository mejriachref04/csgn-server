const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Swimmer = sequelize.define('Swimmer', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    birthDate: { type: DataTypes.DATEONLY, allowNull: true },
    phoneNumber: { type: DataTypes.STRING, allowNull: true },
    parentPhoneNumber: { type: DataTypes.STRING, allowNull: true },
    group: { type: DataTypes.STRING, allowNull: false },
    status: {
        type: DataTypes.ENUM('Active', 'Expired'),
        defaultValue: 'Active',
        allowNull: false
    },
    endSub: { type: DataTypes.DATEONLY, allowNull: true },
    photo_url: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '/uploads/default-avatar.png'
    }
}, { timestamps: true, tableName: 'swimmers', freezeTableName: true });

module.exports = Swimmer;