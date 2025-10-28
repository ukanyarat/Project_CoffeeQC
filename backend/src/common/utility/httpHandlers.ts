import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, ZodSchema } from "zod";

import {
    ResponseStatus,
    ServiceResponse,
} from "@common/model/serviceResponse";

export const handleServiceResponse = (
    serviceResponse: ServiceResponse<any>,
    response: Response
) => {
    return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest =
    (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse({ body: req.body, query: req.query, params: req.params });
            next();
        } catch (err) {
            let errorMessage = "Invalid input";
            if (err instanceof ZodError && err.errors) {
                errorMessage = `Invalid input: ${err.errors.map((e) => e.message).join(", ")}`;
            } else if (err instanceof Error) {
                errorMessage = `Invalid input: ${err.message}`;
            }
            const statusCode = StatusCodes.BAD_REQUEST;
            res
                .status(statusCode)
                .send(
                    new ServiceResponse<null>(
                        ResponseStatus.Failed,
                        errorMessage,
                        null,
                        statusCode
                    )
                );
        }
    };
