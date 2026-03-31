const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('📡 Connexion à MySQL réussie (XAMPP)!');

        // FIX: alter:true automatically adds any missing columns (status, endSub, photo_url)
        // without dropping existing data. Safe for development.
        await sequelize.sync({ alter: true });
        console.log('📚 Toutes les tables sont synchronisées (alter mode).');
    } catch (error) {
        console.error('❌ Impossible de se connecter à MySQL:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };