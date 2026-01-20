// ============================================ 
// ANTHROPIC CLAUDE IMPLEMENTATION (ACTIVE) 
// ============================================ 

import Anthropic from "@anthropic-ai/sdk";
import { getTodaysOrders } from "./tools/getTodaysOrders";
import { getRevenueSummary } from "./tools/getRevenueSummary";
import { getTopMenus } from "./tools/getTopMenus";
import { searchCustomers } from "./tools/searchCustomers";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// Define available tools
const tools: Anthropic.Tool[] = [
  {
    name: "get_todays_orders",
    description: "ดึงรายการออเดอร์ทั้งหมดของวันนี้ พร้อมรายละเอียดเมนู ราคา และลูกค้า",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_revenue_summary",
    description: "สรุปยอดขายและจำนวนออเดอร์ในช่วงเวลาที่กำหนด (default: วันนี้)",
    input_schema: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "วันที่เริ่มต้น (ISO format)",
        },
        endDate: {
          type: "string",
          description: "วันที่สิ้นสุด (ISO format)",
        },
      },
      required: [],
    },
  },
  {
    name: "get_top_menus",
    description: "ดูเมนูขายดีในช่วงเวลาที่กำหนด เรียงตามจำนวนที่ขายได้",
    input_schema: {
      type: "object",
      properties: {
        startDate: {
          type: "string",
          description: "วันที่เริ่มต้น (ISO format)",
        },
        endDate: {
          type: "string",
          description: "วันที่สิ้นสุด (ISO format)",
        },
        limit: {
          type: "number",
          description: "จำนวนเมนูที่ต้องการ (default: 5)",
        },
      },
      required: [],
    },
  },
  {
    name: "search_customers",
    description: "ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทร",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "คำค้นหา (ชื่อหรือเบอร์โทร)",
        },
        limit: {
          type: "number",
          description: "จำนวนผลลัพธ์ (default: 10)",
        },
      },
      required: ["query"],
    },
  },
];

// Tool executor
async function executeTool(
  toolName: string,
  toolInput: any,
  companyId: string
): Promise<any> {
  switch (toolName) {
    case "get_todays_orders":
      return await getTodaysOrders(companyId);

    case "get_revenue_summary":
      return await getRevenueSummary({ companyId, ...toolInput });

    case "get_top_menus":
      return await getTopMenus({ companyId, ...toolInput });

    case "search_customers":
      return await searchCustomers({ companyId, ...toolInput });

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// Main chat function
async function chatWithAI(
  message: string,
  companyId: string,
  conversationHistory: Anthropic.MessageParam[] = []
) {
  // Add user message to history
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory,
    {
      role: "user",
      content: message,
    },
  ];

  // System prompt
  const systemPrompt = `คุณคือ AI Assistant สำหรับร้าน Coffee QC ที่ช่วยเจ้าของร้านและพนักงานในการดูข้อมูล
- ตอบคำถามเป็นภาษาไทยที่เป็นธรรมชาติและเป็นมิตร
- ใช้ tools ที่มีให้เพื่อดึงข้อมูลจริงจากฐานข้อมูล
- แสดงข้อมูลในรูปแบบที่อ่านง่าย เช่น ใช้ bullet points, ตาราง หรือสรุปสั้นๆ
- แสดงตัวเลขเงินในรูปแบบ "฿XX.XX" หรือ "XX บาท"
- ถ้าไม่มีข้อมูล ให้บอกอย่างชัดเจน

สำคัญมาก:
- ถ้าผู้ใช้ไม่ระบุวันที่ ให้ใช้ข้อมูลวันนี้เท่านั้น (อย่าส่ง startDate/endDate ไป)
- ถ้าผู้ใช้ถามแบบทั่วไปเช่น "เมนูไหนขายดี" หมายถึงวันนี้ (อย่าส่ง startDate/endDate)
- ส่ง startDate/endDate เฉพาะตอนที่ผู้ใช้ระบุช่วงเวลาชัดเจน เช่น "สัปดาห์นี้" "เดือนนี้" "เมื่อวาน"

วันนี้คือ: ${new Date().toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })}`;

  try {
    // First API call
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages,
      tools: tools,
    });

    // Check if Claude wants to use tools
    if (response.stop_reason === "tool_use") {
      const toolUses = response.content.filter(
        (block) => block.type === "tool_use"
      ) as Anthropic.ToolUseBlock[];

      // Execute all tools
      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUses.map(async (toolUse) => {
          try {
            const result = await executeTool(
              toolUse.name,
              toolUse.input,
              companyId
            );

            return {
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: JSON.stringify(result, null, 2),
            };
          } catch (error: any) {
            return {
              type: "tool_result" as const,
              tool_use_id: toolUse.id,
              content: `Error: ${error.message}`,
              is_error: true,
            };
          }
        })
      );

      // Add assistant response and tool results to messages
      messages.push({
        role: "assistant",
        content: response.content,
      });

      messages.push({
        role: "user",
        content: toolResults,
      });

      // Second API call with tool results
      const finalResponse = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages,
        tools: tools,
      });

      // Extract text response
      const textBlocks = finalResponse.content.filter(
        (block) => block.type === "text"
      ) as Anthropic.TextBlock[];

      return {
        response: textBlocks.map((block) => block.text).join("\n"),
        conversationHistory: messages,
      };
    }

    // No tool use, just return the text response
    const textBlocks = response.content.filter(
      (block) => block.type === "text"
    ) as Anthropic.TextBlock[];

    return {
      response: textBlocks.map((block) => block.text).join("\n"),
      conversationHistory: messages,
    };
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
}

export default chatWithAI;