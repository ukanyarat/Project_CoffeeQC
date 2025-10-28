
import { PrismaClient } from "@prisma/client";
import { TypePayloadMenu } from "./menuModel";
const prisma = new PrismaClient();

export const menuRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.menu.findMany({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                category: {
                                    category_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                type: {
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
                                    stock: {
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
        return await prisma.menu.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                category: {
                                    category_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    }
                                }
                            },
                            {
                                name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                type: {
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
                                    stock: {
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


    create: async (companyId: string, userId: string, payload: TypePayloadMenu) => {
        return await prisma.menu.create({
            data: {
                company_id: companyId,
                category_id: payload.category_id,
                name: payload.name,
                type: payload.type,
                price: payload.price,
                stock: payload.stock ?? 0,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadMenu) => {
        return await prisma.menu.update({
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
                name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.menu.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.menu.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                name: true,
                category: {
                    select: {
                        category_name: true
                    }
                },
                type: true,
                price: true,
                stock: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.menu.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                name: true,
                price: true,
                category_id: true,
            }
        })
    }
}