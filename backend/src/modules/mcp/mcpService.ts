import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import axios from "axios";
import * as dotenv from 'dotenv';
dotenv.config();

export const mcpService = {
    askMcp: async (companyId: string, question: any) => {
        try {
            const mcpUrl = process.env.MCP_SERVER_PORT;
            if (!mcpUrl) {
                throw new Error("Missing MCP service URL configuration.");
            }

            const requestData = {
                ...question,
                companyId: companyId,
            };

            const response = await axios.post(`${mcpUrl}/api/ask`, requestData);
            const mcpAnswer = response.data;
            return new ServiceResponse(
                ResponseStatus.Success,
                "MCP answered successfully",
                mcpAnswer,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error MCP answer: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },


}