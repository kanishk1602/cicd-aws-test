const express = require("express");
const path = require("path");
const https = require("https");
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req,res)=>{
    res.send("CI/CD Working - Change 2.0");
});

// Proxy endpoint to fetch PDFs from justice.gov
app.get("/proxy/pdf/:docNum", (req, res) => {
    const docNum = req.params.docNum.padStart(8, '0');
    const pdfPath = `/epstein/files/DataSet%202/EFTA${docNum}.pdf`;
    
    const options = {
        hostname: 'www.justice.gov',
        port: 443,
        path: pdfPath,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/pdf,*/*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cookie': 'age_verified=1',
            'Referer': 'https://www.justice.gov/epstein'
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        // Follow redirects
        if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
            const redirectUrl = proxyRes.headers.location;
            console.log('Redirect to:', redirectUrl);
            
            // If redirected to age-verify, try with cookie
            if (redirectUrl && redirectUrl.includes('age-verify')) {
                res.status(403).send('Age verification required - cannot bypass');
                return;
            }
        }

        const contentType = proxyRes.headers['content-type'];
        console.log(`Fetching EFTA${docNum}.pdf - Status: ${proxyRes.statusCode}, Content-Type: ${contentType}`);

        if (proxyRes.statusCode !== 200) {
            res.status(proxyRes.statusCode).send(`Failed to fetch PDF: ${proxyRes.statusCode}`);
            return;
        }

        // Check if we got a PDF
        if (contentType && contentType.includes('application/pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="EFTA${docNum}.pdf"`);
            proxyRes.pipe(res);
        } else {
            // Got HTML instead of PDF (likely age verification page)
            let body = '';
            proxyRes.on('data', chunk => body += chunk);
            proxyRes.on('end', () => {
                if (body.includes('age-verify') || body.includes('Age Verification')) {
                    res.status(403).send('Age verification page returned');
                } else {
                    res.status(400).send('Not a PDF response');
                }
            });
        }
    });

    proxyReq.on('error', (error) => {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching PDF: ' + error.message);
    });

    proxyReq.end();
});

// Debug endpoint to check what the proxy returns
app.get("/proxy/debug/:docNum", (req, res) => {
    const docNum = req.params.docNum.padStart(8, '0');
    const url = `https://www.justice.gov/epstein/files/DataSet%202/EFTA${docNum}.pdf`;
    res.json({ 
        targetUrl: url,
        message: 'Check server logs for response details'
    });
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});
