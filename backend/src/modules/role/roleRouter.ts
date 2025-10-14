import { handleServiceResponse, validateRequest } from "@common/utility/httpHandlers";
import express, { Request, Response } from "express";
import authenticationToken from "@common/middleware/authenticationToken";
import { roleService } from "./roleService";
import { CreateRoleSchema, GetParamRoleSchema, UpdateRoleSchema } from "./roleModel";


export const roleRouter = (() => {
    const router = express.Router();

    //test
    router.get("/test", (req: Request, res: Response) => {
        res.send("Role router test is success");
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
                const ServiceResponse = await roleService.findAll(companyId, page, pageSize, searchText);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in GET request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //create
    router.post("/create",
        authenticationToken,
        validateRequest(CreateRoleSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;
                const ServiceResponse = await roleService.create(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //update
    router.patch("/update",
        authenticationToken,
        validateRequest(UpdateRoleSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;
                const ServiceResponse = await roleService.update(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //delete
    router.delete("/delete/:id",
        authenticationToken,
        validateRequest(GetParamRoleSchema),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await roleService.delete(id);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in DELETE request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //getById
    router.get("/getById/:id",
        authenticationToken,
        validateRequest(GetParamRoleSchema),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await roleService.getById(id);
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
                const ServiceResponse = await roleService.findAllNopaginate(companyId, userId);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });
    return router;
})();