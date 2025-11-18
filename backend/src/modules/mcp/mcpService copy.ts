import { Request, Response } from 'express';
import { userRepository } from '../user/userRepository';
import { orderRepository } from '../order/orderRepository';
import { menuRepository } from '../menu/menuRepository';
import prisma from '@src/db';
import axios from 'axios';

async function getCompanyId(): Promise<string | null> {
    const company = await prisma.company.findFirst({
        select: { id: true }
    });
    return company?.id || null;
}

// ฟังก์ชันนี้จะเรียก Gemini AI เพื่อช่วยวิเคราะห์ intent ของคำถาม
async function getAiIntent(question: string): Promise<'user' | 'order' | 'menu' | 'general'> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

    const prompt = `
You are an AI assistant. Determine the category of the following question.
Answer only one of these categories: "user", "order", "menu", "general".

Question: "${question}"
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await axios.post(apiUrl, {
            contents: [{ parts: [{ text: prompt }] }]
        }, { headers: { 'Content-Type': 'application/json' } });

        const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || 'general';

        if (text.includes('user')) return 'user';
        if (text.includes('order')) return 'order';
        if (text.includes('menu')) return 'menu';
        return 'general';
    } catch (error: any) {
        console.error("Error calling Gemini API for intent:", error.response?.data || error.message);
        return 'general';
    }
}

// ฟังก์ชันหลักในการวิเคราะห์คำถามและดึงข้อมูลจริงจาก DB
async function analyzeAndFetch(question: string): Promise<string> {
    const companyId = await getCompanyId();
    if (!companyId) return "ไม่พบบริษัทในระบบ ไม่สามารถให้คำตอบได้";

    // ใช้ AI วิเคราะห์ intent
    const intent = await getAiIntent(question);

    try {
        switch (intent) {
            case 'user': {
                const userCount = await userRepository.count(companyId, "");
                return `ฉันเจอข้อมูลพนักงานทั้งหมด ${userCount} คนค่ะ`;
            }
            case 'order': {
                const orderCount = await orderRepository.count(companyId, "");
                return `ฉันเจอข้อมูลออเดอร์ทั้งหมด ${orderCount} รายการค่ะ`;
            }
            case 'menu': {
                const menuCount = await menuRepository.count(companyId, "");
                return `ฉันเจอข้อมูลเมนูทั้งหมด ${menuCount} รายการค่ะ`;
            }
            case 'general':
            default: {
                // สำหรับคำถามทั่วไปที่ AI สามารถตอบได้เอง
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) throw new Error("GEMINI_API_KEY is not set.");

                const prompt = `
You are a helpful AI assistant. Answer the user's question in Thai.

Question: "${question}"
`;
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
                const aiResponse = await axios.post(apiUrl, {
                    contents: [{ parts: [{ text: prompt }] }]
                }, { headers: { 'Content-Type': 'application/json' } });

                const answer = aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text;
                return answer?.trim() || "AI ไม่สามารถให้คำตอบได้ในขณะนี้";
            }
        }
    } catch (error: any) {
        console.error("Error during analyzeAndFetch:", error.message);
        return "เกิดข้อผิดพลาดในการวิเคราะห์คำถาม";
    }
}

// Controller
export async function askMcpController(req: Request, res: Response) {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({
            statusCode: 400,
            message: 'Question is required in the request body.',
        });
    }

    try {
        const answer = await analyzeAndFetch(question);

        return res.status(200).json({
            statusCode: 200,
            message: 'Analysis complete',
            data: { answer }
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Error processing your request.',
            error: error.message,
        });
    }
}
