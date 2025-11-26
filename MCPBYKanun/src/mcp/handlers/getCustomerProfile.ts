import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Input = { customer_id: string };

export async function getCustomerProfile({ customer_id }: Input) {
  console.error(`[getCustomerProfile] 👤 Getting profile for customer_id: ${customer_id}`);

  const customer = await prisma.customer.findUnique({
    where: { id: customer_id },
    select: {
      id: true, company_id: true, customer_name: true, customer_phone: true,
      customer_status: true, created_at: true
    }
  });

  if (!customer) {
    console.error(`[getCustomerProfile] ❌ Customer not found: ${customer_id}`);
    return { not_found: true };
  }

  console.error(`[getCustomerProfile] ✅ Customer found: ${customer.customer_name}`);

  // หา order ของลูกค้าคนนี้
  const orders = await prisma.order.findMany({
    where: { customer_id },
    select: { id: true }
  });
  const orderIds = orders.map(o => o.id);

  console.error(`[getCustomerProfile] 📦 Found ${orders.length} orders`);

  // คำนวณยอดรวมจาก OrderList
  let totalAmount = 0;
  let itemsCount = 0;
  if (orderIds.length) {
    const lists = await prisma.orderList.findMany({
      where: { order_id: { in: orderIds } },
      select: { price: true, quantity: true }
    });
    for (const l of lists) {
      totalAmount += Number(l.price) * l.quantity;
      itemsCount += l.quantity;
    }
    console.error(`[getCustomerProfile] 💰 Total: ${totalAmount.toFixed(2)} THB, Items: ${itemsCount}`);
  }

  return {
    profile: {
      customer_id: customer.id,
      company_id: customer.company_id,
      name: customer.customer_name,
      phone: customer.customer_phone,
      status: customer.customer_status,
      created_at: customer.created_at
    },
    metrics: {
      orders_count: orders.length,
      items_count: itemsCount,
      total_amount: Number(totalAmount.toFixed(2))
    }
  };
}

