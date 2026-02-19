# /basel:migrate - Migrate Page/Component to Basel Design

**Category:** Design System
**Description:** Migrate a specific page or component to Basel (Designer One) design system

## Usage

```bash
/basel:migrate <target>
```

## Parameters

- `<target>` - Path to page or component file to migrate

## Examples

```bash
/basel:migrate apps/portal/src/app/dashboard/page.tsx
/basel:migrate apps/portal/src/components/JobCard.tsx
/basel:migrate apps/candidate/src/app/profile/page.tsx
```

## Parallel Page Strategy (CRITICAL)

**NEVER modify the original page.** Always create a NEW parallel Basel version:

```
Original: apps/portal/src/app/roles/page.tsx         ← Untouched
Basel:    apps/portal/src/app/roles-basel/page.tsx    ← New file created
```

### THE OLD PAGE IS NOT A DESIGN TEMPLATE

The Basel version uses the old page as a **DATA SOURCE ONLY**:

- Extract: API calls, data fetching hooks, event handlers, route params, auth checks, types
- Ignore: Layout, component structure, UI patterns (side panels, drawers, expandable rows, tabs, modals, card layouts, table structures, filter positions), styling, interaction design

The Basel version:

- Matches the same FUNCTIONALITY (API calls, business logic, user flows)
- Does NOT copy ANY UI patterns or layout from the original
- Is designed FRESH from Designer One showcase patterns in `apps/corporate/src/app/showcase/*/one/`
- May look COMPLETELY DIFFERENT from the original — that's correct

## Color System (CRITICAL)

Basel uses **DaisyUI semantic tokens ONLY**. No custom color palette.

### Allowed Colors

```
primary, primary-content
secondary, secondary-content
accent, accent-content
neutral, neutral-content
base-100, base-200, base-300, base-content
success, success-content
error, error-content
warning, warning-content
info, info-content
```

### FORBIDDEN Colors (NEVER use)

```
Memphis named colors: coral, teal, cream, dark, yellow, purple
Raw Tailwind palette: red-*, blue-*, green-*, slate-*, zinc-*, etc.
Hardcoded hex: #FF6B6B, #4ECDC4, or ANY hex in style={{}}
Memphis UI imports: @splits-network/memphis-ui
```

## Styling Hierarchy (CRITICAL — follow this order)

1. **`@splits-network/basel-ui` components** — Shared Basel components FIRST. Check the package before building anything custom.
2. **DaisyUI component classes** — `btn`, `card`, `badge`, `input`, `select`, `tabs`, `modal`, `table`, etc. DaisyUI handles theming, states, and accessibility.
3. **DaisyUI modifier classes** — `btn-primary`, `btn-outline`, `btn-sm`, `badge-secondary`, `card-bordered`, etc.
4. **DaisyUI semantic theme classes** — `bg-primary`, `text-base-content`, `border-accent`, etc.
5. **App-local Basel components** — `apps/{app}/src/components/basel/` for components specific to one app (NOT `{feature}-basel/components/`)
6. **Raw Tailwind** — LAST RESORT, only for layout/spacing/grid and Basel-specific visual effects (clip-path, backdrop-blur, etc.)

### Component Placement Rules

- **Shared across apps** → `packages/basel-ui/src/` → `@splits-network/basel-ui`
- **Local to one app** → `apps/{app}/src/components/basel/` → `@/components/basel/...`
- **NEVER** put Basel components in `{feature}-basel/components/`, `packages/shared-ui/`, or `apps/{app}/src/components/` root

## Basel Design Principles

Every Basel page MUST follow these principles from Designer One's showcase:

### 1. Editorial Layout

- Split-screen compositions (60/40, 50/50)
- Asymmetric grid layouts
- Magazine-style content flow with generous whitespace
- Clear visual hierarchy through typography scale

### 2. Typography-Driven Hierarchy

- Large display headings (`text-5xl` to `text-7xl`, `font-black`, `tracking-tight`)
- Kicker text above headlines (`text-sm uppercase tracking-[0.2em] text-primary`)
- Body text with comfortable line-height (`leading-relaxed`)
- Section headlines with border-left accents (`border-l-4 border-primary pl-4`)

### 3. Sharp Corners, No Roundness

- `rounded-none` on ALL elements
- Override DaisyUI rounded defaults where needed
- Cards, buttons, inputs, badges — all sharp corners

### 4. Diagonal Clip-Paths

- Hero sections use angled clips: `clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%)`
- Create dynamic visual breaks between sections
- Overlapping clipped sections for depth

### 5. Frosted Glass Headers

- `backdrop-blur-md bg-base-100/90` for scroll-aware navigation
- Semi-transparent backgrounds that blur content behind

### 6. Border-Left Accents

- `border-l-4 border-primary` on cards, sections, quotes
- Visual accent that creates editorial structure

### 7. Subtle Shadows (Unlike Memphis)

- Basel ALLOWS shadows: `shadow-sm`, `shadow-md` for depth
- Keep them subtle — editorial, not heavy
- Used on cards, dropdowns, floating elements

### 8. No Gradients

- Solid fills only
- Use opacity variants (`bg-primary/10`) for lighter backgrounds

### 9. No Geometric Decorations

- No floating shapes, circles, triangles (that's Memphis)
- Basel uses whitespace, typography, and layout for visual interest

### 10. GSAP Animations

- Staggered fade-in on scroll (`ScrollTrigger`)
- `power3.out` easing for smooth motion
- Elements start with `opacity-0` class
- Respect `prefers-reduced-motion`

## Showcase Reference

Designer One showcase pages are the design source of truth:

| Category      | Showcase Path                            |
| ------------- | ---------------------------------------- |
| Headers       | `showcase/headers/one/page.tsx`          |
| Footers       | `showcase/footers/one/page.tsx`          |
| Landing       | `showcase/landing/one/page.tsx`          |
| Cards         | `showcase/cards/one/page.tsx`            |
| Dashboards    | `showcase/dashboards/one/page.tsx`       |
| Tables        | `showcase/tables/one/page.tsx`           |
| Forms         | `showcase/forms/one/page.tsx`            |
| Details       | `showcase/details/one/page.tsx`          |
| Pricing       | `showcase/pricing/one/page.tsx`          |
| Modals        | `showcase/modals/one/page.tsx`           |
| Profiles      | `showcase/profiles/one/page.tsx`         |
| Settings      | `showcase/settings/one/page.tsx`         |
| Notifications | `showcase/notifications-ui/one/page.tsx` |
| Tabs          | `showcase/tabs/one/page.tsx`             |
| Testimonials  | `showcase/testimonials/one/page.tsx`     |
| FAQs          | `showcase/faqs/one/page.tsx`             |
| Timelines     | `showcase/timelines/one/page.tsx`        |
| Calendars     | `showcase/calendars/one/page.tsx`        |
| Articles      | `showcase/articles/one/page.tsx`         |
| Charts        | `showcase/charts/one/page.tsx`           |

## No Backwards Compatibility (CRITICAL)

Basel pages are **fresh implementations**, not upgrades. There is NO requirement for backwards compatibility:

- Do NOT preserve the original page's component API, prop interfaces, or export signatures
- Do NOT re-export original types or add compatibility shims
- Do NOT keep unused imports, variables, or functions from the original
- The ONLY thing carried over is the **data layer** (API calls, hooks, handlers, types)

## Responsive-First Design (CRITICAL)

Every Basel page MUST be fully responsive across mobile, tablet, and desktop:

- **Grids**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` (never fixed grid-cols without breakpoints)
- **Layouts**: `flex-col lg:flex-row` for side-by-side compositions
- **Typography**: `text-3xl md:text-5xl lg:text-7xl` (scale headings)
- **Padding**: `p-4 md:p-6 lg:p-8` (scale spacing)
- **Buttons**: `w-full sm:w-auto` (full-width on mobile)
- **Modals**: `modal-bottom sm:modal-middle` (sheet on mobile, centered on desktop)
- **Tables**: MUST handle mobile — hide low-priority columns (`hidden md:table-cell`), switch to card view, or wrap in `overflow-x-auto`
- **Cards**: Single column on mobile, multi-column on desktop

## Feature Recommendations

If the showcase suggests a new field, feature, or UX improvement not in the original page, the designer MUST flag it:

- **ui_only** (data already exists): Include in Basel page, note in report
- **new_field** (needs DB + API changes): Flag for user decision before adding
- **new_feature** (significant new work): Flag for user discussion

## What It Does

1. Reads target file to extract DATA LAYER ONLY (API calls, hooks, handlers, types)
2. Identifies matching Designer One showcase page in `apps/corporate/src/app/showcase/*/one/` based on page PURPOSE
3. Creates a NEW parallel page at `{feature}-basel/page.tsx`
4. Designs the Basel version FROM SCRATCH using showcase patterns and DaisyUI components
5. Applies Basel design principles:
    - Editorial layouts with asymmetric grids
    - Typography-driven hierarchy
    - Sharp corners (rounded-none) on all elements
    - DaisyUI semantic colors ONLY (bg-primary, text-base-content, etc.)
    - Diagonal clip-paths for hero sections
    - Frosted glass headers with backdrop-blur
    - Border-left accents on cards and sections
    - Subtle shadows for depth (shadow-sm, shadow-md)
    - GSAP scroll animations with power3.out easing
    - ZERO hardcoded hex colors
    - ZERO Memphis color references
    - ZERO Memphis UI imports
6. Flags any feature recommendations
7. **Spawns basel-copy** to write ALL user-facing text (headlines, kickers, descriptions, CTAs, empty states, tooltips, error messages, microcopy)
8. Integrates copy into the Basel page
9. Validates Basel compliance
10. Updates build progress state
11. Saves checkpoint

## Copy Integration (CRITICAL)

Every migrated page needs editorial copy written by `basel-copy`. The designer builds the structure with placeholder text; the copy agent fills in the real words.

**The migration MUST spawn `basel-copy` for:**

- Page headlines and kicker text
- Section headings and descriptions
- CTA button labels
- Empty state messages
- Tooltip text
- Error/success messages
- Any user-facing string that isn't raw data from the API

**Flow:**

1. Designer creates page with placeholder copy (e.g., `{/* COPY: main headline */}`, `{/* COPY: empty state message */}`)
2. Migrate command spawns `basel-copy` with the page context and list of copy needed
3. Copy agent returns editorial text in Designer One's voice
4. Migrate command integrates copy into the page
5. If designer wrote acceptable generic text (e.g., "Save", "Cancel", "Loading..."), copy review is optional

## Implementation

When invoked:

1. Loads build progress state
2. Creates migration task in state file
3. Reads original page to extract DATA LAYER ONLY (API calls, hooks, handlers, route params, auth, types)
4. Identifies matching showcase files from `apps/corporate/src/app/showcase/*/one/` based on page PURPOSE
5. Spawns basel-designer with target, extracted data layer info, and showcase reference
6. Designer creates NEW `{feature}-basel/page.tsx` from scratch using showcase patterns — NOT the old page's UI
7. Designer reports feature recommendations and copy placeholders (if any)
8. **Spawns basel-copy** with page context to write all user-facing text in Designer One's editorial voice
9. Integrates copy into the Basel page (replaces placeholders with final text)
10. Validates Basel compliance (DaisyUI-only colors, sharp corners, editorial layout, responsive)
11. Saves checkpoint on completion
12. Reports success/failure + recommendations to user
