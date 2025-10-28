import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
const app = express();
const port = 3002; // Port for the MCP service
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('MCP Service is running and ready to connect to the database!');
});
app.post('/analyze', async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ message: 'Question is required in the request body.' });
    }

    try {
        let summary = '';

        // ตัวอย่าง logic วิเคราะห์คำถามง่าย ๆ
        if (question.includes('เมนู')) {
            const menuCount = await prisma.menu.count();
            summary = `มี ${menuCount} เมนูในฐานข้อมูล`;
        } else if (question.includes('ยอดวันนี้')) {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            const total = await prisma.order.aggregate({
                _sum: { amount: true },
                where: { createdAt: { gte: startOfDay, lte: endOfDay } }
            });
            summary = `ยอดรวมวันนี้คือ ${total._sum.amount || 0} บาท`;
        } else {
            summary = 'ยังไม่สามารถตอบคำถามนี้ได้';
        }

        res.status(200).json({
            message: "Successfully analyzed the data.",
            question,
            summary
        });

    } catch (error: any) {
        console.error('Error during database query or analysis:', error.message);
        res.status(500).json({ message: 'Failed to process request in MCP service.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`MCP service listening on port ${port}`);
});
