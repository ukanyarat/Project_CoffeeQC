// backend/index.js
require('module-alias/register');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const PORT = process.env.PORT || 3000;

const prisma = new PrismaClient();
const app = express();

// Middleware สำหรับ JSON
app.use(express.json());
// ตัวอย่าง route
app.get("/", (req, res) => {
    res.send("Hello from Express backend 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
