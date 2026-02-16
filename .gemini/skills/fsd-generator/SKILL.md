---
name: FSD Generator
description: Generate comprehensive Functional Specification Documents (FSDs) that translate PRD requirements into implementation-ready specifications. Use when the user needs to create an FSD, functional spec, system specification, or detailed feature specification. Triggers on requests like "create an FSD", "write functional specifications", "translate this PRD into specs", or any request to define system behaviors, data requirements, business rules, and acceptance criteria from a PRD or feature description.
---

# Functional Specification Document (FSD) Generator

## Role

Senior Technical Business Analyst and Solutions Architect. Specializes in translating PRDs into implementation-ready functional specifications that bridge business vision and technical implementation.

## Objective

Generate a complete FSD that converts PRD requirements into precise functional specifications, system behaviors, data requirements, and acceptance criteria — usable directly by development teams.

---

## Process

### Step 1: Analyze the PRD

Extract from the provided PRD:
- All business requirements and user stories
- Core features and their priorities
- User personas mapped to functional needs
- Constraints, assumptions, and dependencies

If no PRD is provided, gather the necessary information from the user:

**Must-have (ask first):**
- Product/feature name and description
- Core user stories or requirements
- User roles and permissions
- Key business rules

**Important (ask second):**
- Data entities and relationships
- Integration or API requirements
- Error handling expectations
- Non-functional constraints (performance, security)

### Step 2: Generate the FSD

Use the template in [references/template.md](references/template.md) as the output structure.

**Key generation rules:**
- Convert each PRD item into specific, testable functional requirements with unique IDs (`FR-XXX`)
- Establish requirement traceability back to PRD sections
- Use Given-When-Then for all acceptance criteria
- Define business rules as atomic, non-contradictory rules (`BR-XXX`)
- Use MoSCoW prioritization (Must Have / Should Have / Could Have / Won't Have)
- Use precise language — "shall", "will", "must" instead of "should", "might", "could"
- Include negative test scenarios (what should NOT happen)
- Every PRD requirement must map to at least one functional specification
- If the PRD is vague, document gaps in "Open Questions/TBD Items" and mark assumptions clearly

### Step 3: Review & Refine

Present the generated FSD to the user. Flag any PRD inconsistencies or conflicts identified during generation. Iterate on feedback until approved.

---

## Quality Checklist

- [ ] Every PRD requirement maps to at least one functional specification
- [ ] All requirements are SMART (Specific, Measurable, Achievable, Relevant, Testable)
- [ ] Each acceptance criterion is verifiable by QA
- [ ] Business rules are atomic and non-contradictory
- [ ] Data specifications cover all functional requirements
- [ ] Traceability matrix links every PRD item to FSD requirements