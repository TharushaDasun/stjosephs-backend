// seed.js - Run once to create the initial admin user
// Usage: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async () => {
    await connectDB();

    try {
        // Delete existing admins
        await Admin.deleteMany();

        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'StJosephs@2024!';

        await Admin.create({ username, password });

        console.log(`\n✅ Admin user created!`);
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        console.log(`\n⚠️  Change your password after first login!\n`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
        process.exit(1);
    }
};

seedAdmin();
