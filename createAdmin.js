const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { sequelize } = require('./config/db');

// Force l'emplacement mta3 .env
dotenv.config({ path: './.env' });

const createFirstAdmin = async () => {
    console.log('🔄 Démarrage du script de création d\'admin...');
    
    try {
        console.log('📡 Tentative de connexion à la base de données...');
        await sequelize.authenticate();
        console.log('✅ Connexion à la base de données réussie!');
        
        const username = 'tefa';
        const rawPassword = 'tefa22'; 

        // Verifi ken l'admin mawjoud mel sghir
        console.log('🔍 Vérification si l\'admin existe déjà...');
        const existingAdmin = await Admin.findOne({ where: { username } });
        
        if (existingAdmin) {
            console.log('⚠️ Cet admin existe déjà dans la base de données!');
            process.exit(0);
        }

        console.log('🔐 Cryptage du mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        console.log('📝 Création de l\'admin dans la base...');
        const admin = await Admin.create({
            username: username,
            password: hashedPassword
        });

        console.log(`\n🎉 Admin créé avec succès!`);
        console.log(`👤 Username: ${username}`);
        console.log(`🔑 Password: ${rawPassword}\n`);
        
        // Nsakrou l'instance bél gdey
        await sequelize.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'admin:', error.message);
        process.exit(1);
    }
};

createFirstAdmin();