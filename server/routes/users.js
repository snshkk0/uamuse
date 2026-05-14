const express = require('express');
const router  = express.Router();
const db      = require('../db/postgres');

// GET all users
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM users ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single user by id
router.get('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST create or update user (upsert on spotify_id)
router.post('/', async (req, res) => {
    const { spotify_id, display_name, email, avatar_url } = req.body;
    if (!spotify_id) return res.status(400).json({ error: 'spotify_id is required' });
    try {
        const { rows } = await db.query(
            `INSERT INTO users (spotify_id, display_name, email, avatar_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (spotify_id) DO UPDATE
               SET display_name = EXCLUDED.display_name,
                   email        = EXCLUDED.email,
                   avatar_url   = EXCLUDED.avatar_url
             RETURNING *`,
            [spotify_id, display_name, email, avatar_url]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH update user
router.patch('/:id', async (req, res) => {
    const { display_name, email, avatar_url } = req.body;
    try {
        const { rows } = await db.query(
            `UPDATE users
             SET display_name = COALESCE($1, display_name),
                 email        = COALESCE($2, email),
                 avatar_url   = COALESCE($3, avatar_url)
             WHERE id = $4
             RETURNING *`,
            [display_name, email, avatar_url, req.params.id]
        );
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User deleted', user: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
