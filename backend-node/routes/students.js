const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /students
// @desc    Get a paginated list of students with filters
router.get('/students', authMiddleware, async (req, res) => {
    const { page = 1, per_page = 10, sort_by = 'name', sort_direction = 'asc', q, status, modalidade } = req.query;
    const offset = (page - 1) * per_page;

    try {
        let query = 'SELECT s.*, sch.name as school_name FROM students s LEFT JOIN schools sch ON s.school_id = sch.id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM students WHERE 1=1';
        const params = [];
        const countParams = [];

        if (q) {
            query += ' AND s.name LIKE ?';
            countQuery += ' AND name LIKE ?';
            params.push(`%${q}%`);
            countParams.push(`%${q}%`);
        }
        if (status) {
            query += ' AND s.status = ?';
            countQuery += ' AND status = ?';
            params.push(status);
            countParams.push(status);
        }
        if (modalidade) {
            query += ' AND s.modalidade = ?';
            countQuery += ' AND modalidade = ?';
            params.push(modalidade);
            countParams.push(modalidade);
        }

        // Sorting
        const validSortFields = ['name', 'status', 'modalidade'];
        const orderBy = validSortFields.includes(sort_by) ? sort_by : 'name';
        const orderDirection = sort_direction.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
        query += ` ORDER BY ${orderBy} ${orderDirection}`;

        // Pagination
        query += ' LIMIT ? OFFSET ?';
        params.push(parseInt(per_page, 10), parseInt(offset, 10));

        const [[{ total }], [rows]] = await Promise.all([
            pool.query(countQuery, countParams),
            pool.query(query, params)
        ]);

        res.json({ ok: true, data: { rows, total } });

    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /students/create
// @desc    Create a new student
router.post('/students/create', authMiddleware, async (req, res) => {
    const { name, school_id, modalidade, status = 'ativo', support_teacher_id, srm_room_id, created_by_teacher_id } = req.body;

    if (!name || !school_id || !modalidade) {
        return res.status(400).json({ ok: false, error: 'Name, school_id, and modalidade are required.' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO students (name, school_id, modalidade, status, support_teacher_id, srm_room_id, created_by_teacher_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, school_id, modalidade, status, support_teacher_id, srm_room_id, created_by_teacher_id || req.user.id]
        );
        res.status(201).json({ ok: true, data: { id: result.insertId } });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   PUT /students/update
// @desc    Update a student
router.put('/students/update', authMiddleware, async (req, res) => {
    const { id } = req.query;
    const { name, school_id, modalidade, status, support_teacher_id, srm_room_id } = req.body;

    if (!id) return res.status(400).json({ ok: false, error: 'Student ID is required.' });
    if (!name || !school_id || !modalidade) return res.status(400).json({ ok: false, error: 'Name, school_id, and modalidade are required.' });

    try {
        await pool.query(
            'UPDATE students SET name = ?, school_id = ?, modalidade = ?, status = ?, support_teacher_id = ?, srm_room_id = ? WHERE id = ?',
            [name, school_id, modalidade, status, support_teacher_id, srm_room_id, id]
        );
        res.json({ ok: true, message: 'Student updated successfully.' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

// @route   POST /students/delete
// @desc    Delete a student (soft delete could be implemented here)
router.post('/students/delete', authMiddleware, async (req, res) => {
    const { id } = req.query;

    if (!id) return res.status(400).json({ ok: false, error: 'Student ID is required.' });

    try {
        // First, check if the user has permission (is admin or the creator)
        const [students] = await pool.query('SELECT created_by_teacher_id FROM students WHERE id = ?', [id]);
        if (students.length === 0) {
            return res.status(404).json({ ok: false, error: 'Student not found.' });
        }
        const student = students[0];

        if (req.user.role !== 'admin' && student.created_by_teacher_id !== req.user.id) {
            return res.status(403).json({ ok: false, error: 'You do not have permission to delete this student.' });
        }

        // We are doing a hard delete to match the current PHP logic.
        // A soft delete (setting status to 'deleted') would be safer.
        await pool.query('DELETE FROM students WHERE id = ?', [id]);

        res.json({ ok: true, message: 'Student deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ ok: false, error: 'Server error' });
    }
});

module.exports = router;
