module.exports = async function (req, res) {
    if (req.url === '/' || req.url === '') {
        return res.status(200).send('Pandora Proxy is alive!');
    }
    
    // Create target URL
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
        
        // Remove restricted headers
        delete fetchOptions.headers['connection'];
        delete fetchOptions.headers['content-length'];
        delete fetchOptions.headers['x-forwarded-host'];
        delete fetchOptions.headers['x-forwarded-proto'];
        delete fetchOptions.headers['x-forwarded-for'];
        
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            // we have to handle the request body manually for raw streams
            const getRawBody = () => new Promise((resolve) => {
                let body = [];
                req.on('data', chunk => body.push(chunk));
                req.on('end', () => resolve(Buffer.concat(body)));
            });
            fetchOptions.body = await getRawBody();
        }

        const response = await fetch(targetUrl, fetchOptions);
        
        // Forward headers
        response.headers.forEach((val, key) => {
            if (key.toLowerCase() !== 'content-encoding' && key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
                res.setHeader(key, val);
            }
        });

        const arrayBuffer = await response.arrayBuffer();
        res.status(response.status).send(Buffer.from(arrayBuffer));

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
