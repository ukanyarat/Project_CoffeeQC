import { z } from "zod";

export type TypePayloadOrder = {
    id: string;
    company_id: string;
    order_number: string;
    order_status: string;
    service: string;
    payment_channel: string;
    customer_id: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateOrderSchema = z.object({
    body: z.object({
        // order_number is auto generated automatically
        order_status: z.string().min(1, "order_status is required"),
        service: z.string().min(1, "service is required"),
        payment_channel: z.string().min(1, "payment_channel is required"),
        customer_id: z.string().uuid(),
    })
})

export const UpdateOrderSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamOrderSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})