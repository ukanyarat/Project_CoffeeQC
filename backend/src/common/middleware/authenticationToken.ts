import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { handleServiceResponse } from "@common/utility/httpHandlers";
import { verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { env } from "@common/utility/envConfig";
import { userRepository } from "@modules/user/userRepository";
import { roleRepository } from "@modules/role/roleRepository";

//เพิ่ม type ให้กับ req เพิ่มเอาาไว้เก็บ token
declare global {
    namespace Express {
        interface Request {
            token?: any;
        }
    }
}

async function authenticateToken(
    req: Request, res: Response, next: NextFunction): Promise<void> {
    {
        const token = req.cookies.token;
        let jwtPayload;
        if (!token) {
            handleServiceResponse(
                new ServiceResponse(
                    ResponseStatus.Failed,
                    "Authentication token is missing",
                    null,
                    StatusCodes.UNAUTHORIZED
                ), res);
            return;
        }
        try {
            jwtPayload = (<any>verify(token, env.JWT_SECRET, {
                complete: true,
                algorithms: ["HS256"],
                clockTolerance: 0,
                ignoreExpiration: false,
                ignoreNotBefore: false,
            })) as any;
            const uuid = jwtPayload.payload.uuid;
            const user = await userRepository.findByIdOnly(uuid);
            if (!user) {
                handleServiceResponse(
                    new ServiceResponse(
                        ResponseStatus.Failed,
                        "User not found",
                        null,
                        StatusCodes.UNAUTHORIZED
                    ), res);
                return;
            }
            const roleData = await roleRepository.findById(user.role_id);
            jwtPayload.payload.role_id = user.role_id;
            jwtPayload.payload.role = roleData?.role_name || null;
            req.token = jwtPayload;
        } catch (error) {
            handleServiceResponse(
                new ServiceResponse(
                    ResponseStatus.Failed,
                    "Token is not valid",
                    null,
                    StatusCodes.UNAUTHORIZED
                ), res);
            return;
        }
        next();
    }
}
export default authenticateToken;
