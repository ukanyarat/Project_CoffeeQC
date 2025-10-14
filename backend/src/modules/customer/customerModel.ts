import { z } from "zod";

export type TypePayloadCustomer = {
    id: string;
    company_id: string;
    customer_name: string;
    customer_phone: string;
    customer_status: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateCustomerSchema = z.object({
    body: z.object({
        customer_name: z.string().min(1, "customer_name is required").max(50),
        customer_phone: z.string().min(10, "customer_phone is required").max(15),
        customer_status: z.string().nullable().optional(),
    })
})

export const UpdateCustomerSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamCustomerSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})