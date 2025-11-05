const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

// @route   POST /register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    const { name, email, password, role = 'teacher' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ ok: false, error: 'Please provide name, email, and password.' });
    }

    try {
        // Check if user already exists
        const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ ok: false, error: 'User with this email already exists.' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, 'active']
        );

        res.status(201).json({ ok: true, message: 'User registered successfully.', data: { id: result.insertId } });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ ok: false, error: 'Server error during registration.' });
    }
});

// @route   POST /login
// @desc    Authenticate user and get token
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ ok: false, message: 'Please provide email and password.' });
    }

    try {
        // Find user by email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ ok: false, message: 'Invalid credentials.' });
        }

        // Prevent student login
        if (user.role === 'student') {
            return res.status(403).json({ ok: false, message: 'Access denied. Only teachers and administrators can log in.' });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                name: user.name,
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '72h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    ok: true,
                    message: 'Login successful!',
                    data: {
                        token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    }
                });
            }
        );
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ ok: false, message: 'Server error during login.' });
    }
});

module.exports = router;
