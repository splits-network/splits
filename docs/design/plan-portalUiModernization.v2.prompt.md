# Plan Prompt: Splits Portal UI Modernization (Target-State) — v2

> **Intent:** This document is written from a “here’s where we need to be, make it happen” perspective. It defines the **target UI system** (look, feel, interaction, accessibility) and a **build plan** that achieves the reference-style dashboards/tables **without requiring a brand color change**.  
> **Tech baseline:** Next.js + TailwindCSS + DaisyUI themes (light/dark already defined).  
> **Primary outcome:** The portal visually and behaviorally matches the reference UI style: calm, card-based, data-forward, subtle elevation, crisp tables, and purposeful micro-animations.

---

## 1) Target State (Non-Negotiables)

### 1.1 Visual language
- **Calm neutrals + purposeful accents** (keep current DaisyUI color tokens unless contrast demands a tweak).
- **Card-first UI**: content lives on surfaces (cards/sections) with clear hierarchy.
- **Border-first definition**: subtle borders + gentle elevation; avoid “shadow soup.”
- **Rounded geometry**: consistent radii across cards, inputs, pills, popovers.
- **Whitespace discipline**: predictable padding and page gutters (no random spacing).

### 1.2 Interaction language
- **Micro-motion is functional**, not theatrical:
  - hover lift on interactive cards and rows (small translate + shadow shift)
  - fast fades for tooltips/popovers
  - smooth expand/collapse for table details
  - skeletons during load and expansion
- **Reduced motion is respected** (`prefers-reduced-motion: reduce`) everywhere.

### 1.3 Information design
- “Zoom levels” pattern:
  1) KPI strip / stat cards (glanceable)
  2) Trend visualization (optional, supportive)
  3) Actionable table/list (primary workflow)
- Tables are optimized for recruiting workflows: scanning, filtering, selection, inline actions.

### 1.4 Accessibility + quality bar
- Keyboard navigation works across all interactive UI.
- Focus states are obvious and consistent.
- Contrast is validated in both themes (secondary text, borders, badges).
- Motion can be reduced without breaking layout or meaning.

---

## 2) Keep Colors, Change the System (What *Actually* Changes)

You do **not** need to change Splits brand colors to achieve the reference style. The gap is primarily:
- inconsistent elevation/border usage
- inconsistent spacing, radii, and typography hierarchy
- missing motion spec (hover/expand/tooltip) and reduced-motion handling
- table ergonomics and density controls

---

## 3) Implementation Strategy: “Semantic Surfaces” (No extra token layer required)

### Why this approach
You’re right to be wary of adding a new layer of CSS variables like `--elev-0`. The value we need is **consistency**, not a parallel naming universe.

### Decision
Define **semantic surface classes** once using Tailwind `@layer components` + `@apply`, and use them everywhere.  
This gives you a single source of truth for elevation/borders/radii/motion **without** inventing a new token system.

#### Example (global)
```css
/* apps/portal/src/app/globals.css (or a dedicated ui-system.css imported by globals) */
@layer components {
  .surface-flat { @apply bg-base-100 border border-base-300/60 rounded-2xl; }

  .surface-card { @apply bg-base-100 border border-base-300/60 rounded-2xl shadow-sm; }

  .surface-popover { @apply bg-base-100 border border-base-300/70 rounded-2xl shadow-md; }

  .surface-interactive {
    @apply transition will-change-transform;
    @apply hover:-translate-y-0.5 hover:shadow-md;
  }

  /* Motion defaults */
  .motion-fast { @apply transition duration-150 ease-out; }
  .motion-med  { @apply transition duration-200 ease-out; }

  /* Focus defaults (apply to interactive elements/components) */
  .focus-ring { @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40; }
}
```

**Rules**
- Use **three** surface tiers: flat / card / popover.
- “Interactive” is an additive modifier (never a new random set of shadows).
- Prefer **border + subtle shadow** instead of heavy shadows.

---

## 4) Motion Spec (Reference-Style Micro-Animation)

### 4.1 Global requirements
- Hover lift is subtle: translateY(-1px to -2px). No bouncing, no scaling by default.
- Expand/collapse is smooth and quick (height + opacity).
- Tooltips/popovers fade in/out quickly.
- Use skeletons for loading and for expandable row details.

### 4.2 Reduced motion
- Add a global rule that disables transforms/animated height under reduced motion.
- Ensure expanded content is still accessible and not reliant on animation.

#### Example
```css
@media (prefers-reduced-motion: reduce) {
  .surface-interactive { transform: none !important; }
  .motion-fast, .motion-med { transition: none !important; }
}
```

---

## 5) Core UI Kit (Build Once, Then Migrate)

### 5.1 Primitives (must exist before page migrations)
Create these components (or unify existing ones) so pages don’t invent styles:
1. **Surface** (or Card wrapper)
   - variants: flat / card / popover
   - optional interactive behavior
2. **PageHeader**
   - title, subtitle, right-side actions, optional KPI strip
3. **StatCard**
   - metric, delta (trend badge), optional mini sparkline
   - tabular numerals
4. **Badge / Pill**
   - semantic statuses + neutral tags
5. **DataTable**
   - sticky header (configurable)
   - row hover, row selected
   - density: comfortable / compact
   - column truncation rules
6. **ExpandableRow**
   - standardized expand/collapse interaction with accessible semantics
   - supports lazy-loaded detail content + skeleton state
7. **Skeleton system**
   - cards, table rows, expandable row detail
8. **Popover/Tooltip**
   - consistent padding/radius/shadow, fast fade

### 5.2 Naming + structure (suggested)
```
apps/portal/src/components/ui/
├── surface.tsx
├── page-header.tsx
├── stat-card.tsx
├── badge.tsx
├── skeleton.tsx
├── table/
│   ├── data-table.tsx
│   └── expandable-row.tsx
└── popover/
    ├── tooltip.tsx
    └── popover.tsx
```

### 5.3 DaisyUI alignment
- Keep DaisyUI themes as the source for colors and surfaces.
- Use the semantic classes to standardize elevation/border/radius/motion.
- If radii need to match reference, adjust `--radius-box` (or set `rounded-2xl` via semantic surfaces consistently).

---

## 6) Tables: “Recruiting-Grade” Requirements

### Required behaviors
- **Sticky header** on long lists (opt-in per table).
- **Row hover + row focus** that is clearly visible.
- **Inline actions** that don’t jump layout (reserved column or hover reveal).
- **Expandable rows** for “details without navigation”:
  - chevron affordance
  - accessible button semantics (`aria-expanded`)
  - animation + reduced motion support
  - lazy-load details with skeleton
  - preserve scroll position
- **Density toggle** (comfortable / compact) for power users.

### Anti-patterns to avoid
- 4 different row hover colors across pages
- Actions appearing in different places per table
- Expandable details with no affordance or no keyboard support

---

## 7) Navigation + Layout (App Shell)

### Sidebar target
- Collapsible groups (Realtime Overview, SEO, Paid Ads, Social, Data Sources, Reports, Settings — or Splits equivalents).
- Active item style: subtle bg + accent indicator, not “neon highlight.”
- Collapsed mode (icon-only) for wide desktop workflows.
- Bottom user area: avatar + role + quick actions.

### Page layout target
- Standard page gutters and max width (avoid random container widths).
- Consistent section spacing between header → KPIs → table.

**Deliverable:** `AppShell` layout that all authenticated pages use.

---

## 8) Dashboards + Charts (Supporting Actor)

### Rules
- Charts are supportive and must not hijack attention from actions.
- KPI strip + “what changed” deltas are the hero.
- Use consistent tooltip styling and motion.
- Avoid loading chart libraries globally if not needed.

---

## 9) Execution Plan (Phases)

> The goal is to avoid style drift. We build the system first, then migrate pages quickly.

### Phase A — System Foundation
- Implement semantic surfaces + motion classes + focus ring defaults.
- Build primitives: Surface, PageHeader, StatCard, Badge, Skeleton, Tooltip/Popover.
- Build DataTable + ExpandableRow + density control.
- Create a **UI Kitchen Sink** page that showcases all primitives and variants.

**Exit criteria**
- Kitchen sink page matches the reference feel.
- Dark mode looks intentional (borders + subtle elevation; no muddy surfaces).
- Keyboard focus is visible across the kit.

### Phase B — App Shell + One Flagship Workflow
- Implement AppShell (sidebar + top area spacing).
- Convert one flagship page end-to-end (highest-traffic list view recommended).
- Validate performance and reduced motion behavior.

**Exit criteria**
- One production page is “reference-grade” and proves the system works.

### Phase C — High-Traffic Lists + Tables
- Convert remaining core workflow list pages using DataTable + ExpandableRow pattern.
- Standardize filters, empty states, loading states.

**Exit criteria**
- Tables feel consistent across the product; density toggle present where needed.

### Phase D — Detail Pages + Forms + Settings
- Standardize form sections using Surface + PageHeader patterns.
- Ensure validation states and help text follow typography rules.

### Phase E — Polish + Consistency Sweep
- Remove one-off shadows/borders/radii.
- Add visual regression checks (screenshots) on key pages.
- Run an accessibility and contrast pass.

---

## 10) Definition of Done (Checklist)

### Visual consistency
- All surfaces use `surface-*` classes (no ad-hoc shadows/borders).
- All interactive surfaces use the same hover behavior.
- Radii are consistent across cards, popovers, inputs, pills.

### Motion
- Expand/collapse and tooltip motion follows spec.
- Reduced motion supported and verified.

### Tables
- Sticky header (where needed)
- Hover/focus/selected states consistent
- Expandable row pattern consistent
- Density mode present on heavy-use tables

### Accessibility
- Keyboard navigation validated for core flows.
- Focus rings visible everywhere.
- Contrast validated in both themes.

### Performance
- No layout jank during expand/collapse (avoid costly reflows).
- Chart libraries code-split and loaded only where needed.

---

## 11) Files to Modify / Create (Starting Point)

### Modify
- `apps/portal/src/app/globals.css` (or equivalent)  
  - add semantic surface + motion + focus utilities  
  - add reduced-motion rules
- `apps/portal/src/components/sidebar.tsx`  
  - implement AppShell sidebar spec
- Key table/list pages under `apps/portal/src/app/(authenticated)/...`

### Create
- `apps/portal/src/components/ui/*` (primitives listed above)
- `apps/portal/src/app/(authenticated)/ui-kitchen-sink/page.tsx` (internal-only route)

---

## 12) Notes / Guardrails
- **Do not** “fix” the look by increasing shadows everywhere. Use borders and subtle elevation.
- **Do not** create page-specific card variants unless they become primitives.
- **Do not** introduce a second theming system. DaisyUI themes remain the source of color truth.
- When something doesn’t look right, fix it in the **primitive** or **semantic surface** class, not on a page.

---

## 13) Quick Start Task List (First Implementation Sprint)
1. Add `surface-*`, `motion-*`, and `focus-ring` classes to global CSS.
2. Implement `Surface` + `PageHeader` + `Badge` + `Skeleton`.
3. Implement `DataTable` + `ExpandableRow` with:
   - keyboard accessibility
   - skeleton on expand
   - density toggle
4. Build the Kitchen Sink page and match the reference style visually.
5. Convert one flagship list page end-to-end using the new primitives.

