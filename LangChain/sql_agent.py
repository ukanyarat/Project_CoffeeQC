import os
from langchain_openai import ChatOpenAI
from langchain_community.utilities import SQLDatabase
from dotenv import load_dotenv

# In recent versions, create_sql_agent is in the langchain_community package.
# If this script fails, it's likely an environment issue. Please run:
# pip install --force-reinstall --no-cache-dir --upgrade langchain langchain-openai langchain-community
try:
    from langchain_community.agent_toolkits import create_sql_agent
except ImportError:
    raise ImportError("Could not import 'create_sql_agent' from 'langchain_community.agent_toolkits'. Please fix your environment using the commands in the comments of this script.")


def main():
    """
    Sets up the LangChain SQL agent and runs a command-line interface
    for asking questions about the database.
    """
    print("--- Setting up SQL Agent ---")
    
    # --- Load Environment Variables ---
    load_dotenv()
    db_uri = os.getenv("DATABASE_URL")
    openai_api_key = os.getenv("OPENAI_API_KEY")

    if not db_uri:
        raise ValueError("DATABASE_URL environment variable not set! Please check your .env file.")
    if not openai_api_key:
        raise ValueError("OPENAI_API_KEY environment variable not set! Please check your .env file.")

    # --- Database Connection ---
    try:
        db = SQLDatabase.from_uri(db_uri)
        print("Successfully connected to the database.")
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return

    # --- LLM and Agent Setup ---
    llm = ChatOpenAI(model="gpt-4-turbo-preview", temperature=0, api_key=openai_api_key)

    # Create the SQL Agent
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="openai-tools",
        verbose=True
    )

    print("\nSQL Agent is ready! Type 'exit' to quit.")
    print("-" * 30)

    # --- Command-Line Interface Loop ---
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

            chat_history.append({"role": "user", "content": user_input})
            chat_history.append({"role": "assistant", "content": response})
        except Exception as e:
            print(f"\nAn error occurred: {e}")
        
        print("-" * 30)

if __name__ == "__main__":
    main()