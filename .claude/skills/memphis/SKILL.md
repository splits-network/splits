---
name: memphis
description: Launch the Memphis Design System migration orchestrator. Coordinates migration of portal, candidate, and corporate apps to Memphis design.
---

# /memphis - Memphis Design System Migration

When invoked, spawn the `memphis-orchestrator` agent (`.claude/agents/memphis-orchestrator.md`) to coordinate Memphis migration.

## Orchestrator Startup

1. Load state from `.claude/memphis/.build-progress.json`
2. If resuming: display progress, offer to continue from last checkpoint
3. If new: ask which app to migrate (portal, candidate, corporate)
4. Spawn `memphis-designer` and `memphis-auditor` agents as needed

## Sub-Commands

- `/memphis:migrate <target>` - Create parallel Memphis page
- `/memphis:audit <app>` - Audit app for Memphis compliance
- `/memphis:validate <file>` - Validate single file
- `/memphis:fix <target>` - Auto-fix Memphis violations (audit → fix → verify loop)
- `/memphis:extract <component>` - Extract component from showcase
- `/memphis:theme` - Update Memphis theme
- `/memphis:switchover <target>` - Promote Memphis pages, archive originals

## Styling Hierarchy (CRITICAL — follow this order)

1. **Memphis UI components** — Use `@splits-network/memphis-ui` (86+ components) FIRST
2. **Memphis CSS theme classes** — `bg-coral`, `text-dark`, `border-4 border-teal`, etc.
3. **Local components** — Page-specific widgets (must use memphis-ui primitives internally)
4. **Raw Tailwind** — LAST RESORT, only for layout/spacing/grid

## Core Rules

1. **Parallel pages** - Create `{feature}-memphis/page.tsx`, never modify originals
2. **Self-contained** - Memphis pages import from `@splits-network/memphis-ui` or local components, NEVER from original page tree
3. **Fresh design** - Design from showcase patterns, don't copy original layout
4. **Components first** - Always check memphis-ui for existing components before writing raw markup
5. **Flag recommendations** - Surface new feature ideas from showcase, don't silently add/ignore
6. **Checkpoints** - Save state after every task for resume capability
7. **Tailwind classes ONLY** - NEVER hardcode hex colors (`#FF6B6B`), NEVER use inline `style={}` for visual props, NEVER create color constant objects (`const M = {}`)
8. **4px borders ONLY** - Always `border-4` or `border-b-4`, never 3px/5px/other widths
9. **Auto-fix audit** - Auditor catches violations, designer auto-fixes, re-audit until 100% clean

## Resources

- 86+ components: `packages/memphis-ui/`
- 26 showcase pages: `apps/corporate/src/app/showcase/`
- Design refs: `.claude/memphis/references/`
- Templates: `.claude/memphis/templates/`
- Workflows: `.claude/memphis/workflows/`
- 52 page-specific skills: `.claude/skills/memphis/migrate-*.md` and `extract-from-*.md`
