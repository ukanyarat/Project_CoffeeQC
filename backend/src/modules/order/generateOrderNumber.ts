import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";
const prisma = new PrismaClient();

export const generateOrderNumber = async (companyId: string) => {
    const datePrefix = dayjs().format('YYMMDD');
    let orderNumber = `OD${datePrefix}`;

    const orders = await prisma.order.findMany({
        where: {
            company_id: companyId,
            order_number: {
                startsWith: orderNumber,
            },
        }
    })

    if (orders.length > 0) {
        const Max = Math.max(...orders.map((o) => {
            const match = o.order_number.match(/OD\d{6}(\d{3})/);
            return match ? parseInt(match[1], 10) : 0;
        }))
        const newMax = (Max + 1).toString().padStart(3, '0');
        orderNumber += newMax;
    } else {
        orderNumber += '001';
    }
    return orderNumber;
}
