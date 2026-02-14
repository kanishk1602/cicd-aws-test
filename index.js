const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req,res)=>{
    res.send("CI/CD Working - Change 2.0");
});

// Proxy endpoint to fetch PDFs from justice.gov
app.get("/proxy/pdf/:docNum", async (req, res) => {
    const docNum = req.params.docNum.padStart(8, '0');
    const pdfUrl = `https://www.justice.gov/epstein/files/DataSet%202/EFTA${docNum}.pdf`;
    
    try {
        // Dynamically import node-fetch
        const fetch = (await import('node-fetch')).default;
        
        const response = await fetch(pdfUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/pdf,*/*',
            }
        });
        
        if (!response.ok) {
            return res.status(response.status).send(`Failed to fetch PDF: ${response.statusText}`);
        }
        
        // Set headers to serve as PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="EFTA${docNum}.pdf"`);
        
        // Pipe the response body to the client
        response.body.pipe(res);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).send('Error fetching PDF');
    }
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});
