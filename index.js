const express = require("express");
const path = require("path");
const https = require("https");
const app = express();

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req,res)=>{
    res.send("CI/CD Working - Change 2.0");
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});
