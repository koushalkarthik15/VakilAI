# Document 06 — Evaluation Score Strategy

**Project:** Indian Legal AI Assistant
**Project Type:** Hackathon / AI Legal Assistance Platform
**Version:** 0.1.0
**Status:** FROZEN
**Last Updated:** 2026-09-19

---

# 1. Purpose

This document defines how the Indian Legal AI Assistant should translate hackathon evaluation criteria into measurable engineering quality.

The objective is not to optimize for superficial presentation or artificial scoring.

The objective is to ensure that the qualities evaluators are expected to assess are:

1. genuinely implemented,
2. testable,
3. demonstrable,
4. traceable in the codebase,
5. and visible during the final evaluation.

The project should optimize for **substance first and visibility second**.

---

# 2. Evaluation Philosophy

The project follows five principles:

### 2.1 Build the capability, not a demonstration of the capability

A feature must work in the actual application.

Fake outputs, hard-coded findings, fabricated sources, simulated AI calls, and demo-only logic are prohibited.

---

### 2.2 Make important engineering decisions visible

Good engineering that is impossible for an evaluator to observe has reduced evaluation value.

Therefore, important properties should be visible through:

* UI behavior,
* source traceability,
* tests,
* architecture,
* structured data,
* error handling,
* documentation,
* and the final demonstration.

---

### 2.3 Prefer depth over feature count

The project should demonstrate a complete, reliable workflow for:

```text id="1z7ly3"
Rental / Lease Agreement
or
Freelancer / Service Agreement
```

rather than attempting to support many document categories superficially.

---

### 2.4 Reliability is more valuable than AI complexity

The project should not add AI merely to appear more advanced.

The intended principle remains:

> **AI for reasoning; deterministic systems for deterministic work.**

A deterministic implementation that is more reliable than an unnecessary AI call is preferred.

---

### 2.5 Legal trust is a core evaluation differentiator

The system should make it easy to answer:

> "Why did the system say this?"

The answer should be traceable through:

```text id="wubq72"
Finding
   ↓
Clause
   ↓
Rule
   ↓
Source
```

---

# 3. Primary Evaluation Dimensions

The project should optimize across the following dimensions:

1. Problem alignment
2. Functional completeness
3. AI quality and responsible AI usage
4. Legal-source reliability
5. Code quality and architecture
6. Security and privacy
7. Testing and reliability
8. Accessibility
9. Performance and efficiency
10. User experience
11. Demonstrability
12. Documentation and engineering discipline

These dimensions are interconnected.

---

# 4. Problem Alignment

## Objective

Demonstrate that the product directly addresses a meaningful legal-information accessibility problem.

The project should clearly demonstrate:

```text id="n5k7qk"
Complex legal document
        ↓
Understand
        ↓
Identify issues
        ↓
Compare against applicable rules
        ↓
Identify practical next steps
        ↓
Prepare for action/consultation
```

The workflow must remain focused on the supported user groups.

### Evidence

The evaluator should be able to see:

* a real supported PDF,
* extracted clauses,
* understandable explanations,
* flagged issues,
* source-backed comparisons,
* actionable next steps,
* preparation output.

---

# 5. Functional Completeness

The strongest demonstration should cover the complete v1 pipeline.

## Required end-to-end flow

```text id="o7p4me"
Upload PDF
   ↓
Validate
   ↓
Classify
   ↓
Extract
   ↓
Understand
   ↓
Flag
   ↓
Compare
   ↓
Act
   ↓
Prepare
```

A partially implemented feature should not be presented as complete.

---

# 6. Stage Completion Criteria

## 6.1 Understand

The evaluator should be able to observe:

* document text extraction,
* clause identification,
* stable clause IDs,
* explanations,
* evidence linking,
* language presentation.

The system should demonstrate that the explanation corresponds to actual document content.

---

## 6.2 Flag

The evaluator should be able to observe:

* relevant issue detection,
* severity,
* explanation,
* clause evidence,
* legal rule reference,
* source reference.

The system should not claim that something is legally problematic without sufficient supporting evidence.

---

## 6.3 Compare

The evaluator should be able to distinguish:

```text id="sq36x4"
Contract says
        ↓
Applicable rule says
        ↓
System explains relationship
```

This separation is important.

---

## 6.4 Act

The evaluator should see practical next steps rather than generic advice.

Examples may include:

* information to collect,
* questions to ask,
* relevant official routes,
* preparation requirements.

External actions remain user-controlled.

---

## 6.5 Prepare

The evaluator should be able to request preparation material such as:

* consultation questions,
* document checklist,
* issue summary,
* timeline,
* discussion points.

The output must remain grounded in the analyzed case.

---

# 7. AI Quality

The project should demonstrate that AI is being used where it provides meaningful value.

## AI should demonstrate:

* semantic understanding,
* contextual interpretation,
* natural-language explanation,
* multilingual presentation,
* preparation generation.

## AI should not own:

* source-of-truth legal data,
* API keys,
* legal-source verification,
* deterministic calculations,
* clause IDs,
* routing,
* business-state transitions,
* or arbitrary external actions.

---

# 8. Structured AI Outputs

AI responses should be structured rather than directly inserted into the UI.

Conceptually:

```text id="9g0y1e"
AI Provider
    ↓
Structured Response
    ↓
Schema Validation
    ↓
Reference Validation
    ↓
Application State
    ↓
UI
```

This provides visible evidence of responsible AI engineering.

---

# 9. AI Hallucination Controls

The evaluator should be able to see that the application has mechanisms preventing unsupported legal claims.

Required controls include:

* verified legal-source IDs,
* clause IDs,
* rule IDs,
* schema validation,
* source validation,
* `INSUFFICIENT_SOURCE`,
* `NOT_STATED`,
* jurisdiction checks,
* effective-date checks,
* and provider-output validation.

The system must fail safely when evidence is insufficient.

---

# 10. Legal Traceability

Legal traceability should be one of the strongest visible engineering properties.

Every substantive legal finding should be traceable through:

```text id="s6d4qp"
Finding ID
    ↓
Clause ID
    ↓
Rule ID
    ↓
Source ID
    ↓
Verified source
```

The user should be able to navigate from a finding to its evidence.

---

# 11. Source Quality

The system should prioritize:

```text id="g7wuj5"
Tier 1 — Official legislation / government
Tier 2 — Official courts / tribunals
Tier 3 — Official government departments / portals
Tier 4 — Established secondary legal sources
Tier 5 — General secondary sources
```

The demonstration should preferentially use Tier 1–3 sources for substantive legal findings where available.

The evaluator should not have to trust the AI blindly.

---

# 12. Code Quality and Architecture

The architecture should make separation of responsibilities obvious.

Expected boundaries:

```text id="cgj2bx"
UI
 │
 ↓
Session State
 │
 ↓
Application / Orchestration
 │
 ├── Deterministic Processing
 │
 ├── Legal Knowledge
 │
 └── AI Provider Abstraction
          │
          ├── Gemini
          └── Groq
```

The codebase should avoid:

* giant components,
* provider-specific logic spread throughout the application,
* duplicated business logic,
* hard-coded legal findings,
* direct API calls from UI components,
* hidden global state,
* and undocumented cross-layer dependencies.

---

# 13. Provider Independence

AI providers must be accessed through an abstraction boundary.

Conceptually:

```text id="tq8o5x"
AIService
   │
   ├── GeminiProvider
   └── GroqProvider
```

Business logic should not depend directly on provider-specific SDK behavior.

This makes:

* testing easier,
* provider failure safer,
* model replacement easier,
* and architecture easier to explain.

---

# 14. Security

Security should be demonstrated as an implemented property rather than a documentation claim.

Required areas include:

### API keys

Never expose provider keys to the browser.

### File uploads

Validate:

* file type,
* file size,
* processing behavior,
* extraction results.

### AI output

Treat external AI responses as untrusted input.

### Prompt injection

Uploaded document content must not override system/application instructions.

### External actions

No autonomous legal action should occur.

---

# 15. Privacy

Privacy is a first-class evaluation requirement.

The system should demonstrate:

```text id="s0w9oe"
Original PDF
   ↓
Local processing / evidence
   ↓
PII minimization
   ↓
External AI
```

Direct identifiers should be replaced with stable placeholders where practical.

The mapping must remain local.

The external AI provider should not receive the original identifier mapping merely to perform reasoning.

---

# 16. Privacy Evidence

The implementation should make it possible to demonstrate:

* what information was detected as PII,
* what was minimized,
* what representation was sent externally,
* that the original mapping stayed local,
* and that API keys remained server-side.

The application should not expose sensitive values unnecessarily in logs or debug panels.

---

# 17. Accessibility

Accessibility should be treated as a product requirement, not a final visual polish step.

Required areas include:

* keyboard navigation,
* focus management,
* semantic HTML,
* appropriate ARIA,
* screen-reader compatibility,
* readable Telugu/Hindi text,
* sufficient contrast,
* accessible controls,
* and risk indicators that do not rely solely on color.

A strong demonstration should include at least one keyboard-accessibility path.

---

# 18. Testing

Testing should provide evidence that the system is reliable beyond the happy path.

## Unit testing

Prioritize:

* PDF validation,
* classification,
* extraction,
* PII minimization,
* legal-rule retrieval,
* source validation,
* context validation,
* deterministic comparison,
* state transitions.

## Integration testing

Cover:

* upload → processing,
* stage handoffs,
* legal-rule retrieval,
* AI provider adapters,
* session state,
* validation failures.

## AI testing

AI providers must be mocked in automated tests.

Tests must not depend on free-tier provider availability.

---

# 19. Negative Testing

Negative cases are especially valuable for this project.

The test suite should include scenarios such as:

### Unsupported document

```text id="w7slw0"
Employment Agreement
→ UNKNOWN / UNSUPPORTED
```

### Invalid PDF

```text id="jhjv48"
Invalid file
→ validation failure
```

### Scanned PDF

```text id="8d0t5h"
Image-only PDF
→ OCR unsupported / processing limitation
```

### Missing legal source

```text id="g7e1w8"
Potential issue
→ INSUFFICIENT_SOURCE
```

### Missing contract information

```text id="6qxyv8"
Maintenance responsibility absent
→ NOT_STATED
```

### Unclear jurisdiction

```text id="y7v8k3"
Jurisdiction cannot be established
→ JURISDICTION_UNCLEAR
```

### Malicious document instructions

```text id="1y6pzc"
Prompt injection in PDF
→ treated as untrusted document content
```

These cases demonstrate that the system is designed to fail safely.

---

# 20. Performance and Efficiency

The system should demonstrate responsible resource usage.

Primary optimization targets:

* AI calls,
* token usage,
* document processing,
* legal-rule retrieval,
* repeated context,
* unnecessary browser work.

The context architecture should make it possible to send:

```text id="2gquc9"
Relevant structured context
+
Relevant evidence references
```

instead of repeatedly sending:

```text id="a2q4jc"
Entire document
+
all previous AI responses
+
entire legal database
```

---

# 21. Context Handoff as an Engineering Strength

The staged context architecture should be visible in the code.

Conceptually:

```text id="8b4d9h"
DocumentContext
      ↓
UnderstandingContext
      ↓
AnalysisContext
      ↓
ComparisonContext
      ↓
ActionContext
```

Each context should contain only information required by the next stage.

Stable IDs should allow later stages to refer back to:

* clauses,
* findings,
* rules,
* sources,
* actions.

This improves:

* token efficiency,
* debuggability,
* traceability,
* and testability.

---

# 22. User Experience

The UI should make the system's reasoning understandable without overwhelming the user.

The functional baseline should preserve:

```text id="qpl1pp"
Document
+
Current Stage
+
Evidence
+
Explanation
+
Next Action
```

The current document/stage-pane concept is an initial functional baseline.

Visual design can be redesigned after the core system works.

The evaluation should prioritize:

* clarity,
* evidence visibility,
* workflow comprehension,
* accessibility,
* and trust.

---

# 23. Judge-Visible Trust Signals

The following should be visible during a demonstration where appropriate:

### Evidence

A finding can be traced to the PDF clause.

### Source

A legal claim can be traced to a verified source.

### Safety

An unsupported claim produces `INSUFFICIENT_SOURCE`.

### Privacy

PII minimization can be demonstrated.

### AI boundary

The evaluator can see that deterministic operations are not unnecessarily delegated to AI.

### Failure handling

Unsupported files and invalid inputs fail clearly.

### Accessibility

The workflow can be navigated using the keyboard.

---

# 24. Demonstration Strategy

The final demonstration should use a controlled but realistic scenario.

The preferred demonstration sequence is:

```text id="9w0hlv"
1. Open application
2. Select language
3. Upload supported PDF
4. Show document classification
5. Show Understand
6. Click a finding/evidence reference
7. Show Flag
8. Open legal source
9. Show Compare
10. Show Act
11. Request Prepare
12. Show multilingual presentation
13. Demonstrate a safety/failure case
```

The demonstration should not rely exclusively on a perfect happy path.

Showing one controlled failure case demonstrates engineering maturity.

---

# 25. Recommended Demonstration Scenarios

At least two representative document scenarios should be prepared if sufficient test documents are available:

### Scenario A — Rental / Lease

Demonstrate:

* document understanding,
* contractual obligations,
* relevant findings,
* source-backed comparison,
* practical next steps.

### Scenario B — Freelancer / Service Agreement

Demonstrate:

* service/payment terms,
* relevant contractual clauses,
* applicable rules,
* comparison,
* preparation workflow.

The project does not need dozens of documents to demonstrate breadth.

Depth is more important than volume.

---

# 26. Multilingual Demonstration

At least one meaningful workflow should be demonstrated in:

```text id="3ph8pd"
English
```

and then presented in:

```text id="k3g5e4"
Telugu
```

or:

```text id="i4s6kd"
Hindi
```

The demonstration should show that changing presentation language does not require re-running the underlying legal reasoning.

Stable IDs and canonical analysis should remain unchanged.

---

# 27. What Should Not Be Demonstrated

Do not present the following as implemented if they are not actually implemented:

* OCR,
* unsupported document types,
* unsupported languages,
* nationwide legal coverage,
* autonomous filing,
* autonomous legal notices,
* fabricated legal sources,
* fake AI responses,
* mocked functionality disguised as real functionality.

A controlled mock may be used in tests, but it must not be represented as a live capability.

---

# 28. Engineering Evidence Checklist

Before final evaluation, verify:

## Product

* [ ] End-to-end workflow works.
* [ ] Supported document types work.
* [ ] Three supported languages work.
* [ ] Telangana jurisdiction behavior works.

## AI

* [ ] Provider abstraction exists.
* [ ] AI responses are schema validated.
* [ ] AI output references valid IDs.
* [ ] AI is used only where appropriate.
* [ ] Provider failures are handled.

## Legal reliability

* [ ] Legal claims have verified sources.
* [ ] Source hierarchy is respected.
* [ ] Rule applicability is checked.
* [ ] Effective dates are considered.
* [ ] `INSUFFICIENT_SOURCE` works.
* [ ] `NOT_STATED` works.

## Privacy

* [ ] PII minimization works.
* [ ] PII mappings remain local.
* [ ] Sensitive data is not unnecessarily logged.
* [ ] API keys are server-side.

## Security

* [ ] Upload validation works.
* [ ] Prompt injection handling exists.
* [ ] AI output is treated as untrusted.
* [ ] No unauthorized external action exists.

## Accessibility

* [ ] Keyboard navigation works.
* [ ] Focus states work.
* [ ] Contrast is sufficient.
* [ ] Risk is not communicated by color alone.
* [ ] Telugu/Hindi text is readable.

## Testing

* [ ] Unit tests exist.
* [ ] Integration tests exist.
* [ ] Negative tests exist.
* [ ] AI providers are mocked.
* [ ] Critical workflows are covered.

---

# 29. Evaluation Anti-Patterns

The following should actively be avoided.

## Feature stuffing

Adding many shallow features to make the project appear larger.

## AI stuffing

Using an LLM for tasks that can be reliably performed deterministically.

## Complexity theater

Adding vector databases, agents, model chains, or other infrastructure without a demonstrated product need.

## Fake citations

Displaying invented or unverified legal sources.

## Demo-only logic

Hard-coding results for the final presentation.

## Safety theater

Documenting security/privacy controls without actually implementing them.

## Accessibility theater

Adding superficial ARIA attributes without testing actual accessibility.

## Unsupported claims

Presenting AI interpretations as established law.

---

# 30. Definition of Evaluation Readiness

The project is evaluation-ready when:

### Product

The core workflow works from PDF upload through preparation.

### Legal reliability

Substantive legal claims are source-backed and traceable.

### AI

AI contributes meaningful semantic reasoning while remaining constrained by deterministic validation.

### Security

Important attack and input boundaries are handled.

### Privacy

PII minimization and local mapping behavior work.

### Accessibility

The core workflow is usable through accessible interaction patterns.

### Testing

Critical paths and failure cases are automated.

### Performance

Unnecessary AI calls and repeated context transmission are minimized.

### Demonstration

The project can communicate its strongest engineering properties through a reproducible end-to-end workflow.

---

# 31. Final Evaluation Principle

The project should not attempt to convince an evaluator that it is sophisticated.

It should make the sophistication **observable through the engineering itself**.

The strongest evidence is:

```text id="1x7c1g"
Real user problem
       ↓
Focused scope
       ↓
Reliable workflow
       ↓
Grounded legal reasoning
       ↓
Traceable evidence
       ↓
Privacy protection
       ↓
Accessible interface
       ↓
Tested failure handling
       ↓
Efficient AI usage
       ↓
Clear demonstration
```

The evaluation strategy therefore follows one rule:

> **Build a system whose quality can be verified rather than merely claimed.**
