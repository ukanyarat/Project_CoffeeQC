import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch'; // หรือ axios

const app = express();
const port = 3002;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/analyze', async (req: Request, res: Response) => {
    const { question } = req.body;
    if (!question) return res.status(400).json({ message: 'Question is required' });

    try {
        // 1. Fetch all relevant data from DB
        const users = await prisma.user.findMany();
        const orders = await prisma.order.findMany({ include: { orderLists: true } });
        const menus = await prisma.menu.findMany();

        const databaseContent = { users, orders, menus };

        // 2. Call Gemini AI to process the question
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: `Database: ${JSON.stringify(databaseContent).slice(0, 2000)}. Question: ${question}. Answer concisely based on database.` }
                        ]
                    }
                ]
            })
        });

        const aiData = await aiResponse.json();

        const answer = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "No answer from AI";

        // 3. Return answer to frontend
        res.status(200).json({ question, answer });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Failed to process request', error: error.message });
    }
});

app.listen(port, () => console.log(`MCP service listening on port ${port}`));
