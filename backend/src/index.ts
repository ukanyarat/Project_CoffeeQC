import 'module-alias/register';
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";
import cookieParser from "cookie-parser";
//import router
import { userRouter } from "@modules/user/userRouter";
import { categoryRouter } from "@modules/category/categoryRouter";
import { roleRouter } from "@modules/role/roleRouter";
import { menuRouter } from "@modules/menu/menuRouter";
import { orderRouter } from "@modules/order/orderRouter";
import { orderListRouter } from "@modules/orderList/orderListRouter";
import { companyRouter } from "@modules/company/companyRouter";
import { customerRouter } from "@modules/customer/customerRouter";
import mcpRouter from "@modules/mcp/mcpRouter";

dotenv.config();

export const env = cleanEnv(process.env, {
    PORT: str(),
    CORS_ORIGIN: str(),
});

const prisma = new PrismaClient();
const app = express();
const PORT = Number(env.PORT) || 3000;
app.use(cookieParser());
app.use(express.json());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// route
app.use("/v1/user", userRouter);
app.use("/v1/category", categoryRouter);
app.use("/v1/role", roleRouter);
app.use("/v1/menu", menuRouter);
app.use("/v1/order", orderRouter);
app.use("/v1/orderList", orderListRouter);
app.use("/v1/company", companyRouter);
app.use("/v1/customer", customerRouter);
app.use("/v1/mcp", mcpRouter);

// test route
app.get("/", (req, res) => {
    res.send("Hello from Express backend 🚀");
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
