import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from 'express';
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";
const prisma = new PrismaClient();
// Create server instance
const server = new McpServer({
    name: "weather",
    version: "1.0.0",
});
server.registerTool('getCurrentWeather', {
    description: "Get the current weather for a location",
    inputSchema: {
        latitude: z.number(),
        longitude: z.number(),
    },
}, async ({ latitude, longitude }) => {
    // NWS API requires a two-step process to get the weather.
    // First, we need to get the gridpoint for the given lat/lon.
    const gridpointUrl = `${NWS_API_BASE}/points/${latitude},${longitude}`;
    const gridpointResponse = await fetch(gridpointUrl, {
        headers: {
            "User-Agent": USER_AGENT,
        },
    });
    const gridpoint = await gridpointResponse.json();
    const forecastUrl = gridpoint.properties.forecast;
    // Then, we can get the forecast for that gridpoint.
    const forecastResponse = await fetch(forecastUrl, {
        headers: {
            "User-Agent": USER_AGENT,
        },
    });
    const forecast = await forecastResponse.json();
    return {
        content: [{ type: 'text', text: JSON.stringify(forecast.properties.periods[0]) }],
        structuredContent: forecast.properties.periods[0]
    };
});
server.registerTool('getCompanies', {
    description: "Get a list of all companies from the database",
}, async () => {
    const companies = await prisma.company.findMany();
    return {
        content: [{ type: 'text', text: JSON.stringify(companies) }],
        structuredContent: companies
    };
});
const app = express();
app.use(express.json());
app.post('/mcp', async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });
    res.on('close', () => {
        transport.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});
const port = parseInt(process.env.PORT || '3001');
app.listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});
