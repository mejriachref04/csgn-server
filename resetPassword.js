require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

const run = async () => {
    const conn = await mysql.createConnection({
        host: 'interchange.proxy.rlwy.net',
        user: 'root',
        password: 'nMccSEFelBsHmvPTqVsRoBcaCtTcavZy',
        database: 'railway',
        port: 40677,
        ssl: { rejectUnauthorized: false }
    });

    const hash = await bcrypt.hash('Admin123', 10);
    await conn.execute('UPDATE admins SET password = ? WHERE username = ?', [hash, 'admin_marsa']);
    console.log('✅ Password updated! Login with Admin123');
    await conn.end();
};

run().catch(console.error);