const CLIENT_ID    = 'aeb28cef57934414aa17b35206b7889f';
const REDIRECT_URI = IS_LOCAL
    ? 'http://localhost:3000/log_in.html'
    : 'https://snshkk0.github.io/uamuse/log_in.html';

const API_URL = CONFIG.API_URL;

const SCOPES = 'user-read-private user-read-email user-read-recently-played';

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array).map(b => chars[b % chars.length]).join('');
}

async function generateCodeChallenge(verifier) {
    const data   = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function loginWithSpotify() {
    const verifier  = generateRandomString(64);
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem('spotify_verifier', verifier);

    const params = new URLSearchParams({
        client_id:             CLIENT_ID,
        response_type:         'code',
        redirect_uri:          REDIRECT_URI,
        scope:                 SCOPES,
        code_challenge_method: 'S256',
        code_challenge:        challenge,
    });

    window.location = `https://accounts.spotify.com/authorize?${params}`;
}

async function exchangeToken(code) {
    const verifier = sessionStorage.getItem('spotify_verifier');

    const response = await fetch('https://accounts.spotify.com/api/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    new URLSearchParams({
            client_id:     CLIENT_ID,
            grant_type:    'authorization_code',
            code,
            redirect_uri:  REDIRECT_URI,
            code_verifier: verifier,
        }),
    });

    const data = await response.json();
    localStorage.setItem('spotify_token', data.access_token);
    sessionStorage.removeItem('spotify_verifier');
    window.history.replaceState({}, document.title, window.location.pathname);
    showLoggedIn(data.access_token);
}

async function syncWithBackend(spotifyToken, spotifyUser) {
    try {
        // 1. Save / update user in our database
        const userRes = await fetch(`${API_URL}/users`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                spotify_id:   spotifyUser.id,
                display_name: spotifyUser.display_name,
                email:        spotifyUser.email,
                avatar_url:   spotifyUser.images?.[0]?.url || null,
            }),
        });
        const dbUser = await userRes.json();
        if (dbUser.id) localStorage.setItem('uamuse_user_id', dbUser.id);

        // 2. Fetch recently played from Spotify
        const recentRes = await fetch(
            'https://api.spotify.com/v1/me/player/recently-played?limit=50',
            { headers: { Authorization: `Bearer ${spotifyToken}` } }
        );
        const recent = await recentRes.json();

        // 3. Sync Ukrainian plays to our backend
        const items = (recent.items || []).map(item => ({
            artist_name: item.track.artists[0].name,
            track_name:  item.track.name,
            played_at:   item.played_at,
        }));

        await fetch(`${API_URL}/plays/sync`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ user_id: dbUser.id, items }),
        });
    } catch (err) {
        console.warn('Backend sync failed (is the server running?):', err.message);
    }
}

async function showLoggedIn(token) {
    const res  = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();

    if (user.error) {
        localStorage.removeItem('spotify_token');
        return;
    }

    // Sync in the background — don't block the UI
    syncWithBackend(token, user);

    const card = document.querySelector('.login-card');
    if (card) {
        card.innerHTML = `
            <div class="login-form" style="align-items:center; text-align:center">
                ${user.images?.[0] ? `<img src="${user.images[0].url}" style="width:80px;height:80px;border-radius:50%;margin-bottom:10px">` : ''}
                <p class="login-label">Logged in as</p>
                <p style="color:#ffd700; font-size:1.3rem; font-weight:bold; margin: 6px 0 16px">${user.display_name}</p>
                <a href="./index.html"><button class="spotify-btn" type="button">CONTINUE BROWSING →</button></a>
                <button class="login-btn" style="margin-top:10px" onclick="logout()">LOGOUT</button>
            </div>
        `;
    }
}

function logout() {
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('uamuse_user_id');
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        exchangeToken(code);
        return;
    }
    const token = localStorage.getItem('spotify_token');
    if (token) showLoggedIn(token);

    const btn = document.getElementById('spotify-login-btn');
    if (btn) btn.addEventListener('click', loginWithSpotify);
});
