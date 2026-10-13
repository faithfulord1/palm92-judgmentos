"""Palm92 local decision triage prototype. Standard library only; no external calls."""
import json
import re
import sys

PATTERNS = {
    "refund_request": [r"\brefund\b", r"money back", r"return my money", r"refund the difference", r"पैसे वापस"],
    "cancel_account": [r"\bclose my account\b", r"\bcancel my account\b", r"\bdelete my account\b"],
    "complaint": [r"\bbroken\b", r"\bcracked\b", r"\bcrashing\b", r"\bdoesn.t work\b", r"\barrived damaged\b", r"टूटा"],
    "churn_risk": [r"thinking of leaving", r"may leave", r"might leave", r"i.m done"],
}
NEGATED_CLOSURE = re.compile(r"\b(?:do not|don.t|don't|never)\s+(?:close|cancel|delete)\s+my account\b", re.I)


def classify(message):
    lowered = message.lower()
    labels = {name: any(re.search(p, lowered, re.I) for p in patterns)
              for name, patterns in PATTERNS.items()}
    if NEGATED_CLOSURE.search(message):
        labels["cancel_account"] = False
    if "another cracked" in lowered or "love that for me" in lowered:
        labels["complaint"] = True
    flags = []
    if NEGATED_CLOSURE.search(message):
        flags.append("explicit_do_not_close")
    if re.search(r"\b(?:if this happens again|until the refund is confirmed)\b", lowered):
        flags.append("conditional_or_delayed_action")
    if not any(labels.values()):
        flags.append("unknown_needs_review")
    actions = []
    for label, action in (("refund_request", "refund"), ("cancel_account", "account_closure")):
        if labels[label]:
            actions.append({"action": action, "status": "requires_human_approval"})
    return {"labels": labels, "flags": flags, "proposed_actions": actions,
            "automatic_execution_allowed": False, "confidence": None,
            "method": "transparent_keyword_baseline_not_model"}


if __name__ == "__main__":
    message = " ".join(sys.argv[1:]) or sys.stdin.read().strip()
    if not message:
        raise SystemExit("Usage: python3 decision_pilot.py 'customer message'")
    print(json.dumps(classify(message), ensure_ascii=False, indent=2))
