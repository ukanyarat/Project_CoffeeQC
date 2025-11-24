import { searchCustomers } from "./handlers/searchCustomers";
import { getCustomerProfile } from "./handlers/getCustomerProfile";
import { getCustomerRecentOrders } from "./handlers/getCustomerRecentOrders";
import { getRevenueSummary } from "./handlers/getRevenueSummary";
import { getTopMenus } from "./handlers/getTopMenus";
import { getTodaysOrders } from "./handlers/getTodaysOrders";

type ToolDef = {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
};

export const toolDefs: ToolDef[] = [
  {
    name: "search_customers",
    description: "ค้นหาลูกค้าด้วยชื่อหรือเบอร์ (กรองตามบริษัทได้)",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        company_id: { type: "string" },
        limit: { type: "number", default: 10, maximum: 50 }
      },
      required: ["query"]
    },
    handler: searchCustomers
  },
  {
    name: "get_customer_profile",
    description: "โปรไฟล์ลูกค้า + ยอดรวม + จำนวนออเดอร์",
    inputSchema: {
      type: "object",
      properties: { customer_id: { type: "string" } },
      required: ["customer_id"]
    },
    handler: getCustomerProfile
  },
  {
    name: "get_customer_recent_orders",
    description: "ออเดอร์ล่าสุดของลูกค้า (รวมยอด/ไอเท็ม)",
    inputSchema: {
      type: "object",
      properties: { customer_id: { type: "string" }, limit: { type: "number", default: 5, maximum: 20 } },
      required: ["customer_id"]
    },
    handler: getCustomerRecentOrders
  },
  {
    name: "get_todays_orders",
    description: "ดึงรายการออเดอร์ทั้งหมดของวันนี้ (รวมยอด/ไอเท็ม/ลูกค้า)",
    inputSchema: {
      type: "object",
      properties: {},
      required: []
    },
    handler: getTodaysOrders
  },
  {
    name: "get_revenue_summary",
    description: "สรุปยอดขายช่วงเวลา (ต่อบริษัท)",
    inputSchema: {
      type: "object",
      properties: {
        company_id: { type: "string" },
        start_date: { type: "string", format: "date-time" },
        end_date: { type: "string", format: "date-time" }
      },
      required: ["company_id"]
    },
    handler: getRevenueSummary
  },
  {
    name: "get_top_menus",
    description: "เมนูขายดีช่วงเวลา (ต่อบริษัท)",
    inputSchema: {
      type: "object",
      properties: {
        company_id: { type: "string" },
        start_date: { type: "string", format: "date-time" },
        end_date: { type: "string", format: "date-time" },
        limit: { type: "number", default: 5, maximum: 20 }
      },
      required: ["company_id"]
    },
    handler: getTopMenus
  }
];

export const listTools = () => ({ tools: toolDefs.map(({ handler, ...t }) => t) });

