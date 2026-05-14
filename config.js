const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname);

const CONFIG = {
    API_URL: IS_LOCAL
        ? 'http://localhost:3001/api'
        : 'https://your-server.railway.app/api',
};
