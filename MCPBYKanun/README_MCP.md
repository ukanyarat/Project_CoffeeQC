# CoffeeQC MCP Server

MCP Server สำหรับเชื่อมต่อระบบ CoffeeQC กับ Claude Desktop

## ฟีเจอร์ที่มี

### Tools ที่สามารถใช้ได้:

1. **search_customers** - ค้นหาลูกค้าด้วยชื่อหรือเบอร์โทร
2. **get_customer_profile** - ดูโปรไฟล์ลูกค้า + ยอดรวม + จำนวนออเดอร์
3. **get_customer_recent_orders** - ดูออเดอร์ล่าสุดของลูกค้า
4. **get_todays_orders** - ดูรายการออเดอร์ทั้งหมดของวันนี้
5. . **get_top_menus** - ดูเมนูขายดีช่วงเวลา

## การติดตั้ง

### 1. ติดตั้ง Dependencies

```bash
cd MCPBYKanun
npm install
```

### 2. ตั้งค่า Environment Variables

ไฟล์ `.env` ถูกสร้างไว้แล้วโดยอัตโนมัติ

### 3. ใช้ Prisma จาก Backend

โปรเจคนี้ใช้ Prisma จาก backend โดยตรง (symlink):
```bash
# prisma/ folder เป็น symlink ไปที่ ../backend/prisma/
ls -la prisma
```

Generate Prisma Client (ถ้ายังไม่ได้ทำ):
```bash
npx prisma generate
```

### 4. ตั้งค่า Claude Desktop

คัดลอกเนื้อหาจากไฟล์ `claude_desktop_config.json` ไปใส่ใน:

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%/Claude/claude_desktop_config.json
```

**Linux:**
```bash
~/.config/claude/claude_desktop_config.json
```

หรือใช้คำสั่งนี้เพื่อ copy ไฟล์ (macOS):
```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### 5. Restart Claude Desktop

ปิดและเปิด Claude Desktop ใหม่อีกครั้ง

## การทดสอบ

### ทดสอบ MCP Server แบบ standalone:

```bash
npm run mcp
```

### ตัวอย่างคำถามที่สามารถถามใน Claude Desktop:

1. **"วันนี้มีลูกค้ามาใช้บริการทั้งหมดกี่คน?"**
   - จะใช้ tool: `get_todays_orders`

2. **"ยอดขายวันนี้เป็นเงินเท่าไหร่?"**
   - จะใช้ tool: `get_todays_orders` และคำนวณยอดรวม

3. **"เมนูไหนขายดีที่สุดวันนี้?"**
   - จะใช้ tool: `get_todays_orders` และ `get_top_menus`

4. **"หาลูกค้าชื่อ John"**
   - จะใช้ tool: `search_customers`

5. **"ดูประวัติการสั่งของลูกค้า [customer_id]"**
   - จะใช้ tool: `get_customer_recent_orders`

## โครงสร้างโฟลเดอร์

```
MCPBYKanun/
├── src/
│   ├── mcp-server.ts          # MCP Server (ใหม่!)
│   ├── index.ts                # REST API Server (เดิม)
│   └── mcp/
│       ├── tools.ts            # Tool definitions
│       ├── claude.ts           # Claude API wrapper (เดิม)
│       └── handlers/           # Tool handlers
│           ├── getTodaysOrders.ts
│           ├── getRevenueSummary.ts
│           ├── searchCustomers.ts
│           ├── getCustomerProfile.ts
│           ├── getCustomerRecentOrders.ts
│           └── getTopMenus.ts
├── .env                        # Environment variables
├── package.json
└── claude_desktop_config.json  # Claude Desktop config (copy นี้ไปใช้)
```

## Troubleshooting

### 1. Claude Desktop ไม่เห็น MCP Server

- ตรวจสอบว่า config file อยู่ในตำแหน่งที่ถูกต้อง
- ตรวจสอบว่า path ในไฟล์ config ถูกต้อง (absolute path)
- Restart Claude Desktop อีกครั้ง
- ดู logs ใน Developer Console ของ Claude Desktop

### 2. Database Connection Error

- ตรวจสอบว่า PostgreSQL กำลังรันอยู่
- ตรวจสอบ DATABASE_URL ใน `.env` และ `claude_desktop_config.json`
- ตรวจสอบว่า port 5435 ถูกต้อง

### 3. Prisma Error

```bash
# Re-generate Prisma client
npx prisma generate --schema=../backend/prisma/schema.prisma
```

## การพัฒนาต่อ

### เพิ่ม Tool ใหม่:

1. สร้าง handler ใหม่ใน `src/mcp/handlers/`
2. เพิ่ม tool definition ใน `src/mcp/tools.ts`
3. Restart MCP Server หรือ Claude Desktop

### ตัวอย่าง:

```typescript
// src/mcp/handlers/getMenus.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getMenus() {
  return await prisma.menu.findMany({
    where: { status: 'available' },
    select: {
      id: true,
      name: true,
      price: true,
      type: true,
    },
  });
}
```

```typescript
// เพิ่มใน src/mcp/tools.ts
{
  name: "get_menus",
  description: "ดูรายการเมนูทั้งหมดที่มีในร้าน",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  handler: getMenus
}
```

## สถานะ API Servers

### MCP Server (สำหรับ Claude Desktop)
```bash
npm run mcp
```

### REST API Server (เดิม, สำหรับ HTTP requests)
```bash
npm run dev
```

ทั้งสอง servers สามารถรันพร้อมกันได้!
