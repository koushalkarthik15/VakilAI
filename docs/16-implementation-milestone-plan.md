# 16 — Implementation Milestone Plan

**Project:** Indian Legal AI Assistant
**Status:** FROZEN
**Version:** v0.1.0

---

## 1. Environment Dependencies

| Dependency | Classification | Notes |
| ---------- | -------------- | ----- |
| Node.js (v20+) | Needs verification | Core runtime |
| npm / pnpm / yarn | Needs verification | Package manager |
| MongoDB | Needs verification | For Legal KB persistent runtime store |
| Gemini API Keys (2) | Needs verification | Controlled failover / capacity |
| Groq API Key (1) | Needs verification | Required for fast deterministic/comparison reasoning |
| Next.js App Router | Expected | Application framework |
| PDF.js | Expected | Strict PDF parsing |

---

## 2. NON-NEGOTIABLE TEST INTEGRITY RULE

**Never Circumvent Test Failures**
Agents must NEVER hide or circumvent test failures simply to achieve a green test suite. Prohibited behavior includes: deleting tests, weakening assertions without justification, commenting out failing tests, skipping tests, arbitrary `xfail`, excluding failing files, changing config solely to avoid a failing test, replacing real behavior with mocks solely to make tests pass, suppressing exceptions, or changing expected outputs without identifying the underlying contract change.

Every failure must be classified as:
1. Implementation defect
2. Test defect
3. Approved contract/documentation change
4. Environment/tooling failure

For category 4, record the command, exact error, and required user action. A milestone cannot be marked complete while relevant tests are failing.

---

## 3. TERMINAL / POWERSHELL BOUNDARY

**Explicit PowerShell Access Rule**
The coding agent may execute commands using its available terminal capabilities. If a required operation specifically requires explicit PowerShell execution and the agent cannot reliably execute it because of the environment issue:
**STOP and ask the user to run the command manually.**

Provide:
1. Exact command
2. Why it is required
3. Expected result
4. Request user to paste output back

Do NOT claim it executed, fabricate output, or silently assume success.

---

## 4. Repository vs Documentation (Reality Check)

| Area | Status | Notes |
| ---- | ------ | ----- |
| Application Scaffold | NOT IMPLEMENTED | Repository currently only contains `docs/` and `agents/` |
| Next.js Boundaries | NOT IMPLEMENTED | Not yet created |
| MongoDB KB Setup | NOT IMPLEMENTED | Not yet created |
| AI Provider Integrations | NOT IMPLEMENTED | Not yet created |
| PDF Pipeline | NOT IMPLEMENTED | Not yet created |

*Note: Since implementation has not started, "NOT IMPLEMENTED" is the expected state. There are no conflicts.*

---

## 5. Implementation Milestones

### Sprint 0 — Engineering Foundation

#### S0-M0.1: Repository Setup & Next.js Scaffold
* **Objective:** Scaffold Next.js App Router and define server/client boundaries.
* **Scope:** Next.js init, layout structure, strict server-only component rules.
* **Out of Scope:** AI calls, UI layout, databases.
* **Dependencies:** Node.js, npm.
* **Documentation:** 01-system-architecture.md, 09-coding-standards.md
* **Agent Personas:** Architect, Backend Engineer
* **Workflow:** Development Workflow
* **Implementation Boundaries:** API boundary separation.
* **Acceptance Criteria:** Next.js dev server compiles successfully with clear boundary separation for Server Actions/Routes.
* **Testing Requirements:** Framework initialization smoke test.

#### S0-M0.2: Application Architecture Boundaries
* **Objective:** Establish feature-first architecture, server/client boundaries, and structural guardrails.
* **Scope:** Repository directory structure (`features/`, `core/`, `lib/`), dependency rules, boundary verification.
* **Out of Scope:** AI calls, Zod schemas, PDF parsing, business logic.
* **Dependencies:** S0-M0.1
* **Documentation:** 01-system-architecture.md
* **Agent Personas:** Architect
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Structural boundary separation.
* **Acceptance Criteria:** Path aliases configure boundaries. No circular dependencies.
* **Testing Requirements:** Architectural dependency verification (e.g., TS path checks).

#### S0-M0.3: Session State Foundation
* **Objective:** Scaffold Zustand store for active session state without sensitive persistence.
* **Scope:** Zustand store for UI document flow state.
* **Out of Scope:** Persistent user accounts, localStorage persistence for PDFs/case data.
* **Dependencies:** S0-M0.2
* **Documentation:** 03-engineering-rules.md
* **Agent Personas:** Frontend Engineer, Backend Engineer
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Purely transient client-side state.
* **Acceptance Criteria:** Mock state updates correctly propagate to the store without writing to localStorage.
* **Testing Requirements:** Unit tests for state updates and persistence constraints.

#### S0-M0.4: API Boundary & Error Contract Foundation (PROPOSED SCOPE CHANGE)
* **Objective:** Establish reusable API response and error contracts to prevent incompatible schemas.
* **Scope:** `ApiResponse` contract, HTTP status mapping, error sanitization utilities.
* **Out of Scope:** Zod parsing, Document workflows, Request tracing.
* **Dependencies:** S0-M0.3
* **Documentation:** 01-system-architecture.md
* **Agent Personas:** Architect, Backend Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Purely HTTP serialization and error boundary.
* **Acceptance Criteria:** Domain errors safely map to HTTP responses without leaking stack traces.
* **Testing Requirements:** Tests ensuring unexpected errors are sanitized for the client.

#### S0-M0.5: Zod Schema Context Definitions (MOVED FROM M0.2)
* **Objective:** Implement exact Zod schemas based on the normative AI Context Contracts.
* **Scope:** DocumentContext, UnderstandingContext, AnalysisContext, ComparisonContext, ActionContext schemas.
* **Out of Scope:** Context generation.
* **Dependencies:** S0-M0.4
* **Documentation:** 11-ai-context-contracts.md
* **Agent Personas:** AI Engineer, Architect
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Pure deterministic type validation.
* **Acceptance Criteria:** Zod schemas strictly validate mock data corresponding to context contracts.
* **Testing Requirements:** Unit tests for schema validation success and explicit failure constraints.

---

### Sprint 1 — Document Processing

#### S1-M1.1: PDF Ingestion & Provenance
* **Objective:** Securely parse PDFs and map text to page-level provenance.
* **Scope:** PDF.js integration, text extraction, page-mapping, handling corrupted files.
* **Out of Scope:** OCR, scanned-PDF extraction.
* **Dependencies:** S0-M0.3, PDF.js
* **Documentation:** 09-coding-standards.md
* **Agent Personas:** Backend Engineer, QA Engineer
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Untrusted PDF parsing boundary.
* **Acceptance Criteria:** Valid text PDF produces deterministic string mapped to page numbers. Scanned PDF correctly yields `UNSUPPORTED_SCANNED_PDF`.
* **Testing Requirements:** Integration tests for parsing. Adversarial tests for malformed PDFs.

#### S1-M1.2: Deterministic Document Classification
* **Objective:** Deterministically classify ingested text to halt out-of-scope documents.
* **Scope:** Keyword/pattern identification for Rental/Freelance vs Unknown/Unsupported.
* **Out of Scope:** Machine learning, AI classification.
* **Dependencies:** S1-M1.1
* **Documentation:** 05-feature-freeze.md
* **Agent Personas:** Backend Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Deterministic logic boundary (pre-AI).
* **Acceptance Criteria:** Employment contract -> `UNSUPPORTED`. Corrupted text -> `UNKNOWN`. Valid lease -> `RENTAL_LEASE`.
* **Testing Requirements:** Unit tests for all classification branches.

---

### Sprint 2 — Legal Knowledge Foundation

#### S2-M2.1: Legal KB Schema & Deterministic Engine
* **Objective:** Define the MongoDB schema and retrieval logic for the Legal KB.
* **Scope:** Mongoose/MongoDB schemas for LegalDomain, LegalRule, LegalSource.
* **Out of Scope:** Vector DBs, PDF storage in MongoDB.
* **Dependencies:** S0-M0.2
* **Documentation:** 10-legal-knowledge-base.md
* **Agent Personas:** Backend Engineer, Legal Safety
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Application-knowledge boundary.
* **Acceptance Criteria:** Schemas reject un-versioned rules and rules without source provenance.
* **Testing Requirements:** Unit tests for schema validation and effective-date filtering deterministic logic.
*(Note: READY FOR IMPLEMENTATION. Live MongoDB integration: ENVIRONMENT VERIFICATION REQUIRED).*

#### S2-M2.2: MongoDB Seeding & Verification
* **Objective:** Seed the MongoDB instance with the initial verified source data.
* **Scope:** Seed script, source-backed data insertion.
* **Out of Scope:** Inventing statutes.
* **Dependencies:** S2-M2.1, MongoDB environment.
* **Documentation:** 10-legal-knowledge-base.md
* **Agent Personas:** Backend Engineer, Legal Safety
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Runtime persistence boundary.
* **Acceptance Criteria:** Seed script populates MongoDB and rules can be retrieved by jurisdiction/date.
* **Testing Requirements:** Integration tests for DB retrieval.
*(Note: ENVIRONMENT VERIFICATION REQUIRED).*

---

### Sprint 3 — AI Infrastructure

#### S3-M3.1: Provider Abstraction & Safe Failover
* **Objective:** Implement server-side adapters for Gemini and Groq with key failover logic.
* **Scope:** Server-side API endpoints, SDK integrations, primary/secondary Gemini failover for quotas.
* **Out of Scope:** Exposing API keys to the client, arbitrary key rotation.
* **Dependencies:** S0-M0.2, AI API Keys.
* **Documentation:** 02-ai-development-contract.md, 09-coding-standards.md
* **Agent Personas:** AI Engineer, Security/Privacy
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Strict server-side route handlers.
* **Acceptance Criteria:** Requests correctly route to provider and safely failover if primary key hits limit.
* **Testing Requirements:** Security tests preventing client-side keys.
*(Note: READY FOR IMPLEMENTATION. Live API call integration: ENVIRONMENT VERIFICATION REQUIRED).*

#### S3-M3.2: AI Output Validation Boundary
* **Objective:** Ensure all AI output passes strict Zod schema validation before mutating state.
* **Scope:** Validation middleware mapping AI responses to Zod schemas (from S0-M0.2).
* **Out of Scope:** Domain business logic.
* **Dependencies:** S3-M3.1
* **Documentation:** 11-ai-context-contracts.md
* **Agent Personas:** AI Engineer, Backend Engineer
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Trust boundary for external AI input.
* **Acceptance Criteria:** Malformed AI JSON safely errors out without crashing the application or returning a half-formed domain state.
* **Testing Requirements:** Integration tests with malformed mock AI responses.

---

### Sprint 4 — Understand

#### S4-M4.1: DocumentContext & UnderstandingContext Integration
* **Objective:** Connect the PDF text to the Gemini AI provider for initial fact extraction.
* **Scope:** Prompt construction for understanding, generating `UnderstandingContext`, preserving `NOT_STATED`.
* **Out of Scope:** Legal comparison.
* **Dependencies:** S1-M1.2, S3-M3.2
* **Documentation:** 11-ai-context-contracts.md
* **Agent Personas:** AI Engineer, Backend Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Distinction between Document Fact and AI Interpretation.
* **Acceptance Criteria:** AI extracts structured facts (e.g., Parties, Dates) and explicitly returns `NOT_STATED` for missing info.
* **Testing Requirements:** Integration tests for correct structured schema output.

---

### Sprint 5 — Flag

#### S5-M5.1: Deterministic Applicability Filtering
* **Objective:** Retrieve and filter legal rules relevant to the UnderstandingContext.
* **Scope:** Retrieving rules from MongoDB, filtering by jurisdiction, document type, and effective dates.
* **Out of Scope:** AI semantic reasoning.
* **Dependencies:** S2-M2.2, S4-M4.1
* **Documentation:** 10-legal-knowledge-base.md
* **Agent Personas:** Backend Engineer, Legal Safety
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Deterministic rule evaluation.
* **Acceptance Criteria:** Only rules effective during the contract period and within the jurisdiction are retrieved.
* **Testing Requirements:** Unit tests for filtering engine.

#### S5-M5.2: AI Semantic Flagging
* **Objective:** Use Groq to flag material issues based on the filtered rules.
* **Scope:** Groq prompt construction, severity rating assignment, generating `AnalysisContext`.
* **Out of Scope:** Faking rules.
* **Dependencies:** S5-M5.1, S3-M3.2
* **Documentation:** 02-ai-development-contract.md
* **Agent Personas:** AI Engineer, Legal Safety
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Distinction between Severity and Confidence.
* **Acceptance Criteria:** Flags map to verified rules. Missing rules correctly map to `INSUFFICIENT_SOURCE`.
* **Testing Requirements:** Adversarial tests for hallucinated legal claims.

---

### Sprint 6 — Compare

#### S6-M6.1: Fact-to-Rule Comparison Logic
* **Objective:** Generate a structured comparison of contract facts vs. applicable law.
* **Scope:** Groq comparison reasoning, generating `ComparisonContext`.
* **Out of Scope:** Unrestricted legal research.
* **Dependencies:** S5-M5.2
* **Documentation:** 11-ai-context-contracts.md
* **Agent Personas:** AI Engineer, Legal Safety
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Semantic reasoning bound to provided rules.
* **Acceptance Criteria:** Outputs explicitly list material differences with exact evidence and source IDs.
* **Testing Requirements:** E2E integration test for the comparison chain.

---

### Sprint 7 — Act

#### S7-M7.1: Deterministic Action Mapping
* **Objective:** Deterministically map AI findings to verified procedural actions.
* **Scope:** Mapping logic matching flagged issues to `GovernmentRoute`s.
* **Out of Scope:** AI inventing government procedures.
* **Dependencies:** S6-M6.1, S2-M2.2
* **Documentation:** 11-ai-context-contracts.md
* **Agent Personas:** Backend Engineer, Legal Safety
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Strictly deterministic action selection. No AI generation.
* **Acceptance Criteria:** A flagged issue correctly matches a verified route template. If none exist, no route is fabricated.
* **Testing Requirements:** Unit tests proving actions are deterministic.

---

### Sprint 8 — Prepare + Multilingual

#### S8-M8.1: Preparation Template Generation
* **Objective:** Use Gemini to draft user-requested preparation documents from canonical findings.
* **Scope:** PrepareContext generation, templating.
* **Out of Scope:** Autonomous filings.
* **Dependencies:** S7-M7.1
* **Documentation:** 02-ai-development-contract.md
* **Agent Personas:** AI Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Output strictly relies on canonical facts.
* **Acceptance Criteria:** Drafted document relies exclusively on verified sources and `ActionContext`.
* **Testing Requirements:** Integration tests for preparation constraints.

#### S8-M8.2: Presentation Language Switching
* **Objective:** Present the canonical findings in English, Telugu, or Hindi.
* **Scope:** Language translation layer at the presentation boundary.
* **Out of Scope:** Rerunning core legal reasoning for translation.
* **Dependencies:** S8-M8.1
* **Documentation:** 01-system-architecture.md
* **Agent Personas:** Frontend Engineer, AI Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Presentation boundary.
* **Acceptance Criteria:** Switching to Telugu does not mutate rule IDs or source IDs.
* **Testing Requirements:** Unit tests ensuring findings payload structure remains unchanged across languages.

---

### Sprint 9 — Privacy + Security + Accessibility + Design

#### S9-M9.1: PII Pseudonymization Lifecycle
* **Objective:** Ensure PII mapping operates securely before AI processing.
* **Scope:** Identifying PII in `DocumentContext`, creating ephemeral memory map (e.g., `[TENANT_01]`), stripping original PII from AI payload, restoring it for UI.
* **Out of Scope:** Logging PII.
* **Dependencies:** S1-M1.2, S4-M4.1
* **Documentation:** 03-engineering-rules.md
* **Agent Personas:** Security/Privacy, Backend Engineer
* **Workflow:** Bug Fix / Feature Workflow
* **Implementation Boundaries:** Strict memory-only mapping.
* **Acceptance Criteria:** PII never reaches AI provider payload logs.
* **Testing Requirements:** Security tests preventing PII transmission to external provider logs.

#### S9-M9.3: A11y Hardening (DEFERRED)
* **Objective:** Audit UI for WCAG AA compliance and implement security headers.
* **Scope:** Keyboard navigation, semantic HTML, ARIA, HTTP security headers.
* **Status:** DEFERRED. The planned accessibility hardening requires a functional UI baseline. The current repository does not yet contain the required workspace/stage components, so meaningful accessibility hardening cannot yet be performed. This milestone will resume after the Frontend UI is implemented.
* **Dependencies:** S9-M9.6
* **Documentation:** 09-coding-standards.md
* **Agent Personas:** Frontend Engineer, QA Engineer
* **Workflow:** Development Workflow
* **Implementation Boundaries:** Client UI.
* **Acceptance Criteria:** No critical a11y violations. Security headers present on server routes.
* **Testing Requirements:** Accessibility testing tools (e.g. axe).

#### S9-M9.5: Product Design Sprint
* **Objective:** Transform existing requirements into an implementation-ready UI/UX direction.
* **Scope:** Reconcile design document concepts with frozen V1 scope, define V1 user journey, screen inventory, and accessibility requirements using Google Stitch MCP.
* **Dependencies:** S9-M9.2
* **Documentation:** vakil-ai-design-doc.md, 05-feature-freeze.md
* **Agent Personas:** Architect, UI/UX Designer
* **Workflow:** Planning / Design
* **Implementation Boundaries:** Prototyping only; no React implementation.
* **Acceptance Criteria:** Implementation-ready design specification is approved.
* **Testing Requirements:** None.

#### S9-M9.6: Frontend UI Implementation
* **Objective:** Implement the functional React components based on the approved S9.5 design.
* **Scope:** Scaffold main workspace, layout, document pane, stage navigation, and connect UI to existing backend APIs.
* **Dependencies:** S9-M9.5
* **Documentation:** vakil-ai-design-doc.md
* **Agent Personas:** Frontend Engineer
* **Workflow:** Feature Workflow
* **Implementation Boundaries:** Next.js Client Components and UI structure.
* **Acceptance Criteria:** Functional UI is connected to backend and renderable.
* **Testing Requirements:** React component tests and basic rendering validation.

---

### Sprint 10 — Integration + Testing

#### S10-M10.1: Full Pipeline E2E Integration
* **Objective:** Integrate all stages (Upload -> Understand -> Flag -> Compare -> Act -> Prepare).
* **Scope:** Full workflow integration testing, safe failure testing (UNKNOWN, UNSUPPORTED, INSUFFICIENT_SOURCE).
* **Out of Scope:** New feature development.
* **Dependencies:** S9-M9.3 (Accessibility), S9-M9.6 (Frontend UI)
* **Documentation:** 07-sprint-tracker.md
* **Agent Personas:** QA Engineer, Frontend Engineer
* **Workflow:** Review Workflow
* **Implementation Boundaries:** E2E system boundary.
* **Acceptance Criteria:** Full application can be traversed end-to-end with supported and unsupported documents.
* **Testing Requirements:** Complete E2E suites.

#### S10-M10.2: Adversarial & Prompt Injection Hardening
* **Objective:** Prove the system resists adversarial manipulation.
* **Scope:** Testing `IGNORE PREVIOUS INSTRUCTIONS` in PDFs, fabricated sources.
* **Dependencies:** S10-M10.1
* **Documentation:** 09-coding-standards.md
* **Agent Personas:** Security/Privacy, QA Engineer
* **Workflow:** Bug Fix Workflow
* **Implementation Boundaries:** Prompt validation bounds.
* **Acceptance Criteria:** Adversarial text is correctly ignored by AI behavior constraints.
* **Testing Requirements:** Adversarial testing suite execution.

---

### Sprint 11 — Evaluation Readiness

#### S11-M11.1: Evaluation Scenario Traceability
* **Objective:** Finalize traceability for Hackathon judges/evaluation.
* **Scope:** Ensure all evidence references properly map to original PDF pages in the UI.
* **Dependencies:** S10-M10.2
* **Documentation:** 06-evaluation-score-strategy.md
* **Agent Personas:** Architect, Frontend Engineer
* **Workflow:** Review Workflow
* **Implementation Boundaries:** Demo readiness boundary.
* **Acceptance Criteria:** UI clearly proves provenance back to the original source.
* **Testing Requirements:** Final manual UI regression.

#### S11-M11.2: Final Regression & Demo Prep
* **Objective:** Freeze code and finalize demo assets.
* **Scope:** Lock dependencies, run final test suites, prepare local demo fixtures if `INSUFFICIENT_SOURCE` requires demonstration.
* **Dependencies:** S11-M11.1
* **Agent Personas:** QA Engineer, Architect
* **Workflow:** Review Workflow
* **Implementation Boundaries:** Release boundary.
* **Acceptance Criteria:** 100% of required tests pass. No critical bugs open.
* **Testing Requirements:** Full CI/CD or local test pass.

---

## 6. Milestone Dependency Graph

```text
[S0] Foundation
 S0-M0.1 -> S0-M0.2 -> S0-M0.3
        ↓
[S1] Doc Processing      [S2] Legal KB             [S3] AI Infra
 S1-M1.1 -> S1-M1.2      S2-M2.1 -> S2-M2.2        S3-M3.1 -> S3-M3.2
        ↓                      ↓                         ↓
[S4] Understand
 S4-M4.1 (depends on S1, S3)
        ↓
[S5] Flag
 S5-M5.1 -> S5-M5.2 (depends on S2, S4, S3)
        ↓
[S6] Compare
 S6-M6.1 (depends on S5, S3)
        ↓
[S7] Act
 S7-M7.1 (depends on S6, S2)
        ↓
[S8] Prepare & Multilingual
 S8-M8.1 -> S8-M8.2 (depends on S7, S3)
        ↓
[S9] Privacy, Security & A11y
 S9-M9.1 -> S9-M9.2
        ↓
 [S9.5] Product Design Sprint
        ↓
 [S9.6] Frontend UI Implementation
        ↓
 [S9.3] Accessibility Hardening (Resumed)
        ↓
[S10] Integration & Testing
 S10-M10.1 -> S10-M10.2
        ↓
[S11] Evaluation Readiness
 S11-M11.1 -> S11-M11.2
```

---

## 7. Future Improvements / Post-V1 Design Candidates

### Purpose
The detailed design document contains several concepts and capabilities that are useful for future evolution of the product but are not part of the current V1 implementation scope. These must be preserved as documented future directions rather than removed, silently ignored, or treated as current requirements.

### Authority
* `docs/05-feature-freeze.md` remains the authoritative source for what is allowed in V1.
* The current V1 architecture, milestone plans, and implementation prompts must not treat future-improvement items as V1 requirements.
* `docs/vakil-ai-design-doc.md` may contain broader design concepts, but those concepts must be explicitly classified as either **V1 / Current Scope**, or **Future Improvement / Post-V1 Candidate**.

### Future Improvement Candidates

1. **Additional Legal Document Categories**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Feature-freeze constraint (V1 limited to Rental/Lease and Freelancer/Service Agreements).
   * **Potential future phase:** Post-V1 / Future Sprint
   * **Dependencies:** Expansion of Legal KB.

2. **Additional Languages (9-Language Support)**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Infrastructure/evaluation constraints. V1 limited to English, Telugu, Hindi.
   * **Potential future phase:** Post-V1
   * **Dependencies:** Prompt tuning and evaluation pipelines.

3. **OCR and Scanned-PDF/Image-Document Support**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Scope and complexity.
   * **Potential future phase:** Post-V1
   * **Dependencies:** Document ingestion pipeline upgrades, Gemini Vision integration.

4. **Conversational Legal Interaction ("Ask a Question")**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Safety and evaluation constraints. V1 is deterministic action-oriented.
   * **Potential future phase:** Future Sprint
   * **Dependencies:** Expanded guardrails.

5. **Topic-Based Legal Browsing ("Browse by Topic")**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Scope constraint.
   * **Potential future phase:** Post-V1

6. **Expanded Multi-Document Workflows**
   * **Status:** Not implemented in V1
   * **Reason for deferral:** Architecture constraint.
   * **Potential future phase:** Post-V1

### Important Distinction
A feature being documented under "Future Improvements" does **not** mean it is approved for implementation later. It means the concept has been intentionally preserved as a candidate for future product evolution. Future implementation requires a separate scope decision and must not be inferred from the design document alone.

---

## 8. First Implementation Milestone

**Milestone ID:** S0-M0.1
**Name:** Repository Setup & Next.js Scaffold
**Objective:** Scaffold Next.js App Router and define server/client boundaries.
**Why it comes first:** Establishes the foundational Next.js codebase required for all subsequent logic, schemas, and routes.
**Dependencies satisfied:** Documentation frozen, Node.js installed.
**Dependencies still missing:** Initial `npm init` / framework scaffold.
**Required Personas:** Architect, Backend Engineer
**Required Workflow:** Development Workflow
**Acceptance Criteria:** Next.js dev server compiles successfully with clear boundary separation for Server Actions/Routes.
**Required Tests:** Framework initialization smoke test.
**Environment Requirements:** Node.js (v20+), npm/pnpm.
**User Action Currently Required:** None.

*(Do NOT implement it until explicitly instructed.)*

---

## 8. Scope Protection Verification
- OCR / Scanned PDF processing: **ABSENT**
- Persistent User Accounts: **ABSENT**
- Nationwide Legal Coverage: **ABSENT (Telangana/Central only)**
- Additional Languages: **ABSENT (English, Telugu, Hindi only)**
- Autonomous Legal Actions: **ABSENT**
- Unrestricted Legal Research: **ABSENT**
- Unsupported ML/NLP (Transformers.js): **ABSENT**

---

## 9. Required Final Summary

| Sprint | Milestones | Primary Capability | First Dependency | Status |
| ------ | ---------: | ------------------ | ---------------- | ------ |
| 0 | 3 | Engineering Foundation | Node.js / npm | COMPLETE |
| 1 | 2 | Document Processing | S0-M0.3 | COMPLETE |
| 2 | 2 | Legal Knowledge Foundation | S0-M0.2 | COMPLETE |
| 3 | 2 | AI Infrastructure | S0-M0.2 | COMPLETE |
| 4 | 1 | Understand | S1, S3 | COMPLETE |
| 5 | 2 | Flag | S2, S3, S4 | COMPLETE |
| 6 | 1 | Compare | S3, S5 | READY |
| 7 | 1 | Act | S2, S6 | BLOCKED (Preceding Sprints) |
| 8 | 2 | Prepare + Multilingual | S3, S7 | COMPLETE |
| 9 | 2 | Privacy, Security, A11y | S1, S4, UI | BLOCKED (Preceding Sprints) |
| 10 | 2 | Integration + Testing | S8, S9 | BLOCKED (Preceding Sprints) |
| 11 | 2 | Evaluation Readiness | S10 | BLOCKED (Preceding Sprints) |

### Implementation Order
Execution should follow S0 through S11 sequentially. Sprints 1, 2, and 3 can be executed in parallel if independent teams are working, but S4 requires S1 and S3 to be complete.

### Critical Path
S0-M0.1 → S0-M0.2 → S3-M3.1/M3.2 → S1-M1.1/M1.2 → S4-M4.1 → S2-M2.1/M2.2 → S5-M5.1/M5.2 → S6-M6.1 → S7-M7.1 → S8-M8.1 → S10-M10.1 → S11-M11.2

### Environment Verification
* **MongoDB:** S2-M2.2 requires active DB string.
* **Gemini/Groq:** S3-M3.1 requires active `.env` API keys.
* **PDF.js:** S1-M1.1 requires node environment validation.

### MongoDB MCP

If MongoDB MCP is available in the development-agent environment, it may be used for development-time database inspection, schema verification, seed verification, and controlled debugging.

MongoDB MCP is **not a runtime architecture dependency** and must not replace the application's MongoDB data-access layer.

Before relying on it, the agent must verify that MongoDB MCP is actually available. If unavailable, use the project's normal MongoDB integration or request user assistance when explicit environment access is required.


### User Action Required
User must manually configure `.env.local` for Gemini, Groq, and MongoDB before integration milestones (S2-M2.2 and S3-M3.1) can pass their environment verification checks. No manual action blocks S0-M0.1.
