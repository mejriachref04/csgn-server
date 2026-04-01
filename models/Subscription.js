const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Swimmer = require('./Swimmer');

const Subscription = sequelize.define('Subscription', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('active', 'expired', 'pending'),
        defaultValue: 'active'
    }
}, {
    timestamps: true,
    tableName: 'subscriptions',
    freezeTableName: true
});

// Linki l'abonnement bél nageur (Relation One-To-Many)
Subscription.belongsTo(Swimmer, { onDelete: 'CASCADE' });
Swimmer.hasMany(Subscription);

module.exports = Subscription;