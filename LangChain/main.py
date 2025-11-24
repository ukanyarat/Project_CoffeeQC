import os
import requests
import json
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.tools import tool
from langchain.schema import HumanMessage, AIMessage
from dotenv import load_dotenv

from langchain.agents import create_openai_tools_agent, AgentExecutor
# --- Configuration ---
load_dotenv()
MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8080")
MCP_LIST_URL = f"{MCP_SERVER_URL}/mcp/listTools"
MCP_CALL_URL = f"{MCP_SERVER_URL}/mcp/callTool"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def get_remote_tools():
    """
    Fetches tool definitions from the MCP server.
    """
    print(f"Fetching tools from MCP server at {MCP_LIST_URL}...")
    try:
        response = requests.get(MCP_LIST_URL)
        response.raise_for_status()
        
        tool_definitions = response.json().get("tools", [])
        if not tool_definitions:
            raise ConnectionError("API did not return any tools.")

        print(f"Found {len(tool_definitions)} tools.")

        langchain_tools = []

        for tool_def in tool_definitions:
            tool_name = tool_def["name"]
            description = tool_def["description"]

            # ปิด issue เรื่อง closure ด้วยการห่อใน factory function
            def make_tool_func(name, desc):
                @tool(name=name, description=desc)
                def _tool_func(**kwargs):
                    """Dynamically created tool function that calls the MCP server."""
                    print(f"Executing tool '{name}' via API with args: {kwargs}")
                    try:
                        api_response = requests.post(
                            MCP_CALL_URL,
                            json={"name": name, "arguments": kwargs}
                        )
                        api_response.raise_for_status()
                        result_data = api_response.json()
                        return json.dumps(result_data.get("content"), indent=2, ensure_ascii=False)
                    except requests.exceptions.RequestException as e:
                        return f"Error calling MCP server: {e}"
                return _tool_func

            langchain_tools.append(make_tool_func(tool_name, description))
            
        return langchain_tools

    except requests.exceptions.RequestException as e:
        print(f"FATAL: Could not connect to MCP server at {MCP_LIST_URL}. Is the MCP server running?")
        print(f"--> To run it, open a new terminal, cd into 'MCPBYKanun' and run 'npm run dev'")
        print(f"Error: {e}")
        return None
    except Exception as e:
        print(f"FATAL: An unexpected error occurred while fetching tools: {e}")
        return None

def main():
    """
    Sets up and runs the LangChain agent that uses the MCP server for its tools.
    """
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable not set! Please check your .env file.")

    tools = get_remote_tools()
    if tools is None:
        print("Agent setup failed because tools could not be fetched. Exiting.")
        return

    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0, api_key=OPENAI_API_KEY)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant. You have access to a set of tools to get information from the company database. Use the tools when necessary to answer user questions."),
        MessagesPlaceholder(variable_name="chat_history", optional=True),
        ("user", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # ใช้ฟังก์ชันของเวอร์ชัน 0.1.20
    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    print("\n--- MCP Agent (Client) is ready! ---")
    print("Type 'exit' to quit.")
    print("-" * 30)

    chat_history = []
    while True:
        user_input = input("Ask your question: ")
        if user_input.lower() == 'exit':
            print("Exiting...")
            break
        if not user_input:
            continue

        try:
            result = agent_executor.invoke({
                "input": user_input,
                "chat_history": chat_history
            })
            response = result.get("output")
            print("\nBot:", response)
            
            # เก็บ history เป็น HumanMessage / AIMessage ให้ตรงกับ MessagesPlaceholder
            chat_history.append(HumanMessage(content=user_input))
            chat_history.append(AIMessage(content=response))

        except Exception as e:
            print(f"\nAn error occurred: {e}")
        
        print("-" * 30)



if __name__ == "__main__":
    main()

