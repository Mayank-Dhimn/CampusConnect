const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const signToken = (user) =>
  jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (u) => ({
  user_id: u.user_id,
  name: u.name,
  email: u.email,
  department: u.department,
  semester: u.semester,
  role: u.role,
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { name, email, password, department, semester } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const sem = semester ? parseInt(semester, 10) : null;
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, department, semester) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hashed, department || null, sem]
    );

    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [result.insertId]);
    const user = rows[0];
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' });

    res.status(200).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(publicUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, department, semester, password } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const sem = semester ? parseInt(semester, 10) : null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      const hashed = await bcrypt.hash(password, 10);
      await db.query(
        'UPDATE users SET name = ?, department = ?, semester = ?, password = ? WHERE user_id = ?',
        [name.trim(), department || null, sem, hashed, req.user.id]
      );
    } else {
      await db.query(
        'UPDATE users SET name = ?, department = ?, semester = ? WHERE user_id = ?',
        [name.trim(), department || null, sem, req.user.id]
      );
    }

    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.user.id]);
    res.status(200).json(publicUser(rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
