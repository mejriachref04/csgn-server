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

// Associations defined without foreign key constraints for production compatibility
Subscription.belongsTo(Swimmer, { foreignKey: 'SwimmerId', constraints: false });
Swimmer.hasMany(Subscription, { foreignKey: 'SwimmerId', constraints: false });

module.exports = Subscription;