const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('/*', async (req, res) => {
    if (req.path === '/') return res.send('Pandora Proxy V2 is running.');
    
    const targetUrl = 'https://www.pandora.com' + req.url;
    
    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                ...req.headers,
                host: 'www.pandora.com',
                origin: 'https://www.pandora.com',
                referer: 'https://www.pandora.com/'
            }
        };
        
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(targetUrl, fetchOptions);
        
        // Forward headers
        response.headers.forEach((val, key) => {
            res.setHeader(key, val);
        });

        const data = await response.text();
        res.status(response.status).send(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
