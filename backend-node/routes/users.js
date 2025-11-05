const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// Middleware to check for admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ ok: false, error: 'Access denied. Admin role required.' });
    }
};

// @route   GET /users
// @desc    Get all users (for admins)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, status FROM users');
        res.json({ ok: true, data: { rows } });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /users/create
// @desc    Create a user (for admins)
router.post('/users/create', authMiddleware, adminOnly, async (req, res) => {
    const { name, email, password, role = 'teacher', status = 'active' } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, status]
        );
        res.status(201).json({ ok: true, data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /users/update
// @desc    Update a user (for admins)
router.post('/users/update', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.query;
    const { name, email, role, status, password } = req.body;

    if (!id) return res.status(400).json({ ok: false, error: 'User ID is required.' });

    try {
        let query = 'UPDATE users SET name = ?, email = ?, role = ?, status = ?';
        const params = [name, email, role, status];

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE id = ?';
        params.push(id);

        await pool.query(query, params);
        res.json({ ok: true, message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /users/delete
// @desc    Delete a user (for admins)
router.post('/users/delete', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ ok: false, error: 'User ID is required.' });

    try {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ ok: true, message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   GET /professores
// @desc    Get users with role 'teacher' or 'admin' (for selection lists)
router.get('/professores', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name FROM users WHERE role IN ('teacher', 'admin') ORDER BY name ASC");
        res.json({ ok: true, data: rows });
    } catch (error) {
        console.error('Error fetching professores:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});


module.exports = router;
