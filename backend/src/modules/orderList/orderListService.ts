import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { orderListRepository } from "./orderListRepository";
import { TypePayloadOrderList } from "./orderListModel";


export const orderListService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await orderListRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await orderListRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all orderList success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All orderList :" + (ex as Error).message;
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
            const categories = await orderListRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "OrderList retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving order list: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadOrderList) => {
        try {
            const orderList = await orderListRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "OrderList created successfully",
                orderList,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating orderList: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadOrderList) => {
        try {
            const orderList = await orderListRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "OrderList updated successfully",
                orderList,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating orderList: ${(ex as Error).message}`;
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
            await orderListRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "OrderList deleted successfully",
                "OrderList deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting orderList: ${(ex as Error).message}`;
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
            const orderList = await orderListRepository.getById(id);
            if (!orderList) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "OrderList not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "OrderList retrieved successfully",
                orderList,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving orderList: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}