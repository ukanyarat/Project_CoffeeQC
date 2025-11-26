import { handleServiceResponse, validateRequest } from "@common/utility/httpHandlers";
import express, { Request, Response } from "express";
import authenticationToken from "@common/middleware/authenticationToken";
import { orderService } from "./orderService";
import { CreateOrderSchema, GetParamOrderSchema, UpdateOrderSchema } from "./orderModel";


export const orderRouter = (() => {
    const router = express.Router();

    //test
    router.get("/test", (req: Request, res: Response) => {
        res.send("order router test is success");
    });

    //get
    router.get("/get",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const page = parseInt(req.query.page as string) || 1;
                const pageSize = parseInt(req.query.pageSize as string) || 12;
                const searchText = (req.query.searchText as string) || ""
                const date = req.query.date ? new Date(req.query.date as string) : undefined;
                const { companyId, uuid } = req.token.payload;
                const ServiceResponse = await orderService.findAll(companyId, page, pageSize, searchText, date);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in GET request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //create
    router.post("/create",
        authenticationToken,
        validateRequest(CreateOrderSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;
                const ServiceResponse = await orderService.create(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //update with id in URL
    router.patch("/update/:id",
        authenticationToken,
        (req: Request, res: Response, next: any) => {
            // Insert id from URL into body before validation
            req.body.id = req.params.id;
            next();
        },
        validateRequest(UpdateOrderSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;

                const ServiceResponse = await orderService.update(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //update with id in body
    router.patch("/update",
        authenticationToken,
        validateRequest(UpdateOrderSchema),
        async (req: Request, res: Response) => {
            try {
                const payload = req.body;
                const { companyId, uuid } = req.token.payload;
                const userId = uuid;

                const ServiceResponse = await orderService.update(companyId, userId, payload);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //delete
    router.delete("/delete/:id",
        authenticationToken,
        validateRequest(GetParamOrderSchema),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await orderService.delete(id);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in DELETE request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    //getById
    router.get("/getById/:id",
        authenticationToken,
        validateRequest(GetParamOrderSchema),
        async (req: Request, res: Response) => {
            try {
                const { id } = req.params;
                const ServiceResponse = await orderService.getById(id);
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
                const ServiceResponse = await orderService.findAllNopaginate(companyId, userId);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });

    router.get("/sales-analytics",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const { companyId } = req.token.payload;
                const period = (req.query.period as string || 'monthly').toLowerCase(); // Default to 'monthly'

                const validPeriods = ['daily', 'weekly', 'monthly', 'yearly'];
                if (!validPeriods.includes(period)) {
                    return res.status(400).json({ status: "error", message: "Invalid period provided. Must be one of 'daily', 'weekly', 'monthly', 'yearly'." });
                }

                const serviceResponse = await orderService.getSalesAnalytics(companyId, period);
                handleServiceResponse(serviceResponse, res);
            } catch (error) {
                console.error("Error in GET request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });
        
    return router;
})();