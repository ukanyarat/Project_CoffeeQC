import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface TopMenusParams {
  companyId: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function getTopMenus(params: TopMenusParams) {
  const { companyId, startDate, endDate, limit = 5 } = params;

  const start = startDate ? new Date(startDate) : new Date();
  start.setHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);

  const orderLists = await prisma.orderList.findMany({
    where: {
      company_id: companyId,
      created_at: {
        gte: start,
        lte: end,
      },
    },
    include: {
      menu: {
        select: {
          id: true,
          name: true,
          price: true,
          type: true,
        },
      },
    },
  });

  // Group by menu and sum quantities
  const menuStats = orderLists.reduce((acc, item) => {
    const menuId = item.menu.id;
    if (!acc[menuId]) {
      acc[menuId] = {
        menu: item.menu,
        totalQuantity: 0,
        totalRevenue: 0,
      };
    }
    acc[menuId].totalQuantity += item.quantity;
    acc[menuId].totalRevenue += Number(item.price) * item.quantity;
    return acc;
  }, {} as Record<string, any>);

  // Sort by quantity and take top N
  const topMenus = Object.values(menuStats)
    .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit)
    .map((item: any) => ({
      menuId: item.menu.id,
      menuName: item.menu.name,
      menuType: item.menu.type,
      totalQuantity: item.totalQuantity,
      totalRevenue: Number(item.totalRevenue.toFixed(2)),
    }));

  return topMenus;
}
