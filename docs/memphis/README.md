# Memphis Design System

Consolidated documentation for the Memphis design system used across all Splits Network apps.

## Documents

| Document | Description |
|----------|-------------|
| [Feature Architecture](./feature-architecture.md) | Golden example: how to build a Memphis feature page (roles pattern) |
| [Design Principles](./design-principles.md) | The 5 rules, styling hierarchy, typography, spacing |
| [Color System](./color-system.md) | 6-color palette, combinations, accessibility, migration guide |

## Quick Reference

### The 5 Rules (Never Violate)

1. **Flat Design** - No shadows, gradients, or 3D effects
2. **Sharp Corners** - `border-radius: 0` (except perfect circles)
3. **Thick Borders** - 4px borders on interactive elements
4. **Memphis Colors** - Only coral, teal, yellow, purple, dark, cream
5. **Geometric Decorations** - 1-3 decorative shapes per page

### Styling Hierarchy

1. Memphis UI React components (`@splits-network/memphis-ui`) - FIRST
2. Memphis plugin CSS classes (`btn`, `badge`, `card`, `input`) - SECOND
3. Memphis theme classes (`bg-coral`, `text-dark`, `border-interactive`) - THIRD
4. Raw Tailwind - LAST RESORT (layout/spacing only)

### Color Palette

| Color | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Coral | #FF6B6B | `bg-coral` | Primary actions, CTAs |
| Teal | #4ECDC4 | `bg-teal` | Secondary actions, success |
| Yellow | #FFE66D | `bg-yellow` | Warnings, highlights |
| Purple | #A78BFA | `bg-purple` | Info, tertiary actions |
| Dark | #1A1A2E | `bg-dark` | Text, borders |
| Cream | #F5F0EB | `bg-cream` | Backgrounds, cards |

### Memphis UI Package

- Location: `packages/memphis-ui/`
- Build: `pnpm --filter @splits-network/memphis-ui build`
- Plugin loading: `@plugin "@splits-network/memphis-ui/plugin"` in app `globals.css`
- React components: `import { Button, Card, Badge } from '@splits-network/memphis-ui'`
- 101 React components, 57 CSS component files

### Feature Architecture (Golden Example)

The roles feature (`apps/portal/src/app/portal/roles/`) is the reference implementation. See [feature-architecture.md](./feature-architecture.md) for the full pattern.

```
feature/
├── page.tsx                    # Orchestrator: data, state, view switching
├── types.ts                    # Feature types, filters, label maps
├── lists-six-animator.tsx      # GSAP entrance animations
└── components/
    ├── shared/                 # Cross-view utilities
    │   ├── accent.ts           # Color cycling, status mapping
    │   ├── helpers.ts          # Display formatters
    │   ├── controls-bar.tsx    # Search, filters, add button, view toggle
    │   ├── header-section.tsx  # Hero header with stats
    │   ├── actions-toolbar.tsx # Context actions (icon-only + descriptive)
    │   ├── expandable-button.tsx # Hover-expand icon button
    │   ├── view-mode-toggle.tsx  # Table/Grid/Split switcher
    │   └── job-detail.tsx      # Detail view + data loader
    ├── table/
    │   ├── table-view.tsx      # Table layout orchestrator
    │   └── table-row.tsx       # Row + expandable detail
    ├── grid/
    │   ├── grid-view.tsx       # Grid layout + detail sidebar
    │   └── grid-card.tsx       # Individual card
    ├── split/
    │   ├── split-view.tsx      # Split layout (list + detail)
    │   └── split-item.tsx      # List item in split view
    └── modals/
        └── role-wizard-modal.tsx
```
