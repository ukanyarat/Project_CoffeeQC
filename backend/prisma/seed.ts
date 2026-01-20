import { PrismaClient, Category } from '@prisma/client';
import bcrypt from 'bcrypt';
import { role_name, category_name } from '../src/common/other/roleData';

const prisma = new PrismaClient();

async function main() {
    const { v4: uuidv4 } = await import('uuid');

    console.log('🌱 Starting seed...');

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
    console.log('✅ Company created');

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
    console.log('✅ Roles created');

    //  Seed Admin User
    const password = "123456";
    const hashPassword = await bcrypt.hash(password, 10);

    const adminUser = await prisma.user.upsert({
        where: { username: "admin" },
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

    //  Seed Additional Employees
    const employee1 = await prisma.user.upsert({
        where: { username: "kanun" },
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
        where: { username: "kkkk" },
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
    console.log('✅ Users created');

    //  Seed Categories
    const categories: Category[] = [];
    for (const cat of category_name) {
        const category = await prisma.category.upsert({
            where: { category_name: cat },
            update: {},
            create: { company_id: companyId, category_name: cat, created_by: adminUserId },
        });
        categories.push(category);
    }
    console.log('✅ Categories created');

    // ลบ Orders และ OrderLists เก่าออกก่อน (เพื่อให้ลบ Menu ได้)
    await prisma.orderList.deleteMany({
        where: { company_id: companyId }
    });
    await prisma.order.deleteMany({
        where: { company_id: companyId }
    });
    console.log('🗑️  Deleted old orders');

    // ลบเมนูเก่าออก
    await prisma.menu.deleteMany({
        where: { company_id: companyId }
    });
    console.log('🗑️  Deleted old menus');

    // Map category names (Thai to English for menu items)
    // category_name = ["กาแฟ", "ชา", "เครื่องดื่มอื่นๆ", "เค้ก", "ขนมเบเกอร์รี่", "อื่นๆ"]
    const categoryMap = new Map(categories.map(c => [c.category_name, c.id]));

    // Seed Realistic Menus
    const menuItems = [
        // กาแฟ (Coffee)
        { name: 'Espresso', price: 45, category: 'กาแฟ', type: 'coffee', description: 'เข้มข้น หอมกรุ่น คลาสสิค' },
        { name: 'Americano', price: 50, category: 'กาแฟ', type: 'coffee', description: 'กาแฟดำสไตล์อเมริกัน' },
        { name: 'Cappuccino', price: 65, category: 'กาแฟ', type: 'coffee', description: 'กาแฟผสมนมฟองนุ่ม' },
        { name: 'Latte', price: 65, category: 'กาแฟ', type: 'coffee', description: 'กาแฟนมหอมมัน' },
        { name: 'Mocha', price: 70, category: 'กาแฟ', type: 'coffee', description: 'กาแฟช็อคโกแลต' },
        { name: 'Caramel Macchiato', price: 75, category: 'กาแฟ', type: 'coffee', description: 'กาแฟคาราเมลหวานหอม' },
        { name: 'Flat White', price: 70, category: 'กาแฟ', type: 'coffee', description: 'กาแฟนมสไตล์ออสเตรเลีย' },
        { name: 'Affogato', price: 80, category: 'กาแฟ', type: 'coffee', description: 'เอสเปรสโซ่ราดไอศกรีม' },
        { name: 'Cold Brew', price: 65, category: 'กาแฟ', type: 'coffee', description: 'กาแฟสกัดเย็น 24 ชม.' },
        { name: 'Nitro Cold Brew', price: 80, category: 'กาแฟ', type: 'coffee', description: 'กาแฟสกัดเย็นผสมไนโตรเจน' },

        // ชา (Tea)
        { name: 'Thai Tea', price: 50, category: 'ชา', type: 'tea', description: 'ชาไทยเข้มข้น' },
        { name: 'Green Tea Latte', price: 60, category: 'ชา', type: 'tea', description: 'ชาเขียวนมหอมมัน' },
        { name: 'Matcha Latte', price: 75, category: 'ชา', type: 'tea', description: 'มัทฉะญี่ปุ่นแท้' },
        { name: 'Earl Grey', price: 55, category: 'ชา', type: 'tea', description: 'ชาเอิร์ลเกรย์หอมกลิ่นเบอร์กาม็อต' },
        { name: 'Jasmine Tea', price: 50, category: 'ชา', type: 'tea', description: 'ชามะลิหอมสดชื่น' },

        // เครื่องดื่มอื่นๆ (Other Drinks)
        { name: 'Hot Chocolate', price: 60, category: 'เครื่องดื่มอื่นๆ', type: 'chocolate', description: 'ช็อคโกแลตร้อนเข้มข้น' },
        { name: 'Iced Chocolate', price: 65, category: 'เครื่องดื่มอื่นๆ', type: 'chocolate', description: 'ช็อคโกแลตเย็น' },
        { name: 'Strawberry Smoothie', price: 70, category: 'เครื่องดื่มอื่นๆ', type: 'smoothie', description: 'สมูทตี้สตรอเบอร์รี่' },
        { name: 'Mango Smoothie', price: 70, category: 'เครื่องดื่มอื่นๆ', type: 'smoothie', description: 'สมูทตี้มะม่วง' },
        { name: 'Lemon Soda', price: 45, category: 'เครื่องดื่มอื่นๆ', type: 'soda', description: 'โซดามะนาวสดชื่น' },

        // เค้ก (Cake)
        { name: 'Cheesecake', price: 75, category: 'เค้ก', type: 'cake', description: 'ชีสเค้กนิวยอร์ค' },
        { name: 'Banana Cake', price: 45, category: 'เค้ก', type: 'cake', description: 'เค้กกล้วยหอม' },
        { name: 'Chocolate Cake', price: 65, category: 'เค้ก', type: 'cake', description: 'เค้กช็อคโกแลตเข้มข้น' },

        // ขนมเบเกอร์รี่ (Bakery)
        { name: 'Croissant', price: 55, category: 'ขนมเบเกอร์รี่', type: 'bakery', description: 'ครัวซองต์เนยหอม' },
        { name: 'Chocolate Chip Cookie', price: 40, category: 'ขนมเบเกอร์รี่', type: 'bakery', description: 'คุกกี้ช็อคโกแลตชิพ' },
        { name: 'Blueberry Muffin', price: 50, category: 'ขนมเบเกอร์รี่', type: 'bakery', description: 'มัฟฟินบลูเบอร์รี่' },
        { name: 'Brownie', price: 55, category: 'ขนมเบเกอร์รี่', type: 'bakery', description: 'บราวนี่เนื้อหนึบ' },
    ];

    for (const item of menuItems) {
        const categoryId = categoryMap.get(item.category);
        if (categoryId) {
            await prisma.menu.create({
                data: {
                    name: item.name,
                    price: item.price,
                    category_id: categoryId,
                    company_id: companyId,
                    created_by: adminUserId,
                    status: 'available',
                    // type: menuType,
                    
                    description: item.description,
                    type: item.type,
                },
            });
        }
    }
    console.log('✅ Realistic menus created');

    //  Seed Realistic Customers
    const customers = [
        { name: 'สมชาย ใจดี', phone: '0812345678' },
        { name: 'วิภา สุขสันต์', phone: '0823456789' },
        { name: 'ธนากร รักษ์ดี', phone: '0834567890' },
        { name: 'นภัสสร แสงทอง', phone: '0845678901' },
        { name: 'ชัยวัฒน์ มั่นคง', phone: '0856789012' },
        { name: 'ปิยะนุช สว่างใจ', phone: '0867890123' },
        { name: 'กฤษณะ วงศ์ใหญ่', phone: '0878901234' },
        { name: 'รัตนา เจริญสุข', phone: '0889012345' },
        { name: 'อนุชา พัฒนา', phone: '0890123456' },
        { name: 'ศิริพร ดีงาม', phone: '0901234567' },
        { name: 'ประสิทธิ์ สมบูรณ์', phone: '0912345678' },
        { name: 'มณีรัตน์ แก้วใส', phone: '0923456789' },
        { name: 'Walk-in Customer', phone: '0000000000' },
    ];

    const customerIds = [];
    for (const cust of customers) {
        const customer = await prisma.customer.upsert({
            where: {
                customer_name_customer_phone: {
                    customer_name: cust.name,
                    customer_phone: cust.phone,
                }
            },
            update: {},
            create: {
                company_id: companyId,
                customer_name: cust.name,
                customer_phone: cust.phone,
                customer_status: "normal",
                created_by: adminUserId,
            },
        });
        customerIds.push(customer.id);
    }
    console.log('✅ Realistic customers created');

    // Seed Realistic Orders
    const menus = await prisma.menu.findMany({
        where: { company_id: companyId, status: 'available' },
    });

    if (menus.length === 0) {
        console.log('⚠️  No menus found, skipping orders creation');
        return;
    }

    const services = ['Dine-in', 'Take-away', 'Delivery'];
    const paymentChannels = ['Cash', 'Credit Card', 'PromptPay', 'QR Code'];
    const orderStatuses = ['completed', 'pending', 'preparing', 'ready'];

    // สร้าง orders สำหรับวันนี้และเมื่อวาน
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let orderNumber = 1000;

    // สร้าง 20 orders สำหรับวันนี้
    for (let i = 0; i < 20; i++) {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const payment = paymentChannels[Math.floor(Math.random() * paymentChannels.length)];
        const status = i < 15 ? 'completed' : orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

        // สร้างเวลาสุ่มในวันนี้ (8:00 - 20:00)
        const orderTime = new Date(today);
        orderTime.setHours(8 + Math.floor(Math.random() * 12));
        orderTime.setMinutes(Math.floor(Math.random() * 60));
        orderTime.setSeconds(Math.floor(Math.random() * 60));

        const order = await prisma.order.create({
            data: {
                company_id: companyId,
                order_number: `ORD${String(orderNumber++).padStart(5, '0')}`,
                order_status: status,
                service: service,
                payment_channel: payment,
                customer_id: customerId,
                created_by: adminUserId,
                updated_by: adminUserId,
                created_at: orderTime,
                updated_at: orderTime,
            },
        });

        // สร้าง order items (1-4 items per order)
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedMenuIds = new Set<string>();

        for (let j = 0; j < numItems; j++) {
            // เลือก menu ที่ยังไม่ได้เลือกใน order นี้
            let menu;
            let attempts = 0;
            do {
                menu = menus[Math.floor(Math.random() * menus.length)];
                attempts++;
            } while (selectedMenuIds.has(menu.id) && attempts < 10);

            if (selectedMenuIds.has(menu.id)) continue; // Skip if duplicate
            selectedMenuIds.add(menu.id);

            const quantity = Math.floor(Math.random() * 2) + 1;
            const remarks = ['', '', '', 'หวานน้อย', 'น้ำแข็งน้อย', 'เพิ่มช็อต', 'ไม่ใส่น้ำตาล'];
            const remark = remarks[Math.floor(Math.random() * remarks.length)];

            await prisma.orderList.create({
                data: {
                    company_id: companyId,
                    order_id: order.id,
                    menu_id: menu.id,
                    price: menu.price,
                    quantity: quantity,
                    remark: remark || undefined,
                    status: 'active',
                    created_by: adminUserId,
                    updated_by: adminUserId,
                    created_at: orderTime,
                    updated_at: orderTime,
                },
            });
        }
    }
    console.log('✅ Created 20 orders for today');

    // สร้าง 15 orders สำหรับเมื่อวาน
    for (let i = 0; i < 15; i++) {
        const customerId = customerIds[Math.floor(Math.random() * customerIds.length)];
        const service = services[Math.floor(Math.random() * services.length)];
        const payment = paymentChannels[Math.floor(Math.random() * paymentChannels.length)];

        // สร้างเวลาสุ่มในเมื่อวาน
        const orderTime = new Date(yesterday);
        orderTime.setHours(8 + Math.floor(Math.random() * 12));
        orderTime.setMinutes(Math.floor(Math.random() * 60));
        orderTime.setSeconds(Math.floor(Math.random() * 60));

        const order = await prisma.order.create({
            data: {
                company_id: companyId,
                order_number: `ORD${String(orderNumber++).padStart(5, '0')}`,
                order_status: 'completed',
                service: service,
                payment_channel: payment,
                customer_id: customerId,
                created_by: adminUserId,
                updated_by: adminUserId,
                created_at: orderTime,
                updated_at: orderTime,
            },
        });

        // สร้าง order items
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedMenuIds = new Set<string>();

        for (let j = 0; j < numItems; j++) {
            // เลือก menu ที่ยังไม่ได้เลือกใน order นี้
            let menu;
            let attempts = 0;
            do {
                menu = menus[Math.floor(Math.random() * menus.length)];
                attempts++;
            } while (selectedMenuIds.has(menu.id) && attempts < 10);

            if (selectedMenuIds.has(menu.id)) continue; // Skip if duplicate
            selectedMenuIds.add(menu.id);

            const quantity = Math.floor(Math.random() * 2) + 1;
            const remarks = ['', '', '', 'หวานน้อย', 'น้ำแข็งน้อย', 'เพิ่มช็อต'];
            const remark = remarks[Math.floor(Math.random() * remarks.length)];

            await prisma.orderList.create({
                data: {
                    company_id: companyId,
                    order_id: order.id,
                    menu_id: menu.id,
                    price: menu.price,
                    quantity: quantity,
                    remark: remark || undefined,
                    status: 'active',
                    created_by: adminUserId,
                    updated_by: adminUserId,
                    created_at: orderTime,
                    updated_at: orderTime,
                },
            });
        }
    }
    console.log('✅ Created 15 orders for yesterday');

    console.log('🎉 Seed finished successfully!');
    console.log('📊 Summary:');
    console.log('   - Company: Coffee QC');
    console.log('   - Users: 3 (admin, kanun, kkkk)');
    console.log('   - Categories:', category_name.length);
    console.log('   - Menus:', menuItems.length);
    console.log('   - Customers:', customers.length);
    console.log('   - Orders: 35 (20 today, 15 yesterday)');
    console.log('');
    console.log('👤 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: 123456');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
