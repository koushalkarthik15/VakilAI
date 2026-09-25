# Document 08 — Decision Log

**Project:** Indian Legal AI Assistant
**Project Type:** Hackathon / AI Legal Assistance Platform
**Version:** 0.1.0
**Status:** FROZEN
**Last Updated:** 2026-09-19

---

# 1. Purpose

This document records significant decisions made during the design and implementation of the Indian Legal AI Assistant.

The Decision Log exists to preserve:

* what was decided,
* why it was decided,
* what alternatives were considered,
* what consequences the decision creates,
* and which documents or components are affected.

The purpose is to prevent important decisions from being lost across development sessions or accidentally reversed during implementation.

---

# 2. Decision Recording Principle

Not every implementation detail requires a Decision Log entry.

A decision should be recorded when changing it would materially affect:

* product scope,
* architecture,
* legal safety,
* privacy,
* security,
* AI behavior,
* provider strategy,
* supported jurisdictions,
* supported languages,
* document types,
* evaluation strategy,
* or major implementation direction.

Minor coding decisions should remain in code and normal documentation.

---

# 3. Decision Status

Each decision may have one of the following statuses:

| Status     | Meaning                                           |
| ---------- | ------------------------------------------------- |
| PROPOSED   | Decision is being considered                      |
| ACCEPTED   | Decision has been explicitly accepted             |
| FROZEN     | Decision should not change without a new decision |
| SUPERSEDED | Replaced by a later decision                      |
| REJECTED   | Considered and rejected                           |

---

# 4. Decision Record Format

Each decision should use:

```text
Decision ID:
Date:
Title:
Status:

Context:

Decision:

Alternatives Considered:

Rationale:

Consequences:

Affected Documents:

Affected Components:
```

---

# 5. Product Scope Decisions

## ADR-001 — Narrow v1 Document Scope

**Date:** 2026-09-19
**Status:** ACCEPTED

### Context

A general legal-document assistant would require substantially broader legal coverage, testing, source management, and document-specific reasoning.

A narrow initial scope allows the project to produce a deeper and more reliable workflow.

### Decision

Version 0.1.0 supports only:

```text
Rental / Lease Agreement
Freelancer / Service Agreement
```

### Alternatives Considered

* Support arbitrary legal documents.
* Support many contract categories.
* Support court documents and legal notices.
* Start with a general legal chatbot.

### Rationale

The project should prioritize depth and reliability over feature breadth.

### Consequences

The classifier can remain relatively small.

The legal knowledge base can focus on a defined domain.

Testing can use document-specific fixtures.

### Affected Documents

* 00 Project Vision
* 01 System Architecture
* 05 Feature Freeze
* 07 Sprint Tracker

---

# 6. Language Decisions

## ADR-002 — Initial Language Support

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Version 0.1.0 supports:

```text
English
Telugu
Hindi
```

### Alternatives Considered

* English only.
* Support many Indian languages immediately.
* Add additional languages before core workflow completion.

### Rationale

These three languages provide meaningful multilingual capability while keeping the implementation manageable.

### Consequences

Language architecture must support future expansion without requiring a redesign.

Additional languages are deferred.

### Affected Documents

* 00
* 01
* 02
* 05
* 07

---

# 7. Jurisdiction Decisions

## ADR-003 — Initial Jurisdiction

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

The initial jurisdiction is:

```text
Telangana state law
+
applicable central Indian legislation/regulations
relevant to supported document types and the intended Hyderabad/Telangana context
```

### Alternatives Considered

* Hyderabad-only rules.
* Telangana-only law without applicable central legislation.
* Nationwide Indian legal coverage.
* Generic international legal coverage.

### Rationale

The project needs a concrete legal scope to maintain reliable source coverage and avoid implying nationwide legal completeness.

### Consequences

Legal rules must carry jurisdiction and applicability information.

The system must support:

```text
SUPPORTED
OUTSIDE_SCOPE
JURISDICTION_UNCLEAR
```

### Affected Documents

* 00
* 01
* 03
* 05
* 10
* 11

---

# 8. Input Decisions

## ADR-004 — PDF-Only Input for v1

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Version 0.1.0 accepts PDF documents only.

Photo input and OCR are deferred.

### Alternatives Considered

* PDF + image upload.
* Camera capture.
* OCR from scanned documents.
* Browser-based image processing.

### Rationale

PDF processing provides a controlled initial document pipeline.

Adding OCR would introduce another significant processing subsystem and increase error modes before the core workflow is proven.

### Consequences

Scanned/image-only PDFs must fail clearly rather than pretending to have been successfully processed.

### Affected Documents

* 00
* 01
* 03
* 05
* 07

---

# 9. OCR Decision

## ADR-005 — Defer OCR

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

OCR is outside v1.

Potential future technologies may include browser/local OCR or vision-based processing, but no OCR implementation is frozen at this stage.

### Rationale

OCR quality and document preprocessing are separate engineering problems from the core legal-analysis workflow.

The project should first establish reliable text-based PDF processing.

### Consequences

The application must identify scanned/image-only documents and communicate the limitation.

### Affected Documents

* 01
* 03
* 05
* 07

---

# 10. Document Classification Decision

## ADR-006 — Deterministic Classification First

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Because v1 supports only two document categories, document classification should initially use deterministic signals.

Supported outcomes include:

```text
RENTAL_LEASE
FREELANCER_SERVICE
UNKNOWN
UNSUPPORTED
```

### Alternatives Considered

* Large machine-learning classifier.
* Transformers.js classification subsystem.
* LLM-based classification for every document.
* Deterministic classification.

### Rationale

The classification space is intentionally small.

A deterministic classifier is easier to test, explain, and maintain.

### Consequences

A machine-learning classifier should only be introduced if testing demonstrates that deterministic classification is insufficient.

Transformers.js remains optional rather than mandatory.

### Affected Documents

* 01
* 02
* 03
* 05
* 07

---

# 11. AI Responsibility Decision

## ADR-007 — AI for Reasoning, Deterministic Systems for Deterministic Work

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

The architecture follows:

> **AI for reasoning; deterministic systems for deterministic work.**

AI may handle:

* semantic understanding,
* contextual interpretation,
* natural-language generation,
* multilingual presentation where generation is required.

Deterministic systems own:

* extraction,
* validation,
* stable IDs,
* rule retrieval,
* source validation,
* routing,
* calculations,
* business-state transitions,
* and other deterministic operations.

### Rationale

This reduces unnecessary AI calls while retaining AI where semantic reasoning provides genuine value.

### Consequences

Not every stage requires an AI call.

AI usage must be justified by the actual task.

### Affected Documents

* 01
* 02
* 03
* 05
* 06
* 07

---

# 12. AI Provider Allocation

## ADR-008 — Provider Responsibilities

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

The intended provider responsibilities are:

```text
Gemini
→ Stage 1 semantic understanding
→ Stage 5 preparation generation when requested

Groq
→ Stage 2 semantic reasoning where required
→ Stage 3 semantic comparison where required
```

Deterministic processing remains available within every stage.

### Important clarification

Stage 2 and Stage 3 are **not inherently AI stages**.

AI is invoked only when semantic reasoning is required.

### Rationale

This creates a deliberate division of responsibilities while avoiding unnecessary model calls.

### Consequences

Provider adapters must remain independent from business logic.

### Affected Documents

* 01
* 02
* 05
* 07

---

# 13. AI Model Selection

## ADR-009 — Verify Model Availability Before Freezing Model IDs

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Specific Gemini and Groq model identifiers will not be treated as frozen until their availability is verified against the actual project accounts.

### Rationale

Public model availability and account-level availability may differ.

### Consequences

Model selection occurs during AI infrastructure implementation.

The selected models should then be recorded in a subsequent Decision Log entry.

### Affected Documents

* 02
* 07

---

# 14. Gemini Key Strategy

## ADR-010 — Controlled Gemini Key Failover

**Date:** 2026-09-19
**Status:** ACCEPTED

### Context

The project has two Gemini API keys.

### Decision

The keys may be used for:

* controlled failover,
* rate-limit resilience,
* quota management,
* availability.

They must not be used to unnecessarily duplicate identical requests or bypass provider restrictions.

### Rationale

The second key provides resilience rather than justification for increased unnecessary inference.

### Consequences

Provider routing must remain controlled and observable.

### Affected Documents

* 02
* 03
* 07

---

# 15. Groq Strategy

## ADR-011 — Single Groq Provider Key

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

The project uses the available Groq API key through a provider abstraction.

Model availability must be verified before final model selection.

### Consequences

The application must handle provider failure gracefully.

### Affected Documents

* 02
* 07

---

# 16. AI Context Decision

## ADR-012 — Structured Context Handoffs

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Stages communicate through compact structured contexts.

The intended flow is:

```text
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

### Rationale

Repeatedly passing entire documents and previous natural-language outputs would increase:

* token usage,
* latency,
* quota consumption,
* inconsistency,
* and debugging complexity.

### Consequences

Stable IDs must be maintained throughout the workflow.

### Affected Documents

* 01
* 02
* 06
* 07
* 11

---

# 17. Legal Source Decision

## ADR-013 — Source-Backed Legal Claims

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Every substantive legal claim must be traceable to a verified legal source.

The AI must not invent:

* statutes,
* sections,
* case law,
* government procedures,
* source URLs,
* or source metadata.

If adequate support is unavailable:

```text
INSUFFICIENT_SOURCE
```

must be used.

### Rationale

Legal-source hallucination presents a substantially higher risk than ordinary factual hallucination.

### Consequences

Legal findings require source IDs and rule IDs.

### Affected Documents

* 00
* 01
* 02
* 03
* 05
* 06
* 07
* 10
* 11

---

# 18. Legal Evidence Model

## ADR-014 — Separate Document Facts, Legal Rules, and Interpretation

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

The system must distinguish:

```text
Document-derived fact
        ≠
Legal claim
        ≠
AI interpretation
```

### Example

```text
Contract:
"The tenant shall provide 60 days' notice."

Legal rule:
[verified applicable rule]

Interpretation:
"The contractual notice provision differs from the applicable rule."
```

The system must not silently convert one category into another.

### Rationale

This improves legal accuracy, traceability, and user understanding.

### Affected Documents

* 01
* 02
* 03
* 05
* 06
* 11

---

# 19. Missing Information Decision

## ADR-015 — Do Not Infer Missing Contract Terms

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

If the document does not state a required fact, the system must represent the absence explicitly.

Conceptual state:

```text
NOT_STATED
```

### Example

If maintenance responsibility is absent:

```text
Correct:
"The agreement does not specify maintenance responsibility."

Incorrect:
"The tenant is responsible for maintenance."
```

unless supported by a separate applicable legal rule.

### Rationale

The system must not manufacture contract facts.

### Affected Documents

* 01
* 02
* 03
* 05
* 06
* 07
* 11

---

# 20. Severity Definition

## ADR-016 — Severity Represents User Consequence

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Severity measures:

> **How consequential or significant an identified issue could be to the user.**

Severity does not represent:

* model confidence,
* probability of legal success,
* probability of a court outcome,
* certainty that a clause is unlawful,
* or likelihood of litigation.

### Separate concept

Confidence/interpretation status represents how confidently the system interpreted or matched the available evidence.

Therefore:

```text
Severity
≠
Confidence
```

### Rationale

A highly consequential issue may still have uncertain interpretation.

Conversely, a low-consequence issue may be identified with high confidence.

### Affected Documents

* 02
* 03
* 05
* 06
* 07
* 11

---

# 21. Privacy Decision

## ADR-017 — PII Minimization Before External AI

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Where practical, direct identifiers should be replaced with stable placeholders before document-derived information is sent to external AI providers.

Examples:

```text
[TENANT_NAME]
[LANDLORD_NAME]
[PHONE_01]
[EMAIL_01]
[ADDRESS_01]
```

The mapping between placeholder and original value remains local.

The mapping itself must not be sent to external AI providers unless a future explicitly approved requirement makes this necessary.

### Rationale

The AI generally needs relationships and roles, not the user's actual identity.

### Important terminology

This is:

> PII minimization / pseudonymization

It is not guaranteed anonymization.

### Affected Documents

* 00
* 01
* 02
* 03
* 05
* 06
* 07
* 11

---

# 22. Session Storage Decision

## ADR-018 — Active Session State Without Automatic Sensitive Persistence

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Zustand is used for active client-side session state.

This does not imply automatic persistence to long-term browser storage.

For v1:

```text
Zustand
→ active session state

Sensitive localStorage persistence
→ not required

Cloud document persistence
→ not required
```

### Rationale

The application should minimize unnecessary persistence of sensitive legal documents and case data.

### Consequences

Refresh/recovery behavior must not assume permanent local persistence unless explicitly added later.

### Affected Documents

* 01
* 03
* 05
* 07
* 12

---

# 23. AI Response Trust Boundary

## ADR-019 — AI Output Is Untrusted Input

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Every AI response is treated as untrusted external data.

AI output must pass:

```text
Schema validation
      ↓
Reference validation
      ↓
Business-rule validation
      ↓
Application state
```

### Rationale

AI output can be malformed, hallucinated, incomplete, or inconsistent.

### Consequences

No AI response may directly trigger sensitive business logic.

### Affected Documents

* 01
* 02
* 03
* 06
* 07
* 11

---

# 24. Prompt Injection Decision

## ADR-020 — Uploaded Documents Are Untrusted Content

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Instructions contained within uploaded documents must be treated as document content.

They cannot override:

* system instructions,
* application rules,
* security controls,
* privacy requirements,
* legal-source requirements,
* or AI contracts.

### Rationale

Legal documents are external user-controlled input and may contain malicious or adversarial text.

### Consequences

Prompt construction must clearly separate:

```text
System/application instructions
+
Structured task context
+
Untrusted document content
```

### Affected Documents

* 01
* 02
* 03
* 06
* 07

---

# 25. Accessibility Decision

## ADR-021 — Accessibility Is a Core Requirement

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Accessibility is a v1 requirement rather than a post-development polish task.

The implementation must consider:

* keyboard navigation,
* focus management,
* semantic HTML,
* appropriate ARIA,
* contrast,
* screen-reader compatibility,
* multilingual typography,
* and non-color-only indicators.

### Rationale

The target product is intended to make legal information more accessible.

The interface itself must not introduce avoidable accessibility barriers.

### Consequences

Accessibility must be considered during component implementation and tested before evaluation.

### Affected Documents

* 00
* 01
* 03
* 05
* 06
* 07

---

# 26. UI Decision

## ADR-022 — Functional UI Baseline, Visual Design Remains Iterative

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

The initial interface uses the conceptual:

```text
Document Pane
+
Stage Pane
```

model with evidence synchronization.

This is a **functional baseline**, not a permanently frozen visual design.

The visual design may be redesigned after the core workflow is implemented if usability or visual quality requires improvement.

### Rationale

The project should validate the product workflow before investing excessive effort in visual refinement.

### Consequences

Implementation should avoid unnecessarily coupling business logic to the initial visual layout.

### Affected Documents

* 00
* 01
* 05
* 06
* 07

---

# 27. AI Call Optimization Decision

## ADR-023 — Minimize AI Calls Without Artificially Avoiding AI

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

The application should minimize unnecessary AI calls through:

* deterministic processing,
* structured context handoffs,
* reusable legal-rule retrieval,
* canonical analysis,
* and user-triggered Stage 5 generation.

However, the system should not avoid AI when semantic reasoning genuinely requires it.

### Rationale

The goal is efficient AI usage, not zero AI usage.

### Consequences

AI call budgets are guidance and architectural constraints, not a fixed number of calls per case.

### Affected Documents

* 01
* 02
* 03
* 06
* 07

---

# 28. Google NLP Decision

## ADR-024 — Remove Google NLP from v1

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

Google NLP is not part of the v1 architecture.

### Rationale

The project does not require a separate NLP subsystem for its current scope.

The required semantic reasoning is covered by the existing AI-provider architecture and deterministic processing.

### Consequences

No Google NLP dependency should be introduced during v1 implementation.

### Affected Documents

* 01
* 02
* 03
* 05
* 07

---

# 29. Transformers.js Decision

## ADR-025 — Transformers.js Is Optional

**Date:** 2026-09-19
**Status:** ACCEPTED

### Decision

Transformers.js is not a mandatory v1 subsystem.

It may be evaluated later only if deterministic classification or another concrete local-ML requirement proves insufficient.

### Rationale

Introducing a substantial ML subsystem solely to avoid an AI call would add unnecessary complexity.

### Consequences

The initial classifier remains deterministic.

No specific Transformers.js model is frozen.

### Affected Documents

* 01
* 02
* 03
* 05
* 07

---

# 30. Legal Rule Applicability Decision

## ADR-026 — Rule Existence Does Not Equal Rule Applicability

**Date:** 2026-09-19
**Status:** FROZEN

### Decision

A legal rule may only be applied to a finding after considering relevant applicability conditions.

These may include:

* jurisdiction,
* document type,
* effective date,
* subject matter,
* and rule-specific conditions.

### Rationale

A legally valid rule may still be irrelevant to a particular case.

### Consequences

Legal retrieval must be case-aware rather than simply keyword-based.

### Affected Documents

* 01
* 03
* 05
* 07
* 10
* 11

---

# 31. Current Decision Summary

The most important frozen architectural principles are:

```text
1. Focus v1 on two document types.

2. Support English, Telugu, and Hindi.

3. Target Telangana plus applicable central law.

4. Accept PDF only.

5. Defer OCR.

6. Use deterministic classification first.

7. Use AI for semantic reasoning, not deterministic operations.

8. Use Gemini and Groq behind provider abstractions.

9. Do not freeze model IDs before availability verification.

10. Pass compact structured contexts between stages.

11. Source every substantive legal claim.

12. Never invent legal sources.

13. Distinguish document facts from legal claims and AI interpretation.

14. Represent missing information as NOT_STATED.

15. Represent unsupported legal conclusions as INSUFFICIENT_SOURCE.

16. Treat AI output as untrusted.

17. Treat uploaded documents as untrusted content.

18. Minimize PII before external AI processing.

19. Keep the PII mapping local.

20. Use Zustand for active session state without automatic sensitive persistence.

21. Treat accessibility as a core requirement.

22. Keep the initial UI as a functional baseline, not a visual freeze.

23. Minimize AI calls without artificially avoiding necessary reasoning.

24. Keep Google NLP out of v1.

25. Keep Transformers.js optional.

26. Check legal-rule applicability, not merely rule existence.
```

---

# 32. Decision Change Protocol

If an existing `FROZEN` decision needs to change:

```text
Existing decision
       ↓
Identify reason for change
       ↓
Create new Decision Log entry
       ↓
Reference superseded decision
       ↓
Explain alternatives
       ↓
Assess affected documents
       ↓
Update affected documentation
       ↓
Implement change
```

The old decision must remain in the log as `SUPERSEDED`.

It should not be silently deleted.

---

# 33. Decision Log Maintenance Rule

The Decision Log should be updated when a decision materially changes.

It should not become a dump of every small implementation choice.

Good candidates include:

* architecture changes,
* provider changes,
* scope changes,
* privacy changes,
* legal-source policy changes,
* security-boundary changes,
* major dependency changes,
* and important trade-offs.

The objective is to preserve **decision rationale**, not implementation noise.

---

# 34. Final Principle

The Decision Log answers:

> **"Why does the project work this way?"**

The other documents answer:

> **"What does the project require?"**

Implementation answers:

> **"How is the requirement currently realized in code?"**

These three layers must remain connected:

```text
Decision
   ↓
Requirement
   ↓
Implementation
   ↓
Verification
```

When they diverge, the documentation or implementation must be corrected rather than allowing undocumented behavior to become the new specification.


# 35. Final Documentation Review Decisions

## ADR-027 — Final Cross-Document Consistency Review

**Date:** 2026-09-19
**Status:** FROZEN

### Context

A comprehensive documentation consistency pass (Docs 00-12) was performed prior to the agents phase. Temporary review documents (Docs 13, 14, 15) were generated to identify gaps and propose corrections. To streamline the repository, the substantive architectural decisions from that review are being permanently recorded here, allowing the temporary review files to be deleted.

### Decision

The following specific architectural implementations are explicitly FROZEN for V1:

1. **User Accounts & Auth:** Deferred. V1 focuses purely on document understanding without persistent user profiles.
2. **PDF Parsing:** V1 will use `PDF.js` to extract text and preserve page-level provenance. OCR and image-based input are explicitly deferred.
3. **Legal KB Persistence:** MongoDB is established as the persistent runtime store for the Legal KB (storing LegalDomains, Rules, Sources). It MUST NOT store user PDFs, PII, or private analysis. The KB must remain source-backed and reproducible.
4. **API Boundaries & Security:** The Next.js App Router (Server API) is the primary boundary. AI provider SDKs and API keys must NEVER be used directly from browser/client components.
5. **Effective-Date Filtering:** Legal rules must be deterministically filtered using `effective_from` and `effective_to` boundaries before entering the AI reasoning context.

### Rationale

These decisions close critical implementation gaps (API boundaries, KB storage, and exact libraries) that were previously underspecified, preventing autonomous coding agents from introducing architectural drift (e.g., creating a PostgreSQL DB, or calling Gemini from the client).

### Consequences

The temporary review documents (Docs 13, 14, 15) can be safely deleted. Implementation is now unblocked for the agents phase.

### Affected Documents
These may include:

* jurisdiction,
* document type,
* effective date,
* subject matter,
* and rule-specific conditions.

### Rationale

A legally valid rule may still be irrelevant to a particular case.

### Consequences

Legal retrieval must be case-aware rather than simply keyword-based.

### Affected Documents

* 01
* 03
* 05
* 07
* 10
* 11

---

# 31. Current Decision Summary

The most important frozen architectural principles are:

```text
1. Focus v1 on two document types.

2. Support English, Telugu, and Hindi.

3. Target Telangana plus applicable central law.

4. Accept PDF only.

5. Defer OCR.

6. Use deterministic classification first.

7. Use AI for semantic reasoning, not deterministic operations.

8. Use Gemini and Groq behind provider abstractions.

9. Do not freeze model IDs before availability verification.

10. Pass compact structured contexts between stages.

11. Source every substantive legal claim.

12. Never invent legal sources.

13. Distinguish document facts from legal claims and AI interpretation.

14. Represent missing information as NOT_STATED.

15. Represent unsupported legal conclusions as INSUFFICIENT_SOURCE.

16. Treat AI output as untrusted.

17. Treat uploaded documents as untrusted content.

18. Minimize PII before external AI processing.

19. Keep the PII mapping local.

20. Use Zustand for active session state without automatic sensitive persistence.

21. Treat accessibility as a core requirement.

22. Keep the initial UI as a functional baseline, not a visual freeze.

23. Minimize AI calls without artificially avoiding necessary reasoning.

24. Keep Google NLP out of v1.

25. Keep Transformers.js optional.

26. Check legal-rule applicability, not merely rule existence.
```

---

# 32. Decision Change Protocol

If an existing `FROZEN` decision needs to change:

```text
Existing decision
       ↓
Identify reason for change
       ↓
Create new Decision Log entry
       ↓
Reference superseded decision
       ↓
Explain alternatives
       ↓
Assess affected documents
       ↓
Update affected documentation
       ↓
Implement change
```

The old decision must remain in the log as `SUPERSEDED`.

It should not be silently deleted.

---

# 33. Decision Log Maintenance Rule

The Decision Log should be updated when a decision materially changes.

It should not become a dump of every small implementation choice.

Good candidates include:

* architecture changes,
* provider changes,
* scope changes,
* privacy changes,
* legal-source policy changes,
* security-boundary changes,
* major dependency changes,
* and important trade-offs.

The objective is to preserve **decision rationale**, not implementation noise.

---

# 34. Final Principle

The Decision Log answers:

> **"Why does the project work this way?"**

The other documents answer:

> **"What does the project require?"**

Implementation answers:

> **"How is the requirement currently realized in code?"**

These three layers must remain connected:

```text
Decision
   ↓
Requirement
   ↓
Implementation
   ↓
Verification
```

When they diverge, the documentation or implementation must be corrected rather than allowing undocumented behavior to become the new specification.


# 35. Final Documentation Review Decisions

## ADR-027 — Final Cross-Document Consistency Review

**Date:** 2026-09-19
**Status:** FROZEN

### Context

A comprehensive documentation consistency pass (Docs 00-12) was performed prior to the agents phase. Temporary review documents (Docs 13, 14, 15) were generated to identify gaps and propose corrections. To streamline the repository, the substantive architectural decisions from that review are being permanently recorded here, allowing the temporary review files to be deleted.

### Decision

The following specific architectural implementations are explicitly FROZEN for V1:

1. **User Accounts & Auth:** Deferred. V1 focuses purely on document understanding without persistent user profiles.
2. **PDF Parsing:** V1 will use `PDF.js` to extract text and preserve page-level provenance. OCR and image-based input are explicitly deferred.
3. **Legal KB Persistence:** MongoDB is established as the persistent runtime store for the Legal KB (storing LegalDomains, Rules, Sources). It MUST NOT store user PDFs, PII, or private analysis. The KB must remain source-backed and reproducible.
4. **API Boundaries & Security:** The Next.js App Router (Server API) is the primary boundary. AI provider SDKs and API keys must NEVER be used directly from browser/client components.
5. **Effective-Date Filtering:** Legal rules must be deterministically filtered using `effective_from` and `effective_to` boundaries before entering the AI reasoning context.

### Rationale

These decisions close critical implementation gaps (API boundaries, KB storage, and exact libraries) that were previously underspecified, preventing autonomous coding agents from introducing architectural drift (e.g., creating a PostgreSQL DB, or calling Gemini from the client).

### Consequences

The temporary review documents (Docs 13, 14, 15) can be safely deleted. Implementation is now unblocked for the agents phase.

### Affected Documents

* 01 System Architecture
* 03 Engineering Rules
* 05 Feature Freeze
* 09 Coding Standards
* 10 Legal Knowledge Base
* 11 AI Context Contracts

---

# 36. Milestone Sequence Decision

## ADR-028 — S0-M0.4 API Boundary & Error Contract Foundation

**Date:** 2026-09-21
**Status:** FROZEN

### Context

The original S0 milestone plan defined S0-M0.1 (Scaffold), S0-M0.2 (Zod), and S0-M0.3 (Session State). However, an explicit API boundary and typed error contract (with 500-error sanitization and client-safe validation errors) must be established *before* complex document workflows and schemas begin. Creating this API infrastructure upfront prevents incompatible response shapes from proliferating. Additionally, the original S0-M0.2 was actually executed as "Application Architecture Boundaries", requiring a reconciliation of the milestone sequence.

### Decision

1. Authorize a new milestone, `S0-M0.4: API Boundary & Error Contract Foundation`.
2. Re-label S0-M0.2 as `Application Architecture Boundaries` to match reality.
3. Move the `Zod Schema Context Definitions` milestone down the sequence to `S0-M0.5`.
4. The API contract will use a discriminated union, with explicitly sanitized unknown errors and a typed `ApiErrorCode` union.

### Rationale

This sequence ensures API boundary safety, privacy constraints, and error formatting are resolved once, globally, before they are needed by domain routing or external integrations.

### Consequences

* `S0-M0.5` becomes the Zod Schema Context Definitions milestone.
* Downstream dependencies (like S3-M3.2) that previously depended on S0-M0.2 now logically depend on S0-M0.5.
* Feature freeze boundaries remain entirely unaffected (no new features are introduced, only foundational API contracts).

### Affected Documents

* 16 Implementation Milestone Plan

---

# 37. Document Classification Thresholds & Taxonomy

## ADR-018 — Deterministic Classification Boundaries (S1-M1.2)

**Date:** 2026-09-21
**Status:** ACCEPTED

### Context

To implement the deterministic document classification (S1-M1.2), specific keyword threshold rules and taxonomic boundaries must be defined. Furthermore, behavior for resolving conflicts when a document matches multiple categories must be strictly deterministic without silently inventing a priority system.

### Decision

#### 1. Classification Threshold (Approved)
* A category reaches its deterministic classification threshold if there are **exactly 3 or more distinct pattern_id matches**.
* Repeated matches of the same `pattern_id` count only once.
* No probabilistic confidence score or dynamic thresholding will be introduced.

#### 2. Unsupported Taxonomy (Approved)
* S1-M1.2 initially recognizes exclusively: `Employment Agreement / Employment Contract` as the `UNSUPPORTED` category.
* No other unsupported categories (e.g., NDA, Will, Trust, Sale Agreement) will be added during this milestone. The taxonomy may be expanded later through the normal Feature Freeze change process.

#### 3. Conflict Precedence & Ambiguity Fallback (Approved)
* Multiple categories reaching the threshold return `UNKNOWN` with all matching pattern evidence preserved.
* No category precedence is implemented in S1-M1.2.
* Future user-facing conflict clarification is deferred to a later milestone.

### Rationale

A strict numerical threshold ensures classification remains entirely deterministic and predictable without relying on AI. Keeping the unsupported taxonomy narrow aligns with the approved milestone acceptance criteria. Mapping conflicts to `UNKNOWN` while preserving all matched pattern evidence accurately models the ambiguity in the current four-state contract, preventing the system from silently picking a winner and deferring complex dispute resolution to a future clarification flow.

### Consequences

The current `DocumentClassificationResult` reliably handles multi-category threshold matches within the four-state (`RENTAL_LEASE | FREELANCER_SERVICE | UNKNOWN | UNSUPPORTED`) contract. Later AI orchestration stages will consume this context and handle `UNKNOWN` states appropriately.

### Affected Documents

* 08 Decision Log
* 16 Implementation Milestone Plan

---

# 38. S7-M7.1 Deterministic Action Mapping Blockers

## ADR-019 — Dual Context Input for ActionService (S7-M7.1)

**Date:** 2026-09-24
**Status:** ACCEPTED

### Context
`ActionContextSchema` strictly requires an array of `findings` (via `FindingSchema`) and `action_items` that reference `related_finding_ids`. However, `ComparisonContext` (the preceding pipeline stage) only contains `comparison_items` and does not retain the original finding data.

### Decision
`ActionService` will consume **both** `AnalysisContext` (canonical source for findings) and `ComparisonContext` (canonical source for comparison results) to properly populate `ActionContext` without mutating the existing frozen schema boundaries.

### Rationale
This prevents duplicating raw contract evidence unnecessarily and perfectly preserves the `finding -> clause/rule/source` provenance chain established in S5, fulfilling the requirement that no finding IDs are fabricated during S7.

### Affected Documents
* 08 Decision Log
* 11 AI Context Contracts

---

## ADR-020 — GovernmentRoute Minimum Schema and Blockers (S7-M7.1)

**Date:** 2026-09-24
**Status:** ACCEPTED (WITH OPEN BLOCKERS)

### Context
S7-M7.1 must deterministically map comparisons to verified `GovernmentRoute` records from the Legal KB.

### Decision
1. `GovernmentRoute` will be created using only the exact documented fields from `10-legal-knowledge-base.md` (e.g. `route_id`, `name`, `purpose`, `authority`, `jurisdiction`, `applicable_document_types`, `conditions`, `official_url`, `required_information`, `status`, `verified_at`, `notes`).
2. No new action taxonomy will be silently invented. The schema allows free-form string `action_type`, so establishing a formal enum taxonomy requires a product/legal decision.
3. **Blocker Identified:** The current Legal KB architecture possesses no deterministic relational mapping (like `related_rule_ids`) to connect a specific `LegalRule` or `Finding` to a `GovernmentRoute`.

### Rationale
Silent inference of procedures or schema keys violates the fundamental safety rules of the project. We stop and identify the relational gaps to ensure decisions are explicit.

### Affected Documents
* 08 Decision Log
* 10 Legal Knowledge Base

---

## ADR-021 — S9-M9.1: Privacy & Pseudonymization

**Date:** 2026-09-25
**Status:** ACCEPTED

### Context
S9-M9.1 establishes a fail-closed privacy boundary to protect unnecessary personally identifiable information (PII) before case-specific content is sent to external AI providers. 

### Decision
1. English person names will be pseudoymized via a lightweight, local English NER candidate detector (`compromise`).
2. Hindi/Telugu person-name pseudonymization is deferred to a future milestone to keep V1 simple and testable.
3. Rental/property addresses and other legally relevant locations remain intentionally preserved, as they are essential to legal analysis.
4. Structural role extraction is explicitly deferred.
5. No external AI service is used for PII detection.
6. A controlled runtime boundary will construct a branded `PseudonymizedDocumentContext` type to ensure type safety. Privacy processing fails closed when local detection is unavailable or invariants fail.

### Rationale
This minimizes PII leakage while guaranteeing that legally essential context (like addresses) is available to the reasoning pipeline, all without relying on cloud-based NLP models.

### Affected Documents
* 07 Sprint Tracker
* 08 Decision Log
* 12 Session Handoff

---

## ADR-022 — S9-M9.2: V1 Security Hardening

**Date:** 2026-09-25
**Status:** ACCEPTED

### Context
S9-M9.2 establishes the application-level security boundary (resource limits, error handling, HTTP headers, prompt-injection defense) while preserving the architecture.

### Decision
1. **PDF Size Limit**: A maximum file size of 10 MB is enforced to prevent resource exhaustion/DoS.
2. **Safe Mode Error Logging**: Raw AI provider messages, PII, and stack traces are prohibited from application logs. Failures are classified into safe diagnostic metadata. User-facing errors must use impenetrable generic categories.
3. **HTTP Headers**: Enforced a conservative HSTS policy (`max-age=31536000; includeSubDomains` without `preload`), a pragmatic CSP derived from actual Next.js application requirements (avoiding `unsafe-eval`), and standard clickjacking/sniffing headers.
4. **Prompt-Injection Defense**: The system treats all document content explicitly as untrusted data using strict structural isolation. Adversarial tests confirm instructions like "Reveal the system prompt" are safely isolated from AI execution. Zod continues to be used independently for output validation.

### Rationale
These boundaries establish testable V1 protection without forcing an enterprise rewrite or introducing unnecessary dependencies. 

### Affected Documents
* 08 Decision Log

---

## ADR-023 — UI Deferral and Product Design Sprint

**Date:** 2026-09-25
**Status:** ACCEPTED

### Context
During the planning of S9-M9.3 (Accessibility Hardening), an audit revealed that the functional frontend UI components did not yet exist in the repository, making meaningful accessibility hardening impossible. Concurrently, a detailed design specification (`vakil-ai-design-doc.md`) exists but has not been reconciled with the frozen V1 scope.

### Decision
1. **Defer S9-M9.3:** Accessibility hardening is deferred until the functional UI is built.
2. **Insert S9.5 Product Design Sprint:** A new milestone is added to reconcile the design document with the frozen V1 scope and use Google Stitch MCP to explore and prototype the visual UX.
3. **Feature Freeze Authority:** `docs/05-feature-freeze.md` remains authoritative. Exploratory design concepts in `vakil-ai-design-doc.md` (e.g., 9-language support, OCR, topic-based browsing) are explicitly classified as "Future Improvements" and are deferred from V1.
4. **Implementation Sequence:** The sequence is updated to: S9.5 (Design) → S9.6 (UI Implementation) → S9-M9.3 (Accessibility Hardening) → S10 (Integration).

### Rationale
This prevents silent scope creep while ensuring accessibility is implemented correctly against a real UI. It allows the design to be safely explored with Stitch MCP without inadvertently modifying the foundational architecture or the V1 product commitments.

### Affected Documents
* 07 Sprint Tracker
* 16 Implementation Milestone Plan
* 08 Decision Log

