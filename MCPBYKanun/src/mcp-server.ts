#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { toolDefs } from "./mcp/tools.js";

// Create MCP server
const server = new Server(
  {
    name: "coffeeqc-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Convert tool definitions to MCP format
const mcpTools: Tool[] = toolDefs.map((tool) => ({
  name: tool.name,
  description: tool.description,
  inputSchema: tool.inputSchema,
}));

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: mcpTools,
  };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  console.error(`[MCP] 🔧 Tool called: ${name}`);
  console.error(`[MCP] 📥 Input arguments:`, JSON.stringify(args, null, 2));

  const tool = toolDefs.find((t) => t.name === name);
  if (!tool) {
    console.error(`[MCP] ❌ Tool not found: ${name}`);
    throw new Error(`Tool ${name} not found`);
  }

  try {
    const startTime = Date.now();
    const result = await tool.handler(args ?? {});
    const duration = Date.now() - startTime;

    console.error(`[MCP] ✅ Tool executed successfully in ${duration}ms`);
    console.error(`[MCP] 📤 Result:`, JSON.stringify(result, null, 2));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    console.error(`[MCP] ❌ Error executing tool ${name}:`, error.message);
    console.error(`[MCP] Stack trace:`, error.stack);
    throw new Error(`Error executing tool ${name}: ${error.message}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("CoffeeQC MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
