# Basel Design Reference

This file is the authoritative reference for Basel (Swiss International Typographic Style) design standards on Splits Network. It is loaded by planning, execution, and verification agents to ensure all UI work is Basel-compliant.

---

## 1. The 5 Pillars of Basel

1. **Editorial Layout** — Split-screen 60/40 compositions, asymmetric grids, diagonal clip-paths
2. **Typography-First** — `font-black` headlines, uppercase kickers with `tracking-[0.2em]`, generous `leading-relaxed` body text
3. **Functional Color** — DaisyUI semantic tokens ONLY — colors serve purpose, never decoration
4. **Deliberate Negative Space** — Generous padding, breathing room, typography-led sections
5. **Progressive Disclosure** — Dropdowns, search overlays, expandable panels; reveal on demand

---

## 2. Visual Signatures

These are the defining visual patterns of Basel. New pages should incorporate these:

- **Diagonal clip-path panels:** `clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)"`
- **Diagonal hero:** `clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)"`
- **Frosted glass headers:** `bg-base-100/95 backdrop-blur-md shadow-sm border-b border-base-300`
- **Thin accent line at header top:** `h-1 bg-primary w-full`
- **Border-left accents on cards:** `border-l-4 border-primary bg-base-200 p-6`
- **Card with accent:** `card card-bordered bg-base-100 border-l-4 border-primary shadow-sm`
- **Top accent on sections:** `border-t-4 border-secondary`, `border-t-2 border-base-300`
- **Square elements:** No rounded corners except `rounded-full` for circles/status dots
- **Kicker text (above headlines):** `text-sm font-semibold uppercase tracking-[0.2em] text-primary`

---

## 3. Color System

### Allowed DaisyUI Semantic Tokens ONLY

| Token | Usage |
|-------|-------|
| `primary` / `primary-content` | Brand actions, CTAs, accent headlines, active states |
| `secondary` / `secondary-content` | Informational context, supporting features |
| `accent` / `accent-content` | Attention, highlights, notification badges |
| `neutral` / `neutral-content` | Dark backgrounds, hero sections, editorial contrast |
| `base-100` / `base-200` / `base-300` / `base-content` | Backgrounds, cards, borders, text |
| `success` / `error` / `warning` / `info` (+`-content`) | Semantic states (use sparingly) |

### Forbidden Patterns (Zero Tolerance)

- **Memphis named colors:** `bg-coral`, `text-teal`, `border-cream`, `bg-dark`, `text-yellow`, `bg-purple`
- **Raw Tailwind palette:** `bg-blue-500`, `text-red-400`, `border-green-300`, etc.
- **Hardcoded hex:** `#FF6B6B`, any `style={{ color: "#..." }}`
- **`bg-white` / `text-white`:** Use `base-100` / `*-content` instead
- **Gradients:** `bg-gradient-to-*`, `linear-gradient()`, `radial-gradient()`
- **Heavy shadows:** `shadow-xl`, `shadow-2xl`
- **Decorative rounded corners:** `rounded-sm` through `rounded-3xl` on structural elements
- **Geometric shape decorations** (Memphis territory)
- **Memphis UI imports:** `@splits-network/memphis-ui`

**Hex exceptions:** Allowed only in `clipPath`, SVG icon paths, and chart data arrays.

### Memphis to Basel Color Mapping

When fixing existing code:

```
bg-coral   → bg-primary          text-coral → text-primary
bg-teal    → bg-secondary        text-teal  → text-secondary
bg-cream   → bg-base-100         bg-dark    → bg-neutral
bg-yellow  → bg-accent           bg-purple  → bg-info
bg-blue-*  → bg-primary          bg-red-*   → bg-error
bg-green-* → bg-success          bg-gray-*  → bg-base-200
```

### Opacity Pattern

Use slash notation, not separate opacity class:
- Correct: `text-base-content/60`
- Wrong: `text-base-content opacity-60`

---

## 4. Typography Rules

### Hierarchy

| Role | Classes |
|------|---------|
| Display headline | `text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[0.95] text-base-content` |
| Section headline | `text-3xl md:text-5xl font-black text-base-content` |
| Kicker (above headline) | `text-sm font-semibold uppercase tracking-[0.2em] text-primary` |
| Body text | `text-base md:text-lg text-base-content/70 leading-relaxed max-w-xl` |
| Caption / helper | `text-sm text-base-content/70` |

### Minimum Readable Size

**NEVER use `text-xs` for human-readable content.** This includes labels, descriptions, helper text, tooltips, error messages, table cells, timestamps, badges, and any content a user reads.

- `text-xs` acceptable ONLY for purely decorative or non-essential UI chrome
- Minimum for readable text: `text-sm`

---

## 5. DaisyUI-First Rule

**Check DaisyUI docs before building any UI component.** Never build custom implementations for patterns DaisyUI provides natively:

| Pattern | DaisyUI Component |
|---------|-------------------|
| Dropdowns | `<div class="dropdown">` with `<ul class="dropdown-content">` |
| Modals | `<dialog class="modal">` |
| Tooltips | `class="tooltip" data-tip="..."` |
| Drawers | `<div class="drawer">` |
| Tabs | `<div role="tablist" class="tabs">` |
| Accordions | `<div class="collapse">` |
| Alerts | `<div class="alert">` |
| Badges | `<span class="badge">` |
| Loading states | `<span class="loading">` |
| Toasts | `<div class="toast">` |

**If a DaisyUI component exists for the pattern, use it. No exceptions.**

When modifying a component that uses a custom implementation where DaisyUI provides the pattern, refactor it to use DaisyUI as part of the change.

---

## 6. Styling Hierarchy

Apply in this order — earlier tiers take precedence:

1. **DaisyUI component classes** (`btn btn-primary`, `card`, `modal`) — handles theming, states, a11y
2. **DaisyUI modifier classes** (`btn-outline`, `badge-secondary`, `input-bordered`)
3. **DaisyUI semantic color tokens** (`text-primary`, `bg-base-200`, `border-accent`)
4. **App-local Basel components** (`apps/{app}/src/components/basel/`)
5. **Raw Tailwind utilities** (layout, spacing, typography sizing only — last resort)

---

## 7. Showcase Directory Map

Reference pages at `apps/corporate/src/app/showcase/*/one/page.tsx`:

| Page Purpose | Showcase Reference |
|-------------|-------------------|
| Navigation / headers | `headers/one` |
| Site footers | `footers/one` |
| Dashboards / analytics / KPIs | `dashboards/one` |
| Data lists / filtered views | `lists/one` |
| Form layouts | `forms/one` |
| Card variants | `cards/one` |
| Dialog patterns | `modals/one` |
| User profiles | `profiles/one` |
| Settings pages | `settings/one` |
| Hero sections / landing | `landing/one` |
| Content / articles | `articles/one` |
| Data tables | `tables/one` |
| Multi-step flows | `onboarding/one` |
| Search / browse | `search/one` |
| Notifications | `notifications/one` |
| Chat / messaging | `messages/one` |
| Auth pages | `auth/one` |
| Empty states | `empty/one` |
| Pricing | `pricing/one` |
| Detail views | `details/one` |

**ALWAYS check the relevant showcase page before implementing a new UI pattern.**

---

## 8. GSAP Animation Patterns

### Setup

```tsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const containerRef = useRef<HTMLDivElement>(null);

useGSAP(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(".animate-target", { opacity: 1 });
    return;
  }

  const el = containerRef.current?.querySelector(".animate-target");
  if (!el) return;

  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power3.out",
      clearProps: "transform"  // MANDATORY
    }
  );
}, { scope: containerRef });
```

### Mandatory Rules

- **Always use `useGSAP`** with `{ scope: containerRef }` — never raw `useEffect`
- **Always add `clearProps: "transform"`** on any animation using `y`, `x`, `rotateX`, `scale`, `skewX`, `skewY`
  - GSAP leaves residual `transform` on elements even when animating to 0
  - This creates a CSS containing block that traps `position: fixed` children
  - Breaks DaisyUI modals, dropdowns, and any fixed-position elements
- **Always null-check** querySelector results before animating
- **Always implement `prefers-reduced-motion`** — set opacity-0 elements to 1 and early return
- **Elements start `opacity-0`** in className, GSAP animates them in

### Standard Eases

| Use Case | Ease |
|----------|------|
| Entrances | `power3.out` |
| Stagger lists | `power2.out` with `stagger: 0.1` |
| Attention / emphasis | `power4.inOut` |

---

## 9. Component Placement Rules

**Two tiers ONLY — no exceptions:**

1. **Shared across 2+ apps** → `packages/basel-ui/src/{category}/` → import as `@splits-network/basel-ui`
2. **Local to ONE app** → `apps/{app}/src/components/basel/` → import as `@/components/basel/...`

**NEVER place Basel components at:**
- `apps/{app}/src/components/` root (must be inside `basel/` subdirectory)
- `apps/{app}/src/app/{feature}-basel/components/` (page-level dirs)
- `packages/shared-ui/` (non-design-system shared code only)

After placing in `packages/basel-ui/`, update barrel exports and run `pnpm --filter @splits-network/basel-ui build`.

---

## 10. FontAwesome Icon Convention

Use FontAwesome inline:
```tsx
<i className="fa-duotone fa-regular fa-icon-name" />
```

**Never use `<FontAwesomeIcon>` React components** — they add unnecessary bundle weight.

---

## 11. Responsive Design Requirements

Every Basel page MUST be fully responsive. Mobile is first-class.

### Layout
- Responsive grids: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5`
- Split-screen collapse: `flex flex-col lg:flex-row`
- Sidebar stacking: `col-span-full lg:col-span-2`
- Padding scales: `p-4 md:p-6 lg:p-8`

### Tables (Critical)
- Always use `overflow-x-auto` wrapper
- Priority columns: `hidden md:table-cell` for lower-priority columns
- 4+ column tables: card view on mobile below `md:` breakpoint
- Never let table content overflow without scroll container

### Components
- Buttons: `w-full sm:w-auto`
- Modals: `modal-bottom sm:modal-middle`
- Cards: single column on mobile, grid on desktop
- Navigation: hamburger on mobile, horizontal on desktop
- Large text scales: `text-4xl md:text-5xl lg:text-7xl`

---

## 12. Forbidden Patterns Checklist

Planning agents MUST check. Execution agents MUST fix. Verification agents MUST catch.

- [ ] `text-xs` on human-readable content
- [ ] Memphis named colors (coral, teal, cream, dark, yellow, purple)
- [ ] Raw Tailwind palette colors (bg-blue-500, text-red-400, etc.)
- [ ] Hardcoded hex colors in className or style props
- [ ] Gradients (bg-gradient-*, linear-gradient, radial-gradient)
- [ ] Decorative rounded corners (rounded-sm through rounded-3xl)
- [ ] Heavy shadows (shadow-xl, shadow-2xl)
- [ ] Custom dropdown/modal/tooltip implementations (use DaisyUI)
- [ ] GSAP animations without `clearProps: "transform"`
- [ ] GSAP in `useEffect` instead of `useGSAP`
- [ ] `<FontAwesomeIcon>` React component (use inline `<i>`)
- [ ] Fixed grids without responsive breakpoints
- [ ] Tables with 4+ columns and no mobile handling
- [ ] Basel components outside the two approved locations
- [ ] Missing editorial layout on new pages (no split-screen, no border-l-4, no kicker text)
- [ ] `bg-white` or `text-white` (use DaisyUI semantic tokens)
- [ ] `opacity-60` as separate class instead of slash notation (`/60`)
- [ ] Memphis UI imports (`@splits-network/memphis-ui`)
- [ ] Backwards-compat cruft (unused _vars, re-exports, compat shims)

---

## 13. Chart Rules

### Library
- **Recharts ONLY.** Chart.js, ApexCharts, Nivo, and others are forbidden.

### Basel Chart Design
- `radius={0}` on bars, `cornerRadius={0}` on pies — sharp corners everywhere
- Grid: `strokeDasharray="3 3"`, stroke `oklch(var(--bc) / 0.08)`, no vertical lines
- Lines: `type="monotone"`, `strokeWidth={2}`, `dot={{ r: 3 }}`
- Axis labels: `fontSize={10}`, `fontWeight={500}`, normal case (not uppercase)
- No shadows, no gradients in SVG
- Editorial chrome: `border-l-4 border-primary pl-4` header with kicker + title

### Colors
Use DaisyUI CSS custom properties via `useBaselChartColors()` hook. Color assignment order for multi-series: Primary → Secondary → Accent → Info → Success → Error → Warning.

### Custom Tooltip
Use `BaselTooltip`: sharp `borderRadius: 0`, `1px solid` subtle border, `3px solid` left-accent per series.

### Shared Utilities
Located at `packages/basel-ui/src/charts/`:
- `use-basel-chart-colors.ts` — DaisyUI color hook with MutationObserver for theme changes
- `basel-tooltip.tsx` — Custom tooltip component
- `chart-utils.ts` — Chart.js → Recharts data transform utilities

App-specific chart components go in `apps/{app}/src/components/basel/`.

---

## Parallel Page Strategy

Basel pages are created as **parallel pages** alongside originals:
- Create `{feature}-basel/page.tsx` next to `{feature}/page.tsx`
- The original page is a **DATA SOURCE ONLY**: extract API calls, hooks, handlers, types
- **IGNORE** all layout, component structure, UI patterns, and styling from the original
- No backwards compatibility required — Basel pages are fresh implementations

---

## Brand Voice (for copy agents)

| App | Voice |
|-----|-------|
| Employment Networks (Corporate) | "Two platforms. One connected ecosystem." |
| Splits Network (Portal) | "Post a role. Find talent. Split the fee." |
| Applicant Network (Candidate) | "Your career, represented by specialists who compete to find you the right fit." |

**Tone:** Editorial, precise, authoritative, clean. Journalist voice, not marketer voice. No exclamation marks, no buzzwords, no urgency hacking.
