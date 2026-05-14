const express = require('express');
const router  = express.Router();
const db      = require('../db/postgres');

const UKRAINIAN_ARTISTS = [
    'Kalush Orchestra', 'ONUKA', 'Tvorchi', 'Go_A',
    'Діти інженерів', 'Drevo', 'Alena Omargalieva',
    'Jerry Heil', 'Vivienne Mort', 'The Hardkiss', 'Jamala',
];

// GET all plays for a user
router.get('/user/:user_id', async (req, res) => {
    try {
        const { rows } = await db.query(
            'SELECT * FROM plays WHERE user_id = $1 ORDER BY played_at DESC',
            [req.params.user_id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST sync listening history from Spotify for a user
// Body: { user_id, items: [ { artist_name, track_name, played_at } ] }
router.post('/sync', async (req, res) => {
    const { user_id, items } = req.body;
    if (!user_id || !Array.isArray(items)) {
        return res.status(400).json({ error: 'user_id and items[] are required' });
    }

    const ukrainian = items.filter(item =>
        UKRAINIAN_ARTISTS.some(a => a.toLowerCase() === item.artist_name?.toLowerCase())
    );

    if (!ukrainian.length) return res.json({ synced: 0 });

    try {
        const values = ukrainian.map((_, i) =>
            `($1, $${i * 3 + 2}, $${i * 3 + 3}, $${i * 3 + 4})`
        ).join(', ');

        const params = [user_id, ...ukrainian.flatMap(p => [p.artist_name, p.track_name, p.played_at])];

        await db.query(
            `INSERT INTO plays (user_id, artist_name, track_name, played_at) VALUES ${values}
             ON CONFLICT DO NOTHING`,
            params
        );
        res.json({ synced: ukrainian.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE a play record
router.delete('/:id', async (req, res) => {
    try {
        const { rows } = await db.query('DELETE FROM plays WHERE id = $1 RETURNING *', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'Play not found' });
        res.json({ message: 'Play deleted', play: rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
