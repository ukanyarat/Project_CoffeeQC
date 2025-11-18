import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const app = express();
const port = 3002; // Port for the MCP service
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to MCP Bro!');
});
app.post('/api/ask', (req: Request, res: Response) => {
    const requestData = req.body;

    // ตรวจสอบข้อมูลที่ได้รับ
    console.log('Received request from Service:', requestData);

    // *** ส่วนนี้คือ Logic การประมวลผลของ MCP ***
    // เช่น การเรียกใช้ AI Model, การคำนวณ, หรือการดึงข้อมูล

    // สร้างคำตอบจำลองกลับไป
    const mcpResult = {
        status: 'processed',
        message: 'Payload received and processed successfully by MCP.',
        inputData: requestData,
        result: 'The calculated answer is 42.' // คำตอบจากการคิด
    };

    // ส่งคำตอบกลับไปยัง Service ต้นทาง (Port 8080/อื่นๆ)
    res.status(200).json(mcpResult);
});


app.listen(port, () => {
    console.log(`MCP service listening on port ${port}`);
});
