
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function getTodaysOrders() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  console.error(`[getTodaysOrders] 📅 Getting orders for today: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

  const orders = await prisma.order.findMany({
    where: {
      created_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      order_number: true,
      order_status: true,
      service: true,
      payment_channel: true,
      created_at: true,
      customer: {
        select: {
          customer_name: true,
        }
      }
    },
  });

  console.error(`[getTodaysOrders] 📦 Found ${orders.length} orders for today`);

  // ดึงรายการ OrderList + Menu ต่อออเดอร์
  const result = [];
  for (const o of orders) {
    const items = await prisma.orderList.findMany({
      where: { order_id: o.id },
      select: {
        menu: { select: { name: true } },
        price: true,
        quantity: true,
        remark: true,
      },
    });
    const subtotal = items.reduce(
      (a, it) => a + Number(it.price) * it.quantity,
      0
    );
    result.push({ ...o, items, subtotal: Number(subtotal.toFixed(2)) });
  }

  console.error(`[getTodaysOrders] ✅ Returning ${result.length} orders with items`);
  return result;
}
