
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Input = { customer_id: string; limit?: number };

export async function getCustomerRecentOrders({ customer_id, limit = 5 }: Input) {
  const orders = await prisma.order.findMany({
    where: { customer_id },
    orderBy: { created_at: "desc" },
    take: Math.min(20, Math.max(1, limit)),
    select: {
      id: true, order_number: true, order_status: true, service: true,
      payment_channel: true, created_at: true
    }
  });

  // ดึงรายการ OrderList + Menu ต่อออเดอร์
  const result = [];
  for (const o of orders) {
    const items = await prisma.orderList.findMany({
      where: { order_id: o.id },
      select: {
        menu: { select: { name: true } },
        price: true, quantity: true, remark: true
      }
    });
    const subtotal = items.reduce((a, it) => a + Number(it.price) * it.quantity, 0);
    result.push({ ...o, items, subtotal: Number(subtotal.toFixed(2)) });
  }
  return result;
}
