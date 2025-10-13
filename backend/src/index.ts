import 'module-alias/register';
import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { cleanEnv, str } from "envalid";

import { userRouter } from "@modules/user/userRouter";

dotenv.config();

export const env = cleanEnv(process.env, {
    PORT: str(),
    CORS_ORIGIN: str(),
});

const prisma = new PrismaClient();
const app = express();
const PORT = Number(env.PORT) || 3000;

app.use(express.json());
app.use(cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// router
app.use("/v1/user", userRouter);

app.get("/", (req, res) => {
    res.send("Hello from Express backend 🚀");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
