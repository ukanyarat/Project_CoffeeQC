import { z } from "zod";

export type TypePayloadRole = {
    id: string;
    company_id: string;
    role_name: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateRoleSchema = z.object({
    body: z.object({
        role_name: z.string().min(1, "role_name is required").max(50),
    })
})

export const UpdateRoleSchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamRoleSchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})