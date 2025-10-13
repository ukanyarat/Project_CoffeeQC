import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { role_name, category_name } from '../src/common/other/roleData';

const prisma = new PrismaClient();

async function main() {
    //  Seed Company
    const company = await prisma.company.upsert({
        where: { company_code: "C0001" },
        update: {},
        create: {
            company_code: "C0001",
            company_name: "Coffee QC",
            company_tel: "0999999999",
            company_line: "@company",
            company_contact_name: "contact",
            company_contact_number: "0999999999",
            company_contact_line: "@contact",
            addr_number: "123",
            addr_alley: "alley",
            addr_street: "street",
            addr_subdistrict: "subdistrict",
            addr_district: "district",
            addr_province: "province",
            addr_postcode: "12345",
            remark: "remark",
            company_main: true,
        },
    });
    const companyId = company.id;

    //  Seed Roles
    let roleIdAdmin = "";
    for (const role of Object.values(role_name)) {
        const roleData = await prisma.role.upsert({
            where: { role_name: role },
            update: {},
            create: { company_id: companyId, role_name: role },
        });
        if (role === "admin") roleIdAdmin = roleData.id;
    }

    //  Seed Admin User
    const password = "123456";
    const hashPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
            company_id: companyId,
            emp_fname: "admin",
            emp_lname: "admin",
            emp_phone: "0999999999",
            emp_status: "active",
            role_id: roleIdAdmin,
            username: "admin",
            password: hashPassword,
        },
    });
    const adminUserId = adminUser.id;

    //  Seed Additional Employees (2 คน)
    const employee1 = await prisma.user.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
            company_id: companyId,
            emp_fname: "Kanun",
            emp_lname: "Smith",
            emp_phone: "0888888888",
            emp_status: "active",
            role_id: roleIdAdmin,
            username: "kanun",
            password: hashPassword,
            created_by: adminUserId,
        },
    });

    const employee2 = await prisma.user.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
            company_id: companyId,
            emp_fname: "Jack",
            emp_lname: "Johnson",
            emp_phone: "0777777777",
            emp_status: "active",
            role_id: roleIdAdmin,
            username: "kkkk",
            password: hashPassword,
            created_by: adminUserId,
        },
    });

    //  Seed Categories
    for (const cat of category_name) {
        await prisma.category.upsert({
            where: { category_name: cat },
            update: {},
            create: { company_id: companyId, category_name: cat, created_by: adminUserId },
        });
    }

    //  Seed Customer
    await prisma.customer.upsert({
        where: { id: uuidv4() },
        update: {},
        create: {
            company_id: companyId,
            customer_name: "customer1",
            customer_phone: "0999999999",
            customer_status: "normal",
            created_by: adminUserId,
        },
    });

    console.log("Seed finished!");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
