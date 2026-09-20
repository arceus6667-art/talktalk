from app.llm import llm

response = llm.invoke(
    "Explain artificial intelligence in two simple sentences."
)

print(response.content)
