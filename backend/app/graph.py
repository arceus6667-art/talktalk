import json
import re
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, START, END

from app.llm import llm
from app.prompts import CLASSIFY_PROMPT, RAG_PROMPT, GENERAL_PROMPT, VERIFY_PROMPT
from app.rag import retriever
from app.tools import safe_calculator


class TalkTalkState(TypedDict, total=False):
    question: str
    intent: str               # "RAG" | "TOOL" | "GENERAL"
    context: str
    sources: List[Dict[str, Any]]
    tool_result: str
    answer: str
    supported: bool


def _clean_json_str(text: Any) -> str:
    """Extract string content from LLM response whether text block or list."""
    if isinstance(text, list):
        parts = [c.get("text", "") for c in text if isinstance(c, dict) and "text" in c]
        return "".join(parts)
    return str(text)


def _parse_json(text: str) -> dict:
    """Safely extracts JSON dictionary from model output."""
    raw = _clean_json_str(text)
    match = re.search(r"\{.*?\}", raw, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return {}


# 1. Classifier Node
def classify_question_node(state: TalkTalkState) -> Dict[str, Any]:
    q = state["question"].lower().strip()
    
    # Fast-path 1: Mathematical computation (saves LLM quota and runs in 0ms)
    math_symbols = ["*", "×", "+", "/", "÷", "%"]
    if any(sym in q for sym in math_symbols) and any(c.isdigit() for c in q):
        return {"intent": "TOOL"}
    if q.startswith("calculate ") or "multiply " in q or "divide " in q:
        return {"intent": "TOOL"}

    # Fast-path 2: Obvious policy / handbook keywords
    if any(kw in q for kw in ["annual leave", "leave policy", "handbook", "vacation days", "health insurance", "remote work"]):
        return {"intent": "RAG"}

    # For ambiguous or complex requests, invoke Gemini classifier
    try:
        chain = CLASSIFY_PROMPT | llm
        response = chain.invoke({"question": state["question"]})
        data = _parse_json(response.content)
        intent = data.get("intent", "").upper()
        if intent in ["RAG", "TOOL", "GENERAL"]:
            return {"intent": intent}
    except Exception as e:
        print(f"[Classifier warning, using fallback]: {e}")

    return {"intent": "GENERAL"}


# Routing Condition
def route_question(state: TalkTalkState) -> str:
    return state.get("intent", "GENERAL")


# 2A. Retrieval Node (for RAG)
def retrieve_node(state: TalkTalkState) -> Dict[str, Any]:
    docs = retriever.invoke(state["question"])
    context = "\n\n".join(doc.page_content for doc in docs)
    sources = [
        {
            "document": doc.metadata.get("source"),
            "page": doc.metadata.get("page", 0) + 1,
        }
        for doc in docs
    ]
    return {
        "context": context,
        "sources": sources,
    }


# 2B. Calculator Tool Node
def calculator_node(state: TalkTalkState) -> Dict[str, Any]:
    result = safe_calculator(state["question"])
    return {
        "tool_result": result,
        "sources": [],
    }


# 2C. Direct LLM Node (for GENERAL)
def direct_llm_node(state: TalkTalkState) -> Dict[str, Any]:
    chain = GENERAL_PROMPT | llm
    response = chain.invoke({"question": state["question"]})
    answer = _clean_json_str(response.content)
    return {
        "answer": answer,
        "sources": [],
    }


# 3. Generation Node
def generate_node(state: TalkTalkState) -> Dict[str, Any]:
    intent = state.get("intent", "GENERAL")

    if intent == "RAG":
        try:
            chain = RAG_PROMPT | llm
            response = chain.invoke({
                "context": state.get("context", ""),
                "question": state["question"],
            })
            answer = _clean_json_str(response.content)
            return {"answer": answer}
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg or "quota" in err_msg.lower():
                # Provide grounded fallback from context rather than failing
                context = state.get("context", "")
                fallback = "Based on company documents:\n" + context[:500] if context else "Rate limit reached on Gemini free tier. Please retry in a few seconds."
                return {"answer": fallback}
            return {"answer": f"Unable to generate response: {err_msg}"}

    elif intent == "TOOL":
        calc_res = state.get("tool_result", "")
        answer = f"The calculation result is: **{calc_res}**"
        return {"answer": answer}

    else:
        try:
            chain = GENERAL_PROMPT | llm
            response = chain.invoke({"question": state["question"]})
            answer = _clean_json_str(response.content)
            return {"answer": answer}
        except Exception as e:
            err_msg = str(e)
            if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
                return {"answer": "Gemini API free tier rate limit reached. Please wait a few moments before trying again."}
            return {"answer": state.get("answer", "")}


# 4. Grounding Verifier Node
def verify_node(state: TalkTalkState) -> Dict[str, Any]:
    intent = state.get("intent", "GENERAL")

    if intent != "RAG":
        return {"supported": True}

    try:
        chain = VERIFY_PROMPT | llm
        response = chain.invoke({
            "context": state.get("context", ""),
            "question": state["question"],
            "answer": state.get("answer", ""),
        })

        data = _parse_json(response.content)
        is_supported = data.get("supported", True)

        if not is_supported:
            fallback_answer = (
                "The information requested is not sufficiently available in the provided documents."
            )
            return {
                "supported": False,
                "answer": fallback_answer,
            }
        return {"supported": True}
    except Exception:
        # If verifier call fails (e.g. rate limit), gracefully pass through
        return {"supported": True}


# --- LangGraph Workflow Assembly ---
builder = StateGraph(TalkTalkState)

# Add Nodes
builder.add_node("classify_question", classify_question_node)
builder.add_node("retrieve", retrieve_node)
builder.add_node("calculator", calculator_node)
builder.add_node("direct_llm", direct_llm_node)
builder.add_node("generate", generate_node)
builder.add_node("verify", verify_node)

# Add Edges
builder.add_edge(START, "classify_question")

# Conditional Branch from Classifier
builder.add_conditional_edges(
    "classify_question",
    route_question,
    {
        "RAG": "retrieve",
        "TOOL": "calculator",
        "GENERAL": "direct_llm",
    },
)

# Connect branches to Generation
builder.add_edge("retrieve", "generate")
builder.add_edge("calculator", "generate")
builder.add_edge("direct_llm", "generate")

# Connect Generation to Verification
builder.add_edge("generate", "verify")

# End of workflow
builder.add_edge("verify", END)

# Compile Graph
graph = builder.compile()


if __name__ == "__main__":
    test_questions = [
        "What is the annual leave policy?",
        "What is 287 * 93?",
        "Explain quantum computing in two simple sentences.",
    ]

    for q in test_questions:
        print("\n" + "=" * 60)
        print(f"Testing Question: '{q}'")
        res = graph.invoke({"question": q})
        print(f"Classified Intent: {res.get('intent')}")
        print(f"Supported Flag:    {res.get('supported')}")
        print(f"Sources Count:     {len(res.get('sources', []))}")
        print("Answer:")
        print(res.get("answer"))
