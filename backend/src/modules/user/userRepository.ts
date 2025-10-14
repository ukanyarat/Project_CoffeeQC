import { TypePayloadUser } from "@modules/user/userModel";
import prisma from "@src/db";


export const userRepository = {
    findByUser: async (payload: TypePayloadUser) => {
        const user = await prisma.user.findUnique({
            where: { username: payload.username },
            select: {
                id: true,
                company_id: true,
                username: true,
                password: true,
                role: {
                    select: {
                        role_name: true
                    }
                }
            }
        });
        return user;
    },
    findById: async (companyId: string, userId: string) => {
        return await prisma.user.findFirst({
            where: {
                company_id: companyId,
                id: userId
            },
            select: {
                id: true,
                emp_fname: true,
                username: true,
                role: { select: { role_name: true } }
            }
        })
    },
    findByIdOnly: async (userId: string) => {
        return await prisma.user.findFirst({
            where: {
                id: userId
            },
            select: {
                id: true,
                emp_fname: true,
                username: true,
                role_id: true
            }
        })
    },
    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.user.findMany({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                username: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_fname: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_lname: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_phone: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_start_date: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                role: {
                                    role_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    },
                                }
                            }
                        ],
                    }
                    : {}),
            },
            // select: {
            //     id: true,
            //     username: true,
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
        return await prisma.user.count({
            where: {
                company_id: companyId,
                ...(searchText
                    ? {
                        OR: [
                            {
                                username: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_fname: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_lname: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_phone: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_start_date: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                emp_status: {
                                    contains: searchText,
                                    mode: "insensitive",
                                },
                            },
                            {
                                role: {
                                    role_name: {
                                        contains: searchText,
                                        mode: "insensitive",
                                    },
                                }
                            }
                        ],
                    }
                    : {}),
            },
        });
    },


    create: async (companyId: string, userId: string, payload: TypePayloadUser) => {
        return await prisma.user.create({
            data: {
                company_id: companyId,
                emp_fname: payload.emp_fname,
                emp_lname: payload.emp_lname,
                emp_phone: payload.emp_phone,
                emp_start_date: payload.emp_start_date,
                emp_status: payload.emp_status,
                role_id: payload.role_id,
                username: payload.username,
                password: payload.password,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                emp_fname: true,
                emp_status: true,
                role_id: true,
                username: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadUser) => {
        return await prisma.user.update({
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
                emp_fname: true,
                emp_status: true,
                role_id: true,
                username: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.user.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                emp_fname: true,
                emp_status: true,
                role_id: true,
                username: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.user.findMany({
            where: {
                company_id: companyId,
            },
            select: {
                id: true,
                username: true,
            }
        })
    }

}