# Legal Reasoning & Evidence Chain

This diagram demonstrates how substantive legal claims trace their provenance back to verifiable sources and exact document clauses.

```mermaid
flowchart TD
    %% Styling
    classDef source fill:#e1bee7,stroke:#8e24aa,stroke-width:2px,color:#4a148c
    classDef ai fill:#fff3e0,stroke:#e65100,stroke-width:2px,stroke-dasharray: 5 5,color:#e65100
    classDef output fill:#c8e6c9,stroke:#388e3c,stroke-width:2px,color:#1b5e20
    
    Source[Legal Source<br><code>source_id</code>]:::source
    Rule[Legal Rule<br><code>rule_id</code>]:::source
    App[Applicability Filter]:::source
    Doc[Document Evidence<br><code>document_id</code> + <code>clause_id</code>]:::source
    
    Reasoning[AI Semantic Reasoning]:::ai
    
    Find[Finding<br><code>finding_id</code>]:::output
    Claim[User-facing Claim]:::output
    Action[Recommended Action<br><code>action_id</code>]:::output
    
    Fail[Safe Failure:<br>INSUFFICIENT_SOURCE]:::output

    %% Flow
    Source --> Rule
    Rule --> App
    App --> Reasoning
    Doc --> Reasoning
    
    Reasoning --> Find
    Reasoning -.-> |If no matching rule| Fail
    
    Find --> Claim
    Find --> Action
```

## Traceability Principles
1. **Evidence Before Claims**: The AI cannot generate a `Finding` without explicitly mapping it to an array of valid `clause_ids` and `rule_ids`.
2. **Safe Failure**: If the Knowledge Base lacks sufficient authority to evaluate a clause, the system returns `INSUFFICIENT_SOURCE` rather than hallucinating a legal conclusion.
