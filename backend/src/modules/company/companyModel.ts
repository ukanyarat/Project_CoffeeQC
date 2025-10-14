import { z } from "zod";

export type TypePayloadCompany = {
    id: string;
    company_code: string;
    company_name: string;
    company_tel: string;
    company_line: string;
    company_contact_name: string;
    company_contact_number: string;
    company_contact_line: string;
    addr_number: string;
    addr_alley: string;
    addr_street: string;
    addr_subdistrict: string;
    addr_district: string;
    addr_province: string;
    addr_postcode: string;
    remark: string;
    company_main: boolean;

    created_at: Date;
    updated_at: Date;
    created_by: string;
    updated_by: string;
}

export const CreateCompanySchema = z.object({
    body: z.object({
        company_code: z.string().min(1, "company_code is required").max(10),
        company_name: z.string().min(1, "company_name is required").max(50),
        company_tel: z.string().min(10, "company_tel is required").max(15),
        company_line: z.string().max(50).nullable().optional(),
        company_contact_name: z.string().min(1, "company_contact_name is required").max(50),
        company_contact_number: z.string().min(10, "company_contact_number is required").max(15),
        company_contact_line: z.string().max(50).nullable().optional(),
        addr_number: z.string().max(5).nullable().optional(),
        addr_alley: z.string().max(50).nullable().optional(),
        addr_street: z.string().max(50).nullable().optional(),
        addr_subdistrict: z.string().max(50).nullable().optional(),
        addr_district: z.string().max(50).nullable().optional(),
        addr_province: z.string().max(50).nullable().optional(),
        addr_postcode: z.string().max(5).nullable().optional(),
        remark: z.string().max(255).nullable().optional(),
        company_main: z.boolean().default(false),
    })
})

export const UpdateCompanySchema = z.object({
    body: z.object({
        id: z.string().uuid(),
    })
})

export const GetParamCompanySchema = z.object({
    params: z.object({
        id: z.string().uuid(),
    })
})