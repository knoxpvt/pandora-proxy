const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
// Parse raw text body for everything
app.use(express.text({ type: '*/*' }));

app.all('/*', async (req, res) => {
    if (req.path === '/') return res.send('Pandora Proxy V3 is running.');
    
    const targetUrl = 'https://www.pandora.com' + req.url;
    
    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                ...req.headers,
                host: 'www.pandora.com',
                origin: 'https://www.pandora.com',
                referer: 'https://www.pandora.com/',
                'accept-encoding': 'identity' // prevent compression issues
            }
        };
        
        // Remove headers that might cause issues with node fetch
        delete fetchOptions.headers['connection'];
        delete fetchOptions.headers['content-length'];
        
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            fetchOptions.body = (typeof req.body === 'string') ? req.body : '';
        }

        const response = await fetch(targetUrl, fetchOptions);
        
        // Forward headers
        response.headers.forEach((val, key) => {
            // avoid forwarding content-encoding to prevent double decoding errors on client
            if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'content-length') {
                res.setHeader(key, val);
            }
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        res.status(response.status).send(buffer);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = app;
