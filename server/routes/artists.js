const express = require('express');
const router  = express.Router();
const db      = require('../db/postgres');

// GET all artists
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM artists ORDER BY name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single artist
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM artists WHERE id = $1', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Artist not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create artist
router.post('/', async (req, res) => {
    const { name, genre, bio } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    try {
        const { rows } = await db.query(
            `INSERT INTO artists (name, genre, bio)
             VALUES ($1, $2, $3)
             ON CONFLICT (name) DO UPDATE SET genre = EXCLUDED.genre, bio = EXCLUDED.bio
             RETURNING *`,
            [name, genre, bio]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update artist
router.patch('/:id', async (req, res) => {
    const { name, genre, bio } = req.body;
    try {
        const { rows } = await db.query(
            `UPDATE artists
             SET name  = COALESCE($1, name),
                 genre = COALESCE($2, genre),
                 bio   = COALESCE($3, bio)
             WHERE id = $4
             RETURNING *`,
            [name, genre, bio, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Artist not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE artist
router.delete('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('DELETE FROM artists WHERE id = $1 RETURNING *', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Artist not found' });
        res.json({ message: 'Artist deleted', artist: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
