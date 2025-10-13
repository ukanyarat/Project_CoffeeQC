import { handleServiceResponse, validateRequest } from "@common/utility/httpHandlers";
import express, { Request, Response } from "express";
import { LoginUserSchema } from "@modules/user/userModel";
import { userService } from "./userService";
import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import authenticationToken from "@common/middleware/authenticationToken";

export const userRouter = (() => {
    const router = express.Router();

    //เทส
    router.get("/test", (req: Request, res: Response) => {
        res.send("User router test is success");
    });
    //login
    router.post("/login",
        validateRequest(LoginUserSchema),
        async (req: Request, res: Response) => {
            const payload = req.body;
            const ServiceResponse = await userService.login(payload, res);
            handleServiceResponse(ServiceResponse, res);
        });

    //logout
    router.get("/logout",
        async (req: Request, res: Response) => {
            const serviceResponse = await userService.logout(res);
            handleServiceResponse(serviceResponse, res);
        });

    router.get("/auth-status",
        async (req: Request, res: Response) => {
            const ServiceResponse = await userService.authStatus(req);
            handleServiceResponse(ServiceResponse, res);
        });

    router.get("/get_profile",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const { company_id, uuid } = req.token.payload;
                const companyId = company_id;
                const userId = uuid;
                const ServiceResponse = await userService.findById(companyId, userId);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.log("Error in GET request /get_profile:", error);
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "An error occurred while fetching the profile",
                    null,
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            }
        }
    )
    return router;
})();