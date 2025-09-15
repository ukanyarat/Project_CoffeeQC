// backend/index.js
const express = require("express");
const app = express();
const PORT = 3000;

// Middleware สำหรับ JSON
app.use(express.json());

// ตัวอย่าง route
app.get("/", (req, res) => {
    res.send("Hello from Express backend 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
