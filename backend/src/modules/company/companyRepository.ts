
import { PrismaClient } from "@prisma/client";
import { TypePayloadCompany } from "./companyModel";
const prisma = new PrismaClient();

export const companyRepository = {

    findAll: async (
        companyId: string,
        skip: number,
        take: number,
        searchText: string
    ) => {
        return await prisma.company.findMany({
            where: {
                ...(searchText
                    ? {
                        OR: [
                            {
                                company_code: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_tel: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_line: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_line: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_alley: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_street: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_subdistrict: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_district: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_province: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_postcode: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                remark: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                        ],
                    }
                    : {}),
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
        return await prisma.company.count({
            where: {
                ...(searchText
                    ? {
                        OR: [
                            {
                                company_code: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_tel: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_line: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_name: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                company_contact_line: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_number: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_alley: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_street: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_subdistrict: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_district: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_province: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                addr_postcode: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                            {
                                remark: {
                                    contains: searchText,
                                    mode: "insensitive",
                                }
                            },
                        ],
                    }
                    : {}),
            },
        });
    },


    create: async (companyId: string, userId: string, payload: TypePayloadCompany) => {
        return await prisma.company.create({
            data: {
                company_code: payload.company_code,
                company_name: payload.company_name,
                company_tel: payload.company_tel,
                company_line: payload.company_line,
                company_contact_name: payload.company_contact_name,
                company_contact_number: payload.company_contact_number,
                company_contact_line: payload.company_contact_line,
                addr_number: payload.addr_number,
                addr_alley: payload.addr_alley,
                addr_street: payload.addr_street,
                addr_subdistrict: payload.addr_subdistrict,
                addr_district: payload.addr_district,
                addr_province: payload.addr_province,
                addr_postcode: payload.addr_postcode,
                remark: payload.remark,
                company_main: payload.company_main ?? false,
                created_at: new Date(),
                updated_at: new Date(),
                created_by: userId,
                updated_by: userId,
            },
            select: {
                id: true,
                company_code: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    update: async (companyId: string, userId: string, payload: TypePayloadCompany) => {
        return await prisma.company.update({
            where: {
                id: payload.id,
            },
            data: {
                ...payload,
                updated_at: new Date(),
                updated_by: userId,
            },
            select: {
                id: true,
                company_code: true,
                created_at: true,
                updated_at: true,
            }
        })
    },

    delete: async (id: string) => {
        return await prisma.company.delete({
            where: {
                id: id
            },
        })
    },

    getById: async (id: string) => {
        return await prisma.company.findUnique({
            where: {
                id: id
            },
            // select: {
            //     id: true,
            //     company_code: true,
            //     created_at: true,
            //     updated_at: true,
            // }
        })
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        return await prisma.company.findMany({
            where: {
                id: companyId,
            },
            select: {
                id: true,
                company_code: true,
            }
        })
    }
}