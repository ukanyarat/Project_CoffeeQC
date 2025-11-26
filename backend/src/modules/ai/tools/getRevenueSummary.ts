import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface RevenueSummaryParams {
  companyId: string;
  startDate?: string;
  endDate?: string;
}

export async function getRevenueSummary(params: RevenueSummaryParams) {
  const { companyId, startDate, endDate } = params;

  // Default to today if no dates provided
  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      company_id: companyId,
      created_at: {
        gte: start,
        lte: end,
      },
      order_status: 'completed',
    },
    include: {
      orderLists: {
        select: {
          price: true,
          quantity: true,
        },
      },
    },
  });

  const totalRevenue = orders.reduce((total, order) => {
    const orderTotal = order.orderLists.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    return total + orderTotal;
  }, 0);

  return {
    totalOrders: orders.length,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    period: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };
}
