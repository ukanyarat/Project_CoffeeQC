import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to MCP Bro!');
});

app.post('/api/ask', (req: Request, res: Response) => {
    console.log('Received request from Service: \n', req.body);
    res.status(200).send('Welcome to MCP >> /api/ask!');
    // const requestData = req.body;

    // // ตรวจสอบข้อมูลที่ได้รับ
    // console.log('Received request from Service:', requestData);

    // // *** ส่วนนี้คือ Logic การประมวลผลของ MCP ***
    // // เช่น การเรียกใช้ AI Model, การคำนวณ, หรือการดึงข้อมูล

    // // สร้างคำตอบจำลองกลับไป
    // const mcpResult = {
    //     status: 'processed',
    //     message: 'Payload received and processed successfully by MCP.',
    //     inputData: requestData,
    //     result: 'The calculated answer is 42.' // คำตอบจากการคิด
    // };

    // // ส่งคำตอบกลับไปยัง Service ต้นทาง (Port 8080/อื่นๆ)
    // res.status(200).json(mcpResult);
});


// 🚀 เริ่มต้น Server
app.listen(PORT, () => {
    console.log(`🚀 MCP Service is running on port ${PORT}`);
});