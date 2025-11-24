import { z } from "zod";

export type TypePayloadMenu = {
    id: string;
    company_id: string;
    category_id: string;
    name: string;
    type: string;
    price: number;
    stock: number;
    status: string;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateMenuSchema = z.object({
    body: z.object({
        category_id: z.string().uuid(),
        name: z.string().min(1, "name is required").max(50),
        type: z.string().min(1, "type is required").max(50),
        price: z.number().min(0),
        stock: z.number().min(0).nullable().optional(),
        status: z.string().optional(),
    })
})

export const UpdateMenuSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
        category_id: z.string().uuid().optional(),
        name: z.string().min(1, "name is required").max(50).optional(),
        type: z.string().min(1, "type is required").max(50).optional(),
        price: z.number().min(0).max(99999.99).optional(),
        stock: z.number().min(0).max(999).nullable().optional(),
        status: z.string().max(20).optional(), 
    })
})

export const GetParamMenuSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})