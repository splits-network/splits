# Memphis Design System Migration

This directory contains all resources for migrating Splits Network apps to the Memphis design system.

## Quick Start

```bash
# Launch Memphis migration system
/memphis

# Migrate a specific page
/memphis:migrate apps/portal/src/app/dashboard/page.tsx

# Audit entire app
/memphis:audit portal

# Validate single file
/memphis:validate apps/portal/src/components/JobCard.tsx

# Extract component from showcase
/memphis:extract NotificationCard

# Update theme
/memphis:theme update
```

## Directory Structure

```
.claude/memphis/
├── showcase/              # 26 Designer Six reference pages
│   ├── landing-six.tsx
│   ├── articles-six.tsx
│   ├── modals-six.tsx
│   └── ... (23 more)
├── references/            # Design documentation
│   ├── design-principles.md
│   ├── color-system.md
│   ├── typography.md
│   ├── spacing-layout.md
│   └── component-patterns.md
├── templates/             # Code templates
│   ├── page-template.tsx
│   ├── component-template.tsx
│   └── modal-template.tsx
├── workflows/             # Process documentation
│   ├── migration-workflow.md
│   ├── validation-checklist.md
│   └── component-extraction.md
├── .build-progress.json   # State tracker
└── README.md             # This file
```

## Documentation

Consolidated Memphis documentation lives in `docs/memphis/`:
- **[Design Principles](../../docs/memphis/design-principles.md)** - The 5 rules, styling hierarchy, typography
- **[Color System](../../docs/memphis/color-system.md)** - 6-color palette, combinations, accessibility
- **[Feature Architecture](../../docs/memphis/feature-architecture.md)** - Golden example: roles feature pattern

## Memphis Design Principles

### The 5 Rules (Never Violate)

1. **Flat Design** - NO shadows, gradients, or 3D effects
2. **Sharp Corners** - border-radius: 0 (except perfect circles)
3. **Thick Borders** - 4px borders on all interactive elements
4. **Memphis Colors** - Use only coral, teal, yellow, purple, dark, cream
5. **Geometric Shapes** - Add 1-3 decorative shapes per page

### Styling Hierarchy (CRITICAL)

Before writing ANY markup, follow this order. Use memphis-ui components and named CSS classes before ever reaching for raw Tailwind:

1. **Memphis UI React components** (`@splits-network/memphis-ui`) — FIRST. 101 components with correct styling baked in.
2. **Memphis plugin CSS classes** (`btn`, `badge`, `card`, `input`, etc.) — named classes with border tiers baked in.
3. **Memphis CSS theme classes** (`bg-coral`, `text-dark`, `border-interactive`) — for elements not covered above.
4. **Local components** (`{feature}-memphis/components/`) — must use memphis-ui primitives internally.
5. **Raw Tailwind** — LAST RESORT, only for layout/spacing/grid.

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Coral | #FF6B6B | Primary actions, CTAs |
| Teal | #4ECDC4 | Secondary actions, success |
| Yellow | #FFE66D | Warnings, highlights |
| Purple | #A78BFA | Info, tertiary actions |
| Dark | #1A1A2E | Text, borders |
| Cream | #F5F0EB | Backgrounds, cards |

## Commands

### /memphis
Main command - launches Memphis orchestrator
- Loads build progress
- Presents migration options
- Coordinates agents
- Manages state

### /memphis:migrate <target>
Migrate single page/component
- Removes shadows, rounded corners, gradients
- Replaces colors with Memphis palette
- Adds 4px borders
- Adds geometric decorations

### /memphis:audit <app>
Comprehensive compliance audit
- Scans all files
- Identifies violations
- Generates report
- Calculates compliance score

### /memphis:validate <file>
Validate single file
- Checks Memphis compliance
- Reports violations
- Suggests fixes

### /memphis:extract <component> [page]
Extract reusable component from showcase
- Analyzes showcase page
- Abstracts component
- Adds to memphis-ui package

### /memphis:theme [action]
Manage Memphis theme
- Update colors, spacing, typography
- Preview theme
- Validate theme
- Export for design tools

## Agents

### memphis-orchestrator
Coordinates migration work
- Manages build state
- Spawns workers
- Tracks progress
- Handles errors

### memphis-designer
Performs migrations
- Applies Memphis patterns
- Removes violations
- Preserves functionality
- Adds decorations

### memphis-auditor
Validates compliance
- Scans for violations
- Generates reports
- Calculates scores
- Recommends fixes

## Skills

### migrate-page
Migrate single page to Memphis design

### extract-component
Extract reusable component from showcase

### validate-design
Validate Memphis compliance

### apply-theme
Apply Memphis theme to component

## Showcase Pages (26 Total)

Reference implementations in `apps/corporate/src/app/showcase/`:

1. landing-six.tsx - Landing page
2. articles-six.tsx - Article/blog page
3. lists-six.tsx - List views
4. modals-six.tsx - Modal dialogs
5. dashboards-six.tsx - Dashboard layouts
6. messages-six.tsx - Messaging UI
7. headers-six.tsx - Header variations
8. footers-six.tsx - Footer variations
9. forms-six.tsx - Form layouts
10. details-six.tsx - Detail pages
11. cards-six.tsx - Card components
12. search-six.tsx - Search interfaces
13. empty-six.tsx - Empty states
14. profiles-six.tsx - Profile pages
15. settings-six.tsx - Settings UI
16. onboarding-six.tsx - Onboarding flows
17. tables-six.tsx - Data tables
18. pricing-six.tsx - Pricing pages
19. auth-six.tsx - Authentication
20. notifications-six.tsx - Notifications
21. notifications-ui-six.tsx - Notification components
22. tabs-six.tsx - Tab interfaces
23. timelines-six.tsx - Timeline components
24. calendars-six.tsx - Calendar views
25. testimonials-six.tsx - Testimonial sections
26. faqs-six.tsx - FAQ accordions

## State Management

Migration progress tracked in `.build-progress.json`:

```json
{
  "version": "1.0.0",
  "currentPhase": "migration",
  "targetApp": "portal",
  "phases": {
    "planning": { "status": "completed" },
    "migration": { "status": "in_progress", "tasks": [...] },
    "validation": { "status": "pending" },
    "cleanup": { "status": "pending" }
  },
  "statistics": {
    "totalTasks": 45,
    "completedTasks": 23,
    "failedTasks": 1
  }
}
```

**Resume Capability**: If interrupted, orchestrator loads state and resumes from last checkpoint.

## Memphis UI Package

Location: `packages/memphis-ui/`

Built on SilicaUI (DaisyUI v5 fork). All DaisyUI v5 component classes work.

**Architecture:**
```
packages/memphis-ui/
├── src/                           # HAND-AUTHORED only
│   ├── base/                      # Base CSS (reset, rootcolor, properties)
│   ├── components/                # 57 CSS component files (SilicaUI + Memphis)
│   ├── themes/memphis.css         # Generated CSS variables (NEVER edit)
│   ├── utilities/                 # SilicaUI + Memphis utilities
│   ├── react/components/          # 101 React components
│   └── theme.config.ts            # Single source of truth
├── dist/                          # Generated (gitignored)
├── functions/                     # Runtime plugin handlers
├── scripts/generators/            # 7 modular generators
├── build.js, index.js, package.json
```

**Build:** `pnpm --filter @splits-network/memphis-ui build`
(Runs: `tsx scripts/generate.ts` → `node build.js` → `tsc -b`)

**Plugin Loading (in app globals.css):**
```css
@plugin "@splits-network/memphis-ui/plugin";
```
No `@import` of theme.css. No `tailwind.config.ts` needed.

**React Usage:**
```tsx
import { Button, Card, Badge } from '@splits-network/memphis-ui';
```

**CSS Classes (all DaisyUI v5 classes work):**
```tsx
<button className="btn btn-coral btn-md">Click Me</button>
<span className="badge badge-yellow badge-sm">New</span>
<div className="card p-6">Content</div>
```

**Color variants use CSS variables (not direct properties):**
- Buttons: `--btn-color` and `--btn-fg`
- Badges: `--badge-color` and `--badge-fg`

**Size variants include border tiers + font sizes:**
- `sm`: 2px border (detail), smaller font
- `md`: 3px border (interactive), standard font
- `lg`: 4px border (container), larger font

## Migration Workflow

1. **Planning** - Analyze app, create task list
2. **Migration** - Migrate pages/components in parallel
3. **Validation** - Audit for 100% compliance
4. **Cleanup** - Remove old deps, optimize, deploy

See [workflows/migration-workflow.md](./workflows/migration-workflow.md) for details.

## Common Violations

### ❌ Shadows
```tsx
<div className="shadow-xl"> // FORBIDDEN
```

### ✅ Memphis (use component or plugin class first)
```tsx
import { Card } from '@splits-network/memphis-ui';
<Card>...</Card>                          // BEST — React component
<div className="card">...</div>           // OK — plugin class
<div className="border-4 border-dark">    // FALLBACK — theme classes
```

### ❌ Rounded Corners
```tsx
<button className="rounded-lg"> // FORBIDDEN
```

### ✅ Memphis (use component or plugin class first)
```tsx
import { Button } from '@splits-network/memphis-ui';
<Button variant="primary">Click</Button>  // BEST — React component
<button className="btn btn-coral btn-md">  // OK — plugin class
```

### ❌ Gradients
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600"> // FORBIDDEN
```

### ✅ Memphis
```tsx
<div className="bg-coral"> // CORRECT — solid Memphis color
```

## Accessibility

All Memphis designs maintain WCAG AA compliance:
- Dark on Cream: 12.5:1 (AAA)
- Dark on Coral: 4.6:1 (AA)
- Dark on Teal: 4.8:1 (AA)
- Dark on Yellow: 9.2:1 (AAA)
- Dark on Purple: 5.1:1 (AA)

## Resources

- **Design Principles**: [references/design-principles.md](./references/design-principles.md)
- **Color System**: [references/color-system.md](./references/color-system.md)
- **Migration Workflow**: [workflows/migration-workflow.md](./workflows/migration-workflow.md)
- **Page Template**: [templates/page-template.tsx](./templates/page-template.tsx)
- **Component Template**: [templates/component-template.tsx](./templates/component-template.tsx)

## Support

For issues or questions:
1. Check showcase pages for examples
2. Review design principles
3. Run validation to identify issues
4. Use /memphis commands for guidance

## Version

Current version: 1.0.0
Last updated: 2026-02-14
