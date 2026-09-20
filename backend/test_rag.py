from app.llm import llm
from app.rag import retriever
from app.prompts import RAG_PROMPT

question = "What is the annual leave policy?"

# 1. Retrieve relevant chunks
docs = retriever.invoke(question)

# 2. Extract context
context = "\n\n".join(doc.page_content for doc in docs)

# 3. Format prompt
prompt_value = RAG_PROMPT.invoke({
    "context": context,
    "question": question,
})

# 4. Generate answer from Gemini
response = llm.invoke(prompt_value)

# 5. Extract sources
sources = []
for doc in docs:
    sources.append({
        "document": doc.metadata.get("source"),
        "page": doc.metadata.get("page", 0) + 1,
    })

print("--- Question ---")
print(question)

print("\n--- Answer ---")
# Handle content whether string or list
content = response.content
if isinstance(content, list):
    text_parts = [c.get("text", "") for c in content if isinstance(c, dict) and "text" in c]
    print("".join(text_parts))
else:
    print(content)

print("\n--- Sources ---")
for s in sources:
    print(f"- {s['document']} (Page {s['page']})")
