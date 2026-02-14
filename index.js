const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the current directory
app.use(express.static(__dirname));

app.get("/", (req,res)=>{
    res.send("CI/CD Working - Change 2.0");
});

app.listen(3000, ()=>{
    console.log("Server running on port 3000");
});
