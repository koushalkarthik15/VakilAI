# Document 00 — Project Vision

**Project:** Indian Legal AI Assistant
**Version:** v0.1.0
**Status:** FROZEN for Review
**Target:** PromptWars Virtual — AI for Legal Assistance & Access
**Initial Jurisdiction:** Hyderabad, Telangana, India
**Primary Languages:** English, Telugu, Hindi

---

## 1. Executive Vision

The Indian Legal AI Assistant is a privacy-conscious, multilingual AI assistance system designed to help ordinary users **understand and prepare around legal documents before consulting a qualified legal professional**.

The product is not a legal advice service, lawyer replacement, legal representation platform, or generic chatbot.

It is a structured preparation workflow that transforms a difficult legal document into:

1. a plain-language understanding,
2. identifiable potential risks and inconsistencies,
3. a comparison against relevant legal/contractual expectations,
4. concrete next actions, and
5. an optional attorney-preparation package.

The first release deliberately limits its scope to two high-value document categories:

* **Rental / Lease Agreements**
* **Freelancer / Service Agreements**

The initial jurisdiction is **Telangana, with central Indian laws applicable to users in Hyderabad**.

The initial language set is:

* English
* Telugu
* Hindi

Additional Indian languages and document categories are explicitly deferred until the core workflow is reliable.

---

# 2. Problem

Legal documents are difficult for ordinary users to understand because they combine:

* complex legal terminology,
* lengthy clauses,
* unfamiliar obligations,
* jurisdiction-specific requirements,
* ambiguous wording,
* hidden financial or procedural consequences,
* and language barriers.

For many users, the practical problem is not necessarily "I need a lawyer right now."

It is:

> **"I have this document in front of me. What does it actually say, what should I pay attention to, and what should I ask a lawyer?"**

Existing generic AI chat interfaces can answer questions about legal documents, but a conversational interface alone does not provide sufficient structure, evidence traceability, document synchronization, or legal-source grounding.

The product therefore treats legal assistance as a **workflow**, not a conversation.

---

# 3. Product Thesis

The system follows five core principles.

### 3.1 Assistance Before Advice

The product helps users prepare for professional legal consultation.

It does not present AI-generated output as a substitute for advice from a qualified legal professional.

This principle is embedded in the product workflow and terminology rather than being implemented solely through a disclaimer.

---

### 3.2 Evidence Before Claims

A substantive legal claim must be supported by a known legal source.

The AI must not independently invent:

* statutes,
* sections,
* regulations,
* court decisions,
* government procedures,
* legal authorities,
* or source URLs.

When the application's verified legal knowledge base does not contain sufficient support for a claim, the system must explicitly represent that limitation rather than generating a plausible legal conclusion.

---

### 3.3 AI for Reasoning, Deterministic Logic for Deterministic Work

AI is used when semantic interpretation or reasoning provides genuine value.

Deterministic application logic owns operations such as:

* PDF extraction,
* document/session management,
* legal-rule retrieval,
* source mapping,
* known-rule matching,
* basic comparisons,
* routing,
* date/deadline calculations where rules are known,
* government-portal routing,
* validation,
* and PDF generation.

The project will **not introduce unnecessary AI complexity merely to demonstrate AI usage**.

Conversely, deterministic systems will not be forced to perform tasks that genuinely require semantic interpretation merely to avoid an API call.

---

### 3.4 Privacy by Architecture

User documents are session-oriented and remain under the user's control.

The application will not build a persistent document-storage platform in v1.

The original document and extracted evidence are retained locally for the active workflow, while personally identifiable information is minimized or pseudonymized before external AI processing where practical.

The application must not claim stronger privacy guarantees than the implementation actually provides.

---

### 3.5 Judge-Visible Engineering Quality

The product is being built for a technical evaluation environment.

Important engineering qualities must therefore be both:

1. genuinely implemented, and
2. demonstrable to an evaluator.

Security, accessibility, testing, source grounding, efficiency, architectural separation, and AI boundaries should be visible through the implementation and demo rather than existing only as documentation claims.

Detailed evaluation strategy is defined in **Document 06 — Evaluation & Score Optimization Strategy**.

---

# 4. Target Users

The initial release focuses on two concrete user groups.

## 4.1 Tenants

Users reviewing rental or lease agreements before signing.

Typical concerns include:

* security deposits,
* rent and payment terms,
* notice periods,
* termination clauses,
* maintenance obligations,
* penalties,
* unusual restrictions,
* ambiguous language,
* missing provisions,
* and clauses that may require professional review.

The system provides preparation material rather than determining whether the user should sign.

---

## 4.2 Freelancers / Independent Service Providers

Users reviewing service or freelancer agreements.

Typical concerns include:

* payment terms,
* milestones,
* deliverables,
* termination,
* intellectual property,
* confidentiality,
* liability,
* restrictive clauses,
* dispute resolution,
* notice requirements,
* and ambiguous obligations.

The system helps the user understand the agreement and identify questions or issues to raise with a professional.

---

# 5. Initial Jurisdiction

The v1 jurisdiction is:

> **Telangana law and central Indian laws applicable to users/documents in Hyderabad.**

This is intentionally narrower than attempting to build a generic "India-wide" legal assistant.

The legal knowledge base will distinguish between:

* central legislation,
* Telangana-specific rules/procedures,
* official courts and tribunals,
* Telangana government departments and portals,
* and other sources according to the source hierarchy defined in Document 10.

The system must represent jurisdiction states such as:
`SUPPORTED`
`OUTSIDE_SCOPE`
`JURISDICTION_UNCLEAR`

If jurisdiction cannot be established sufficiently, the system must not confidently apply Telangana-specific rules. Jurisdiction must be represented explicitly in the application's legal-analysis context.

---

# 6. Initial Language Strategy

The first release supports:

* **English**
* **Telugu**
* **Hindi**

The internal legal-analysis representation remains language-neutral and canonical.

The system should not independently perform separate legal reasoning for each language.

Instead:

```text
Document
    ↓
Canonical analysis
    ↓
Structured findings + evidence + sources
    ↓
English / Telugu / Hindi presentation
```

This ensures that changing the display language does not trigger unnecessary re-analysis or create inconsistent legal conclusions.

Additional languages are deferred until the v1 workflow has demonstrated reliability.

---

# 7. Initial Document Scope

### Supported

1. Rental / Lease Agreement
2. Freelancer / Service Agreement

### Not supported in v1

* Employment contracts
* Offer letters
* Property-sale documents
* Consumer documents
* Family/legal documents
* Court filings
* Government forms
* Images/photos of documents
* Arbitrary legal documents outside the supported categories

The system must handle classification using states such as:
`RENTAL_LEASE`
`FREELANCER_SERVICE`
`UNKNOWN`
`UNSUPPORTED`

Unsupported documents must be identified and handled explicitly (e.g., informing the user that the document type is outside v1 scope) rather than silently analyzed as a supported category.

---

# 8. Input Strategy

The v1 system accepts **PDF documents only**.

The initial workflow is:

```text
PDF Upload
    ↓
File Validation
    ↓
PDF Text Extraction
    ↓
Document Structuring
    ↓
Document Classification
    ↓
Legal Assistance Pipeline
```

Photo/document OCR is intentionally deferred.

The architecture should allow a future OCR input layer without requiring a redesign of the downstream legal-analysis pipeline.

---

# 9. Core User Workflow

The product uses a five-stage assistance pipeline.

## Stage 1 — Understand

The system converts the document into a plain-language explanation in the user's selected language.

It identifies relevant:

* parties/roles,
* obligations,
* payments,
* dates,
* important clauses,
* and document structure.

The original document remains available alongside the explanation.

The system must not infer facts merely because a contract does not mention something. Use `NOT_STATED` rather than inferring facts unless the contract or an applicable verified legal rule establishes that conclusion.

---

## Stage 2 — Flag

The system identifies potential issues requiring attention.

The stage uses the following processing boundary:
* **Known deterministic clause/rule matching:** Deterministic processing.
* **Semantic interpretation required:** Groq.

Each finding should reference:

* the original clause,
* the finding type,
* severity where applicable,
* relevant legal rule IDs,
* supporting source IDs,
* and an explanation.

Potential issue categories include:

* unusual provision,
* possible legal conflict,
* missing provision,
* ambiguity,
* inconsistent obligation,
* or insufficiently supported claim.

The system must distinguish **"potential issue requiring review"** from a definitive legal conclusion where the available evidence does not justify one.

---

## Stage 3 — Compare

For a single supported document, the system compares relevant clauses against the application's structured legal/contractual baseline.

The stage uses the following processing boundary:
* **Deterministic comparison possible:** Deterministic processing.
* **Semantic comparison required:** Groq.

For multiple documents, the system may identify relationships between documents.

The initial inconsistency taxonomy is:

1. **Direct contradiction**
2. **Deviation from norm**
3. **Coverage gap**
4. **Ambiguity**

---

## Stage 4 — Act

The system converts identified issues into a prioritized action list. This stage is primarily deterministic. There is no autonomous external legal action.

Actions may include:

* reviewing a particular clause,
* clarifying a term with the other party,
* collecting a missing document,
* checking a government source,
* preparing a question for an advocate,
* or seeking professional legal review.

Where applicable, the application uses known Telangana/Hyderabad routing information.

Routing and procedural rules are deterministic wherever possible.

---

## Stage 5 — Prepare

Stage 5 is **opt-in**.

The user explicitly requests preparation material.

Possible outputs include:

### Attorney Preparation Sheet

A structured summary containing:

* relevant document facts,
* important clauses,
* identified potential issues,
* supporting sources,
* unresolved questions,
* and smart questions to ask a lawyer.

It is explicitly presented as preparation material, not as a legal brief or legal advice.

### Optional Draft

Where supported, the system may generate a starting-point document.

Generated drafts must be clearly labelled as AI-generated preparation material and not final legal documents.

### Export

The user may export preparation outputs as PDF.

---

# 10. Document Evidence Model

The original uploaded document is the primary evidence source for document-specific facts.

Extracted content receives stable identifiers.

Example:

```text
document_001
    ├── page_01
    ├── page_02
    └── clauses
          ├── clause_001
          ├── clause_002
          └── clause_003
```

AI findings reference these identifiers.

Therefore:

```text
Finding
   ↓
clause_id
   ↓
original extracted clause
   ↓
page/document location
```

This enables synchronization between:

* document highlighting,
* AI explanations,
* comparison results,
* and attorney preparation output.

The system should not rely solely on AI-generated summaries as evidence.

---

# 11. AI Context Architecture

Each AI stage produces a structured context object for downstream stages.

The entire previous response is **not** passed blindly to the next API call.

Instead:

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

Each context contains only the information required by subsequent stages.

Stable clause IDs, rule IDs, and source IDs allow downstream stages to retrieve the original evidence without repeatedly transmitting large amounts of text.

This provides:

* lower token usage,
* lower latency,
* lower API cost/quota consumption,
* more predictable prompts,
* better traceability,
* and easier testing.

Detailed schemas are defined in **Document 11 — AI Context & Data Contracts**.

---

# 12. Legal Claim Protocol

The Legal Claim Protocol is a mandatory system invariant.

The conceptual flow is:

```text
Legal Knowledge Base
        ↓
Applicable Rule
        ↓
Supporting Source
        ↓
AI Reasoning
        ↓
Structured Finding
        ↓
User-facing Legal Claim
```

Every substantive legal claim must have a supporting source.

The AI may explain supplied legal material, but it must not manufacture the underlying authority.

Every finding should be traceable through:

```text
Finding
 → Rule ID
 → Source ID
 → Source URL
```

If sufficient support does not exist:

```text
INSUFFICIENT_SOURCE
```

must be returned rather than an invented legal conclusion.

Source URLs are supplied by the application's verified knowledge base; the AI must not generate them.

---

# 13. Legal Knowledge Base

Known legal rules will be stored in a structured database so that the same information does not need to be rediscovered by an AI model on every request.

The initial knowledge base is restricted to:

> **Telangana + central laws applicable in Hyderabad**

Core entities include:

```text
LegalRule
LegalSource
ClausePattern
GovernmentRoute
LegalDomain
```

The database is the application's structured legal knowledge layer.

The AI receives only the rules relevant to the current document and analysis stage rather than the entire database.

Detailed design is defined in **Document 10 — Legal Knowledge Base Specification**.

---

# 14. Legal Source Hierarchy

Sources are classified into tiers.

### Tier 1 — Primary Official Sources

Examples include:

* official legislation,
* official government publications,
* authoritative statutory repositories.

### Tier 2 — Official Judicial Sources

Examples include:

* courts,
* tribunals,
* official judicial publications.

### Tier 3 — Official Government Sources

Examples include:

* government departments,
* official portals,
* official procedural guidance.

### Tier 4 — Established Secondary Legal Sources

Useful for contextual information but not independently sufficient for a core legal claim where a higher-tier source is available.

### Tier 5 — General Secondary Sources

Useful for background discovery only.

The detailed rules governing how each tier may be used are defined in Document 10.

---

# 15. Privacy Architecture

The application is designed around a session-only model.

The intended architecture is:

```text
User PDF
   ↓
Browser session
   ↓
Local extraction
   ↓
Local session state
   ↓
PII minimization / pseudonymization
   ↓
Server-side AI API
```

The original document remains available locally for the user's document view.

Before external AI processing, obvious personally identifiable information should be pseudonymized where practical.

Example:

```text
Rahul Sharma
      ↓
[TENANT_NAME]

rahul@example.com
      ↓
[EMAIL_01]
```

The same placeholder must remain stable throughout the case.

The system should describe this accurately as **PII minimization/pseudonymization**, not claim that the data has been mathematically anonymized.

---

# 16. Client Session State

Zustand is the primary session-state mechanism.

The session contains:

* document state,
* extracted clauses,
* document type,
* language,
* jurisdiction,
* AI context objects,
* findings,
* source mappings,
* comparison results,
* action items,
* and UI state.

Sensitive original documents should not be unnecessarily persisted to long-term browser storage.

The intended default is an active client session rather than a persistent document account.

---

# 17. AI Provider Strategy

The system uses provider abstractions rather than coupling application components directly to individual AI APIs.

Conceptually:

```text
AIProvider
   ├── GeminiProvider
   └── GroqProvider
```

The application should not hard-code provider-specific logic throughout the UI or business layer.

### Gemini

Used primarily for:

* Stage 1 understanding,
* multilingual presentation,
* Stage 5 preparation,
* optional generation tasks.

### Groq

Used primarily for:

* Stage 2 reasoning,
* Stage 3 semantic reasoning where required.

The exact models are not frozen in this document and must be verified against the models accessible through the project's available accounts before implementation. Model selection is subject to availability verification.

Two Gemini API keys are available and may be used through controlled failover, rate-limit handling, quota resilience, and availability. They must not be used to duplicate identical inference unnecessarily.

One Groq API key is available and its model availability should be verified during implementation.

API keys must never be exposed to the browser.

---

# 18. AI Quota Strategy

The system minimizes API usage through:

* one-time PDF extraction,
* structured context handoffs,
* local session caching,
* applicable-rule filtering,
* deterministic comparison,
* user-triggered Stage 5 generation,
* no duplicate analysis for language changes,
* API call limits per stage,
* and provider-level quota management.

The project does not define an exact mandatory number of AI calls per case. Instead, each stage has permitted AI responsibilities and an intended AI budget.

AI should be invoked only when semantic reasoning or generation is actually required. The system should minimize unnecessary calls, repeated context, repeated document processing, and repeated legal-rule retrieval. 

However, do not artificially avoid an AI call when semantic reasoning genuinely requires it.

The principle is:

> **Do not spend AI quota on work that the application can perform deterministically and reliably.**

---

# 19. Technology Direction

The initial technical direction is:

```text
Frontend
    Next.js
    TypeScript
    Tailwind CSS
    Framer Motion
    Zustand
    next-intl

Document
    PDF.js
    pdf-lib

Testing
    Vitest
    React Testing Library

AI
    Gemini
    Groq

Client-side ML
    Optional Transformers.js semantic classifier

Backend/API boundary
    Next.js server-side API routes
```

Transformers.js is not a mandatory v1 subsystem.

Document classification should initially use the simplest reliable mechanism appropriate to the two supported document categories.

A semantic Transformers.js classifier may be introduced if testing demonstrates that deterministic classification is insufficient.

The project must not add a large client-side model solely to satisfy an architectural preference for "using AI less."

---

# 20. Accessibility Vision

Accessibility is part of the product rather than a post-processing task.

The interface should provide:

* keyboard navigation,
* screen-reader-compatible structure,
* ARIA labels,
* sufficient contrast,
* visible focus states,
* non-colour-only risk indicators,
* accessible stage navigation,
* readable regional-language typography,
* and synchronized document/highlight explanations.

Risk severity must never be communicated by colour alone.

---

# 21. Core UI Vision

The main workspace conceptual layout is an initial functional baseline, not a permanently frozen visual design. Visual design is not considered final and styling can be redesigned later.

The main workspace uses a two-pane structure.

### Left Pane

Persistent document viewer containing:

* the uploaded PDF,
* clause-level highlighting,
* risk indicators,
* page navigation,
* and multi-document controls where applicable.

### Right Pane

Stage-driven assistance interface containing:

* sticky stage navigation,
* explanations,
* findings,
* comparisons,
* actions,
* and preparation outputs.

The document and AI explanation remain synchronized through stable clause IDs.

The design should prioritize:

> **Clarity before decoration.**

Animation should communicate state changes rather than distract from the legal content.

---

# 22. What This Product Is Not

The v1 system is explicitly **not**:

* a lawyer,
* a legal advice service,
* a legal representation service,
* a court filing service,
* a document-storage platform,
* a generic chatbot,
* an India-wide legal database,
* an OCR platform,
* or an autonomous legal decision-maker.

It does not tell a user:

> "You should sign this."

or:

> "You definitely have a legal case."

Instead, it provides structured preparation material backed by identifiable evidence and sources.

---

# 23. Success Criteria

The v1 product is considered successful when a user can:

1. Select English, Telugu, or Hindi.
2. Upload a supported PDF.
3. Have the document recognized as Rental/Lease or Freelancer/Service Agreement.
4. Read a plain-language explanation.
5. See potential issues tied to actual clauses.
6. Understand why an issue was flagged.
7. Open the supporting legal source for substantive legal claims.
8. Compare relevant terms against the structured baseline.
9. Receive concrete next actions.
10. Generate an attorney preparation sheet on demand.
11. Export preparation material as PDF.
12. Complete the workflow without the application storing their document as a persistent account record.
13. Navigate the primary workflow accessibly.
14. Demonstrate the above functionality reliably using free-tier AI resources.

---

# 24. Definition of Done for the Vision

The project will proceed to architectural design only when the following are accepted:

* [ ] v1 scope is limited to Rental/Lease and Freelancer/Service Agreements.
* [ ] Initial jurisdiction is Telangana + applicable central Indian law.
* [ ] Initial languages are English, Telugu and Hindi.
* [ ] PDF-only input is accepted for v1.
* [ ] Photo OCR is deferred.
* [ ] Google NLP is removed.
* [ ] AI is not required for every operation.
* [ ] Legal Claim Protocol is mandatory.
* [ ] Legal sources are structured and traceable.
* [ ] User documents are session-oriented and locally controlled.
* [ ] PII minimization/pseudonymization is part of the processing pipeline.
* [ ] AI context is transferred through structured contracts.
* [ ] Known legal rules are reusable from the application's database.
* [ ] AI quota conservation is an explicit architectural objective.
* [ ] Evaluation/judge visibility is treated as a first-class requirement.
* [ ] Exact AI models remain subject to verification before the AI contract is frozen.

---

# 25. Document Authority Model

This document establishes the **product vision and scope**. 

The documentation uses a domain ownership model rather than a simple linear authority chain. Document 00 owns the product vision. It does not independently define:

* detailed system architecture,
* implementation conventions,
* AI prompts,
* legal database schemas,
* individual sprint tasks,
* or coding standards.

Those concerns are delegated to the subsequent project documents.

The Decision Log (Document 08) serves as cross-cutting historical decision evidence and is not a low-level document beneath implementation.

If a later document conflicts with this Vision, the conflict must be explicitly recorded and resolved through the project's Decision Log rather than silently overriding this document.

**Next document:** Document 01 — System Architecture
