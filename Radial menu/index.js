const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, "src")));

// Force correct MIME types
app.use((req, res, next) => {
  if (req.url.endsWith(".js")) {
    res.setHeader("Content-Type", "application/javascript");
  } else if (req.url.endsWith(".css")) {
    res.setHeader("Content-Type", "text/css");
  }
  next();
});

// Serve index.html (optional, for SPA routing)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = app;