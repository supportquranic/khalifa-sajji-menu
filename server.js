const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function resolveFile(reqPath) {
    const safePath = path.normalize(decodeURIComponent(reqPath)).replace(/^(\.\.[\/\\])+/, '');
    
    // Candidate locations
    const candidates = [
        path.join(__dirname, safePath),
        path.join('D:\\ai\\khalifa-sajji', safePath),
        path.join(__dirname, safePath + '.jpg'),
        path.join('D:\\ai\\khalifa-sajji', safePath + '.jpg')
    ];

    for (const p of candidates) {
        try {
            if (fs.existsSync(p) && fs.statSync(p).isFile()) {
                return p;
            }
        } catch (e) {}
    }
    return null;
}

function requestHandler(req, res) {
    try {
        let reqPath = req.url.split('?')[0];
        if (reqPath === '/' || reqPath === '') {
            reqPath = '/index.html';
        }

        const filePath = resolveFile(reqPath);

        if (!filePath) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        });
        fs.createReadStream(filePath).pipe(res);
    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
    }
}

// Start IPv4 server
const serverV4 = http.createServer(requestHandler);
serverV4.listen(PORT, '0.0.0.0', () => {
    console.log(`IPv4 Server running at http://127.0.0.1:${PORT}/`);
});

// Start IPv6 server for localhost (::1)
try {
    const serverV6 = http.createServer(requestHandler);
    serverV6.listen(PORT, '::1', () => {
        console.log(`IPv6 Server running at http://[::1]:${PORT}/ (localhost)`);
    });
} catch (e) {
    console.log('IPv6 not bound:', e.message);
}
