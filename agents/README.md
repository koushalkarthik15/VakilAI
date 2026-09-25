# Indian Legal AI Assistant — Agents

This directory contains AI coding-agent instructions, personas, and workflows only. 
It does NOT contain application business logic, legal rules, source data, runtime configuration, API keys, or application code.

## System Architecture

```text
docs/
    = project specification (frozen architecture, feature constraints, decision log)

agents/
    = coding-agent behavior and workflow rules

source code/
    = implementation (business logic)
```

**The agents must never become an alternative specification.** All AI implementation must strictly adhere to `docs/`.

## Personas & Workflows
A coding agent should read `agent.md` as its universal master contract, then select the appropriate persona and workflow based on the task at hand. 

## Precedence Rules
If a persona or workflow conflicts with project documentation in `docs/`, **the documentation wins**. 
An agent is prohibited from bypassing documentation or silently expanding V1 scope.
