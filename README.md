# Palm92 JudgmentOS

**Governed AI delegation and assurance for consequential work.**

> Humans define the outcome. AI performs the permitted work. Evidence verifies the result. Humans retain authority over consequential decisions.
>
> **AI investigates. Humans decide.**

Palm92 JudgmentOS is a professional portfolio and pilot MVP for governing delegated AI work before, during and after execution. It operationalises five questions:

1. What does the finished result look like?
2. What authoritative context must the AI know and must not guess?
3. What requires human approval before action?
4. How will we verify the result is correct?
5. What happens if the AI is wrong?

## Flagship case: Palm92 LeaseGuard AI

The seeded demonstration models an insurance review where an executed lease requires **£10m public liability cover** while the supplied policy shows **£5m**. JudgmentOS identifies the **£5m shortfall**, classifies it as a high-consequence exception and routes the recommendation to a human reviewer.

The AI may extract, compare, explain and recommend. It may not autonomously approve or reject a policy, notify a customer, post to an ERP, create a financial commitment or alter contractual records.

## MVP capabilities

- Executive delegation dashboard
- Five-question Delegation Contract
- Fact / inference / assumption separation
- Evidence provenance and confidence
- Verification checklist
- Human approval gate with mandatory rationale
- Audit timeline
- Low / Medium / High / Critical consequence model
- Continue / Improve / Stop evaluation
- Reusable Palm92 templates for LeaseGuard, JobShield, SafeVoice and AI Test Copilot
- Browser persistence for demonstration data
- Future-ready database schema for Supabase/Postgres

## Run locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Architecture direction

Current demo uses browser persistence so it runs without credentials. The repository includes a database schema for the next phase, where the UI can be connected to Supabase/Postgres and later to model APIs, OCR/document extraction, MCP tools, SAP, Oracle, Dynamics and immutable audit storage.

## Important

This is a demonstration and architecture portfolio project. Seeded cases are illustrative. JudgmentOS does not guarantee legal, insurance, regulatory, compliance or financial correctness and does not claim certification against any standard.

## Palm92 Intelligence

Palm92 JudgmentOS is part of the Palm92 governed-AI portfolio. Its design principle is simple: automate the permitted work, preserve evidence, and keep accountable humans in control of consequential decisions.
