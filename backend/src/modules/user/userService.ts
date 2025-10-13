import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { TypePayloadUser } from "./userModel";
import { StatusCodes } from "http-status-codes";
import { userRepository } from "@modules/user/userRepository";
import bcrypt from "bcrypt";
import { jwtGenerator } from "@common/utility/jwtGenerator";
import { Response } from "express";


export const userService = {
    login: async (payload: TypePayloadUser, res: Response) => {
        try {
            //เช็ค user ในระบบ
            const checkUser = await userRepository.findByUser(payload)
            if (!checkUser) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "User not found",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            //เช็คพาสเวิดว่าตรงกันไหม
            const passwordDB = checkUser.password;
            const passwordPayload = payload.password;

            const isMatch = await bcrypt.compare(passwordPayload, passwordDB);
            if (!isMatch) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Username or Password is incorrect",
                    null,
                    StatusCodes.BAD_REQUEST
                )
            }
            //กำหนดค่าโทเคน
            const uuid = checkUser.id;
            const role = checkUser.role.role_name;
            const companyId = checkUser.company_id ?? "";
            const username = checkUser.username;
            const dataPayloadtoToken = {
                uuid: uuid,
                role: role,
                companyId: companyId,
                username: username
            }

            //สร้าง token ไปไว้ที่ cookie ชื่อว่า token
            const token = await jwtGenerator.generate(dataPayloadtoToken);
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 8 * 60 * 60 * 1000, // 8 hours
            });
            return new ServiceResponse(
                ResponseStatus.Success,
                "User successfully authenticated and logged in",
                { token: token },
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = `Error login user : ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    },

    logout: async (res: Response) => {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });
            return new ServiceResponse(
                ResponseStatus.Success,
                "User successfully logged out",
                null,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = `Error logout user : ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    },

}