
import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 3002; // Port for the MCP service
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send('MCP Service is running and ready to connect to the database!');
});

app.post('/analyze', async (req: Request, res: Response) => {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question is required in the request body.' });
    }

    console.log(`Received question for analysis: "${question}"`);

    try {
        // 1. Fetch data directly from the database using Prisma Client
        console.log('Fetching data from database...');
        const users = await prisma.user.findMany({ take: 10 }); // Limiting for now
        const orders = await prisma.order.findMany({ take: 10, include: { orderLists: true } });
        const menus = await prisma.menu.findMany({ take: 10 });

        const databaseContent = {
            users,
            orders,
            menus
        };

        console.log('Data fetched successfully.');

        // 2. Perform "AI analysis" (placeholder)
        // In a real scenario, you would pass `databaseContent` and `question` to an AI model.
        const analysisResult = {
            message: "Successfully analyzed the data.",
            question: question,
            summary: `Analyzed ${users.length} users, ${orders.length} orders, and ${menus.length} menus.`
        };

        // 3. Send back the result
        res.status(200).json(analysisResult);

    } catch (error: any) {
        console.error('Error during database query or analysis:', error.message);
        res.status(500).json({ message: 'Failed to process request in MCP service.', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`MCP service listening on port ${port}`);
});
