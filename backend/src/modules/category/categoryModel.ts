import { category_name } from "@common/other/roleData";
import { z } from "zod";

export type TypePayloadCategory = {
    id: string;
    company_id: string;
    category_name: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateCategorySchema = z.object({
    body: z.object({
        category_name: z.string().min(1, "category_name is required").max(50),
    })
})

export const UpdateCategorySchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamCategorySchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})