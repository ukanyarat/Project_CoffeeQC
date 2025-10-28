
import { PrismaClient } from "@prisma/client";
import { TypePayloadOrderList } from "./orderListModel";
const prisma = new PrismaClient();

export const orderListRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string,
        orderId?: string // Add orderId parameter
    ) => {
        return await prisma.orderList.findMany({
            where: {
                company_id: companyId,
                ...(orderId ? { order_id: orderId } : {}),
                ...(searchText
                    ? {
                        OR: [
                            {
                                menu: {
                                    name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                order: {
                                    order_number: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                order: {
                                    customer: {
                                        customer_name: {
                                            contains: searchText,
                                            mode: "insensitive",
                                        }
                                    }
                                }
                            },
                            {
                                order: {
                                    payment_channel: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                remark: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            ...(isNaN(Number(searchText)) ? [] : [
                                {
                                    price: {
                                        equals: Number(searchText),
                                    }
                                },
                                {
                                    quantity: {
                                        equals: Number(searchText),
                                    }
                                },
                            ]),
                        ],
                    }
                    : {}),
            },
            // select: {
            //     id: true,
            //     price: true,
            //     quantity: true,
            //     remark: true,
            //     status: true,
            //     created_at: true,
            //     updated_at: true,
            //     order: {
            //         select: {
            //             id: true,
            //             order_number: true,
            //             order_status: true,
            //         }
            //     },
            //     menu: {
            //         select: {
            //             id: true,
            //             name: true,
            //             type: true,
            //             price: true,
            //             stock: true,
            //         }
            //     }
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
        return await prisma.orderList.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                menu: {
                                    name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                order: {
                                    order_number: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                order: {
                                    customer: {
                                        customer_name: {
                                            contains: searchText,
                                            mode: "insensitive",
                                        }
                                    }
                                }
                            },
                            {
                                order: {
                                    payment_channel: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                remark: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            ...(isNaN(Number(searchText)) ? [] : [
                                {
                                    price: {
                                        equals: Number(searchText),
                                    }
                                },
                                {
                                    quantity: {
                                        equals: Number(searchText),
                                    }
                                },
                            ]),
                        ],
                    }
                    : {}),
            },
        });
    },


    create: async (companyId: string, userId: string, payload: TypePayloadOrderList) => {
        return await prisma.orderList.create({
            data: {
                company_id: companyId,
                order_id: payload.order_id,
                menu_id: payload.menu_id,
                price: payload.price,
                quantity: payload.quantity,
                remark: payload.remark,
                status: payload.status,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                price: true,
                quantity: true,
                remark: true,
                status: true,
                created_at: true,
                updated_at: true,
                order: {
                    select: {
                        id: true,
                        order_number: true,
                        order_status: true,
                    }
                },
                menu: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        price: true,
                        stock: true,
                    }
                }
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadOrderList) => {
        return await prisma.orderList.update({
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
                price: true,
                quantity: true,
                remark: true,
                status: true,
                created_at: true,
                updated_at: true,
                order: {
                    select: {
                        id: true,
                        order_number: true,
                        order_status: true,
                    }
                },
                menu: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        price: true,
                        stock: true,
                    }
                }
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.orderList.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.orderList.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                price: true,
                quantity: true,
                remark: true,
                status: true,
                created_at: true,
                updated_at: true,
                order: {
                    select: {
                        id: true,
                        order_number: true,
                        order_status: true,
                    }
                },
                menu: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        price: true,
                        stock: true,
                    }
                }
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.orderList.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                status: true,
            }
        })
    }
}