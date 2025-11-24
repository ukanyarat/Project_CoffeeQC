import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Input = { query: string; company_id?: string; limit?: number };

export async function searchCustomers({ query, company_id, limit = 10 }: Input) {
  const q = (query || "").trim();
  if (!q) return [];

  const rows = await prisma.customer.findMany({
    where: {
      AND: [
        company_id ? { company_id } : {},
        {
          OR: [
            { customer_name: { contains: q, mode: "insensitive" } },
            { customer_phone: { contains: q } }
          ]
        }
      ]
    },
    select: {
      id: true,
      company_id: true,
      customer_name: true,
      customer_phone: true,
      customer_status: true,
      created_at: true
    },
    take: Math.min(50, Math.max(1, limit))
  });

  return rows.map(r => ({
    customer_id: r.id,
    company_id: r.company_id,
    name: r.customer_name,
    phone: r.customer_phone,
    status: r.customer_status,
    created_at: r.created_at
  }));
}

