
import { PrismaClient } from "@prisma/client";
import { TypePayloadCustomer } from "./customerModel";
const prisma = new PrismaClient();

export const customerRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.customer.findMany({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                customer_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer_phone: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer_status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            }
                        ],
                    }
                    : {}),
            },
            // select: {
            //     id: true,
            //     customer_name: true,
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
        return await prisma.customer.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                customer_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer_phone: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                customer_status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            }
                        ],
                    }
                    : {}),
            },
        });
    },


    create: async (companyId: string, userId: string, payload: TypePayloadCustomer) => {
        return await prisma.customer.create({
            data: {
                company_id: companyId,
                customer_name: payload.customer_name,
                customer_phone: payload.customer_phone,
                customer_status: payload.customer_status,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                customer_name: true,
                customer_status: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadCustomer) => {
        return await prisma.customer.update({
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
                customer_name: true,
                customer_status: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.customer.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.customer.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                customer_name: true,
                customer_status: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.customer.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                customer_name: true,
            }
        })
    }
}