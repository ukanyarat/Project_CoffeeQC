
import { PrismaClient } from "@prisma/client";
import { TypePayloadCategory } from "./categoryModel";
const prisma = new PrismaClient();

export const categoryRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.category.findMany({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                category_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            }
                        ],
                    }
                    : {}),
            },
            select: {
                id: true,
                category_name: true,
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
        return await prisma.category.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                category_name: {
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


    create: async (companyId: string, userId: string, payload: TypePayloadCategory) => {
        return await prisma.category.create({
            data: {
                company_id: companyId,
                category_name: payload.category_name,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                category_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadCategory) => {
        return await prisma.category.update({
            where: {
                company_id: companyId,
                id: payload.id
            },
            data: {
                category_name: payload.category_name,
                updated_at: new Date(),
                updated_by: userId,
            },
            select: {
                id: true,
                category_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.category.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.category.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                category_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.category.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                category_name: true,
            }
        })
    }
}