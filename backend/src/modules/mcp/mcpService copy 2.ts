// import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
// import axios from 'axios';

// const prisma = new PrismaClient();

// // ดึง company id ตัวแรก
// async function getCompanyId(): Promise<string | null> {
//     const company = await prisma.company.findFirst({ select: { id: true } });
//     return company?.id || null;
// }

// // วิเคราะห์ intent ของคำถาม
// async function getAiIntent(
//     question: string
// ): Promise<'user' | 'order' | 'menu' | 'role' | 'category' | 'orderlist' | 'customer' | 'company' | 'general'> {
//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) throw new Error('GEMINI_API_KEY is not set.');

//     const prompt = `
// คุณเป็นผู้ช่วย AI ให้จำแนกคำถามต่อไปนี้ว่าเกี่ยวข้องกับหมวดใด
// ตอบเพียงคำเดียว (ภาษาอังกฤษ) จาก: user, order, menu, role, category, orderlist, customer, company, general

// คำถาม: "${question}"
// `;

//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

//     try {
//         const response = await axios.post(
//             apiUrl,
//             { contents: [{ parts: [{ text: prompt }] }] },
//             { headers: { 'Content-Type': 'application/json' } }
//         );

//         const text =
//             response.data.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase() || 'general';

//         const mapping = ['user', 'order', 'menu', 'role', 'category', 'orderlist', 'customer', 'company'];
//         return (mapping.find((m) => text.includes(m)) as any) || 'general';
//     } catch (err) {
//         console.error('❌ Intent analysis error:', err);
//         return 'general';
//     }
// }

// // วิเคราะห์และตอบคำถาม
// async function analyzeAndFetch(question: string): Promise<string> {
//     const companyId = await getCompanyId();
//     if (!companyId) return 'ไม่พบบริษัทในระบบ ไม่สามารถให้คำตอบได้ค่ะ';

//     const intent = await getAiIntent(question);

//     try {
//         switch (intent) {
//             case 'user': {
//                 const count = await prisma.user.count({ where: { company_id: companyId } });
//                 return `ฉันเจอข้อมูลพนักงานทั้งหมด ${count} คนค่ะ`;
//             }

//             case 'order': {
//                 const count = await prisma.order.count({ where: { company_id: companyId } });
//                 return `มีออเดอร์ทั้งหมด ${count} รายการค่ะ`;
//             }

//             case 'menu': {
//                 const count = await prisma.menu.count({ where: { company_id: companyId } });
//                 return `ตอนนี้มีเมนูทั้งหมด ${count} รายการค่ะ`;
//             }

//             case 'role': {
//                 const count = await prisma.role.count({ where: { company_id: companyId } });
//                 return `มีตำแหน่งงานทั้งหมด ${count} ตำแหน่งค่ะ`;
//             }

//             case 'category': {
//                 const count = await prisma.category.count({ where: { company_id: companyId } });
//                 return `มีหมวดหมู่ทั้งหมด ${count} หมวดค่ะ`;
//             }

//             case 'orderlist': {
//                 const count = await prisma.orderList.count({ where: { company_id: companyId } });
//                 return `มีรายการสั่งทั้งหมด ${count} รายการค่ะ`;
//             }

//             case 'customer': {
//                 const count = await prisma.customer.count({ where: { company_id: companyId } });
//                 return `มีลูกค้าทั้งหมด ${count} รายค่ะ`;
//             }

//             case 'company': {
//                 const count = await prisma.company.count();
//                 return `ในระบบมีบริษัททั้งหมด ${count} บริษัทค่ะ`;
//             }

//             default: {
//                 // ให้ AI ตอบคำถามทั่วไป
//                 const apiKey = process.env.GEMINI_API_KEY;
//                 const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
//                 const prompt = `
// คุณเป็นผู้ช่วย AI ตอบคำถามของผู้ใช้เป็นภาษาไทย
// คำถาม: "${question}"
// `;

//                 const aiResponse = await axios.post(
//                     apiUrl,
//                     { contents: [{ parts: [{ text: prompt }] }] },
//                     { headers: { 'Content-Type': 'application/json' } }
//                 );

//                 const answer =
//                     aiResponse.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//                     'AI ไม่สามารถให้คำตอบได้ในขณะนี้ค่ะ';
//                 return answer;
//             }
//         }
//     } catch (err: any) {
//         console.error('❌ Query error:', err.message);
//         return 'เกิดข้อผิดพลาดในการวิเคราะห์คำถามค่ะ';
//     }
// }

// // Controller
// export async function askMcpController(req: Request, res: Response) {
//     const { question } = req.body;

//     if (!question) {
//         return res.status(400).json({
//             statusCode: 400,
//             message: 'กรุณาระบุคำถาม (question) ใน request body',
//         });
//     }

//     try {
//         const answer = await analyzeAndFetch(question);

//         return res.status(200).json({
//             statusCode: 200,
//             message: 'Analysis complete',
//             data: { answer },
//         });
//     } catch (error: any) {
//         console.error(error);
//         return res.status(500).json({
//             statusCode: 500,
//             message: 'เกิดข้อผิดพลาดในการประมวลผลคำถาม',
//             error: error.message,
//         });
//     }
// }
// C:\Users\ACER\Documents\GitHub\Project_CoffeeQC\backend\src\modules\mcp\mcpService.ts
// C:\Users\ACER\Documents\GitHub\Project_CoffeeQC\backend\src\modules\mcp\mcpService.ts

/**
 * ฟังก์ชัน Service สำหรับส่งคำสั่งไปยังอุปกรณ์ MCP
 * นี่คือส่วนที่รับผิดชอบการเชื่อมต่อจริง (เช่น MQTT, TCP, HTTP Request)
 */
export async function sendCommandToMcp(command: string, params: any): Promise<any> {

    // 1. สร้าง Payload ที่อุปกรณ์ MCP คาดหวัง
    const payload = {
        cmd: command,
        data: params,
        source: 'Backend-CoffeeQC'
    };

    try {
        // 2. โค้ดสื่อสารจริง (คุณต้องใส่โค้ดเชื่อมต่อของคุณที่นี่)

        // **ตัวอย่าง Mocking/จำลองการทำงาน:**
        console.log(`[MCP Service] Sending command: ${command}`);
        await new Promise(resolve => setTimeout(resolve, 500)); // จำลองการดีเลย์ 500ms

        if (command === 'FAIL_TEST') {
            // จำลองการเกิด Error ในการสื่อสาร
            throw new Error("Device connection timeout or device reported an error.");
        }

        // 3. ส่งข้อมูลสถานะที่ได้รับกลับมาจาก MCP
        const mcpData = {
            deviceId: 'MCP-001',
            status: 'success',
            result: `Command ${command} processing started.`,
            received_params: params
        };

        return mcpData;

    } catch (error) {
        // 4. จัดการ Error ก่อนโยนออกไป
        // โยน Error เพื่อให้ Controller จับและจัดการ Response ได้
        if (error instanceof Error) {
            throw new Error(`MCP Communication Failed: ${error.message}`);
        }
        throw new Error("An unknown error occurred in the MCP Service layer.");
    }
}