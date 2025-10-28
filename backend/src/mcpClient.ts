import { MCPClient } from '@modelcontextprotocol/sdk';
import { makeNWSRequest } from './modules/mcp/getWeather.js';

async function run() {
    const client = new MCPClient({ serverUrl: "http://localhost:3001/mcp" });

    const result = await client.callTool("getCurrentWeather", {
        latitude: 13.7563,
        longitude: 100.5018
    });

    console.log(result);
}

run();
