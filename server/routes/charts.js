const express = require('express');
const router  = express.Router();
const db      = require('../db/postgres');

// GET top Ukrainian artists by play count (all users)
router.get('/', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM top_charts LIMIT 20');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET top charts for a specific user
router.get('/user/:user_id', async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT artist_name, COUNT(*) AS play_count, MAX(played_at) AS last_played
             FROM plays
             WHERE user_id = $1
             GROUP BY artist_name
             ORDER BY play_count DESC
             LIMIT 20`,
            [req.params.user_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
