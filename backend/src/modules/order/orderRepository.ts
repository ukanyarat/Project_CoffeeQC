
import { PrismaClient } from "@prisma/client";
import { TypePayloadOrder } from "./orderModel";
const prisma = new PrismaClient();

export const orderRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string,
        date?: Date // Add date parameter
    ) => {
        const startOfDay = date ? new Date(date.setHours(0, 0, 0, 0)) : undefined;
        const endOfDay = date ? new Date(date.setHours(23, 59, 59, 999)) : undefined;

        return await prisma.order.findMany({
            where: {
                company_id: companyId,
                ...(date && startOfDay && endOfDay ? {
                    created_at: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                } : {}),
                ...(searchText
                    ? {
                        OR: [
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer: {
                                    customer_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                        ],
                    }
                    : {}),
            },
            include: {
                customer: true,
            },
            skip,
            take,
            orderBy: [
                { created_at: "asc" }
            ],
        },
        );
    },

    count: async (companyId: string, searchText?: string) => {
        return await prisma.order.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                order_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer: {
                                    customer_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                        ],
                    }
                    : {}),
            },
        });
    },


    create: async (companyId: string, userId: string, payload: TypePayloadOrder) => {
        return await prisma.order.create({
            data: {
                company_id: companyId,
                order_number: payload.order_number, //gen
                order_status: payload.order_status,
                service: payload.service,
                payment_channel: payload.payment_channel,
                customer_id: payload.customer_id,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                order_number: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadOrder) => {
        return await prisma.order.update({
            where: {
                company_id: companyId,
                id: payload.id
            },
            data: {
                ...payload,
                updated_at: new Date(),
                updated_by: userId,
            },
            select: {
                id: true,
                order_number: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.order.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.order.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                order_number: true,
                order_status: true,
                service: true,
                payment_channel: true,
                customer: {
                    select: {
                        id: true,
                        customer_name: true,
                    }
                },
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.order.findMany({
            where: {
                company_id: companyId,
            },
            include: {
                customer: true,
            }
        })
    },

    getSalesAnalyticsByCompany: async (companyId: string, period: string = 'monthly') => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (period) {
            case 'daily':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'weekly':
                startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of the week (Sunday)
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'monthly':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                startDate.setHours(0, 0, 0, 0);
                break;
            default: // Default to monthly if an invalid period is provided
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                startDate.setHours(0, 0, 0, 0);
                break;
        }

        const salesData = await prisma.orderList.groupBy({
            by: ['menu_id'],
            where: {
                company_id: companyId,
                created_at: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                quantity: true,
                price: true,
            },
        });

        const menuIds = salesData.map(item => item.menu_id);
        const menus = await prisma.menu.findMany({
            where: {
                id: {
                    in: menuIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        const menuMap = new Map(menus.map(menu => [menu.id, menu.name]));

        const result = salesData.map(item => ({
            menu: menuMap.get(item.menu_id) || 'Unknown Menu',
            sales: item._sum.quantity || 0,
            revenue: item._sum.price ? item._sum.price.toNumber() : 0,
        }));

        return result;
    }
}