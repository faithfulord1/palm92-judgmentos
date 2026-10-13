"""Run deliberately small, inspectable golden cases; not a performance benchmark."""
from decision_pilot import classify

CASES = [
    ("Please refund order 5521. The item arrived broken.", {"refund_request": True, "complaint": True, "cancel_account": False}),
    ("The app keeps crashing, honestly thinking of leaving.", {"complaint": True, "churn_risk": True, "cancel_account": False}),
    ("Third time the blender arrived cracked. Send my money back and close my account.", {"complaint": True, "refund_request": True, "cancel_account": True}),
    ("Oh great. Another cracked blender. Love that for me.", {"complaint": True, "refund_request": False}),
    ("Refund the blender and also close my account.", {"refund_request": True, "cancel_account": True}),
    ("Fantastic, another cracked blender. Please refund order 5521, but do not close my account until the refund is confirmed. If this happens again, I may leave.", {"complaint": True, "refund_request": True, "cancel_account": False, "churn_risk": True}),
    ("The blender फिरसे टूटा हुआ आया, पैसे वापस करो.", {"complaint": True, "refund_request": True}),
    ("Charged 1,200 and then 2,400 for one order, refund the difference.", {"refund_request": True}),
    ("What time does the session start?", {"refund_request": False, "cancel_account": False}),
]

if __name__ == "__main__":
    failures = []
    for message, expected in CASES:
        result = classify(message)
        mismatches = {k: (result["labels"][k], v) for k, v in expected.items() if result["labels"][k] != v}
        if mismatches or result["automatic_execution_allowed"]:
            failures.append((message, mismatches))
    print(f"{len(CASES) - len(failures)}/{len(CASES)} illustrative cases matched")
    for message, mismatches in failures:
        print("FAIL:", message, mismatches)
    raise SystemExit(bool(failures))
