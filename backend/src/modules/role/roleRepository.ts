import { PrismaClient } from "@prisma/client";
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
    }
}