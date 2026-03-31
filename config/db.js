const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: isProduction ? {
            ssl: {
                require: true,
                rejectUnauthorized: false // needed for some cloud MySQL providers
            }
        } : {}
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('📡 MySQL connected!');

        // Production: force:false only — never alter in prod (use migrations)
        // Development: alter:true to auto-add missing columns
        if (isProduction) {
            await sequelize.sync({ force: false });
        } else {
            await sequelize.sync({ alter: true });
        }

        console.log('📚 Tables synchronisées.');
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };