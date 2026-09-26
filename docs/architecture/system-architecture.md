# System Architecture

The Vakil AI architecture strictly separates the client-side UI, server-side orchestration, AI models, and the deterministic Legal Knowledge Base. This boundary ensures API keys are protected and that the AI cannot manipulate the authoritative legal rules.

```mermaid
flowchart TD
    subgraph Client ["Browser (Next.js Frontend)"]
        UI["React UI (Zustand State)"]
        PDF["PDF.js (Client-side extraction)"]
        UI <--> PDF
    end

    subgraph Server ["Server (Next.js API Routes)"]
        API["Orchestrator (/api/analyze, /api/prepare)"]
        Context["Session Contexts (Memory only)"]
        API <--> Context
    end

    subgraph External ["External Services"]
        subgraph LegalKB ["Legal Knowledge Base"]
            Mongo[("MongoDB (Rules, Sources)")]
        end
        subgraph AI_Layer ["AI Provider Abstraction"]
            Gemini["Google Gemini"]
            Groq["Groq / Llama 3"]
        end
    end

    Client -- "Extracted Text" --> API
    API -- "Deterministic Queries" --> Mongo
    API -- "Semantic Tasks" --> Gemini
    API -- "Semantic Tasks" --> Groq
    
    classDef client fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef server fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px;
    classDef ai fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    classDef db fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    
    class Client,UI,PDF client;
    class Server,API,Context server;
    class AI_Layer,Gemini,Groq ai;
    class LegalKB,Mongo db;
```

## Key Boundaries
1. **Client/Server**: PDF text extraction occurs entirely in the browser (`PDF.js`). The raw text is sent to the server for processing.
2. **Server/AI**: API keys and prompts are strictly managed server-side. The client never interacts with the LLMs directly.
3. **AI/DB**: The AI providers have *no access* to query MongoDB. The orchestration layer fetches the applicable rules deterministically and passes only the relevant text as context to the AI.
