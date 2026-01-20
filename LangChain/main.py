
import os
from dotenv import load_dotenv

from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import create_sql_agent
from langchain_anthropic import ChatAnthropic


load_dotenv()  # โหลดตัวแปรจาก .env


def main():
    """
    SQL Agent เวอร์ชันใช้ Anthropic (Claude) ผ่าน LangChain
    สามารถถามข้อมูลจากฐานข้อมูลด้วยภาษามนุษย์ได้
    """
    print("Setting up Anthropic + LangChain SQL Agent...")

    # --- Database Connection ---
    db_uri = os.getenv("DATABASE_URL")
    if not db_uri:
        raise ValueError(
            "DATABASE_URL environment variable not set! "
            "กรุณาเช็คไฟล์ .env ว่ามี DATABASE_URL ด้วย"
        )

    try:
        db = SQLDatabase.from_uri(db_uri)
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return

    # --- Anthropic API Key ---
    anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
    if not anthropic_api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY environment variable not set! "
            "กรุณาเช็คไฟล์ .env ว่ามี ANTHROPIC_API_KEY ด้วย"
        )

    # --- LLM Setup (Claude) ---
    # เปลี่ยนชื่อโมเดลให้ตรงกับที่คุณใช้ใน console.anthropic.com
    # เช่น claude-3-5-sonnet-20241022 หรือ claude-3-5-sonnet-latest
        # --- LLM Setup (Claude) ---
        # ใช้ค่า default ที่คุณมีสิทธิ์ใช้แน่นอน: claude-3-haiku-20240307
    anthropic_model = os.getenv("ANTHROPIC_MODEL", "claude-3-haiku-20240307")

    print(f"Using Anthropic model: {anthropic_model}")

    llm = ChatAnthropic(
    model=anthropic_model,
    temperature=0,
    api_key=anthropic_api_key,
    )

   
    # --- Create SQL Agent ---
    # ใช้ agent_type = "zero-shot-react-description"
    # ซึ่งเป็น style ReAct แบบข้อความ ใช้ได้กับ LLM ทั่วไป (ไม่ผูกกับ OpenAI tools)
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        verbose=True,
        agent_type="zero-shot-react-description",
    )

    print("Agent is ready! Type 'exit' to quit.")
    print("-" * 30)

    # --- Command-Line Interface Loop ---
    while True:
        user_input = input("Ask your question: ")
        if user_input.lower().strip() == "exit":
            print("Exiting...")
            break

        if not user_input.strip():
            continue

        try:
            result = agent_executor.invoke({"input": user_input})
            # สำหรับ create_sql_agent ปกติ key หลักคือ "output"
            response = result.get("output", result)
            print("\nBot:", response)
        except Exception as e:
            print(f"\nAn error occurred: {e}")

        print("-" * 30)


if __name__ == "__main__":
    main()
