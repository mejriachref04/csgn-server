require('dotenv').config();
const { sequelize } = require('./config/db');
require('./models/Admin');
require('./models/Swimmer');
require('./models/Subscription');
require('./models/Planning');

const sync = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected!');
        await sequelize.sync({ force: true });
        console.log('All tables created!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
};

sync();
