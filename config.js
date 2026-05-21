const IS_LOCAL = ['localhost', '127.0.0.1'].includes(window.location.hostname)
    || window.location.hostname.endsWith('.ngrok-free.app')
    || window.location.hostname.endsWith('.ngrok-free.dev')
    || window.location.hostname.endsWith('.ngrok.io');

const CONFIG = {
    API_URL: IS_LOCAL
        ? 'http://localhost:3001/api'
        : 'https://your-server.railway.app/api',
};
