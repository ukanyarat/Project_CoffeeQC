import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Input = { company_id: string; start_date?: string; end_date?: string };

export async function getRevenueSummary({ company_id, start_date, end_date }: Input) {
  const start = start_date ? new Date(start_date) : new Date("1970-01-01");
  const end = end_date ? new Date(end_date) : new Date();

  // ดึงออเดอร์ของบริษัทในช่วงเวลา
  const orders = await prisma.order.findMany({
    where: {
      company_id,
      created_at: { gte: start, lte: end }
    },
    select: { id: true, created_at: true }
  });
  const orderIds = orders.map(o => o.id);

  let total = 0;
  let items = 0;
  if (orderIds.length) {
    const lists = await prisma.orderList.findMany({
      where: { order_id: { in: orderIds } },
      select: { price: true, quantity: true }
    });
    for (const l of lists) {
      total += Number(l.price) * l.quantity;
      items += l.quantity;
    }
  }

  return {
    period: { start: start.toISOString(), end: end.toISOString() },
    company_id,
    orders_count: orders.length,
    items_count: items,
    revenue_total: Number(total.toFixed(2))
  };
}

