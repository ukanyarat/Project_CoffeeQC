
import { PrismaClient } from "@prisma/client";
import { TypePayloadOrder } from "./orderModel";
const prisma = new PrismaClient();

export const orderRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.order.findMany({
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
            // select: {
            //     id: true,
            //     category_name: true,
            // },
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
            select: {
                id: true,
                order_number: true,
            }
        })
    }
}