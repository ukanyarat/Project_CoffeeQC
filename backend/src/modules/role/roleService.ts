import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { roleRepository } from "./roleRepository";
import { TypePayloadRole } from "./roleModel";


export const roleService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await roleRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await roleRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all role success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All role :" + (ex as Error).message;
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
            const categories = await roleRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Role retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving role: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadRole) => {
        try {
            const role = await roleRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Role created successfully",
                role,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating role: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadRole) => {
        try {
            const role = await roleRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Role updated successfully",
                role,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating role: ${(ex as Error).message}`;
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
            await roleRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Role deleted successfully",
                "Role deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting role: ${(ex as Error).message}`;
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
            const role = await roleRepository.getById(id);
            if (!role) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Role not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Role retrieved successfully",
                role,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving role: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}