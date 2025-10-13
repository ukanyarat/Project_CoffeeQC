import { env } from "@common/utility/envConfig";
import jwt from "jsonwebtoken";

const JWT_SECRET = env.JWT_SECRET;

export type TypePayloadToken = {
    uuid: string
    username: string
    role: string
    companyId: string
};

export const jwtGenerator = {
    generate: async (dataPayload: TypePayloadToken) => {
        const token = jwt.sign(dataPayload, JWT_SECRET, { expiresIn: '8h' });
        return token;
    }
} 