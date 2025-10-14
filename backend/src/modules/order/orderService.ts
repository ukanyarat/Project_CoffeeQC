import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { orderRepository } from "./orderRepository";
import { TypePayloadOrder } from "./orderModel";
import { generateOrderNumber } from "./generateOrderNumber";


export const orderService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await orderRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await orderRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all order success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All order :" + (ex as Error).message;
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
            const categories = await orderRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Order retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving order: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadOrder) => {
        try {
            payload.order_number = await generateOrderNumber(companyId);
            const order = await orderRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Order created successfully",
                order,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating order: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadOrder) => {
        try {
            const order = await orderRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Order updated successfully",
                order,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating order: ${(ex as Error).message}`;
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
            await orderRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Order deleted successfully",
                "Order deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting order: ${(ex as Error).message}`;
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
            const order = await orderRepository.getById(id);
            if (!order) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Order not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Order retrieved successfully",
                order,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving order: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}