require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err.message);
});

module.exports = pool;
