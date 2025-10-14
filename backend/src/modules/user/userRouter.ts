import { handleServiceResponse, validateRequest } from "@common/utility/httpHandlers";
import express, { Request, Response } from "express";
import { CreateUserSchema, GetParamUserSchems, LoginUserSchema, UpdateUserSchema } from "@modules/user/userModel";
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

    //check
    router.get("/auth-status",
        async (req: Request, res: Response) => {
            const ServiceResponse = await userService.authStatus(req);
            handleServiceResponse(ServiceResponse, res);
        });

    //getForPermission
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
        });

    //get
    router.get("/get",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const page = parseInt(req.query.page as string) || 1;
                const pageSize = parseInt(req.query.pageSize as string) || 12;
                const searchText = (req.query.searchText as string) || ""
                const { companyId, uuid } = req.token.payload;
                const ServiceResponse = await userService.findAll(companyId, page, pageSize, searchText);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in GET request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //create//register
    router.post("/register",
        authenticationToken,
        validateRequest(CreateUserSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;
                const ServiceResponse = await userService.create(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //update
    router.patch("/update",
        authenticationToken,
        validateRequest(UpdateUserSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;
                const ServiceResponse = await userService.update(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //delete
    router.delete("/delete/:id",
        authenticationToken,
        validateRequest(GetParamUserSchems),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await userService.delete(id);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in DELETE request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //getById
    router.get("/getById/:id",
        authenticationToken,
        validateRequest(GetParamUserSchems),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await userService.getById(id);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in GET request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //getAllNopaginate
    router.get("/getNoPaginate",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const { company_id, uuid } = req.token.payload;
                const companyId = company_id;
                const userId = uuid;
                const ServiceResponse = await userService.findAllNopaginate(companyId, userId);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    return router;
})();