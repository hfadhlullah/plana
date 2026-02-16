---
description: HEAVY complexity feature addition — generates documentation suite consistent with the project kickoff heavy workflow.
---

# Add Feature Workflow (HEAVY)

This workflow is for adding new features or modules to an **enterprise, platform, regulated, or multi-team project**. It ensures consistent documentation standards for everything added post-kickoff.

## Step 1: Feature PRD Addendum & PRD

1.  **Read**: Load `skills/prd-generator/SKILL.md` for interview guidance.
2.  **Context**: Read `docs/prd.md` to understand the current product state and constraints.
3.  **Interview**: Follow the skill's data-gathering process, scoped to this specific feature.
4.  **Generate**: Execute the skill to produce `docs/features/[feature-name]/prd-addendum.md`.
5.  **Approve**: Stop and wait for explicit user approval. Do NOT auto-proceed.

## Step 2: Sprint Stories

1.  **Read**: Load `skills/story-generator/SKILL.md` for guidance.
2.  **Generate**: Execute the skill to break FSD/Requirements into sprint-ready, estimated stories.
3.  **Output**: Create a directory of individual story files at `docs/features/[feature-name]/stories/`.
    *   Ensure each story is in its own markdown file (e.g., `VORA-001-login.md`).
4.  **Approve**: Stop and wait for explicit user approval. Do NOT auto-proceed after generating fixes. If revisions are requested, generate them and then STOP again for approval.

## Step 3: Global Artifacts Integration

1.  **Objective**: Merge feature-specific artifacts back into the core documentation to maintain a single **cohesive** source of truth (avoiding fragmentation).
2.  **Refactor Global PRD**:
    *   **Input**: Read `docs/features/[feature-name]/prd-addendum.md` and the current `docs/prd.md`.
    *   **Action**: Integrate the new requirements and stories into the Global PRD.
    *   **CRITICAL**: Do NOT just append the addendum as a new section. You must **REFACTOR** the Global PRD to weave the new feature seamlessly into the existing narrative and structure.
3.  **Approve**: Wait for explicit user approval. Do NOT auto-proceed after refactoring.

---

# Completion

*   Notify the user that feature documentation is complete.
*   Provide a summary of files created and their locations.
*   Remind user that stories are written *after* requirements approval.
