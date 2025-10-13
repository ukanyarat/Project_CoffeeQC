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
    }
}