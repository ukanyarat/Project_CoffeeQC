import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

interface SearchCustomersParams {
  companyId: string;
  query: string;
  limit?: number;
}

export async function searchCustomers(params: SearchCustomersParams) {
  const { companyId, query, limit = 10 } = params;

  const customers = await prisma.customer.findMany({
    where: {
      company_id: companyId,
      OR: [
        { customer_name: { contains: query, mode: 'insensitive' } },
        { customer_phone: { contains: query } },
      ],
    },
    take: limit,
    select: {
      id: true,
      customer_name: true,
      customer_phone: true,
      customer_status: true,
      created_at: true,
    },
  });

  return customers;
}
