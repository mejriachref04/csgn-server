const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Admin = require('./Admin');

const Planning = sequelize.define('Planning', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: { type: DataTypes.TIME, allowNull: false },
    endTime: { type: DataTypes.TIME, allowNull: false },
    location: { type: DataTypes.STRING, defaultValue: 'Piscine principale' },
    group: { type: DataTypes.STRING, allowNull: false },
    coachId: { type: DataTypes.INTEGER, allowNull: true }
}, { timestamps: true, tableName: 'planning', freezeTableName: true });

Planning.belongsTo(Admin, { foreignKey: 'coachId', as: 'coach', constraints: false });
Admin.hasMany(Planning, { foreignKey: 'coachId', as: 'sessions', constraints: false });

module.exports = Planning;