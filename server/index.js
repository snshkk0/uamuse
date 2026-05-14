require('dotenv').config();
const express  = require('express');
const cors     = require('cors');

const usersRouter   = require('./routes/users');
const artistsRouter = require('./routes/artists');
const playsRouter   = require('./routes/plays');
const chartsRouter  = require('./routes/charts');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'UAMUSE API is running' });
});

// Routes
app.use('/api/users',   usersRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/plays',   playsRouter);
app.use('/api/charts',  chartsRouter);

// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.listen(PORT, () => {
    console.log(`UAMUSE server running on http://localhost:${PORT}`);
});

module.exports = app;
