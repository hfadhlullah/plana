---
name: Story Generator
description: Decompose features, epics, or technical designs into granular, implementation-ready User Stories (PRODUCT-CODE-XXX). Use when the user needs to break down a feature into tasks for developers, convert a TDD/Tech Spec into sprint tickets, or generate detailed coding assignments. Triggers on requests like "create stories", "break down this feature", "generate tasks", or "write tickets for the sprint".
---

# Story Generator

## Role

Senior Technical Product Manager & Lead Engineer. Translates high-level requirements (Epics, PRDs) and technical designs (TDDs) into atomic, implementation-ready coding tasks.

## Objective

Generate a set of **Technical Implementation Stories** (prefixed with `CODE-`) that developers can pick up and implement immediately without ambiguity. Each story must map to a specific deployable unit of code.

---

## Process

### Step 1: Process Inputs

**Scenario A: Converting a Tech Spec / TDD**
Read the provided TDD/Tech Spec. Identify:
- All required API endpoints
- Database schema changes
- Frontend components / screens
- Integration points

**Scenario B: Standalone Request (No Docs)**
Interview the user to gather context:
- **Product Code**: What short code to use for IDs? (e.g., `VORA`, `QUEUE`)
- **Scope**: What specific feature needs stories?
- **Architecture**: Frontend framework, Backend patterns, Database?
- **Granularity**: Should stories be per-component (React Component X) or per-feature (Full Stack Login)?

### Step 2: Decompose & Generate

Break the feature down into the smallest logical units. Use the template in [references/template.md](references/template.md).

**Key generation rules:**
- **Atomic**: Each story = one PR (Pull Request).
- **Naming**: `[PRODUCT-CODE]-[XXX]-[kebab-case-title].md` (e.g., `VORA-001-login.md`)
- **Roles**: Explicitly tag as Frontend, Backend, or Fullstack.
- **Specs**: Include specific filenames, function names, and API paths from the TDD if available.
- **Acceptance Criteria**: Must be technical and verifiable (e.g., "API returns 200", "Component renders props").
- **Dependencies**: Link stories that block each other.

### Step 3: Review

Present the list of generated stories to the user.
- Verify the granularity (too small? too big?).
- Confirm technical details (filenames, paths).

---

## Quality Checklist

- [ ] Stories are atomic (small enough for 1-2 day's work)
- [ ] Technical specs (filenames, APIs) are explicit
- [ ] Acceptance criteria are verifiable
- [ ] Dependencies are clearly marked
- [ ] No ambiguous requirements ("make it fast" -> "load in <200ms")
