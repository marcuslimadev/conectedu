const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ ok: false, error: 'Access denied. Admin role required.' });
    }
};

// @route   GET /schools
// @desc    Get all schools
router.get('/schools', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM schools ORDER BY name ASC');
        res.json({ ok: true, data: { rows } });
    } catch (error) {
        console.error('Error fetching schools:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   GET /schools/options
// @desc    Get schools as options for select components
router.get('/schools/options', authMiddleware, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name as text, city, address FROM schools ORDER BY name ASC');
        res.json({ ok: true, data: { options: rows } });
    } catch (error) {
        console.error('Error fetching school options:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});


// @route   POST /schools/create
// @desc    Create a school (admin only)
router.post('/schools/create', authMiddleware, adminOnly, async (req, res) => {
    const { name, address, city, phone } = req.body;
    if (!name) {
        return res.status(400).json({ ok: false, error: 'School name is required.' });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO schools (name, address, city, phone) VALUES (?, ?, ?, ?)',
            [name, address, city, phone]
        );
        res.status(201).json({ ok: true, data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating school:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /schools/update
// @desc    Update a school (admin only)
router.post('/schools/update', authMiddleware, adminOnly, async (req, res) => {
    const { id, name, address, city, phone } = req.body;
    if (!id || !name) {
        return res.status(400).json({ ok: false, error: 'ID and name are required.' });
    }
    try {
        await pool.query(
            'UPDATE schools SET name = ?, address = ?, city = ?, phone = ? WHERE id = ?',
            [name, address, city, phone, id]
        );
        res.json({ ok: true, message: 'School updated successfully.' });
    } catch (error) {
        console.error('Error updating school:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   DELETE /schools/delete
// @desc    Delete a school (admin only)
router.delete('/schools/delete', authMiddleware, adminOnly, async (req, res) => {
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ ok: false, error: 'School ID is required.' });
    }
    try {
        await pool.query('DELETE FROM schools WHERE id = ?', [id]);
        res.json({ ok: true, message: 'School deleted successfully.' });
    } catch (error) {
        console.error('Error deleting school:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

module.exports = router;
