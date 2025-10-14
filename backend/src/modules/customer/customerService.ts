import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { customerRepository } from "./customerRepository";
import { TypePayloadCustomer } from "./customerModel";



export const customerService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await customerRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await customerRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all customer success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All customer :" + (ex as Error).message;
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
            const categories = await customerRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Customer retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving customer: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadCustomer) => {
        try {
            const customer = await customerRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Customer created successfully",
                customer,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating customer: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadCustomer) => {
        try {
            const customer = await customerRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Customer updated successfully",
                customer,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating customer: ${(ex as Error).message}`;
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
            await customerRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Customer deleted successfully",
                "Customer deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting customer: ${(ex as Error).message}`;
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
            const customer = await customerRepository.getById(id);
            if (!customer) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Customer not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Customer retrieved successfully",
                customer,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving customer: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}