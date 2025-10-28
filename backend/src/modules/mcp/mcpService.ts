import { Request, Response } from 'express';
import axios from 'axios';

// The actual service logic for calling MCP
async function askMcp(question: string) {
    try {
        const mcpApiUrl = 'http://localhost:3002/analyze'; // URL of the MCP service
        
        // Send ONLY the question to the MCP service
        const response = await axios.post(mcpApiUrl, { question });

        // Return the analysis from the MCP service
        return response.data;
    } catch (error: any) {
        console.error('Error calling MCP service:', error.message);
        if (error.response) {
            console.error('MCP Response:', error.response.data);
        }
        throw new Error('Failed to get analysis from MCP service.');
    }
}

// Controller
export async function askMcpController(req: Request, res: Response) {
    const { question } = req.body;

    if (!question) {
        return res.status(400).json({
            statusCode: 400,
            message: 'Question is required in the request body.',
        });
    }

    try {
        const analysis = await askMcp(question);

        return res.status(200).json({
            statusCode: 200,
            message: 'Analysis received from MCP',
            data: analysis,
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
            statusCode: 500,
            message: 'Error processing your request.',
            error: error.message,
        });
    }
}
