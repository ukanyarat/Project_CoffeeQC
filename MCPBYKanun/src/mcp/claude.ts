import Anthropic from "@anthropic-ai/sdk";
import { toolDefs } from "./tools";
import "dotenv/config";

const anthropic = new Anthropic(); // API key from ANTHROPIC_API_KEY env var

export async function claudeQuery(query: string) {
  const tools = toolDefs.map(({ handler, ...t }) => t);
  const messages: Anthropic.Messages.MessageParam[] = [{ role: "user", content: query }];

  const response = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 4096,
    messages: messages,
    tools: tools,
  });

  messages.push({ role: "assistant", content: response.content });

  if (response.stop_reason === "tool_use") {
    const toolUseContent = response.content.filter(c => c.type === 'tool_use');

    const toolResults = await Promise.all(toolUseContent.map(async (toolUse) => {
        const toolName = toolUse.name;
        const toolInput = toolUse.input;
        const tool = toolDefs.find((t) => t.name === toolName);

        if (!tool) {
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Tool ${toolName} not found.`,
            } as Anthropic.Messages.ToolResultBlockParam
        }

        try {
            const toolResult = await tool.handler(toolInput);
            return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(toolResult),
            } as Anthropic.Messages.ToolResultBlockParam
        } catch (e: any) {
             return {
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Error running tool ${toolName}: ${e.message}`,
            } as Anthropic.Messages.ToolResultBlockParam
        }
    }));

    messages.push({
        role: 'user',
        content: toolResults
    });

    const finalResponse = await anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        messages: messages,
        tools: tools,
    });
    
    return finalResponse.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
  }

  return response.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
}
