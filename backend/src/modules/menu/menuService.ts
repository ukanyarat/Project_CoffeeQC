import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { menuRepository } from "./menuRepository";
import { TypePayloadMenu } from "./menuModel";


export const menuService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await menuRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await menuRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all menu success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All menu :" + (ex as Error).message;
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
            const categories = await menuRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Menu retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving menu: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadMenu) => {
        try {
            const menu = await menuRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Menu created successfully",
                menu,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating menu: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadMenu) => {
        try {
            const menu = await menuRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Menu updated successfully",
                menu,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating menu: ${(ex as Error).message}`;
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
            await menuRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Menu deleted successfully",
                "Menu deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting menu: ${(ex as Error).message}`;
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
            const menu = await menuRepository.getById(id);
            if (!menu) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Menu not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Menu retrieved successfully",
                menu,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving menu: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}