import { z } from "zod";

export type TypePayloadUser = {
    id: string;
    company_id: string;
    emp_fname: string;
    emp_lname: string;
    emp_phone: string;
    emp_start_date: string;
    emp_status: string;
    role_id: string;
    username: string;
    password: string;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const LoginUserSchema = z.object({
    body: z.object({
        username: z.string().min(4).max(50),
        password: z.string().min(4).max(50),
    }),
});

export const CreateUserSchema = z.object({
    body: z.object({
        emp_fname: z.string().min(1, "emp_fname is required").max(50, "emp_fname must be less than 50 characters"),
        emp_lname: z.string().min(1, "emp_lname is required").max(50, "emp_lname must be less than 50 characters"),
        emp_phone: z.string().min(10, "emp_phone is required").max(15, "emp_phone must be 15 characters"),
        emp_start_date: z.string().nullable().optional(),
        emp_status: z.string().nullable().optional(),
        role_id: z.string().min(1, "role_id is required"),
        username: z.string().min(1, "username is required").max(50, "username must be less than 50 characters"),
        password: z.string().min(1, "password is required").max(50, "password must be less than 50 characters"),
    })
})

export const UpdateUserSchema = z.object({
    body: z.object({
        id: z.string().min(1, "id is required"),
    })
})

export const GetParamUserSchems = z.object({
    params: z.object({
        id: z.string().min(1, "id is required").uuid(),
    })
})