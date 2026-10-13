# Palm92 Decision Pilot

A local, free, transparent baseline from the Outskill session. No API key, dependencies, or customer data needed. It is **not Jev**, does not calculate model probabilities, and does not execute refunds, closures, or messages.

## Run

```bash
python3 evaluate.py
python3 decision_pilot.py "Third time the blender arrived cracked. Send my money back and close my account."
```

The result preserves separate labels and flags money or account actions for approval. This simple keyword baseline is intentionally limited: paraphrases, negation outside the one example, sarcasm, and other languages can fail. Unknown cases need review.

## Next implementation gate

1. Collect 30 to 50 synthetic cases covering single intent, two intents, negation, future conditions, sarcasm, other languages, and unknown requests. Have a human label each independently.
2. Define which Palm92 workflow to pilot first. Recommended: local Chief of Staff email triage with synthetic opportunity messages, no live Gmail connection or outbound action.
3. When the presenter shares the repository and official API documentation, inspect the contract, pricing/free tier, data retention, privacy, and key handling. Add Jev as a replaceable scorer only if access and terms fit.
4. Compare baseline, Jev, and a chat model on the same held-out cases. Measure per-label precision and recall, missed multi-intent actions, calibration, latency, total cost, and human review burden. A model's displayed percentage is not a measured correctness probability by default.
5. Keep Palm92's authority gate: human approval before any payment, account change, external communication, or sensitive record update. Log the original text or privacy-safe reference, all labels and scores, model/version, policy version, reviewer, and outcome.

The workshop's reported benchmarks are not independently reproduced here.
