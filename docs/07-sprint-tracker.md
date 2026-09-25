# Document 07 — Sprint Tracker

**Project:** Indian Legal AI Assistant
**Project Type:** Hackathon / AI Legal Assistance Platform
**Version:** 0.1.0
**Status:** FROZEN
**Last Updated:** 2026-09-19

---

# 1. Purpose

This document tracks implementation progress for Version 0.1.0.

The Sprint Tracker translates the approved project documentation into executable engineering milestones.

It defines:

* implementation order,
* milestone dependencies,
* acceptance criteria,
* testing requirements,
* blockers,
* completion status,
* and release readiness.

This document is an **execution tracker**, not a replacement for the architecture or feature specifications.

---

# 2. Tracking Principles

## 2.1 Build in dependency order

Foundational infrastructure must be completed before dependent features.

```text
Foundation
    ↓
Document Processing
    ↓
Legal Knowledge
    ↓
AI Infrastructure
    ↓
Core Pipeline
    ↓
UI Integration
    ↓
Security / Privacy / Accessibility
    ↓
Testing
    ↓
Evaluation Readiness
```

---

## 2.2 Complete vertical slices

Where practical, implementation should produce working vertical slices rather than isolated unfinished subsystems.

Example:

```text
PDF
 ↓
Extract
 ↓
Identify Clause
 ↓
Display Evidence
```

is more valuable than building a large extraction subsystem with no working UI integration.

---

## 2.3 No milestone is complete without verification

A milestone is not considered complete merely because code exists.

The expected lifecycle is:

```text
NOT STARTED
    ↓
IN PROGRESS
    ↓
IMPLEMENTED
    ↓
TESTING
    ↓
VERIFIED
    ↓
COMPLETE
```

---

# 3. Status Definitions

| Status      | Meaning                                            |
| ----------- | -------------------------------------------------- |
| NOT STARTED | Work has not begun                                 |
| IN PROGRESS | Active implementation                              |
| BLOCKED     | Cannot proceed because of an unresolved dependency |
| IMPLEMENTED | Code exists but verification is incomplete         |
| TESTING     | Tests or validation are actively being performed   |
| VERIFIED    | Acceptance criteria have been demonstrated         |
| COMPLETE    | Implementation and verification are complete       |
| DEFERRED    | Explicitly moved outside current scope             |

---

# 4. Sprint Structure

The implementation is divided into the following sprints:

```text
Sprint 0 — Engineering Foundation
Sprint 1 — Document Processing
Sprint 2 — Legal Knowledge Foundation
Sprint 3 — AI Infrastructure
Sprint 4 — Understand
Sprint 5 — Flag
Sprint 6 — Compare
Sprint 7 — Act
Sprint 8 — Prepare + Multilingual
Sprint 9 — Privacy + Security + Accessibility
Sprint 10 — Integration + Testing
Sprint 11 — Evaluation Readiness
```

The sprint numbers represent implementation order.

They do not represent calendar commitments.

---

# 5. Sprint 0 — Engineering Foundation

**Status:** COMPLETE

## Objective

Establish the application foundation before implementing legal functionality.

### Milestones

#### S0.1 — Repository and application structure

* [x] Next.js application configured.
* [x] TypeScript configured.
* [x] Tailwind configured.
* [x] Base directory structure established.
* [x] Environment configuration established.

#### S0.2 — Application architecture

* [x] UI/application boundaries established.
* [x] API boundary established.
* [x] Server-side provider boundary established.
* [x] Session-state architecture established.

#### S0.3 — Zustand session state

* [x] Core session store created.
* [x] Case/session lifecycle defined.
* [x] No automatic sensitive-data persistence.
* [x] State types established.

#### S0.4 — Testing foundation

* [x] Unit test framework configured.
* [x] Integration test structure configured.
* [x] Mock provider strategy established.

### Acceptance Criteria

* Application starts successfully.
* Type checking succeeds.
* Test framework executes.
* API routes can be tested independently.
* Provider keys are not exposed to client code.

---

# 6. Sprint 1 — Document Processing

**Status:** COMPLETE

## Objective

Build a reliable PDF ingestion and evidence foundation.

### Milestones

#### S1.1 — PDF validation

* [x] PDF type validation.
* [x] File-size validation.
* [x] Processing limits.
* [x] Invalid-file handling.

#### S1.2 — PDF text extraction

* [x] Text-based PDF extraction.
* [x] Page-aware extraction.
* [x] Extraction failure handling.
* [x] Empty-text detection.

#### S1.3 — Document processing states

Support safe processing states such as:

```text
PDF_VALID_TEXT
PDF_EMPTY_TEXT
PDF_SCANNED
PDF_CORRUPTED
PDF_UNSUPPORTED
```

#### S1.4 — Clause segmentation

* [x] Identify logical clauses/sections.
* [x] Generate stable clause IDs.
* [x] Preserve page/location evidence.
* [x] Store clause metadata in active session state.

#### S1.5 — Document classification

Support:

```text
RENTAL_LEASE
FREELANCER_SERVICE
UNKNOWN
UNSUPPORTED
```

Deterministic classification should be attempted first.

### Acceptance Criteria

A supported text-based PDF can be:

```text
uploaded
→ validated
→ extracted
→ classified
→ segmented
→ assigned stable clause IDs
```

Unsupported documents fail safely.

Scanned PDFs do not silently appear successfully processed.

---

# 7. Sprint 2 — Legal Knowledge Foundation

**Status:** COMPLETE

## Objective

Build the source-backed legal knowledge layer before relying on legal AI reasoning.

### Milestones

#### S2.1 — Legal source model

Define:

```text
LegalSource
```

including appropriate metadata such as:

* source ID,
* title,
* authority,
* source type,
* URL,
* verification status,
* verification timestamp.

#### S2.2 — Legal rule model

Define:

```text
LegalRule
```

including:

* rule ID,
* domain,
* jurisdiction,
* applicability,
* effective dates,
* description,
* severity relevance where applicable,
* source reference.

#### S2.3 — Rule-to-source integrity

* [x] Every substantive rule references a source.
* [x] Source IDs are validated.
* [x] Unverified sources cannot become authoritative findings.

#### S2.4 — Clause patterns

* [ ] DEFERRED (Outside S2-M2.2 scope)

#### S2.5 — Government routes

* [ ] DEFERRED (Outside S2-M2.2 scope)

### Acceptance Criteria

The application can retrieve applicable legal rules for a supported scenario using:

```text
document type
+
jurisdiction
+
relevant date
+
subject/domain
```

and every substantive rule can be traced to a verified source.

---

# 8. Sprint 3 — AI Infrastructure

**Status:** COMPLETE

## Objective

Build safe, provider-independent AI infrastructure.

### Milestones

#### S3.1 — AI provider abstraction

Establish a provider-independent interface.

Conceptually:

```text
AIProvider
├── GeminiProvider
└── GroqProvider
```

#### S3.2 — Gemini integration

* [x] Server-side API access.
* [x] Environment configuration.
* [x] Provider adapter.
* [x] Structured response handling.
* [x] Failure handling.

Model selection must be based on verified availability.

#### S3.3 — Groq integration

* [x] Server-side API access.
* [x] Environment configuration.
* [x] Provider adapter.
* [x] Structured response handling.
* [x] Failure handling.

Model selection must be based on verified availability.

#### S3.4 — AI schema validation

* [x] Structured schemas.
* [x] Runtime validation.
* [x] Reference validation.
* [x] Safe failure behavior.

#### S3.5 — Prompt-injection boundary

* [x] Document content clearly separated from instructions.
* [x] System/application instructions protected.
* [x] Untrusted document text never treated as authoritative instructions.

#### S3.6 — AI usage tracking

Track active-session information such as:

* provider,
* operation,
* success/failure,
* approximate usage where available,
* fallback events.

Do not log sensitive document content unnecessarily.

### Acceptance Criteria

A test request can pass through:

```text
Application
→ AI abstraction
→ provider adapter
→ structured response
→ validation
→ application state
```

without exposing provider credentials to the browser.

---

# 9. Sprint 4 — Understand

**Status:** COMPLETE

## Objective

Build the first complete user-facing stage.

### Milestones

#### S4.1 — Understanding context

Implement:

```text
DocumentContext
→
UnderstandingContext
```

#### S4.2 — Gemini understanding

Use Gemini for semantic understanding where appropriate.

The AI receives only the required structured context and relevant evidence.

#### S4.3 — Understanding output validation

Validate:

* clause IDs,
* extracted facts,
* explanations,
* dates,
* monetary values,
* roles/entities,
* and supported output structure.

#### S4.4 — Evidence synchronization

Selecting an explanation should identify the corresponding document clause/page.

#### S4.5 — Language presentation

Establish the canonical analysis representation and presentation-language boundary.

### Acceptance Criteria

A supported PDF produces an understandable Stage 1 result where:

```text
Explanation
    ↓
Clause ID
    ↓
Document evidence
```

is traceable.

---

# 10. Sprint 5 — Flag

**Status:** COMPLETE

## Objective

Identify potentially consequential contractual/legal issues.

### Milestones

#### S5.1 — Rule retrieval

Retrieve only legal rules relevant to the current case.

#### S5.2 — Deterministic flagging

Implement deterministic checks for known supported clause/rule patterns.

#### S5.3 — Semantic flagging

Use Groq when semantic interpretation is actually required.

#### S5.4 — Finding model

Implement structured findings containing appropriate:

```text
finding_id
clause_id
rule_id
source_id
severity
explanation
status
```

#### S5.5 — Safety states

Implement:

```text
INSUFFICIENT_SOURCE
NOT_STATED
JURISDICTION_UNCLEAR
OUTSIDE_SCOPE
```

where applicable.

#### S5.6 — Severity

Severity represents:

> The potential consequence/significance of the issue to the user.

Severity must not represent:

* model confidence,
* probability of legal success,
* probability of litigation outcome,
* or legal certainty.

### Acceptance Criteria

A supported clause can produce a source-backed finding that is traceable to:

```text
Clause
→ Rule
→ Source
```

or safely return an uncertainty/insufficient-source state.

---

# 11. Sprint 6 — Compare

**Status:** NOT STARTED

## Objective

Make the relationship between contractual language and applicable legal rules understandable.

### Milestones

#### S6.1 — Comparison context

Implement:

```text
AnalysisContext
→
ComparisonContext
```

#### S6.2 — Deterministic comparison

Implement straightforward comparisons without AI.

#### S6.3 — Semantic comparison

Use Groq only where semantic interpretation is required.

#### S6.4 — Comparison presentation

Clearly distinguish:

```text
Contract says
Applicable rule says
System interpretation
```

#### S6.5 — Evidence/source navigation

Allow the user to navigate from a comparison to:

* contract clause,
* rule,
* source.

### Acceptance Criteria

The evaluator/user can clearly understand why a contract clause was considered aligned, different, or uncertain relative to the applicable rule.

---

# 12. Sprint 7 — Act

**Status:** NOT STARTED

## Objective

Convert findings into practical, user-controlled next steps.

### Milestones

#### S7.1 — Action model

Define structured action records.

#### S7.2 — Deterministic action routing

Use the legal knowledge base to identify applicable official routes.

#### S7.3 — Preparation checklist

Generate deterministic checklists where possible.

#### S7.4 — User control

Ensure external actions are never automatically executed.

#### S7.5 — Source-backed routes

Official routes must come from verified legal knowledge.

### Acceptance Criteria

The system can produce useful next steps grounded in the case without:

* pretending to provide representation,
* inventing procedures,
* or performing external legal actions automatically.

---

# 13. Sprint 8 — Prepare + Multilingual

**Status:** COMPLETE

## Objective

Complete the preparation workflow and multilingual presentation.

### Milestones

#### S8.1 — Preparation context

Implement:

```text
ComparisonContext
→
ActionContext
```

#### S8.2 — Gemini preparation generation

Gemini may generate preparation material only when requested.

Possible outputs:

* lawyer consultation questions,
* issue summary,
* document checklist,
* timeline,
* discussion points.

#### S8.3 — Grounding validation

Preparation output must remain grounded in established case context.

#### S8.4 — English

Verify complete workflow.

#### S8.5 — Telugu

* [x] Verify presentation without re-running legal reasoning.

#### S8.6 — Hindi

* [x] Verify presentation without re-running legal reasoning.

### Acceptance Criteria

A user can switch between:

```text
English
Telugu
Hindi
```

without changing the underlying:

* clause IDs,
* rule IDs,
* source IDs,
* findings,
* severity,
* or canonical legal analysis.

---

# 14. Sprint 9 — Privacy + Security + Accessibility + Design

**Status:** IN PROGRESS

## Objective

Harden the product, establish the implementation-ready design direction, and implement the functional UI before broad integration testing.

---

## S9.1 — PII minimization (COMPLETE)

* [x] Detect supported direct identifiers.
* [x] Replace identifiers with stable placeholders.
* [x] Keep mapping local.
* [x] Verify mapping is not transmitted externally.
* [x] Avoid sensitive logging.

### Acceptance Criteria

External AI receives minimized representation rather than unnecessary direct identifiers.

---

## S9.2 — Security hardening (COMPLETE)

* [x] API keys server-side.
* [x] Upload validation (including 10MB limit).
* [x] Request validation.
* [x] AI output validation.
* [x] Prompt-injection defenses.
* [x] Safe error responses.
* [x] No unauthorized external actions.

---

## S9.3 — Accessibility (DEFERRED)

**Status:** DEFERRED — UI prerequisite missing

*Reason for deferral:* The planned accessibility hardening requires a functional UI baseline. The current repository does not yet contain the required workspace/stage components, so meaningful accessibility hardening cannot yet be performed. This milestone will resume after the Frontend UI is implemented.

* [ ] Keyboard navigation.
* [ ] Focus management.
* [ ] Semantic HTML.
* [ ] Appropriate ARIA.
* [ ] Contrast checks.
* [ ] Non-color-only risk indicators.
* [ ] Screen-reader checks.
* [ ] Telugu/Hindi typography verification.

### Acceptance Criteria

The core workflow is usable without relying exclusively on mouse input or color perception.

---

## S9.5 — Product Design Sprint

**Objective:** Transform existing requirements into an implementation-ready UI/UX direction using Google Stitch MCP for exploration.

* [ ] Reconcile design document concepts with frozen V1 scope.
* [ ] Define V1 user journey and screen inventory.
* [ ] Define responsive and accessibility behaviors.
* [ ] Produce implementation-ready design specification.

---

## S9.6 — Frontend UI Implementation

**Objective:** Implement the functional React components based on the approved S9.5 design direction.

* [ ] Scaffold main workspace and layout.
* [ ] Implement document pane and stage navigation.
* [ ] Connect UI to existing backend/domain integration.

---

# 15. Sprint 10 — Integration + Testing

**Status:** NOT STARTED

## Objective

Validate the entire product as one system.

### Milestones

#### S10.1 — End-to-end workflow

Test:

```text
Upload
→ Validate
→ Classify
→ Extract
→ Understand
→ Flag
→ Compare
→ Act
→ Prepare
```

#### S10.2 — Negative testing

Verify:

* invalid PDFs,
* unsupported documents,
* scanned PDFs,
* missing text,
* unknown classification,
* unclear jurisdiction,
* insufficient legal source,
* missing contract information,
* AI schema failure,
* provider failure,
* prompt injection.

#### S10.3 — AI provider failure

Test:

* Gemini unavailable,
* Groq unavailable,
* timeout,
* malformed response,
* rate limit,
* invalid model configuration.

The system must fail safely.

#### S10.4 — Regression suite

Run the full automated test suite after major integration changes.

#### S10.5 — Accessibility regression

Re-test keyboard navigation, focus, contrast, and multilingual presentation.

---

# 16. Sprint 11 — Evaluation Readiness

**Status:** NOT STARTED

## Objective

Prepare the project for final evaluation without introducing new scope.

### Milestones

#### S11.1 — Demo scenario preparation

Prepare realistic supported documents.

#### S11.2 — End-to-end demo

Verify complete workflow.

#### S11.3 — Source traceability demo

Demonstrate:

```text
Finding
→ Clause
→ Rule
→ Source
```

#### S11.4 — Privacy demo

Demonstrate PII minimization without exposing real sensitive information.

#### S11.5 — Safety demo

Demonstrate at least one controlled failure case.

Examples:

```text
Unsupported document
or
INSUFFICIENT_SOURCE
or
JURISDICTION_UNCLEAR
```

#### S11.6 — Accessibility demo

Demonstrate keyboard-accessible workflow.

#### S11.7 — Performance review

Review:

* AI calls,
* context sizes,
* repeated processing,
* unnecessary retrieval,
* client-side work.

#### S11.8 — Documentation review

Verify that:

* implementation matches architecture,
* feature scope matches Feature Freeze,
* AI behavior matches AI Contract,
* legal behavior matches Legal Knowledge Base,
* context contracts match implementation,
* tests match documented requirements.

---

# 17. Cross-Sprint Dependencies

The critical dependency chain is:

```text
S0 Foundation
    ↓
S1 Document Processing
    ↓
S2 Legal Knowledge
    ↓
S3 AI Infrastructure
    ↓
S4 Understand
    ↓
S5 Flag
    ↓
S6 Compare
    ↓
S7 Act
    ↓
S8 Prepare
    ↓
S9 Security / Privacy / Accessibility
    ↓
S10 Integration / Testing
    ↓
S11 Evaluation
```

Some work can happen in parallel.

For example:

```text
S2 Legal Knowledge
        +
S3 AI Infrastructure
```

can proceed concurrently once the foundational interfaces are established.

Similarly, accessibility and testing should begin during feature development rather than being postponed entirely until Sprint 9/10.

---

# 18. Vertical Slice Priority

The preferred early milestone is:

```text
PDF
 ↓
Validation
 ↓
Extraction
 ↓
Classification
 ↓
Clause identification
 ↓
Basic Understand
 ↓
Evidence highlighting
```

Once this works reliably, the project should expand through:

```text
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

This creates a usable product early rather than waiting until every subsystem is complete.

---

# 19. Testing Strategy Across Sprints

Testing must accompany implementation.

```text
Feature implementation
        ↓
Unit test
        ↓
Integration test
        ↓
Negative case
        ↓
Manual verification
        ↓
Milestone completion
```

Do not accumulate all testing until the final sprint.

---

# 20. Definition of Milestone Complete

A milestone can be marked `COMPLETE` only when:

* implementation exists,
* acceptance criteria pass,
* relevant tests exist,
* failure behavior has been considered,
* security implications have been reviewed,
* privacy implications have been reviewed where applicable,
* accessibility implications have been reviewed where applicable,
* documentation remains consistent,
* and no known blocker remains.

---

# 21. Blocker Rules

A milestone should be marked `BLOCKED` rather than partially completed when a required dependency prevents meaningful completion.

Examples:

```text
Provider API unavailable
        ↓
BLOCKED
```

rather than:

```text
Implemented
```

if the actual provider integration cannot be verified.

Similarly:

```text
Legal source cannot be verified
        ↓
Do not fabricate source
        ↓
INSUFFICIENT_SOURCE
```

Legal uncertainty must never be hidden merely to mark a feature complete.

---

# 22. Scope Change Rules

If implementation reveals that a milestone requires functionality outside the Feature Freeze:

1. Stop the scope expansion.
2. Record the issue.
3. Check `docs/08-decision-log.md`.
4. Determine whether the requirement is essential.
5. If it is not essential, defer it.
6. If it is essential, update the relevant documentation before implementation.

No silent scope expansion is permitted.

---

# 23. Current Progress

At the beginning of implementation:

| Sprint                                        | Status      |
| --------------------------------------------- | ----------- |
| Sprint 0 — Engineering Foundation             | NOT STARTED |
| Sprint 1 — Document Processing                | NOT STARTED |
| Sprint 2 — Legal Knowledge Foundation         | NOT STARTED |
| Sprint 3 — AI Infrastructure                  | NOT STARTED |
| Sprint 4 — Understand                         | NOT STARTED |
| Sprint 5 — Flag                               | NOT STARTED |
| Sprint 6 — Compare                            | NOT STARTED |
| Sprint 7 — Act                                | NOT STARTED |
| Sprint 8 — Prepare + Multilingual             | COMPLETE    |
| Sprint 9 — Privacy + Security + Design        | IN PROGRESS |
| Sprint 10 — Integration + Testing             | NOT STARTED |
| Sprint 11 — Evaluation Readiness              | NOT STARTED |

---

# 24. Immediate Implementation Order

Once the documentation phase is complete, the initial implementation order is:

```text
1. Repository/application foundation
2. Session-state foundation
3. PDF validation
4. PDF extraction
5. Clause segmentation
6. Deterministic document classification
7. Legal knowledge schema
8. Initial verified legal rules/sources
9. AI provider abstraction
10. Gemini integration
11. Groq integration
12. Understand vertical slice
13. Flag
14. Compare
15. Act
16. Prepare
17. Multilingual validation
18. Privacy hardening
19. Security hardening
20. Product Design Sprint (S9.5)
21. Frontend UI Implementation
22. Accessibility pass (S9.3 Resumed)
23. Integration testing
24. Evaluation preparation
```

This order may change if implementation reveals a genuine dependency, but changes must be recorded.

---

# 25. Definition of V1 Complete

Version 0.1.0 is complete when:

```text
PDF
 ↓
Validated
 ↓
Classified
 ↓
Extracted
 ↓
Understood
 ↓
Flagged
 ↓
Compared
 ↓
Actionable next steps
 ↓
Preparation
```

works for the supported document categories within the supported jurisdiction and languages, while maintaining:

* legal-source traceability,
* privacy protection,
* accessibility,
* security,
* AI-output validation,
* deterministic/AI separation,
* and automated test coverage.

The product does not need every future capability to reach v1 completion.

---

# 26. Final Sprint Principle

The Sprint Tracker exists to answer one question:

> **What is the next smallest piece of work that moves the project toward a complete, reliable, demonstrable product?**

Implementation should follow that principle rather than maximizing the number of files, technologies, AI calls, or features.

A milestone is valuable when it makes the actual product more complete.
