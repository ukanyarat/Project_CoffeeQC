import { ResponseStatus, ServiceResponse } from "@common/model/serviceResponse";
import { StatusCodes } from "http-status-codes";
import { categoryRepository } from "./categoryRepository";
import { TypePayloadCategory } from "./categoryModel";


export const categoryService = {
    findAll: async (
        companyId: string,
        page: number = 1,
        pageSize: number = 12,
        searchText: string = "",
    ) => {
        try {
            const skip = (page - 1) * pageSize;
            const companyReceiving = await categoryRepository.findAll(
                companyId,
                skip,
                pageSize,
                searchText
            );
            const totalCount = await categoryRepository.count(companyId, searchText);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Get all category success",
                {
                    data: companyReceiving,
                    totalCount,
                    totalPages: Math.ceil(totalCount / pageSize),
                },
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = "Error Find All category :" + (ex as Error).message;
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
            const categories = await categoryRepository.findAllNopaginate(companyId, userId);
            return new ServiceResponse(
                ResponseStatus.Success,
                "Categories retrieved successfully",
                categories,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving categories: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    create: async (companyId: string, userId: string, payload: TypePayloadCategory) => {
        try {
            const category = await categoryRepository.create(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Category created successfully",
                category,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error creating category: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

    update: async (companyId: string, userId: string, payload: TypePayloadCategory) => {
        try {
            const category = await categoryRepository.update(companyId, userId, payload)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Category updated successfully",
                category,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error updating category: ${(ex as Error).message}`;
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
            await categoryRepository.delete(id)
            return new ServiceResponse(
                ResponseStatus.Success,
                "Category deleted successfully",
                "Category deleted successfully",
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error deleting category: ${(ex as Error).message}`;
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
            const category = await categoryRepository.getById(id);
            if (!category) {
                return new ServiceResponse(
                    ResponseStatus.Failed,
                    "Category not found",
                    null,
                    StatusCodes.NOT_FOUND
                );
            }
            return new ServiceResponse(
                ResponseStatus.Success,
                "Category retrieved successfully",
                category,
                StatusCodes.OK
            );
        } catch (ex) {
            const errorMessage = `Error retrieving category: ${(ex as Error).message}`;
            return new ServiceResponse(
                ResponseStatus.Failed,
                errorMessage,
                null,
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    },

}