import { PrismaClient } from "@prisma/client";
import { TypePayloadRole } from "./roleModel";
const prisma = new PrismaClient();

export const roleRepository = {
    findById: async (roleId: string) => {
        return await prisma.role.findUnique({
            where: {
                id: roleId
            },
            select: {
                id: true,
                role_name: true
            }
        })
    },
    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.role.findMany({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                role_name: {
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
            //     role_name: true,
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
        return await prisma.role.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                role_name: {
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


    create: async (companyId: string, userId: string, payload: TypePayloadRole) => {
        return await prisma.role.create({
            data: {
                company_id: companyId,
                role_name: payload.role_name,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                role_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadRole) => {
        return await prisma.role.update({
            where: {
                company_id: companyId,
                id: payload.id
            },
            data: {
                role_name: payload.role_name,
                updated_at: new Date(),
                updated_by: userId,
            },
            select: {
                id: true,
                role_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.role.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.role.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                role_name: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.role.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                role_name: true,
            }
        })
    }
}