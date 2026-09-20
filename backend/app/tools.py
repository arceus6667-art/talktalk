import ast
import operator
import re

# Supported safe arithmetic operators
_OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}


def _eval_node(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
        return node.value
    elif isinstance(node, ast.BinOp):
        left = _eval_node(node.left)
        right = _eval_node(node.right)
        op = _OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(left, right)
    elif isinstance(node, ast.UnaryOp):
        operand = _eval_node(node.operand)
        op = _OPERATORS.get(type(node.op))
        if op is None:
            raise ValueError(f"Unsupported operator: {type(node.op).__name__}")
        return op(operand)
    raise ValueError(f"Unsupported expression element: {type(node).__name__}")


def safe_calculator(expression: str) -> str:
    """
    Safely evaluates basic arithmetic expressions without arbitrary code execution.
    Handles standard expressions like '287 * 93' or '27 x 83'.
    """
    try:
        # Normalize multiplication symbols
        cleaned = expression.strip()
        cleaned = re.sub(r"[×xX]", "*", cleaned)
        cleaned = re.sub(r"[÷]", "/", cleaned)
        # Extract purely mathematical symbols (must start and end with digit or parenthesis)
        match = re.search(r"(\(?\d+[\d\s\+\-\*\/\(\)\.\^%]*\d+\)?)", cleaned)
        if not match:
            return f"Error: Could not extract math expression from '{expression}'"
        
        expr_str = match.group(1).strip()
        parsed = ast.parse(expr_str, mode="eval")
        result = _eval_node(parsed.body)
        return str(result)
    except Exception as e:
        return f"Calculation error: {e}"


if __name__ == "__main__":
    print("Test 287 * 93:", safe_calculator("What is 287 * 93?"))
    print("Test 27 x 83:", safe_calculator("27 x 83"))
