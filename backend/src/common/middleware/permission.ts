import { NextFunction, Request, Response } from "express";
import { permissionMap } from "@common/utility/permissionMap";
import { handleServiceResponse } from "@common/utility/httpHandlers";
import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";


export const authorizeByname =
    (name: string, requiredPermissions: ("A" | "R" | "N")[]) => {
        (req: Request, res: Response, next: NextFunction) => {
            try {
                const role = req.token?.payload.role;
                const userPermission = permissionMap[name]?.[role];
                if (!userPermission || !requiredPermissions.includes(userPermission)) {
                    return handleUnauthorizedResponse(res)
                }
                next()
            } catch (error) {
                return handleUnauthorizedResponse(res)
            }
        }
    }


const handleUnauthorizedResponse = (res: Response) => {
    handleServiceResponse(
        new ServiceResponse(
            ResponseStatus.Failed,
            "Unauthorized",
            null,
            StatusCodes.FORBIDDEN
        ),
        res
    );
};
