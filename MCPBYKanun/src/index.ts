
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { listTools, toolDefs } from "./mcp/tools";
import { claudeQuery } from "./mcp/claude";

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));

app.get("/mcp/listTools", (_req, res) => res.json(listTools()));

app.post("/mcp/callTool", async (req, res) => {
  const { name, arguments: args } = req.body as { name: string; arguments: any };
  const tool = toolDefs.find(t => t.name === name);
  if (!tool) return res.status(404).json({ error: "tool_not_found" });
  try {
    const content = await tool.handler(args ?? {});
    res.json({ content });
  } catch (e: any) {
    res.status(400).json({ error: "tool_error", message: e?.message });
  }
});

app.post("/mcp/claude", async (req, res) => {
    const { query } = req.body;
    if (!query) {
        return res.status(400).json({ error: "query_is_required" });
    }

    try {
        const response = await claudeQuery(query);
        res.json({ response });
    } catch (e: any) {
        console.error(e);
        res.status(500).json({ error: "claude_error", message: e?.message });
    }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`MCP on :${process.env.PORT || 3000}`)
);
