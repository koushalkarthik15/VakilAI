# Security & Privacy Architecture

This diagram illustrates how user data is protected through strict session scoping, pseudonymization, and separation from the persistent Knowledge Base.

```mermaid
flowchart TD
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
    classDef ephemeral fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef persistent fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef external fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    
    User[User PDF Upload]:::client
    Extract[Client-side PDF.js Extraction]:::client
    
    Session["Session-Scoped Context<br>(Memory Only)"]:::ephemeral
    PII[PII Pseudonymization]:::ephemeral
    
    AI["Server-side AI Provider<br>(Gemini / Groq)"]:::external
    Val[Validated AI Output]:::ephemeral
    
    KB["Legal KB (MongoDB)<br>Persistent Legal Data"]:::persistent
    
    User --> Extract
    Extract --> Session
    Session --> PII
    PII --> AI
    AI --> Val
    Val --> Session
    
    KB -.-> |Read Only Queries| Session
```

## Privacy Guarantees
- **No Persistent User Storage**: Uploaded documents and generated session contexts are stored purely in transient memory during the analysis. They are NOT written to the MongoDB Legal KB.
- **Client-Side Extraction**: PDF files are never uploaded to the server; only the extracted text payload is transmitted.
- **Server-Side AI Credentials**: Provider API keys (`GEMINI_API_KEY`, `GROQ_API_KEY`) are kept entirely server-side. The Next.js client never communicates directly with LLMs.
- **PII Pseudonymization**: Where practical, names and identifying details are pseudonymized before being sent to the AI provider.
