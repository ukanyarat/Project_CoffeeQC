import { askMcpController } from './mcpController';
import express, { Request, Response } from "express";
import authenticationToken from "@common/middleware/authenticationToken";
import { handleServiceResponse } from '@common/utility/httpHandlers';
import { mcpService } from './mcpService';


export const mcpRouter = (() => {
    const router = express.Router();

    //test
    router.get("/testAskMcp", (req: Request, res: Response) => {
        res.send("MCP router test is success!! You can ask MCP.");
    });

    //askMcp
    router.post("/askMcp",
        authenticationToken,
        async (req: Request, res: Response) => {
            try {
                const question = req.body;
                const { companyId } = req.token.payload;
                const ServiceResponse = await mcpService.askMcp(companyId, question);
                handleServiceResponse(ServiceResponse, res);
            } catch (error) {
                console.error("Error in POST request:", error);
                res.status(500).json({ status: "error", message: "Internal Server Error" });
            }
        });
    return router;
})();