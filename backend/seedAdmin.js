// Creates the admin account using ADMIN_* values from .env
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

(async () => {
  try {
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = (process.env.ADMIN_EMAIL || 'admin@campusconnect.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      console.log(`Admin already exists: ${email}`);
    } else {
      const hashed = await bcrypt.hash(password, 10);
      await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')", [
        name,
        email,
        hashed,
      ]);
      console.log(`Admin created. Email: ${email}  Password: ${password}`);
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
  } finally {
    process.exit();
  }
})();
