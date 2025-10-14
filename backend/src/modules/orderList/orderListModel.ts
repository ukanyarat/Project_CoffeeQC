import { z } from "zod";

export type TypePayloadOrderList = {
    id: string;
    company_id: string;
    order_id: string;
    menu_id: string;
    price: number;
    quantity: number;
    remark: string;
    status: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateOrderListSchema = z.object({
    body: z.object({
        order_id: z.string().uuid(),
        menu_id: z.string().uuid(),
        price: z.number(),
        quantity: z.number().min(0),
        remark: z.string().max(50).nullable().optional(),
        status: z.string().max(50)
    })
})

export const UpdateOrderListSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamOrderListSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})