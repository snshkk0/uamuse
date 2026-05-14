/**
 * UAMUSE API Tests
 * Run: node tests/run.js
 * Make sure the server is running first: npm run dev
 */

const BASE = 'http://localhost:3001/api';

let passed = 0;
let failed = 0;
let createdUserId   = null;
let createdArtistId = null;

async function request(method, path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

function assert(label, condition, info = '') {
    if (condition) {
        console.log(`  ✓ ${label}`);
        passed++;
    } else {
        console.error(`  ✗ ${label}${info ? ' — ' + info : ''}`);
        failed++;
    }
}

// ── Users ─────────────────────────────────────────────────────────────────────

async function testUsers() {
    console.log('\n[Users]');

    // CREATE
    let { status, data } = await request('POST', '/users', {
        spotify_id:   'test_spotify_' + Date.now(),
        display_name: 'Test User',
        email:        'test@uamuse.com',
    });
    assert('POST /users — status 201',        status === 201);
    assert('POST /users — returns user',      data.id !== undefined);
    assert('POST /users — correct name',      data.display_name === 'Test User');
    createdUserId = data.id;

    // READ ALL
    ({ status, data } = await request('GET', '/users'));
    assert('GET /users — status 200',         status === 200);
    assert('GET /users — returns array',      Array.isArray(data));

    // READ ONE
    ({ status, data } = await request('GET', `/users/${createdUserId}`));
    assert('GET /users/:id — status 200',     status === 200);
    assert('GET /users/:id — correct user',   data.id === createdUserId);

    // UPDATE
    ({ status, data } = await request('PATCH', `/users/${createdUserId}`, { display_name: 'Updated User' }));
    assert('PATCH /users/:id — status 200',   status === 200);
    assert('PATCH /users/:id — name updated', data.display_name === 'Updated User');

    // NOT FOUND
    ({ status } = await request('GET', '/users/999999'));
    assert('GET /users/999999 — status 404',  status === 404);
}

// ── Artists ────────────────────────────────────────────────────────────────────

async function testArtists() {
    console.log('\n[Artists]');

    let { status, data } = await request('POST', '/artists', {
        name:  'Test Артист ' + Date.now(),
        genre: 'Indie Rock',
        bio:   'A test Ukrainian artist.',
    });
    assert('POST /artists — status 201',        status === 201);
    assert('POST /artists — returns artist',    data.id !== undefined);
    createdArtistId = data.id;

    ({ status, data } = await request('GET', '/artists'));
    assert('GET /artists — status 200',         status === 200);
    assert('GET /artists — returns array',      Array.isArray(data));

    ({ status, data } = await request('GET', `/artists/${createdArtistId}`));
    assert('GET /artists/:id — status 200',     status === 200);

    ({ status, data } = await request('PATCH', `/artists/${createdArtistId}`, { genre: 'Electronic Folk' }));
    assert('PATCH /artists/:id — status 200',   status === 200);
    assert('PATCH /artists/:id — genre updated', data.genre === 'Electronic Folk');

    ({ status } = await request('GET', '/artists/999999'));
    assert('GET /artists/999999 — status 404',  status === 404);
}

// ── Plays ──────────────────────────────────────────────────────────────────────

async function testPlays() {
    console.log('\n[Plays]');

    const { status, data } = await request('POST', '/plays/sync', {
        user_id: createdUserId,
        items: [
            { artist_name: 'Kalush Orchestra', track_name: 'Stefania',    played_at: new Date().toISOString() },
            { artist_name: 'ONUKA',            track_name: 'Vidlik',      played_at: new Date().toISOString() },
            { artist_name: 'Unknown Artist',   track_name: 'Some Song',   played_at: new Date().toISOString() },
        ],
    });
    assert('POST /plays/sync — status 200',          status === 200);
    assert('POST /plays/sync — synced 2 (Ukrainian only)', data.synced === 2);

    const { status: s2, data: d2 } = await request('GET', `/plays/user/${createdUserId}`);
    assert('GET /plays/user/:id — status 200',       s2 === 200);
    assert('GET /plays/user/:id — returns array',    Array.isArray(d2));
    assert('GET /plays/user/:id — only Ukrainian',
        d2.every(p => ['Kalush Orchestra', 'ONUKA'].includes(p.artist_name)));
}

// ── Charts ─────────────────────────────────────────────────────────────────────

async function testCharts() {
    console.log('\n[Charts]');

    const { status, data } = await request('GET', '/charts');
    assert('GET /charts — status 200',        status === 200);
    assert('GET /charts — returns array',     Array.isArray(data));

    const { status: s2, data: d2 } = await request('GET', `/charts/user/${createdUserId}`);
    assert('GET /charts/user/:id — status 200',   s2 === 200);
    assert('GET /charts/user/:id — has play_count', d2.every(r => r.play_count !== undefined));
}

// ── Cleanup ────────────────────────────────────────────────────────────────────

async function cleanup() {
    console.log('\n[Cleanup]');

    const { status: s1 } = await request('DELETE', `/artists/${createdArtistId}`);
    assert('DELETE /artists/:id — status 200', s1 === 200);

    const { status: s2 } = await request('DELETE', `/users/${createdUserId}`);
    assert('DELETE /users/:id — status 200',   s2 === 200);
}

// ── Runner ─────────────────────────────────────────────────────────────────────

(async () => {
    console.log('=== UAMUSE API Tests ===');
    try {
        await testUsers();
        await testArtists();
        await testPlays();
        await testCharts();
        await cleanup();
    } catch (err) {
        console.error('\nUnexpected error:', err.message);
        failed++;
    }

    console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
    process.exit(failed > 0 ? 1 : 0);
})();
