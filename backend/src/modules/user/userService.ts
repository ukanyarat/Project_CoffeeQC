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
            const role = checkUser.role?.role_name || "";
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
                {
                    token: token,
                    user: {
                        name: checkUser.emp_fname,
                        role: checkUser.role.role_name
                    }
                },
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
    authStatus: (req: any) => {
        try {
            const token = req.cookies.token;
            if (token) {
                return new ServiceResponse(
                    ResponseStatus.Success,
                    "User authenticated successfully",
                    null,
                    StatusCodes.OK
                );
            } else {
                return new ServiceResponse(
                    ResponseStatus.Success,
                    "Authentication required",
                    null,
                    StatusCodes.OK
                );
            }
        } catch (ex) {
            const errorMessage = "Error auth status: " + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findById: async (companyId: string, userId: string) => {
        try {
            const user = await userRepository.findById(companyId, userId);
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "User not found",
                    null,
                    StatusCodes.NOT_FOUND
                )
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get user success",
                user,
                StatusCodes.OK
            )
        } catch (ex) {
            const errorMessage = `Error find user by id : ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            )
        }
    },
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await userRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await userRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all user success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All user :" + (ex as Error).message;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    findAllNopaginate: async (companyId: string, userId: string) => {
        try {
            const categories = await userRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "User retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving user: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadUser) => {
        try {
            const hashedPassword = await bcrypt.hash(payload.password, 10);
            const user = await userRepository.create(companyId, userId, { ...payload, password: hashedPassword });
            return new ServiceResponse(
                ResponseStatus.Success,
                "User created successfully",
                user,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating user: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadUser) => {
        try {
            let updatedPayload = { ...payload };
            if (payload.password) {
                updatedPayload.password = await bcrypt.hash(payload.password, 10);
            }
            const user = await userRepository.update(companyId, userId, updatedPayload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "User updated successfully",
                user,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating user: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    delete: async (id: string) => {
        try {
            await userRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "User deleted successfully",
                "User deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting user: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    getById: async (id: string) => {
        try {
            const user = await userRepository.getById(id);
            if (!user) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "User not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "User retrieved successfully",
                user,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving user: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },
}
