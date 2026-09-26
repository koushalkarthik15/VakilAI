# Vakil AI — Indian Legal AI Assistant

A privacy-conscious, multilingual AI assistance system that helps users understand and prepare around legal documents before consulting a qualified legal professional.

## Overview

Legal documents are complex, jurisdictional, and often difficult to understand. Existing generic AI chatbots can answer questions, but they lack structured evidence traceability, synchronization with the original document, and anchoring in verified legal sources. 

Vakil AI treats legal assistance as a **structured workflow**, not a conversation. It transforms difficult legal documents into plain-language understanding, identifies potential risks/inconsistencies, compares clauses against legal baselines, provides concrete next actions, and generates an optional attorney-preparation package.

## Key Design Principle: Why This Architecture?

> **Legal applicability is deterministic; semantic interpretation is AI-assisted; evidence and source validation form a boundary around AI output.**

Vakil AI does not use AI where deterministic code is safer and more reliable. Deterministic systems control classification, legal-rule applicability, source/evidence validation, schema validation, stable IDs, and state transitions; AI is used exclusively for semantic understanding and reasoning. This strict architectural boundary guarantees that the AI cannot autonomously invent legal claims or manufacture fake citations.

## V1 Scope

The initial release (V1) focuses on a specific scope to ensure high-quality reasoning and traceability.

### Supported
- **Document Types:** Rental / Lease Agreements, Freelancer / Service Agreements.
- **Input Format:** PDF only (text-based).
- **Languages:** English, Telugu, Hindi.
- **Jurisdiction:** Telangana law plus applicable Central Indian legal context for the supported V1 workflows.

### Explicitly Out of Scope
- **Autonomous Legal Actions:** The system does not file complaints, send legal notices, or make binding decisions.
- **OCR/Scanned PDFs:** Currently deferred; only text-extractable PDFs are supported.
- **Generic Chat:** There is no unrestricted conversational legal research feature.

## How It Works: The User Workflow

Vakil AI guides users through a five-stage pipeline:

1. **Understand:** Converts the document into a plain-language explanation, identifying parties, roles, dates, and obligations.
2. **Flag:** Highlights unusual provisions, possible legal conflicts, ambiguities, or missing clauses.
3. **Compare:** Compares the actual contract language against the verified legal rules in the system's knowledge base.
4. **Act:** Provides concrete next steps (e.g., questions to ask, documents to collect, government portals to check).
5. **Prepare (Optional):** An opt-in stage where the user can explicitly request a structured Attorney Preparation Sheet containing findings, unresolved questions, and evidence links to save time during professional consultation.

## Architecture

Vakil AI employs a strictly bounded architecture that separates deterministic business logic from AI-assisted semantic reasoning. 

To explore the architecture in detail, please refer to the dedicated diagrams:

* **[System Architecture](docs/architecture/system-architecture.md)**: High-level overview of the Client, Server, Legal KB, and AI Boundaries.
* **[End-to-End Pipeline](docs/architecture/pipeline-flow.md)**: Visual breakdown of deterministic vs. AI-assisted subsystems across the analysis lifecycle.
* **[Frontend Stage Flow](docs/architecture/frontend-stage-flow.md)**: User journey and state transitions.

## Legal Reasoning & AI Safety

The system adheres to a strict "reasoning only" boundary for GenAI.

* **[AI Trust Boundary](docs/architecture/ai-boundary.md)**: Details how untrusted PDF data is processed and how rigid Zod validations protect downstream deterministic systems.
* **[Legal Reasoning Flow](docs/architecture/legal-reasoning-flow.md)**: Demonstrates the strict traceability from Legal Sources to Document Evidence to User-Facing Claims, ensuring AI hallucinations are mitigated.

## Security & Privacy

Document processing is session-oriented. We ensure that user data is isolated and AI models operate under strict security constraints.

* **[Security & Privacy Architecture](docs/architecture/security-privacy.md)**: Outlines client-side extraction, PII pseudonymization, and the separation of transient session data from the persistent Legal KB.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Zustand, PDF.js
- **Backend API:** Next.js API Routes, Zod
- **Database:** MongoDB / Mongoose (Legal KB)
- **AI Providers:** Gemini SDK, Groq SDK
- **Testing:** Vitest, Playwright, React Testing Library

## Project Structure

```text
src/
├── app/              # Next.js UI, Layouts, and API boundaries
├── components/       # UI components, stage views, document viewer
├── core/             # AI context schemas, state, shared errors
├── features/         # Domain-specific services (understand, flag, compare, legal-kb)
└── lib/              # Shared AI provider adapters and utilities

tests/
├── api/              # API contract tests
├── contexts/         # Context validations
├── core/             # State and schema tests
├── e2e/              # Playwright end-to-end integration tests
├── features/         # Domain service unit tests
├── fixtures/         # Mock data and test helpers
└── lib/              # Infrastructure and AI provider tests
```

## Running Locally

### Prerequisites
- Node.js (v20+)
- MongoDB connection string (for Legal KB)
- Gemini and Groq API Keys

### Environment Variables
Create a `.env.local` file in the root directory:
```text
# AI Providers
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=your_gemini_model
GEMINI_API_KEY_SECONDARY=your_secondary_gemini_key
GEMINI_MODEL_SECONDARY=your_secondary_gemini_model
GROQ_API_KEY=your_groq_key
GROQ_MODEL=your_groq_model

# Legal Knowledge Base
MONGODB_URI=your_mongodb_connection_string

# Application Flags
MOCK_AI_PROVIDERS=false
```

### Installation & Execution
```bash
# 1. Install dependencies
npm install

# 2. Seed the local MongoDB with the legal knowledge base
npm run db:seed

# 3. Start the development server
npm run dev
```

## CI/CD and Deployment

Vakil AI employs separate architectures for Continuous Integration (CI) and Production to ensure deterministic testability without depending on live external AI providers.

* **[Deployment Architecture](docs/architecture/deployment-architecture.md)**: Visualizes the GitHub Actions CI workflow (using Mock AI and ephemeral DB) vs. the Vercel Production deployment.

## V1 Limitations & Scope

**Status: FROZEN (V1)**

The initial release (V1) focuses on a specific scope to ensure high-quality reasoning and traceability. 

* **[Scope (V1 vs Post-V1)](docs/architecture/v1-scope.md)**: Details explicitly supported document types, languages, and jurisdictions, as well as deferred features.

- Vakil AI is a preparation tool, not a substitute for a qualified lawyer.
- AI outputs are validated against a structured knowledge base, but `INSUFFICIENT_SOURCE` can occur if a specific niche rule is unsupported.
- The system will not automatically escalate issues or file forms on behalf of the user.
