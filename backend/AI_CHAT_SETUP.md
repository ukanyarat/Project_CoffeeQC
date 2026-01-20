# 🤖 AI Chat Feature - Setup Guide

## ✅ สิ่งที่สร้างเสร็จแล้ว:

### Backend:
- ✅ `src/modules/ai/tools/` - AI tools สำหรับดึงข้อมูล
  - `getTodaysOrders.ts` - ดึงออเดอร์วันนี้
  - `getRevenueSummary.ts` - สรุปยอดขาย
  - `getTopMenus.ts` - เมนูขายดี
  - `searchCustomers.ts` - ค้นหาลูกค้า

- ✅ `src/modules/ai/aiService.ts` - AI service ที่ integrate กับ Google Gemini API (โค้ด Claude ยังคงอยู่แบบ commented)
- ✅ `src/modules/ai/aiRouter.ts` - API endpoint `/v1/ai/chat`
- ✅ เพิ่ม router เข้า `src/index.ts`

### Frontend:
- ✅ `src/pages/ai-chat/AiChatPage.tsx` - Chat UI
- ✅ `src/api/ai.ts` - API functions
- ✅ เพิ่ม route `/ai-chat`
- ✅ เพิ่มลิงก์ "คุยกับ AI" ในเมนู
- ✅ ติดตั้ง `react-markdown`

## 🔧 ขั้นตอนสุดท้าย (สำคัญ!):

### 1. เพิ่ม Google AI API Key (Gemini)

แก้ไขไฟล์ `backend/.env`:

```env
# เพิ่มบรรทัดนี้
GOOGLE_API_KEY=your_google_api_key_here
```

**วิธีหา API Key:**
1. ไปที่ https://aistudio.google.com/
2. สมัครหรือ login ด้วย Google Account
3. คลิก "Get API key" ที่มุมบนขวา
4. Create API key และ copy มาใส่

**หมายเหตุ:** Google AI Studio (Gemini) มี free tier ที่ใช้งานได้ดีโดยไม่ต้องใส่บัตรเครดิต!

### 2. Restart Backend Server

```bash
cd backend
npm run dev
```

### 3. เปิด Frontend

```bash
cd frontend
npm run dev
```

### 4. ทดสอบ!

เปิดเบราว์เซอร์: http://localhost:5173/ai-chat

## 💬 ตัวอย่างคำถามที่ถามได้:

1. **"วันนี้มียอดขายเท่าไหร่?"**
   - AI จะใช้ `get_todays_orders` และ `get_revenue_summary`

2. **"เมนูไหนขายดีที่สุดวันนี้?"**
   - AI จะใช้ `get_top_menus`

3. **"แสดงออเดอร์ทั้งหมดของวันนี้"**
   - AI จะใช้ `get_todays_orders`

4. **"หาลูกค้าชื่อ สมชาย"**
   - AI จะใช้ `search_customers`

5. **"เมื่อวานขายได้เท่าไหร่?"**
   - AI จะคำนวณจากเมื่อวาน

## 🛠️ การปรับแต่ง:

### เพิ่ม Function (Tool) ใหม่:

1. สร้างไฟล์ใน `backend/src/modules/ai/tools/yourTool.ts`
2. เพิ่ม function definition ใน `backend/src/modules/ai/aiService.ts` ที่ array `functions`
3. เพิ่ม case ใน `executeTool` function

### ปรับ System Prompt:

แก้ไขใน `backend/src/modules/ai/aiService.ts` ที่ `systemPrompt` variable

### ปรับ UI:

แก้ไขใน `frontend/src/pages/ai-chat/AiChatPage.tsx`

### สลับกลับไปใช้ Claude (ถ้าต้องการ):

1. Uncomment โค้ดส่วน ANTHROPIC CLAUDE IMPLEMENTATION (บรรทัด 4-228)
2. Comment โค้ดส่วน GOOGLE GEMINI IMPLEMENTATION (บรรทัด 230-439)
3. เปลี่ยน environment variable จาก `GOOGLE_API_KEY` เป็น `ANTHROPIC_API_KEY`
4. Restart backend server

## 🔒 Security Notes:

- ✅ ใช้ `authMiddleware` - ต้อง login ก่อนถึงใช้ได้
- ✅ API Key อยู่ใน backend เท่านั้น
- ✅ ดึงข้อมูลแค่ของ company ตัวเองเท่านั้น (ผ่าน `companyId`)

## 📊 Available Tools:

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_todays_orders` | ออเดอร์ทั้งหมดของวันนี้ | - |
| `get_revenue_summary` | สรุปยอดขาย | startDate, endDate |
| `get_top_menus` | เมนูขายดี | startDate, endDate, limit |
| `search_customers` | ค้นหาลูกค้า | query, limit |

## 🎨 Features:

- 💬 Chat interface ที่สวยงามและใช้งานง่าย
- 🤖 AI ตอบเป็นภาษาไทยธรรมชาติ
- 📊 แสดงข้อมูลในรูปแบบที่อ่านง่าย (bullet points, ตัวเลข)
- 💾 จำ conversation history (ในแต่ละ session)
- ⚡ Real-time response
- 🎯 Suggested questions สำหรับผู้ใช้ใหม่

## 🐛 Troubleshooting:

**1. Error: "Missing API Key"**
- เช็คว่าเพิ่ม `GOOGLE_API_KEY` ใน `.env` แล้ว
- Restart backend server

**2. Error: "401 Unauthorized"**
- ต้อง login ก่อนใช้งาน

**3. AI ไม่ตอบ หรือ timeout**
- เช็ค API key ว่าถูกต้องและ active
- เช็ค network connection
- ดู console logs ใน backend

## 📝 Next Steps:

- [ ] เพิ่ม tools อื่นๆ ตามต้องการ (เช่น update data, create order)
- [ ] เพิ่ม export chat history
- [ ] เพิ่ม voice input/output
- [ ] เพิ่ม multi-language support

---

✨ **Ready to chat with AI!** Visit: http://localhost:5173/ai-chat
