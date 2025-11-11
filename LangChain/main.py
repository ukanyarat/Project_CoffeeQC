from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
import os

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

def main():
    """
    Sets up the LangChain SQL agent and runs a command-line interface
    for asking questions about the database.
    """
    print("Setting up LangChain SQL Agent...")

    # --- Database Connection ---
    db_uri = os.getenv("DATABASE_URL")
    if not db_uri:
        raise ValueError("DATABASE_URL environment variable not set! Please check your .env file.")

    try:
        db = SQLDatabase.from_uri(db_uri)
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return

    # --- LLM and Agent Setup ---
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set! Please check your .env file.")

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=openai_api_key)

    # Create the SQL Agent
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="openai-tools",
        verbose=True # Set to True to see the agent's thought process
    )

    print("Agent is ready! Type 'exit' to quit.")
    print("-" * 30)

    # --- Command-Line Interface Loop ---
    while True:
        user_input = input("Ask your question: ")
        if user_input.lower() == 'exit':
            print("Exiting...")
            break

        if not user_input:
            continue

        try:
            result = agent_executor.invoke({
                "input": user_input
            })
            response = result.get("output")
            print("\nBot:", response)
        except Exception as e:
            print(f"\nAn error occurred: {e}")
        
        print("-" * 30)

if __name__ == "__main__":
    main()
