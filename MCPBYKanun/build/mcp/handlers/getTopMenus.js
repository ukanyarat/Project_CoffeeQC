import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function getTopMenus({ company_id, start_date, end_date, limit = 5 }) {
    const start = start_date ? new Date(start_date) : new Date("1970-01-01");
    const end = end_date ? new Date(end_date) : new Date();
    console.error(`[getTopMenus] 🏆 Getting top menus for company: ${company_id}, limit: ${limit}`);
    console.error(`[getTopMenus] 📅 Period: ${start.toISOString()} to ${end.toISOString()}`);
    // หาทุก order ของ company ในช่วงเวลา
    const orders = await prisma.order.findMany({
        where: { company_id, created_at: { gte: start, lte: end } },
        select: { id: true }
    });
    const orderIds = orders.map(o => o.id);
    if (!orderIds.length) {
        console.error(`[getTopMenus] ⚠️ No orders found for this period`);
        return [];
    }
    console.error(`[getTopMenus] 📦 Found ${orders.length} orders`);
    // ดึง order list แล้วสรุปยอดตามเมนู
    const lists = await prisma.orderList.findMany({
        where: { order_id: { in: orderIds } },
        select: { menu_id: true, quantity: true, price: true, menu: { select: { name: true } } }
    });
    const agg = new Map();
    for (const l of lists) {
        const key = l.menu_id;
        const prev = agg.get(key) || { name: l.menu?.name || "-", qty: 0, amount: 0 };
        prev.qty += l.quantity;
        prev.amount += Number(l.price) * l.quantity;
        agg.set(key, prev);
    }
    const result = Array.from(agg.entries())
        .map(([menu_id, v]) => ({ menu_id, name: v.name, qty: v.qty, amount: Number(v.amount.toFixed(2)) }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, Math.min(20, Math.max(1, limit)));
    console.error(`[getTopMenus] ✅ Returning top ${result.length} menus`);
    return result;
}
