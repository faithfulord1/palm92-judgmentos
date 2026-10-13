# Palm92 Decision Review Pilot

**Status: complete offline demonstration. Live model integration remains pending.**

## Try it

Download `index.html` and open it in your browser. No installation, API key, subscription, or network connection is required.

1. Choose a fictional example or write one.
2. Click **Check the message**.
3. Read all candidate labels and confirm every intent.
4. Select a decision and write the reason.
5. Click **Record decision**, then **Download review record**.

The generated JSON records the original message, candidate labels, human labels, rationale, timestamp, and `execution_performed: false`. Editing the message invalidates its old analysis; editing a decision disables its old download. Clear removes the current in-memory record. Nothing is stored remotely or executed.

## What it demonstrates

Separate complaint, refund, closure and churn signals preserve multiple requests. Explicit closure negation is flagged. Human review is required for every case in this demo. Keyword matches are candidates, not verified facts or calibrated confidence. Paraphrases, complex negation, conditional language and unsupported languages can fail. The supported Hindi example is only one illustrative test.

This is a transparent rules baseline inspired by the Outskill session. Jev and other model APIs are not connected. Refund eligibility, payment records, identity and account authority are not verified by this demo.

## Developer checks

From this directory:

```bash
python3 evaluate.py
node test_demo.cjs
```

Checks cover 9 illustrative label cases in Python and JavaScript, empty input, a required decision reason, record invalidation, and the invariant that execution is false. The JavaScript checks use a minimal DOM mock; a real browser visual test could not run in the build environment because Chromium was unavailable.

`build_demo.py` embeds the Python rules into the self-contained HTML. Regenerate after changing the baseline:

```bash
python3 build_demo.py
```

## Next version

Obtain official decision API documentation and access; verify free tier/pricing and data terms; add a replaceable scorer; test on independently labelled held-out cases; compare missed intents, calibration, latency, total cost and review burden. Connect real workflows only after those checks. Authority remains separate from classification.

**Palm92 principle: AI investigates. Humans decide.**
