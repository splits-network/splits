---
name: basel
description: Launch the Basel Design System (Designer One) migration orchestrator. Coordinates migration of portal, candidate, and corporate apps to Basel editorial design using DaisyUI semantic tokens only.
---

# /basel - Basel Design System Migration

When invoked, spawn the `basel-orchestrator` agent (`.claude/agents/basel-orchestrator.md`) to coordinate Basel migration.

## Orchestrator Startup

1. Load state from `.claude/basel/.build-progress.json`
2. If resuming: display progress, offer to continue from last checkpoint
3. If new: ask which app to migrate (portal, candidate, corporate)
4. Spawn `basel-designer`, `basel-auditor`, `basel-charts` agents as needed

## Sub-Commands

- `/basel:migrate <target>` - Create parallel Basel page
- `/basel:audit <app>` - Audit app for Basel compliance
- `/basel:validate <file>` - Validate single file
- `/basel:fix <target>` - Auto-fix Basel violations (audit → fix → verify loop)
- `/basel:chart <create|migrate> <target>` - Create or migrate charts with Basel theming
- `/basel:switchover <target>` - Promote Basel pages, archive originals

## Color System (CRITICAL)

Basel uses **DaisyUI semantic tokens ONLY**:

```
primary, primary-content, secondary, secondary-content
accent, accent-content, neutral, neutral-content
base-100, base-200, base-300, base-content
success, error, warning, info (+ -content variants)
```

**FORBIDDEN:** Memphis named colors (coral, teal, cream, dark, yellow, purple), raw Tailwind palette (red-500, blue-600), hardcoded hex, Memphis UI imports.

## Styling Hierarchy (CRITICAL — follow this order)

1. **`@splits-network/basel-ui` components** — Shared Basel package FIRST (`packages/basel-ui/`)
2. **DaisyUI component classes** — `btn`, `card`, `badge`, `input`, `select`, `tabs`, `modal`, `table`
3. **DaisyUI modifier classes** — `btn-primary`, `btn-outline`, `badge-secondary`, etc.
4. **DaisyUI semantic theme classes** — `bg-primary`, `text-base-content`, `border-accent`
5. **App-local Basel components** — `apps/{app}/src/components/basel/` (NOT scattered elsewhere)
6. **Raw Tailwind** — LAST RESORT, only for layout/spacing/grid and Basel-specific effects (clip-path, backdrop-blur)

## Component Placement (CRITICAL)

- **Shared (2+ apps)** → `packages/basel-ui/src/` → `@splits-network/basel-ui`
- **Local (1 app)** → `apps/{app}/src/components/basel/` → `@/components/basel/...`
- **NEVER** in `packages/shared-ui/`, `components/` root, or `{feature}-basel/components/`

## Basel Design Principles

1. **Editorial layouts** — Asymmetric grids, split-screen 60/40, magazine-style flow
2. **Typography-driven hierarchy** — Large display headings, kicker text, comfortable line-height
3. **Sharp corners** — rounded-none on ALL elements
4. **Diagonal clip-paths** — Angled hero sections
5. **Frosted glass headers** — `backdrop-blur-md bg-base-100/90`
6. **Border-left accents** — `border-l-4 border-primary` on cards/sections
7. **Subtle shadows** — `shadow-sm`, `shadow-md` for editorial depth (unlike Memphis: zero shadows)
8. **No gradients** — Solid fills with opacity variants (`bg-primary/10`)
9. **No geometric decorations** — No floating shapes (that's Memphis)
10. **GSAP scroll animations** — `power3.out` easing, staggered fade-in, ScrollTrigger

## Core Rules

1. **Parallel pages** - Create `{feature}-basel/page.tsx`, never modify originals
2. **Self-contained** - Basel pages import from `@splits-network/basel-ui`, `components/basel/`, and DaisyUI — NEVER from original page tree or Memphis UI
3. **Fresh design** - Design from Designer One showcase patterns (`showcase/*/one/`), don't copy original layout
4. **Package first** - Check `@splits-network/basel-ui` before DaisyUI, before raw markup
5. **Flag recommendations** - Surface new feature ideas from showcase
6. **Checkpoints** - Save state after every task for resume capability
7. **Tailwind classes ONLY** - NEVER hardcode hex colors, NEVER create color constant objects
8. **Auto-fix audit** - Auditor catches violations, designer auto-fixes, re-audit until 100% clean

## Resources

- Shared package: `packages/basel-ui/` (`@splits-network/basel-ui`)
- 20 Designer One showcase pages: `apps/corporate/src/app/showcase/*/one/page.tsx`
- Basel agents: `.claude/agents/basel-*.md`
- Basel commands: `.claude/commands/basel/*.md`
- Basel skills: `.claude/skills/basel/*.md`
