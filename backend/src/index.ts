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

// route ดึงข้อมูล
app.get("/testDataTable", async (req, res) => {
    try {
        const data = await prisma.category.findMany();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
