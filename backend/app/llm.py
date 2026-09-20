import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# 1. Load environment variables from .env
load_dotenv()

# 2. Read configurations
api_key = os.getenv("GOOGLE_API_KEY")
model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# 3. Initialize Gemini LLM via LangChain
llm = ChatGoogleGenerativeAI(
    model=model_name,
    google_api_key=api_key,
    temperature=0.2,
)

def get_answer(prompt: str) -> str:
    """
    The smallest possible LangChain flow:
    Python -> LangChain -> Gemini -> Answer
    """
    response = llm.invoke(prompt)
    return str(response.content)

if __name__ == "__main__":
    test_prompt = "Explain in one sentence what makes a great AI knowledge assistant."
    print("--- TalkTalk Minimal AI Backend ---")
    print(f"Model:  {model_name}")
    print(f"Prompt: {test_prompt}\n")

    if not api_key or api_key == "YOUR_GOOGLE_AI_STUDIO_API_KEY":
        print("[!] Note: Set your GOOGLE_API_KEY in backend/.env to run live calls against Gemini.")
    else:
        try:
            answer = get_answer(test_prompt)
            print("Answer:")
            print(answer)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
