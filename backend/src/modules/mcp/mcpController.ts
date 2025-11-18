// C:\Users\ACER\Documents\GitHub\Project_CoffeeQC\backend\src\modules\mcp\mcpController.ts

import { Request, Response } from 'express';
// ✅ นำเข้าฟังก์ชัน Service จากไฟล์เดียวกัน
import { sendCommandToMcp } from './mcpService';

interface AskMcpBody {
    command: string;
    params?: any;
}

// Controller หลักที่จัดการ HTTP Request
export const askMcpController = async (req: Request<{}, {}, AskMcpBody>, res: Response) => {

    // 1. ตรวจสอบข้อมูลนำเข้า (Validation)
    const { command, params } = req.body;
    if (!command) {
        return res.status(400).json({
            success: false,
            message: 'Command is required in the request body (Bad Request).'
        });
    }

    try {
        // 2. เรียกใช้ Service Layer เพื่อสื่อสารกับ MCP
        const mcpResponse = await sendCommandToMcp(command, params);

        // 3. ส่ง Response กลับไป
        return res.status(200).json({
            success: true,
            message: `Command '${command}' processed successfully.`,
            data: mcpResponse,
        });

    } catch (error) {
        // 4. จัดการ Error (แก้ไข Type 'unknown')
        console.error('Error processing MCP command:', error);

        let errorMessage = 'An internal error occurred.';

        // ✅ Type Guard: ตรวจสอบว่าเป็น Error object เพื่อเข้าถึง .message ได้อย่างปลอดภัย
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to execute command on MCP device.',
            error: errorMessage
        });
    }
};