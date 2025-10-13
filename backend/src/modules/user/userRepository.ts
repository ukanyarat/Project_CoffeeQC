import { TypePayloadUser } from "@modules/user/userModel";
import prisma from "@src/db";
import bcrypt from "bcrypt";




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
    }

}