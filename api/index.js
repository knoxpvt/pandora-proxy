const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Health check
app.get('/', (req, res) => res.send('Pandora Proxy is running.'));

// Proxy all requests to Pandora
app.use('/', createProxyMiddleware({
    target: 'https://www.pandora.com',
    changeOrigin: true,
    headers: {
        'Origin': 'https://www.pandora.com',
        'Referer': 'https://www.pandora.com/'
    },
    onProxyReq: (proxyReq, req, res) => {
        // Forward client IP if needed or spoof
    }
}));

module.exports = app;
