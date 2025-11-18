import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error("❌ FATAL: GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); // สร้าง instance 'ai'

app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Welcome to MCP Bro! (AI Ready)');
});

app.post('/api/ask', async (req: Request, res: Response) => {
    const requestData = req.body;
    const { question, companyId } = requestData;

    if (!question || typeof question !== 'string') {
        return res.status(400).json({
            status: 'failed',
            message: 'Question field is required in the request body.'
        });
    }

    try {
        // 1.  กำหนด System Instruction เพื่อให้ Gemini ทำหน้าที่เฉพาะทาง
        // const systemInstruction = `You are an AI assistant specialized in analyzing coffee quality control data for Company ID ${companyId}. Based on the user's question, provide concise, technical, and accurate analysis.`;
        const systemInstruction = `
You are an AI assistant for Company ID ${companyId}. 
You can answer general questions normally, 
but when the user asks about coffee quality control, 
provide technical and accurate analysis.
`;

        // 2. เรียกใช้ Gemini API
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: question,
            config: {
                systemInstruction: systemInstruction,
                // สามารถเพิ่มการตั้งค่าอื่นๆ เช่น temperature หรือ maxOutputTokens ได้ที่นี่
            }
        });

        const geminiAnswer = response.text;
        const mcpResult = {
            inputData: requestData.question,
            result: geminiAnswer,
        };
        res.status(200).json(mcpResult);
    } catch (error) {
        console.error('Error during Gemini API call:', error);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 MCP Service is running on port ${PORT}`);
    console.log(`API Endpoint: http://localhost:${PORT}/api/ask`);
});