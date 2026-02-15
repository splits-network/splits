# /memphis:fix - Auto-Fix Memphis Violations

**Category:** Design System
**Description:** Automatically fix Memphis design violations in files (audit → fix → verify loop)

## Usage

```bash
/memphis:fix <target>
/memphis:fix <app> --all
```

## Parameters

- `<target>` - Path to specific file or directory to fix
- `<app>` - App name (portal, candidate, corporate) with `--all` flag

## Examples

```bash
/memphis:fix apps/portal/src/components/header-memphis.tsx
/memphis:fix apps/portal/src/components/footer-memphis.tsx
/memphis:fix portal --all
```

## Styling Hierarchy (CRITICAL)

**Why this order matters:** The higher you go, the more design decisions are already made for you. A `<Button>` component already has the correct 3px interactive border, colors, typography, and hover states baked in — you don't need to think about any of it. A `memphis-btn` CSS class has the correct border tier built in. Raw Tailwind makes you responsible for every decision, which means more room for error.

When fixing violations, apply this hierarchy in order:

### 1. Memphis UI React Components (FIRST CHOICE)
Use pre-built components from `@splits-network/memphis-ui` (86+ components).
Design decisions (border tier, colors, typography) are already correct.

```tsx
// ❌ WRONG — building a header from raw HTML/Tailwind
<nav className="bg-dark border-b-4 border-coral">
  <a className="text-cream font-bold uppercase">Logo</a>
  <button className="bg-coral text-dark border-4 border-dark">Sign Up</button>
</nav>

// ✅ CORRECT — use memphis-ui components
import { HeaderLogo, NavItem, HeaderCta, HeaderDecorations } from '@splits-network/memphis-ui';
<HeaderLogo brand="splits" />
<NavItem label="Jobs" href="/jobs" />
<HeaderCta label="Sign Up" href="/register" />
```

Key components to check before writing raw markup:
- **Header**: HeaderLogo, NavItem, NavDropdown, NavDropdownItem, HeaderSearchToggle, HeaderCta, MobileMenuToggle, MobileAccordionNav, HeaderDecorations
- **Footer**: FooterLinkColumn, FooterBottomBar, FooterDecorations, NewsletterSection, SocialLink
- **Cards**: Card, JobCard, RecruiterCard, CompanyCard, StatCard, PricingCard, TestimonialCard, ReviewCard, IntegrationCard, SelectionCard, FeaturedCard, SidebarCard, EmptyStateCard
- **Forms**: Button, Input, Select, Checkbox, Toggle, SearchInput, SearchBar, AuthInput
- **Data**: Table, Pagination, ScoreBar, BulkActionBar, DataTableToolbar, SplitFeeBar, StatBlock
- **Navigation**: Tabs, VerticalTabs, PillTabs, UnderlineTabs, BadgeTabs, Breadcrumb, SettingsNav
- **Feedback**: Toast, AlertBanner, Badge, NotificationBadge, Snackbar, StatusDot, NotificationItem
- **Layout**: Modal, Divider, SectionDivider, ColorBar, GeometricDecoration, AccentCycle
- **Profiles**: Avatar, ProfileHeader, DetailSection, InfoRow, AvailabilityIndicator, ActivityFeed
- **Misc**: Accordion, AccordionItem, Timeline, HorizontalTimeline, StepProgress, BillingToggle, ComparisonTable, FAQAccordion, TrustBadge, BenefitGrid, FilterBar, CategoryFilter, ActiveFilterChips

### 1b. Memphis Plugin CSS Classes (SECOND CHOICE)
When you can't use a React component but need Memphis styling on raw HTML, use the plugin's CSS classes:

**Buttons:**
```tsx
// ❌ WRONG — raw Tailwind
<button className="border-3 border-dark bg-coral text-white font-bold uppercase tracking-wide px-6 py-3">

// ✅ CORRECT — plugin classes
<button className="memphis-btn memphis-btn-md btn-coral">
```

**Badges:**
```tsx
// ❌ WRONG — raw Tailwind
<span className="border-3 border-dark font-bold text-xs uppercase px-3 py-1">

// ✅ CORRECT — plugin class
<span className="memphis-badge bg-coral text-white border-dark">
```

**Forms:**
```tsx
<input className="memphis-input" />
<select className="memphis-select" />
<input type="checkbox" className="memphis-checkbox" />
```

**Cards/Modals:**
```tsx
<div className="memphis-card">...</div>
<div className="memphis-card-dark">...</div>
<div className="memphis-modal">...</div>
```

**Semantic borders (when no component class fits):**
```tsx
className="border-memphis"              // container tier (4px)
className="border-memphis-interactive"  // interactive tier (3px)
className="border-memphis-detail"       // detail tier (2px)
```

Available plugin classes: `.memphis-btn`, `.memphis-btn-sm/md/lg`, `.memphis-btn-outline`, `.btn-coral/teal/yellow/purple/dark`, `.memphis-badge`, `.memphis-input`, `.memphis-select`, `.memphis-checkbox`, `.memphis-toggle`, `.memphis-card`, `.memphis-card-dark`, `.memphis-modal`, `.memphis-table`, `.memphis-tabs`, `.memphis-tab`, `.memphis-tab-active`, `.border-memphis`, `.border-memphis-interactive`, `.border-memphis-detail`

### 2. Memphis CSS Theme Classes (THIRD CHOICE)
If no memphis-ui component or plugin class fits, use the theme's Tailwind tokens:
```tsx
className="bg-coral text-dark border-4 border-dark"
className="text-cream/40"
className="border-b-4 border-teal"
```

### 3. Local Memphis Components (FOURTH CHOICE)
If the component is page-specific and doesn't exist in memphis-ui, create it locally:
```
apps/portal/src/app/{feature}-memphis/components/CustomWidget.tsx
```
The local component must still use memphis-ui primitives and theme classes internally.

### 4. Raw Tailwind (LAST RESORT)
Only for layout/spacing/grid that has no component:
```tsx
className="grid grid-cols-3 gap-6 p-8"
```

## What It Does

Runs an automated **audit → fix → verify** loop until the target has zero violations:

### Phase 1: Scan
Spawns memphis-auditor to scan target file(s) for ALL violation types:
- **Missing memphis-ui component usage** — raw markup where a component exists
- Shadows, rounded corners, gradients (classic violations)
- Hardcoded hex colors (`#FF6B6B`, `#4ECDC4`, `rgba()`, etc.)
- Inline `style={{}}` for visual properties (colors, borders, backgrounds, spacing, opacity)
- Color constant objects (`const M = {}`, `const COLORS = {}`)
- **Raw Tailwind styling where plugin classes exist** — buttons with raw border/bg/font classes instead of memphis-btn, badges with raw classes instead of memphis-badge, etc.
- **Wrong border tier** — border-4 on buttons (should be 3px/memphis-btn), border-2 on cards (should be 4px/memphis-card)
- Component isolation violations (imports from original page tree)

### Phase 2: Fix
Spawns memphis-designer with the violation report to apply fixes **using the hierarchy above**:
- **First**: Replace raw markup with memphis-ui React components where they exist
- **Then**: Replace raw button/badge/input/card markup with plugin CSS classes (memphis-btn, memphis-badge, memphis-input, memphis-card)
- **Then**: Fix wrong border tiers (border-4 on buttons → memphis-btn, border-2 on cards → memphis-card, etc.)
- **Then**: Delete color constant objects entirely (`const M = { ... }`)
- **Then**: Replace inline `style={{}}` with Tailwind theme classes
- **Then**: Replace hardcoded hex with Tailwind color classes
- **Then**: Replace `rgba()` opacity with Tailwind opacity modifiers (`text-cream/40`)
- **Then**: Remove shadows, rounded corners, gradients

### Phase 3: Verify
Re-runs memphis-auditor to confirm zero violations remain.
- If violations remain → loops back to Phase 2 (max 3 iterations)
- If still failing after 3 iterations → escalates to user with detailed report

## Fix Mappings

### Hex → Tailwind
```
#FF6B6B → bg-coral / text-coral / border-coral
#4ECDC4 → bg-teal / text-teal / border-teal
#FFE66D → bg-yellow / text-yellow / border-yellow
#A78BFA → bg-purple / text-purple / border-purple
#1A1A2E → bg-dark / text-dark / border-dark
#F5F0EB → bg-cream / text-cream / border-cream
#2D2D44 → bg-dark (or border-dark with opacity)
```

### RGBA → Tailwind Opacity
```
rgba(255,255,255,0.4)  → text-cream/40
rgba(255,255,255,0.15) → text-cream/15
rgba(255,255,255,0.5)  → text-cream/50
rgba(255,255,255,0.7)  → text-cream/70
```

### Border Tiers (3-tier hierarchy)
```
Container tier (4px — cards, modals, outer frames):
  Raw markup with border-4 → memphis-card / memphis-modal / border-memphis

Interactive tier (3px — buttons, inputs, badges):
  Raw button markup → memphis-btn + btn-{color} + memphis-btn-{size}
  Raw badge markup → memphis-badge
  Raw input markup → memphis-input
  Raw select markup → memphis-select

Detail tier (2px — checkboxes, toggles, small indicators):
  Raw checkbox → memphis-checkbox
  Raw toggle → memphis-toggle
  Other small elements → border-memphis-detail

Wrong tier (always a violation):
  border-4 on buttons → memphis-btn (interactive tier, 3px)
  border-2 on cards → memphis-card (container tier, 4px)
  border-4 on checkboxes → memphis-checkbox (detail tier, 2px)
  border-[5px] → violation (not a valid tier)
  border-1 → violation (not a valid tier)
  5px solid → violation
  1px solid → violation
```

### Tailwind v4 Arbitrary Class → Safe Alternative
**CRITICAL: Arbitrary bracket classes silently fail in Tailwind v4** when the source isn't scanned (packages, default props, dynamic strings). These cause invisible breakage with zero console errors.

```
# Borders — use standard Tailwind class
border-[3px]  → border-4 (standard class, always generated)
border-[4px]  → border-4 (standard class, always generated)
border-[2px]  → border-4 (standard class, always generated)

# Dimensions in component libraries — use inline style
w-[440px]     → style={{ width: '440px' }} or style={{ minWidth: '440px' }}
h-[300px]     → style={{ height: '300px' }} or style={{ minHeight: '300px' }}
min-w-[440px] → style={{ minWidth: '440px' }}

# Dimensions in app code (usually safe, but verify)
w-[440px]     → Check if CSS rule is generated. If not, use inline style.
```

**Rule for memphis-ui package:** NEVER use arbitrary Tailwind classes for configurable values. Use inline styles. Standard classes (`border-4`, `w-72`, `p-4`) are always safe.

### Inline Style → Tailwind Class
```
style={{ backgroundColor: "#1A1A2E" }}     → className="bg-dark"
style={{ borderBottom: "5px solid #FF6B6B" }} → className="border-b-4 border-coral"
style={{ color: "rgba(255,255,255,0.4)" }} → className="text-cream/40"
style={{ borderColor: "#2D2D44" }}         → className="border-dark"
style={{ padding: "1.5rem" }}              → className="p-6"
```

## Report Format

```
Memphis Auto-Fix Report
========================
Target: apps/portal/src/components/header-memphis.tsx

Scan Results (before fix):
- 1 color constant object (const M = {...})
- 8 inline style={{}} violations
- 6 hardcoded hex color references
- 3 non-4px border widths
- Total: 18 violations

Fixes Applied:
- Deleted const M color constant
- Replaced 8 inline styles with Tailwind classes
- Replaced 6 hex references with Tailwind color classes
- Replaced 3 border widths with border-4

Verification (after fix):
- Violations remaining: 0
- Memphis compliance: 100%
- Status: PASS
```

## Implementation

When invoked:
1. Spawns memphis-auditor to scan target
2. Auditor checks for memphis-ui component opportunities (raw markup that could use a component)
3. If violations found, spawns memphis-designer with fix instructions
4. Designer applies fixes **using the styling hierarchy**: components first → theme classes → Tailwind
5. Re-spawns memphis-auditor to verify
6. Loops until clean (max 3 iterations)
7. Reports final compliance status
8. Updates build progress state
