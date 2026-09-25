# Document 01 — System Architecture

**Project:** Indian Legal AI Assistant
**Version:** v0.1.0
**Status:** FROZEN for Review
**Document Location:** `docs/01-system-architecture.md`
**Parent Document:** `docs/00-project-vision.md`

---

# 1. Architecture Objective

The Indian Legal AI Assistant uses a **privacy-first, evidence-grounded, stage-based architecture**.

The architecture separates five responsibilities:

1. **User Interface** — presentation and interaction.
2. **Session State** — user-controlled case state and context.
3. **Deterministic Processing** — extraction, validation, routing, legal-rule lookup and other predictable operations.
4. **AI Reasoning** — semantic interpretation where reasoning provides genuine value.
5. **Legal Knowledge** — structured rules and authoritative source references.

The central architectural principle is:

> **The application owns evidence, state, rules, sources and deterministic operations. AI performs bounded semantic interpretation over that controlled context.**

The AI is therefore a component of the system rather than the system itself.

---

# 2. Architecture Principles

## 2.1 Evidence Is Traceable

Every document-specific finding must be traceable to an extracted document clause.

```text
Finding
   ↓
clause_id
   ↓
Original Document Evidence
```

The system must explicitly separate three types of information:
1. **Document-derived fact**: e.g., "The agreement states X." Supported by clause_id and document evidence.
2. **Legal claim**: e.g., "Applicable law provides Y." Supported by rule_id, source_id, and verified source URL.
3. **AI interpretation**: e.g., "This clause may create a concern because Z." Supported by clause_id, rule_id, and source_id.

Every substantive legal claim must additionally be traceable to a legal rule and source.

```text
Legal Finding
   ↓
rule_id
   ↓
source_id
   ↓
verified source URL
```

No AI-generated source URL is accepted as authoritative. Do not force ordinary document summaries to have legal citations, and do not allow AI interpretations to silently become legal facts. Contractual requirements must be explicitly separated from legal requirements.

---

## 2.2 Session State Is Client-Owned

The application uses Zustand as the primary case/session state store.

The intended v1 model is:

```text
User
 ↓
Browser
 ↓
Zustand Session
```

rather than:

```text
User
 ↓
Permanent Document Account
 ↓
Stored Legal Documents
```

Original document content should remain available locally to support the document viewer and evidence references.

Persistent storage of user documents is outside v1 scope.

---

## 2.3 AI Calls Are Stateless

The server-side AI endpoints should not depend on hidden conversational history.

Every AI request receives the structured context it requires.

```text
Client Context
     ↓
API Request
     ↓
AI Provider
     ↓
Validated Structured Response
     ↓
Client Session
```

This makes requests:

* reproducible,
* testable,
* inspectable,
* cacheable,
* and provider-independent.

---

## 2.4 Context Is Passed Through Contracts

Each stage produces a structured context object.

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

The system does not repeatedly send the entire document and all previous AI output to every provider.

Stable identifiers allow downstream stages to refer back to the original evidence.

---

## 2.5 Deterministic Before Generative

When an operation can be performed reliably through deterministic logic, the application should perform it locally.

Examples:

* PDF validation
* PDF extraction
* clause identifiers
* source lookup
* rule filtering
* equality/numeric comparisons
* known deadline calculations
* government route lookup
* output validation
* PDF generation

AI is introduced when semantic reasoning is actually required.

---

# 3. High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                                                             │
│ Next.js + TypeScript + Tailwind + Framer Motion + i18n      │
│                                                             │
│ Upload | Document Viewer | Stage Navigator | Findings       │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     SESSION / CASE STATE                    │
│                                                             │
│                         Zustand                             │
│                                                             │
│ Document | Contexts | Findings | Sources | Actions | UI     │
└─────────────────────────────┬───────────────────────────────┘
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
┌──────────────────────────────┐  ┌───────────────────────────┐
│   DETERMINISTIC PIPELINE     │  │       AI ORCHESTRATION    │
│                              │  │                           │
│ PDF extraction               │  │ Context construction      │
│ File validation              │  │ Provider selection        │
│ PII minimization             │  │ Request validation        │
│ Document classification      │  │ Response validation       │
│ Rule matching                │  │ Quota management          │
│ Source lookup                │  │ Gemini / Groq             │
│ Comparison                  │  │                           │
│ Action routing               │  │                           │
│ PDF generation               │  │                           │
└──────────────┬───────────────┘  └─────────────┬─────────────┘
               │                                │
               └──────────────┬─────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  LEGAL KNOWLEDGE LAYER                       │
│                                                             │
│ LegalRule | LegalSource | ClausePattern | GovernmentRoute   │
│                                                             │
│ Telangana + Central Laws Applicable in Hyderabad            │
└─────────────────────────────────────────────────────────────┘
```

---

# 4. Application Layers

## 4.1 Presentation Layer

Responsible for:

* pages,
* components,
* document viewer,
* stage navigation,
* risk visualization,
* language presentation,
* accessibility,
* animations,
* user interactions.

The presentation layer must not directly call Gemini or Groq.

It communicates through application services.

---

# 5. Application / Orchestration Layer

This layer coordinates the five-stage workflow.

Example responsibilities:

```text
CaseService
DocumentService
AnalysisService
ComparisonService
ActionService
PreparationService
```

The exact module naming may change during implementation, but the architectural responsibility remains separated.

The orchestration layer should not contain provider-specific AI logic.

---

# 6. Document Processing Layer

The document pipeline is:

```text
PDF
 ↓
File Validation
 ↓
PDF Text Extraction
 ↓
Page Segmentation
 ↓
Clause Segmentation
 ↓
Document Evidence Model
```

## 6.1 File Validation

Before extraction:

* validate MIME type,
* validate file extension,
* validate size,
* inspect file signature/magic bytes,
* reject unsupported files,
* enforce configured limits.

The application must not trust client-provided MIME types alone.

---

## 6.2 PDF Extraction

PDF.js is responsible for client-side extraction.

The extraction result should retain enough location information to identify:

* page number,
* text range where practical,
* paragraph/section,
* and stable clause ID.

Example:

```text
clause_017
page: 4
type: security_deposit
text: "The tenant shall pay..."
```

---

# 7. Document Evidence Model

The system establishes a canonical representation of the uploaded document.

Conceptually:

```text
Document
├── document_id
├── document_type
├── jurisdiction
├── language
├── pages[]
└── clauses[]
```

Each clause contains:

```text
Clause
├── clause_id
├── page_id
├── raw_text
├── normalized_text
├── clause_type
└── metadata
```

The raw extracted text remains the authoritative representation of what was present in the uploaded document.

AI-generated summaries are not replacements for this evidence.

---

# 8. Document Classification

Only two document types are supported in v1, but classification uses the following conceptual states:

```text
RENTAL_LEASE
FREELANCER_SERVICE
UNKNOWN
UNSUPPORTED
```

An arbitrary PDF must never be silently forced into one of the supported categories.

The classification architecture deliberately starts simple.

### Initial strategy

```text
Extracted text
      ↓
Deterministic signals
      ↓
Confidence
      ↓
Supported type / unsupported / uncertain
```

Strong signals may include domain-specific terminology and clause patterns.

A semantic local classifier such as Transformers.js may be introduced only if testing demonstrates that deterministic classification is insufficient.

### Architectural rule

> **Transformers.js is optional infrastructure, not a mandatory feature.**

The project must not introduce a large client-side model merely to avoid using an LLM for a trivial two-class classification problem.

---

# 9. Privacy / PII Processing Layer

The privacy pipeline sits between local document processing and external AI requests.

```text
Original Evidence
       │
       ├──────────────→ Local Viewer
       │
       ▼
PII Detection
       │
       ▼
Pseudonymization
       │
       ▼
AI-Safe Context
       │
       ▼
External AI Provider
```

## 9.1 PII Representation

Example:

```text
Rahul Sharma
    ↓
[TENANT_NAME]

9876543210
    ↓
[PHONE_01]

rahul@example.com
    ↓
[EMAIL_01]
```

Stable placeholders must be used within a case.

The original-to-placeholder mapping remains local to the user's session.

---

# 10. Legal Knowledge Layer

The legal knowledge layer is a structured source of known rules.

Core entities:

```text
LegalDomain
LegalRule
LegalSource
ClausePattern
GovernmentRoute
```

The initial jurisdiction is:

```text
TELANGANA
+
CENTRAL_LAW_APPLICABLE_TO_HYDERABAD
```

The knowledge layer is not treated as an LLM-generated database.

Legal rules and source URLs must be explicitly curated/verified before being used as authoritative application data.

---

# 11. Legal Rule Retrieval

The application should not send the complete legal database to an AI provider.

Instead:

```text
Document Type
+
Detected Clause Types
+
Jurisdiction
+
Relevant Topics
        ↓
Rule Matcher
        ↓
Applicable Legal Rules
        ↓
Supporting Sources
```

Only relevant rules are included in an AI context.

Example:

```text
Document:
Rental Agreement

Relevant clauses:
security deposit
termination
notice

Applicable rules:
RULE-014
RULE-021
RULE-029

Sources:
SOURCE-004
SOURCE-008
SOURCE-013
```

This reduces token usage and prevents irrelevant legal information from entering the model context.

---

# 12. Legal Source Hierarchy

The system recognizes five source tiers.

```text
Tier 1
Official legislation / authoritative government source

Tier 2
Official courts / tribunals

Tier 3
Official government departments / portals

Tier 4
Established secondary legal sources

Tier 5
General secondary sources
```

Tier 1–3 sources are the preferred basis for substantive legal claims.

The precise permitted use of each tier is governed by Document 10.

---

# 13. AI Architecture

AI providers are abstracted behind a common interface.

```text
AIProvider
├── GeminiProvider
└── GroqProvider
```

The application must not contain direct provider calls inside UI components.

Conceptually:

```text
AnalysisService
      ↓
AIProvider
      ↓
Provider Adapter
      ↓
External API
```

This allows:

* provider substitution,
* mocking in tests,
* quota management,
* consistent error handling,
* structured output validation.

---

# 14. Gemini Responsibilities

Gemini is primarily responsible for tasks where language generation and multilingual explanation are valuable.

### Stage 1

* plain-language explanation,
* structured understanding,
* user-facing explanation.

### Stage 5

* attorney preparation sheet,
* optional document drafting,
* multilingual presentation where required.

The exact Gemini model is intentionally not frozen here.

The model must be verified against the available API account and current provider availability before Document 02 is finalized.

---

# 15. Groq Responsibilities

Groq is primarily intended for reasoning-heavy analysis.

### Stage 2

* potential risk identification,
* semantic clause analysis,
* interpretation against supplied rules.

### Stage 3

* semantic inconsistency reasoning where deterministic comparison is insufficient.

The application must determine which model is accessible through the configured Groq API key rather than assuming a model is available.

The selected model will be recorded in the AI Development Contract.

---

# 16. AI Request Lifecycle

Every AI request follows the same conceptual pipeline:

```text
Stage Request
     ↓
Build Context
     ↓
Attach Applicable Rules
     ↓
Attach Source Metadata
     ↓
Attach Relevant Evidence
     ↓
PII-Minimized Representation
     ↓
Provider Request
     ↓
Response
     ↓
Schema Validation
     ↓
Source/Clause Validation
     ↓
Context Update
     ↓
Zustand Session
```

An AI response is not accepted merely because the provider returned valid JSON.

The application must also validate semantic references and rules such as:

* schema correctness,
* clause IDs,
* rule IDs,
* source IDs,
* severity values,
* required fields,
* language,
* allowed state transitions,
* and legal-source relationships.

---

# 17. AI Context Handoff

The system uses explicit stage contracts.

```text
DocumentContext
      ↓
Stage 1
      ↓
UnderstandingContext
      ↓
Stage 2
      ↓
AnalysisContext
      ↓
Stage 3
      ↓
ComparisonContext
      ↓
Stage 4
      ↓
ActionContext
      ↓
Stage 5
```

Each context references evidence through stable identifiers.

The downstream stage should receive:

1. relevant structured context,
2. relevant original evidence,
3. applicable legal rules,
4. supporting sources,
5. explicit task instructions.

It should not receive unnecessary previous prose.

Detailed contracts are defined in Document 11.

---

# 18. Stage Architecture

## Stage 1 — Understand

```text
DocumentContext
+
Relevant Clauses
+
User Language
        ↓
Gemini
        ↓
UnderstandingContext
```

No legal conclusion should be generated unless supported by the supplied legal context.

Stage 1 is primarily about explaining what the document says.

---

## Stage 2 — Flag

```text
UnderstandingContext
+
Original Clauses
+
Applicable LegalRules
+
LegalSources
        ↓
Deterministic clause/rule matching 
OR Groq (if semantic interpretation required)
        ↓
AnalysisContext
```

Every finding must identify its evidence and supporting legal references where a legal claim is made.

---

## Stage 3 — Compare

```text
AnalysisContext
+
Legal Baseline
+
Document Evidence
        ↓
Deterministic Comparison 
OR Groq (if semantic comparison required)
        ↓
ComparisonContext
```

Simple comparisons remain deterministic.

---

## Stage 4 — Act

```text
ComparisonContext
+
Known GovernmentRoutes
+
Known Procedural Rules
        ↓
Deterministic Routing
        ↓
ActionContext
```

No AI call should be necessary for ordinary routing.

---

## Stage 5 — Prepare

Triggered only when the user requests preparation.

```text
AnalysisContext
+
ComparisonContext
+
ActionContext
+
Relevant Evidence
+
Sources
        ↓
Gemini
        ↓
AttorneyPreparationContext
        ↓
PDF Export
```

---

# 19. Language Architecture

Legal reasoning is internally represented in a canonical form.

```text
Canonical Finding
      │
      ├── English presentation
      ├── Telugu presentation
      └── Hindi presentation
```

Changing language must not trigger fresh legal analysis.

Where AI translation/generation is required, it operates on the already-established structured findings rather than rediscovering legal conclusions.

The original evidence remains available for citation regardless of presentation language.

---

# 20. State Management

Zustand is the canonical client-side session state manager.

Conceptual state:

```text
CaseSession
├── session
│   ├── sessionId
│   ├── language
│   └── jurisdiction
│
├── documents[]
│   ├── metadata
│   ├── pages[]
│   └── clauses[]
│
├── contexts
│   ├── document
│   ├── understanding
│   ├── analysis
│   ├── comparison
│   └── actions
│
├── findings[]
├── sources[]
├── actions[]
│
├── privacy
│   ├── piiMappings
│   └── piiStats
│
└── aiUsage
    ├── geminiCalls
    └── groqCalls
```

The exact TypeScript schemas are defined in Document 11.

---

# 21. Local Storage Policy

The application should distinguish between:

### Session memory

Data required while the application is open.

### Persistent browser storage

Data that survives reloads or browser restarts.

Zustand active state is not automatic long-term persistence. Sensitive original documents and case data should not automatically be persisted to browser localStorage. There is no cloud document persistence requirement for v1.

If persistence is introduced later (e.g., IndexedDB or cloud storage), it requires an explicit architectural decision and privacy review.

---

# 22. AI Quota Management

The system has a provider abstraction and quota manager.

Conceptually:

```text
AI Request
    ↓
Quota Manager
    ↓
Available Provider / Key
    ↓
Request
```

Two Gemini keys are available.

They should be used for:

* quota-aware failover,
* rate-limit recovery,
* controlled request distribution where appropriate.

They should not be used to make duplicate calls for the same request merely to obtain multiple opinions.

One Groq key is available.

API usage should be tracked at the session level for debugging and quota protection.

---

# 23. API Boundary

API keys must remain server-side and never be exposed to client-side code.

The intended architecture is:

```text
Browser
   ↓
Next.js server/API boundary
   ↓
Provider Adapter
   ↓
Gemini / Groq
```

The browser sends:

* sanitized context,
* required document evidence,
* stage identifier,
* language,
* legal rule references,
* source references.

The server validates and forwards the request.

---

# 24. API Security

The API layer must implement:

* API key secrecy,
* request validation,
* file validation,
* input-size limits,
* rate limiting,
* origin/CORS controls where applicable,
* structured response validation,
* error sanitization,
* security headers.

Provider errors must not expose:

* API keys,
* internal configuration,
* stack traces,
* sensitive request payloads,
* or private document content unnecessarily.

---

# 25. Data Flow — Complete User Journey

```text
                    USER
                      │
                      ▼
              Select Language
                      │
                      ▼
                Upload PDF
                      │
                      ▼
              File Validation
                      │
                      ▼
              Local PDF Parse
                      │
                      ▼
             PII Minimization
                      │
                      ▼
          Document Classification
                      │
                      ▼
              DocumentContext
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    Legal Rule Lookup       Stage 1 Gemini
          │                       │
          └───────────┬───────────┘
                      ▼
             UnderstandingContext
                      │
                      ▼
                 Stage 2
                   Groq
                      │
                      ▼
               AnalysisContext
                      │
                      ▼
              Stage 3 Compare
              ┌───────┴────────┐
              ▼                ▼
       Deterministic       Groq if
        comparison         required
              │                │
              └───────┬────────┘
                      ▼
             ComparisonContext
                      │
                      ▼
                 Stage 4
              Deterministic
                      │
                      ▼
                ActionContext
                      │
               User requests
                 preparation
                      │
                      ▼
                 Stage 5
                  Gemini
                      │
                      ▼
             Attorney Preparation
                      │
                      ▼
                  PDF Export
```

---

# 26. Error Handling Architecture

Every major layer must have explicit failure states.

Examples:

```text
UNSUPPORTED_FILE
INVALID_PDF
EXTRACTION_FAILED
UNSUPPORTED_DOCUMENT
CLASSIFICATION_UNCERTAIN
LEGAL_SOURCE_UNAVAILABLE
INSUFFICIENT_SOURCE
AI_PROVIDER_UNAVAILABLE
AI_RATE_LIMITED
AI_RESPONSE_INVALID
AI_CONTEXT_INVALID
EXPORT_FAILED
```

The UI must provide a useful user-facing state without exposing internal implementation details.

---

# 27. AI Failure Policy

If an AI provider fails:

The application must **not silently fabricate a result**.

Possible behavior:

```text
AI unavailable
      ↓
Retry if safe
      ↓
Provider fallback where configured
      ↓
If still unavailable:
      ↓
Explain that this stage could not be completed
```

A failed AI stage must not be represented as successfully analyzed.

---

# 28. Source Validation

Before displaying a source-backed legal claim:

```text
Finding.source_id
        ↓
Source exists?
        ↓
Source verified?
        ↓
URL available?
        ↓
Rule/source relationship valid?
        ↓
Display claim
```

If validation fails, the legal claim should be downgraded to an unsupported/insufficient-source state.

---

# 29. Document Viewer Architecture

The viewer is the canonical evidence surface.

Each highlighted clause maps to:

```text
clause_id
      ↓
Finding(s)
      ↓
Explanation
      ↓
Rule(s)
      ↓
Source(s)
```

Clicking a highlighted clause should update the right-hand panel to the corresponding explanation.

The right-hand explanation must never highlight a clause that cannot be located in the original evidence model.

---

# 30. Multi-Document Architecture

Although the initial use case can begin with a single document, the architecture should allow a session to contain multiple supported documents.

Example:

```text
CaseSession
├── document_001
└── document_002
```

Cross-document analysis can identify:

* direct contradictions,
* deviations,
* coverage gaps,
* ambiguities.

The common legal context remains shared where jurisdiction and domain are compatible.

Multi-document functionality should not expand the supported legal document categories.

---

# 31. Testing Architecture

The system must be testable without live AI providers.

AI providers therefore require interfaces that can be mocked.

```text
AIProvider
    ↓
MockAIProvider
```

Tests should cover:

### Unit

* PDF validation
* document classification
* PII detection
* pseudonymization
* legal-rule matching
* source validation
* risk severity mapping
* deterministic comparison
* action routing
* context validation

### Integration

* PDF upload → extraction → classification
* Stage 1 → Stage 2 context handoff
* Stage 2 → Stage 3 handoff
* source-backed finding validation
* language presentation
* PDF export

### AI integration

Live provider calls are optional and isolated from normal test execution.

---

# 32. Accessibility Architecture

Accessibility is enforced at the component level.

Requirements include:

* semantic HTML,
* keyboard navigation,
* focus management,
* ARIA labels,
* accessible stage navigation,
* screen-reader-friendly findings,
* text labels alongside risk colours,
* sufficient contrast,
* accessible document controls,
* multilingual text rendering.

Accessibility testing should be integrated into the QA milestone rather than left until final polish.

---

# 33. Performance Architecture

Performance priorities:

1. Parse the PDF once.
2. Store extracted evidence in session state.
3. Avoid repeated AI requests.
4. Send only relevant context to providers.
5. Lazy-load expensive client-side functionality.
6. Avoid loading optional ML models unless needed.
7. Generate Stage 5 only on demand.
8. Keep deterministic operations local where possible.

The application should measure AI latency separately from UI rendering and local processing.

---

# 34. Security Boundaries

The system has four primary trust boundaries.

```text
BOUNDARY 1
User File → Application

BOUNDARY 2
Browser → Server API

BOUNDARY 3
Server API → External AI Provider

BOUNDARY 4
AI Response → Application State
```

Each boundary requires validation.

In particular:

> **An AI response is untrusted external input.**

It must be validated before entering application state.

---

# 35. Architectural Invariants

The following rules are non-negotiable unless explicitly changed through the Decision Log.

### Invariant 1

No API key is exposed to the browser.

### Invariant 2

No substantive legal claim is displayed without a valid supporting source.

### Invariant 3

AI cannot create authoritative legal source URLs.

### Invariant 4

Every AI finding referencing document content must identify a valid clause ID.

### Invariant 5

Every legal finding must identify its supporting rule/source when a legal claim is made.

### Invariant 6

The original document evidence remains separate from AI interpretation.

### Invariant 7

Known legal rules are retrieved from the structured legal knowledge base.

### Invariant 8

Only relevant legal rules are sent to an AI provider.

### Invariant 9

Language changes do not trigger unnecessary re-analysis.

### Invariant 10

Deterministic operations are not delegated to AI without a documented reason.

### Invariant 11

AI failure never results in fabricated output.

### Invariant 12

Sensitive document data is not persisted beyond the intended session model.

### Invariant 13

Unsupported document categories are explicitly rejected or marked unsupported.

### Invariant 14

AI provider implementations remain replaceable through provider interfaces.

---

# 36. Architecture Decision Boundaries

This document deliberately does not freeze:

* exact Gemini model,
* exact Groq model,
* exact Transformers.js model,
* final database engine,
* exact legal-rule dataset,
* exact API endpoint names,
* final component hierarchy,
* exact prompt wording,
* exact rate limits.

Those decisions belong to subsequent documents or implementation milestones.

They must not contradict the architectural invariants defined here.

---

# 37. Future Extension Boundaries

The architecture should permit future additions without changing the core pipeline.

Potential future capabilities include:

* additional Indian languages,
* additional legal document categories,
* photo OCR,
* additional jurisdictions,
* additional AI providers,
* persistent user accounts,
* document history,
* richer legal databases.

None of these are v1 requirements.

The current architecture must not be over-engineered around them.

---

# 38. Architecture Success Criteria

The architecture is considered valid when:

* [ ] UI does not directly depend on AI providers.
* [ ] AI providers are abstracted.
* [ ] Document evidence has stable clause IDs.
* [ ] AI contexts have explicit boundaries.
* [ ] Legal rules and sources are structured.
* [ ] AI receives only relevant legal context.
* [ ] PII minimization occurs before external AI processing.
* [ ] Original document evidence remains locally available.
* [ ] AI responses are schema validated.
* [ ] Source and clause references are validated.
* [ ] AI failures have explicit states.
* [ ] Deterministic work remains deterministic.
* [ ] AI quota is protected against accidental repeated calls.
* [ ] The system can operate with mocked AI providers.
* [ ] Unsupported documents are handled explicitly.
* [ ] The architecture supports English, Telugu and Hindi presentation without duplicating legal reasoning.

---

# 39. Related Documents

| Document                          | Relationship                                          |
| --------------------------------- | ----------------------------------------------------- |
| `00-project-vision.md`            | Defines product purpose and scope                     |
| `02-ai-development-contract.md`   | Defines AI-specific contracts and boundaries          |
| `03-engineering-rules.md`         | Defines implementation rules                          |
| `04-documentation-index.md`       | Defines documentation structure                       |
| `05-feature-freeze.md`            | Defines frozen v1 features                            |
| `06-evaluation-score-strategy.md` | Defines evaluation and judge-visible scoring strategy |
| `07-sprint-tracker.md`            | Defines implementation milestones                     |
| `08-decision-log.md`              | Records architectural decisions                       |
| `09-coding-standards.md`          | Defines code conventions                              |
| `10-legal-knowledge-base.md`      | Defines legal rules and source architecture           |
| `11-ai-context-contracts.md`      | Defines stage input/output schemas                    |
| `12-session-handoff.md`           | Defines cross-session project state                   |

---

# 40. Architecture Authority Model

This document defines the system's architectural boundaries. The documentation uses a domain ownership model rather than a simple linear authority chain. Document 01 owns the system architecture.

The Decision Log (Document 08) serves as cross-cutting historical decision evidence.

Implementation documents may add detail but must not silently violate the architectural invariants.

When an implementation requirement conflicts with this architecture:

1. stop implementation of the conflicting portion,
2. identify the conflict,
3. record the issue in the Decision Log,
4. update the relevant authoritative document,
5. then continue implementation.

**Next document:** `docs/02-ai-development-contract.md`


## Next.js API Boundary
The primary architectural boundary for API communication is:
Browser -> Next.js App Router (Server API/Route Handlers) -> Application/Backend Services -> Provider Adapter -> Gemini / Groq.
Do not introduce tRPC, GraphQL, or microservices.


## User Language Switching
Canonical reasoning is independent of presentation language. The conceptual model is:
Canonical analysis -> English / Telugu / Hindi presentation.
Changing language must not mutate finding IDs, rule IDs, canonical facts, or trigger re-running of legal reasoning.
