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

The V1 architecture utilizes a clear separation of concerns. 
- **Classification:** Deterministic document classification before semantic analysis.
- **Orchestration:** Server-side API routes (e.g., `/api/analyze`, `/api/prepare`) orchestrate the pipeline.
- **Knowledge Base:** MongoDB stores deterministic legal rules, sources, and government routes.
- **State Management:** Zustand manages transient session state.

## Legal Evidence & Provenance

**Evidence Before Claims.** Every substantive legal claim must be supported by a known legal source.
The system implements a strict Legal Claim Protocol:
`Legal Source → Legal Rule → Document Evidence → AI Reasoning → Finding`

Findings are connected to stable clause IDs, enabling the UI to synchronize the AI's explanation with the exact highlight in the original PDF. If the system's knowledge base lacks sufficient authority to evaluate a clause, it safely returns `INSUFFICIENT_SOURCE` rather than hallucinating a legal conclusion.

## Security & Prompt Injection Resistance

- **Untrusted Input:** Uploaded PDFs are treated as untrusted data. Instructions within a PDF (e.g., "Ignore previous instructions") are treated strictly as document content.
- **Schema Validation:** All AI outputs are strongly validated using Zod against rigid contextual schemas. Malformed outputs or missing evidence IDs fail safely.
- **Server-side credentials:** AI provider API keys never reach browser/client components.
- **Session isolation:** Analysis state is session-scoped and must not leak between document sessions.

## Privacy

Document processing is session-oriented, with user-document data kept out of the persistent Legal Knowledge Base. PII is pseudonymized before external AI processing where practical.

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

## Testing

Vakil AI employs a comprehensive testing strategy that does not require live external LLM calls to verify deterministic domain logic.
```bash
# Run unit, schema, and domain tests (fast)
npm run test

# Run type checking
npm run type-check
```

## Limitations & Project Status

**Status: FROZEN (V1)**
- Vakil AI is a preparation tool, not a substitute for a qualified lawyer.
- AI outputs are validated against a structured knowledge base, but `INSUFFICIENT_SOURCE` can occur if a specific niche rule is unsupported.
- The system will not automatically escalate issues or file forms on behalf of the user.

## License
MIT

---

## Continuous Integration

This project uses GitHub Actions to automatically validate all pushes and pull requests.
The CI workflow ensures that the codebase is completely reproducible from a clean environment.

- **Triggers**: Pushes and Pull Requests to `main`.
- **Validation Steps**: Typecheck, Lint, Unit/Integration Tests (`vitest`), E2E Tests (`playwright`), and Production Build (`next build`).
- **Mock AI Providers**: CI uses `MOCK_AI_PROVIDERS=true` to test deterministic logic and prompt-injection safety boundaries without exposing real API keys.
- **MongoDB**: CI uses an ephemeral MongoDB `mongo:7` service container to run integration and E2E tests (seeded via `npm run db:seed`).

## Vercel Deployment (Build Verified Only)

Vakil AI is build-compatible with standard Vercel Next.js deployments. 

### Deployment Steps
1. Push your repository to GitHub.
2. Import the project into Vercel.
3. Configure the required environment variables in the Vercel dashboard:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `GEMINI_API_KEY_SECONDARY`
   - `GEMINI_MODEL_SECONDARY`
   - `GROQ_API_KEY`
   - `GROQ_MODEL`
   - `MONGODB_URI` (Use a hosted MongoDB cluster like MongoDB Atlas)
4. Deploy the application.
5. Visit your deployed URL and verify functionality by navigating to the landing page and checking `/api/health`.

*Note: PDF text extraction is performed client-side with PDF.js. AI provider calls and Legal KB access remain server-side through the Next.js application. Vercel's standard Node.js serverless functions are used to manage interactions with MongoDB and the AI APIs.*
