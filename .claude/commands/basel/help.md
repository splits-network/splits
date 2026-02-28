---
name: basel:help
description: Show available Basel GSD commands and usage guide
allowed-tools: []
---

<objective>
Display the complete Basel GSD command reference.
Output ONLY the reference content below. Do NOT add commentary or analysis.
</objective>

<reference>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 BASEL GSD ► COMMAND REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Basel GSD** combines GSD (Get Shit Done) project management with the Basel design system.
All planning, execution, and verification agents are Basel-aware — they enforce DaisyUI-first
styling, editorial layouts, and the Designer One aesthetic automatically.

## Quick Start

```
/basel:new-project          # Initialize project with deep context gathering
/basel:plan-phase 1         # Plan phase 1 (Basel design rules built into planner)
/basel:execute-phase 1      # Execute with Basel auto-fix deviation rules
```

---

## Design Commands

| Command | Purpose |
|---------|---------|
| `/basel:audit <app>` | Full Basel compliance scan of all `-basel/` pages in an app |
| `/basel:fix <target>` | Auto-fix Basel violations (audit → fix → verify loop) |
| `/basel:validate <file>` | Single-file point-in-time compliance check |
| `/basel:migrate <target>` | Create parallel Basel page from existing page |
| `/basel:chart` | Create or migrate charts to Basel-themed Recharts |
| `/basel:switchover <target>` | Promote Basel pages to primary routes |

---

## Project Lifecycle

| Command | Purpose |
|---------|---------|
| `/basel:new-project` | Initialize project — questioning → PROJECT.md → roadmap |
| `/basel:new-milestone` | Start new milestone cycle on existing project |
| `/basel:complete-milestone` | Archive milestone, tag, prepare for next |

---

## Phase Workflow

| Command | Purpose |
|---------|---------|
| `/basel:discuss-phase <N>` | Deep-dive vision for a phase → CONTEXT.md |
| `/basel:list-phase-assumptions <N>` | Surface Claude's assumptions before planning |
| `/basel:research-phase <N>` | Standalone research for a phase |
| `/basel:plan-phase <N>` | Research → Plan → Verify loop → PLAN.md files |
| `/basel:execute-phase <N>` | Wave-based parallel execution → SUMMARY.md + VERIFICATION.md |
| `/basel:verify-work` | Conversational UAT with auto-diagnosis |
| `/basel:quick` | Quick task with atomic commits (skips optional agents) |

**Typical flow:**
```
/basel:discuss-phase 1    →  CONTEXT.md (locked decisions)
/basel:plan-phase 1       →  PLAN.md files (Basel-aware)
/basel:execute-phase 1    →  Execution + verification (Basel auto-fix)
```

---

## Roadmap Management

| Command | Purpose |
|---------|---------|
| `/basel:add-phase` | Append new phase to end of milestone |
| `/basel:insert-phase` | Insert urgent phase as decimal (e.g., 7.1) |
| `/basel:remove-phase` | Remove future phase and renumber |
| `/basel:audit-milestone` | Audit milestone against original intent |
| `/basel:plan-milestone-gaps` | Create phases to close audit gaps |

---

## Session & Progress

| Command | Purpose |
|---------|---------|
| `/basel:progress` | Status report with routing to next action |
| `/basel:resume-work` | Resume from previous session |
| `/basel:pause-work` | Create handoff file for later resume |
| `/basel:debug` | Scientific method debugging with persistent state |

---

## Todos & Config

| Command | Purpose |
|---------|---------|
| `/basel:add-todo` | Capture task/idea to `.planning/todos/` |
| `/basel:check-todos` | List and select pending todos |
| `/basel:settings` | Configure workflow toggles and model profile |
| `/basel:set-profile` | Quick switch: quality / balanced / budget |
| `/basel:map-codebase` | Parallel codebase analysis → `.planning/codebase/` |

---

## Basel Design Standards

**Reference file:** `.claude/basel-gsd/references/basel-design.md`
**Showcase pages:** `apps/corporate/src/app/showcase/*/one/page.tsx`

**Key rules baked into all agents:**
- DaisyUI semantic tokens only (no Memphis colors, no raw Tailwind palette, no hex)
- DaisyUI components first (never custom dropdown/modal/tooltip)
- Editorial layouts (split-screen 60/40, border-l-4 accents, kicker text)
- Sharp corners (no rounded-sm through rounded-3xl)
- GSAP with `useGSAP` + `clearProps: "transform"`
- Minimum `text-sm` for human-readable content

---

## Files & Structure

```
.claude/basel-gsd/              # Package root
├── VERSION                     # Fork version (based on GSD 1.11.1)
├── references/                 # Shared knowledge loaded by agents
│   ├── basel-design.md         # Basel design system reference
│   └── ...                     # GSD operational references
├── templates/                  # Document scaffolds
└── workflows/                  # Orchestration procedures

.claude/agents/
├── basel-gsd-planner.md        # Plans with Basel design constraints
├── basel-gsd-executor.md       # Executes with Basel auto-fix rules (5-10)
└── basel-gsd-verifier.md       # Verifies with Basel compliance checks (B1-B8)

.planning/                      # Project state (created by workflows)
├── PROJECT.md, ROADMAP.md, STATE.md, REQUIREMENTS.md
├── phases/                     # Per-phase plans, summaries, verification
└── codebase/                   # Codebase analysis documents
```

</reference>
