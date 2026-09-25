# Document 09 — Coding Standards

**Project:** Indian Legal AI Assistant
**Project Type:** Hackathon / AI Legal Assistance Platform
**Version:** 0.1.0
**Status:** FROZEN
**Last Updated:** 2026-09-19

---

# 1. Purpose

This document defines implementation-level coding standards for the Indian Legal AI Assistant.

The goal is to ensure that the codebase remains:

* readable,
* maintainable,
* type-safe,
* testable,
* secure,
* accessible,
* modular,
* consistent with the architecture,
* and understandable to both human developers and AI coding agents.

These standards complement the architecture and engineering rules.

They do not override:

* Project Vision,
* System Architecture,
* AI Development Contract,
* Engineering Rules,
* Feature Freeze,
* Legal Knowledge requirements,
* or explicit decisions recorded in the Decision Log.

---

# 2. Technology Baseline

The v1 implementation uses:

```text id="3g9a0d"
Frontend
Next.js
TypeScript
Tailwind CSS

Client State
Zustand

Document Processing
PDF processing/extraction

AI
Gemini
Groq

Testing
Unit + integration testing

Legal Knowledge
Structured local knowledge base
```

The exact library choice for a subsystem should be made only when the subsystem requires it.

Do not introduce dependencies merely because they are popular.

---

# 3. General Coding Principles

## 3.1 Prefer clarity over cleverness

Code should be understandable without requiring the reader to reverse-engineer complex abstractions.

Prefer:

```ts
const applicableRules = getApplicableRules(caseContext);
```

over unnecessarily compressed logic.

---

## 3.2 Single responsibility

A function, component, service, or module should have a clear responsibility.

Avoid functions that simultaneously:

* parse PDFs,
* call AI,
* update Zustand,
* manipulate UI,
* and construct legal findings.

These responsibilities belong in separate layers.

---

## 3.3 Explicit boundaries

The implementation should make architectural boundaries visible.

Examples:

```text id="dy9n6j"
PDF processing
AI provider
Legal knowledge
Session state
UI
```

should not become one tightly coupled subsystem.

---

## 3.4 Avoid premature abstraction

Do not create abstractions merely because two lines of code look similar.

Create an abstraction when:

* a boundary is architecturally meaningful,
* duplication creates maintenance risk,
* provider independence requires it,
* testing requires it,
* or future variation is already expected.

---

# 4. TypeScript Standards

## 4.1 Strict typing

TypeScript strict mode should remain enabled.

Avoid:

```ts
any
```

unless there is a documented and justified boundary requiring it.

Prefer:

```ts
unknown
```

followed by validation.

---

## 4.2 External data is unknown

Anything coming from:

* uploaded documents,
* AI providers,
* API requests,
* query parameters,
* browser storage,
* external services,

must be treated as untrusted data.

Do not assume its shape.

Validate it before using it.

---

## 4.3 Use explicit domain types

Important domain concepts should have explicit types.

Examples:

```ts
type DocumentType =
  | "RENTAL_LEASE"
  | "FREELANCER_SERVICE"
  | "UNKNOWN"
  | "UNSUPPORTED";
```

```ts
type JurisdictionStatus =
  | "SUPPORTED"
  | "OUTSIDE_SCOPE"
  | "JURISDICTION_UNCLEAR";
```

```ts
type ProcessingStatus =
  | "PDF_VALID_TEXT"
  | "PDF_EMPTY_TEXT"
  | "PDF_SCANNED"
  | "PDF_CORRUPTED"
  | "PDF_UNSUPPORTED";
```

Do not replace meaningful domain types with generic strings.

---

# 5. Naming Conventions

## Files

Use descriptive names.

Examples:

```text
document-classifier.ts
legal-rule-service.ts
pii-minimizer.ts
gemini-provider.ts
groq-provider.ts
```

---

## Components

Use PascalCase:

```text
DocumentViewer
ClauseHighlight
StageNavigator
FindingCard
SourceReference
```

---

## Functions

Use camelCase:

```ts
extractPdfText()
classifyDocument()
getApplicableRules()
minimizePii()
validateAiResponse()
```

---

## Types

Use PascalCase:

```ts
DocumentContext
Finding
LegalRule
LegalSource
ActionContext
```

---

## Constants

Use descriptive names:

```ts
MAX_UPLOAD_SIZE
SUPPORTED_DOCUMENT_TYPES
SUPPORTED_LANGUAGES
```

---

# 6. Directory Organization

The exact directory layout may evolve with implementation, but responsibilities should remain separated.

A conceptual structure is:

```text id="1kmw3s"
src/
├── app/
├── components/
├── features/
├── lib/
├── services/
├── domain/
├── ai/
├── legal/
├── documents/
├── state/
├── validation/
└── tests/
```

The architecture should prioritize **feature and responsibility boundaries** over excessive nesting.

---

# 7. Domain Models

Core domain models should not depend directly on UI components.

Examples include:

```text id="4b6xwd"
Document
Clause
Finding
LegalRule
LegalSource
Action
CaseSession
```

These should remain usable independently of React rendering.

---

# 8. Stable IDs

Stable identifiers are mandatory for evidence traceability.

Examples:

```text id="cyi7zh"
document_id
clause_id
finding_id
rule_id
source_id
action_id
```

IDs must remain stable throughout a session.

Do not identify evidence solely by:

* array index,
* UI position,
* generated text,
* or display order.

---

# 9. Document Processing Standards

Document processing should follow:

```text id="6x3m7x"
Upload
 ↓
Validate
 ↓
Extract
 ↓
Normalize
 ↓
Segment
 ↓
Classify
 ↓
Create evidence references
```

Each stage should have a clear output.

Do not silently continue after a critical processing failure.

---

# 10. PDF Validation

PDF validation must occur before extraction.

Validation should consider:

* file type,
* file size,
* processing limits,
* parseability,
* and supported document conditions.

Invalid input should produce a structured error.

Avoid leaking internal stack traces to users.

---

# 11. PDF Extraction

PDF extraction should preserve enough information to support evidence navigation.

Where available, retain:

* page number,
* text location,
* clause boundaries,
* section information.

Do not discard document-location metadata merely because the extracted text itself is sufficient for AI processing.

---

# 12. Document Classification

Classification should initially be deterministic.

Use explicit outcomes:

```text id="lmyy2j"
RENTAL_LEASE
FREELANCER_SERVICE
UNKNOWN
UNSUPPORTED
```

Classification must not force unsupported documents into a supported category.

The classifier should be testable independently from the UI.

---

# 13. Legal Knowledge Standards

Legal knowledge must be represented as structured data rather than scattered hard-coded strings.

Core concepts include:

```text id="m40bxy"
LegalRule
LegalSource
Applicability
Jurisdiction
EffectivePeriod
GovernmentRoute
```

A substantive legal rule must reference its source.

---

# 14. Legal Source Integrity

Source URLs must originate from the verified legal knowledge base.

AI-generated URLs must never be accepted as authoritative merely because they appear plausible.

Do not write:

```ts
const sourceUrl = aiResponse.url;
```

and treat it as verified.

Instead:

```text id="7k9e4s"
AI source_id
     ↓
Validate against legal knowledge base
     ↓
Use verified source
```

---

# 15. Legal Rule Applicability

A legal rule should never be applied based solely on keyword similarity.

Where applicable, check:

* jurisdiction,
* document type,
* effective dates,
* subject matter,
* rule conditions.

The code should distinguish:

```text id="n5x1ra"
rule exists
```

from:

```text id="z7k6e2"
rule applies to this case
```

---

# 16. Legal Evidence Model

Keep these separate:

```text id="4p9zre"
Document Fact
Legal Rule
AI Interpretation
```

A finding should be able to reference the evidence it depends on.

Conceptually:

```ts
interface Finding {
  id: string;
  clauseId: string;
  ruleId?: string;
  sourceId?: string;
  severity: Severity;
  explanation: string;
  status: FindingStatus;
}
```

Do not require a rule/source reference for an ordinary document-derived fact unless the application is explicitly making a legal claim.

---

# 17. Missing Information

Never infer missing document facts.

Represent absence explicitly.

For example:

```ts
type InformationStatus =
  | "STATED"
  | "NOT_STATED"
  | "UNCLEAR";
```

The implementation may use a different equivalent type, but the semantic distinction must remain.

---

# 18. Severity

Severity measures:

> **How consequential or significant an identified issue could be to the user.**

It does not measure:

* confidence,
* probability of legal success,
* model certainty,
* litigation outcome,
* or whether a court will agree.

Keep severity separate from interpretation confidence/status.

Example:

```ts
interface Finding {
  severity: Severity;
  confidence?: Confidence;
}
```

Do not create a numerical severity score unless explicitly approved.

---

# 19. AI Provider Standards

AI providers must be accessed through provider abstractions.

Preferred conceptual structure:

```text id="lq1q6k"
AIProvider
├── GeminiProvider
└── GroqProvider
```

Application code should not directly depend on provider SDK calls.

---

# 20. Provider Adapter Responsibilities

A provider adapter should handle:

* provider-specific request formatting,
* authentication,
* model configuration,
* provider-specific errors,
* response parsing,
* retry/failure behavior where appropriate.

It should not own:

* legal business rules,
* document classification,
* session state,
* UI rendering,
* or application-specific workflow decisions.

---

# 21. AI Output Validation

Never trust AI output directly.

The flow should be:

```text id="5q8j6c"
AI response
   ↓
Parse
   ↓
Schema validation
   ↓
Reference validation
   ↓
Business-rule validation
   ↓
Application state
```

Invalid responses should produce controlled errors.

---

# 22. AI Prompt Standards

Prompts should clearly separate:

1. system/application instructions,
2. structured task context,
3. untrusted document content.

Document content must never be placed in a position where it can be mistaken for trusted instructions.

---

# 23. AI Context Standards

Do not pass entire previous AI responses when only structured information is required.

Prefer:

```ts
{
  clauseIds: [...],
  findingIds: [...],
  ruleIds: [...],
  sourceIds: [...]
}
```

over repeatedly passing large natural-language outputs.

This reduces:

* token usage,
* cost,
* latency,
* context drift,
* and hallucination opportunities.

---

# 24. AI Model Configuration

Model identifiers should be configuration values rather than scattered through source code.

Do not hard-code model names in multiple files.

Example:

```text
GEMINI_MODEL
GROQ_MODEL
```

The actual model selection must be verified against available project accounts before being frozen.

---

# 25. API Key Standards

API keys must:

* remain server-side,
* come from environment configuration,
* never appear in client bundles,
* never be committed to source control,
* never be logged.

Environment files containing secrets must remain excluded from version control.

---

# 26. Error Handling

Errors should be categorized rather than represented only as arbitrary strings.

Conceptual categories:

```text id="v1d7fz"
VALIDATION_ERROR
DOCUMENT_PROCESSING_ERROR
CLASSIFICATION_ERROR
LEGAL_KNOWLEDGE_ERROR
AI_PROVIDER_ERROR
AI_VALIDATION_ERROR
JURISDICTION_ERROR
UNSUPPORTED_OPERATION
INTERNAL_ERROR
```

User-facing errors should be understandable.

Internal diagnostic information should remain in controlled server-side logs.

---

# 27. Fail Safely

When the system cannot establish sufficient information:

```text id="b9y91k"
Do not guess.
Do not fabricate.
Do not silently continue with false assumptions.
```

Examples:

```text id="gbrw0t"
No reliable legal source
→ INSUFFICIENT_SOURCE

Missing contract information
→ NOT_STATED

Unclear jurisdiction
→ JURISDICTION_UNCLEAR

Unsupported document
→ UNSUPPORTED
```

---

# 28. State Management

Zustand should represent active application/session state.

State should be structured around the case workflow rather than arbitrary UI flags.

Conceptually:

```text id="07ufk5"
CaseSession
├── document
├── clauses
├── understanding
├── findings
├── comparison
├── actions
├── preparation
├── language
├── privacy
└── aiUsage
```

Avoid duplicating the same authoritative data in multiple state locations.

---

# 29. Persistence

Do not automatically persist sensitive legal case data to localStorage.

If persistence is introduced later, it requires an explicit architectural/security decision.

Sensitive original documents should not be casually serialized into browser persistence.

---

# 30. React Component Standards

Components should have clear responsibilities.

Prefer:

```text id="exom0h"
DocumentViewer
ClauseHighlight
StageNavigator
FindingCard
SourceReference
```

over one large component responsible for the entire application.

Avoid deeply coupled components that directly manipulate unrelated application state.

---

# 31. Server/Client Boundary

Client components must not contain:

* API keys,
* provider credentials,
* direct privileged provider calls,
* server-only secrets,
* or trusted legal-source mutation logic.

The browser communicates with application API boundaries.

---

# 32. UI Accessibility Standards

Every interactive element must be usable with the keyboard.

Use:

* semantic buttons,
* semantic links,
* labels,
* visible focus,
* appropriate ARIA,
* logical tab order.

Do not replace accessible native controls with custom controls without a clear reason.

---

# 33. Color and Risk Indicators

Risk/severity must not rely solely on color.

Use combinations such as:

```text
High
⚠
```

rather than relying only on:

```text
red
```

This requirement applies to:

* findings,
* alerts,
* statuses,
* validation errors,
* and other important state indicators.

---

# 34. Multilingual UI Standards

The application must support:

```text
English
Telugu
Hindi
```

UI text must not assume that translated strings have the same length as English.

Avoid fixed-width layouts that break when regional-language text expands.

Use fonts and rendering choices that correctly support Telugu and Hindi characters.

---

# 35. Language-Neutral Domain State

Changing presentation language must not modify the canonical legal analysis.

For example:

```text id="d6p6yn"
findingId = FINDING-001
ruleId = RULE-007
sourceId = SOURCE-004
```

remain unchanged when the user switches from English to Telugu.

Translation is a presentation concern.

---

# 36. Logging Standards

Logs should help diagnose system behavior without unnecessarily exposing user data.

Do log where appropriate:

* request identifiers,
* operation type,
* provider,
* success/failure,
* error category,
* timing,
* system state transitions.

Avoid logging:

* raw uploaded documents,
* complete PII,
* API keys,
* full AI prompts containing sensitive information,
* PII mappings.

---

# 37. Debugging Standards

Debugging information must not accidentally become production behavior.

Avoid:

```ts
console.log(fullDocument);
console.log(aiPrompt);
console.log(apiKey);
```

Use structured, sanitized diagnostics instead.

---

# 38. Testing Standards

Every non-trivial deterministic function should have tests.

High-priority areas include:

* document validation,
* PDF extraction,
* classification,
* PII minimization,
* legal-rule retrieval,
* applicability,
* source validation,
* clause IDs,
* context schemas,
* AI response validation,
* state transitions.

---

# 39. Test Naming

Test names should describe behavior.

Prefer:

```text
classifies a rental agreement from supported clause signals
```

over:

```text
test1
```

Negative cases should be explicit.

Examples:

```text
rejects unsupported document types
returns insufficient source when no verified source exists
does not expose PII mapping to AI context
does not apply Telangana rules when jurisdiction is unclear
```

---

# 40. AI Tests

Tests involving Gemini or Groq should use mocks or fixtures.

Automated tests must not depend on:

* live free-tier quotas,
* network availability,
* provider uptime,
* or changing model behavior.

Provider adapters should be testable independently.

---

# 41. Test Fixtures

Use synthetic or sanitized documents for testing.

Do not commit real users' legal documents or sensitive personal information to the repository.

Fixtures should cover:

* rental agreements,
* freelancer/service agreements,
* unsupported documents,
* malformed PDFs,
* scanned PDFs where relevant,
* missing clauses,
* ambiguous information,
* and adversarial document content.

---

# 42. Security Testing

Security tests should cover:

* malicious uploads,
* invalid file types,
* oversized uploads,
* prompt injection,
* malformed AI output,
* invalid IDs,
* unauthorized state transitions,
* and secret exposure.

---

# 43. Privacy Testing

Privacy tests should verify:

```text id="h2yqtr"
PII detected
    ↓
placeholder generated
    ↓
mapping remains local
    ↓
AI context contains placeholder
    ↓
AI context does not contain original mapping
```

This behavior should be testable independently of the AI provider.

---

# 44. Accessibility Testing

At minimum, verify:

* keyboard navigation,
* focus visibility,
* semantic controls,
* labels,
* contrast,
* screen-reader-compatible structure,
* multilingual rendering.

Automated accessibility tooling may supplement, but not completely replace, manual verification.

---

# 45. Dependency Standards

Before adding a dependency, ask:

1. Is it necessary?
2. Does the architecture require it?
3. Is there already a suitable existing dependency?
4. Does it introduce unnecessary bundle size?
5. Does it introduce security or maintenance risk?
6. Can it be tested?
7. Does it work within the project constraints?

Do not add dependencies solely because they are commonly used in AI projects.

---

# 46. AI Complexity Rule

Do not introduce:

* agent frameworks,
* vector databases,
* multi-agent systems,
* complex orchestration frameworks,
* additional model providers,

unless a concrete v1 requirement justifies them.

Complexity must solve a demonstrated problem.

---

# 47. Database Standards

Legal knowledge should be represented through structured records rather than duplicated constants throughout application code.

Database access should remain behind an appropriate repository/service boundary.

UI components should not directly manipulate legal database records.

---

# 48. Validation Standards

Validation should occur at system boundaries.

Examples:

```text id="2f3y5d"
Upload boundary
→ file validation

API boundary
→ request validation

AI boundary
→ response validation

Database boundary
→ schema/constraint validation

UI boundary
→ form validation
```

Do not rely only on client-side validation for security-sensitive behavior.

---

# 49. No Silent Fallbacks

Do not silently substitute incorrect or misleading behavior when a dependency fails.

Bad:

```text
Legal source unavailable
→ show made-up source
```

Bad:

```text
Classification failed
→ assume RENTAL_LEASE
```

Good:

```text
Classification failed
→ UNKNOWN
```

Good:

```text
Legal source unavailable
→ INSUFFICIENT_SOURCE
```

---

# 50. Business Logic vs Presentation

Business logic should not be embedded in UI components.

For example, do not implement:

```text
if user clicked this card:
    determine legal severity
```

Instead:

```text id="u3ry2m"
Domain/service
→ determine finding
→ UI renders finding
```

The UI should present decisions rather than make legal decisions.

---

# 51. Feature Boundaries

Feature modules should own their feature-specific logic.

A feature should avoid reaching directly into unrelated feature internals.

Use shared domain/services when information genuinely crosses boundaries.

---

# 52. Comments

Comments should explain **why**, not merely repeat **what** the code does.

Bad:

```ts
// Increment counter
counter++;
```

Good:

```ts
// Keep the original clause ID stable because later findings
// reference this identifier for evidence navigation.
counter++;
```

Do not use comments to justify violations of architecture.

---

# 53. TODO Standards

TODOs should not become hidden unfinished requirements.

Use TODOs only when:

* the work is intentionally deferred,
* the limitation is understood,
* and the corresponding issue/milestone can be identified.

Avoid vague TODOs such as:

```text
TODO: fix later
```

Prefer:

```text
TODO(S8): Add additional language support after v1 validation.
```

---

# 54. Git Standards

Commits should represent coherent changes.

Prefer:

```text
feat: add PDF validation
feat: add deterministic document classifier
test: add clause extraction fixtures
fix: reject unclear jurisdiction findings
```

Avoid giant commits containing unrelated changes.

Do not commit:

* API keys,
* secrets,
* real user documents,
* sensitive logs,
* generated credentials.

---

# 55. Code Review Checklist

Before considering implementation complete, review:

### Architecture

* [ ] Correct layer?
* [ ] Correct responsibility?
* [ ] No unnecessary coupling?

### Security

* [ ] Inputs validated?
* [ ] Secrets protected?
* [ ] AI output treated as untrusted?

### Privacy

* [ ] PII minimized?
* [ ] Mapping local?
* [ ] No sensitive logging?

### Legal safety

* [ ] Source verified?
* [ ] Applicability checked?
* [ ] Missing information represented?
* [ ] No unsupported legal conclusion?

### Accessibility

* [ ] Keyboard usable?
* [ ] Focus visible?
* [ ] Color not sole indicator?
* [ ] Multilingual text readable?

### Testing

* [ ] Unit tests?
* [ ] Negative tests?
* [ ] Integration impact considered?

---

# 56. AI Coding Agent Rules

AI coding agents working in this repository must:

1. Read relevant documentation before implementing significant changes.
2. Follow the Feature Freeze.
3. Check the Decision Log when a design decision is unclear.
4. Avoid inventing legal rules or sources.
5. Avoid inventing APIs or provider capabilities.
6. Avoid introducing unnecessary dependencies.
7. Preserve stable IDs.
8. Preserve privacy boundaries.
9. Preserve accessibility requirements.
10. Run relevant tests after changes.
11. Update the Sprint Tracker when milestones materially change.
12. Record significant architectural decisions in the Decision Log.

AI agents must not silently modify frozen architectural decisions.

---

# 57. Definition of Done for Code

Code is considered complete when:

* it follows the architecture,
* types are valid,
* external inputs are validated,
* security requirements are satisfied,
* privacy requirements are satisfied,
* accessibility requirements are considered,
* tests exist for important behavior,
* failure cases are handled,
* no secrets are committed,
* documentation remains consistent,
* and the relevant sprint milestone can be verified.

---

# 58. Final Coding Principle

The codebase should make the architecture visible.

A developer should be able to look at the project and understand:

```text id="4n3x44"
Where documents are processed
        ↓
Where legal rules live
        ↓
Where AI is called
        ↓
Where AI responses are validated
        ↓
Where session state lives
        ↓
Where findings are created
        ↓
Where evidence is connected
        ↓
Where the UI presents the result
```

The objective is not to create the most sophisticated codebase.

The objective is to create a codebase that is:

> **clear, testable, secure, privacy-conscious, accessible, legally traceable, and easy to evolve.**


## No Client-Side AI SDKs
AI provider SDKs and provider API keys (e.g., GEMINI_API_KEY) must never be used directly from browser/client components. All AI calls must go through the Next.js Server App Router API boundary.


## PDF Parsing Contract
V1 will use `PDF.js` for PDF processing. It must distinguish states: VALID_TEXT_PDF, UNSUPPORTED_SCANNED_PDF, INVALID_PDF, UNREADABLE_PDF. It must preserve page-level provenance.


## Comprehensive Testing Requirements
- **Unit**: classification, applicability, effective-date filtering, deterministic action mapping, context validation.
- **Integration**: PDF extraction, Legal KB retrieval, provider adapter, AI validation.
- **Adversarial**: prompt injection in PDF, fabricated legal source, invalid source ID, fabricated evidence, malformed AI response.
- **Security**: API key exposure, PII leakage, unsafe logging, browser persistence.
- **E2E**: Full supported workflow (Upload -> Understand -> Flag -> Compare -> Act -> Prepare) and safe failure workflows (UNKNOWN, UNSUPPORTED, JURISDICTION_UNCLEAR, INSUFFICIENT_SOURCE, AI provider failure).
