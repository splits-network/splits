# Typography Audit Report -- Splits Network

**Date:** 2026-02-11
**Scope:** `apps/portal/`, `apps/candidate/`, `apps/corporate/`, `services/notification-service/src/templates/`
**Branch:** `staging`
**Agent:** Typography Agent (read-only audit)

---

## Executive Summary

The Splits Network typography system is **largely well-structured** with a strong foundation: system fonts, DaisyUI semantic color tokens, consistent use of `text-base-content` with opacity modifiers, and reusable page header components. However, this audit uncovered **several categories of inconsistency** that undermine the intended type hierarchy.

### Key Findings

| Category | Severity | Count |
|----------|----------|-------|
| Hardcoded color values (text-gray, text-white) | High | ~35 instances |
| Inconsistent h1 sizing across same-context pages | High | 8+ distinct h1 patterns |
| Multiple h1 tags on single page (conditional rendering) | Medium | 2 confirmed pages |
| Excessive opacity value fragmentation (7 tiers instead of 3) | Medium | Systemic |
| Email markdown-to-HTML headings deviate from `components.ts` scale | Medium | 3 elements |
| `text-gradient-primary` defined in portal only | Low | Missing in candidate/corporate |
| `antialiased` applied inconsistently across apps | Low | 1 app only |
| Arbitrary `text-[Npx]` values scattered throughout | Low | ~45 instances |

**Overall grade: B+** -- The fundamentals are correct, but drift has occurred as the codebase grew. Most issues are addressable through targeted cleanup passes rather than architectural changes.

---

## 1. Font Stack Configuration

### Current State

No custom fonts are loaded in any of the three apps. The entire platform relies on the system font stack, which is the intended design.

| App | `@font-face` | Google Fonts | `next/font` | Custom font-family CSS |
|-----|:---:|:---:|:---:|:---:|
| Portal | None | None | None | None |
| Candidate | None | None | None | None |
| Corporate | None | None | None | None |

The email templates (`services/notification-service/src/templates/base.ts`) explicitly set:
```css
font-family: -apple-system, 'Segoe UI', sans-serif;
```

The email signatures in `apps/corporate/public/signatures/` use:
```css
font-family: "Segoe UI", Arial, sans-serif;
```

**Finding:** The email signatures omit `-apple-system` from the stack. This is a minor inconsistency -- email clients on macOS/iOS will fall back to Helvetica rather than San Francisco. Not a blocking issue for emails, but worth standardizing.

### `antialiased` Inconsistency

Only `apps/corporate/` applies `antialiased` to the `<body>`:

| File | Body Class |
|------|-----------|
| `g:\code\splits.network\apps\portal\src\app\layout.tsx` | `flex flex-col min-h-screen bg-base-300` |
| `g:\code\splits.network\apps\candidate\src\app\layout.tsx` | `flex flex-col min-h-screen bg-base-300` |
| `g:\code\splits.network\apps\corporate\src\app\layout.tsx` | `antialiased flex flex-col min-h-screen` |

**Recommendation:** Either add `antialiased` to all three apps or remove it from corporate. Inconsistency in font rendering between apps is perceptible on macOS.

---

## 2. Heading Hierarchy (h1 through h6)

### 2.1 h1 Usage -- Inventory of Patterns

The codebase uses **three distinct mechanisms** for rendering h1 elements:

1. **`PageTitle` + `PortalHeader`** (portal authenticated pages) -- Sets the h1 in the sticky header bar via context. Renders as `text-base lg:text-lg font-semibold`.
2. **`PageHeader` component** (portal + candidate shared UI) -- Renders `text-2xl font-bold text-base-content`.
3. **`AdminPageHeader` component** (portal admin pages) -- Renders `text-2xl sm:text-3xl font-bold`.
4. **Inline h1 tags** (ad-hoc across many pages) -- Varying sizes and weights.
5. **`DocPageHeader` component** (documentation pages) -- Renders `text-3xl font-semibold text-base-content`.

#### h1 Sizing Fragmentation

The following distinct h1 sizing patterns were found across the three apps:

| Pattern | Context | Files |
|---------|---------|-------|
| `text-base lg:text-lg font-semibold` | Portal header toolbar (via PageTitle) | `g:\code\splits.network\apps\portal\src\components\portal-header.tsx` |
| `text-lg font-semibold` | Candidate header toolbar | `g:\code\splits.network\apps\candidate\src\components\portal-toolbar.tsx` |
| `text-2xl font-bold` | PageHeader component, teams page | Multiple portal pages |
| `text-2xl sm:text-3xl font-bold` | AdminPageHeader | `g:\code\splits.network\apps\portal\src\app\portal\admin\components\admin-page-header.tsx` |
| `text-2xl font-semibold` | Recruiter marketplace detail header | `g:\code\splits.network\apps\portal\src\app\portal\marketplace\recruiters\components\browse\detail-header.tsx` |
| `text-3xl font-bold` | Billing, integrations, admin pages | ~15 portal pages |
| `text-3xl font-semibold` | Documentation section pages | ~8 documentation pages |
| `text-3xl md:text-4xl font-bold` | Candidate dashboard | `g:\code\splits.network\apps\candidate\src\app\portal\dashboard\page.tsx` |
| `text-4xl font-bold` | Candidate documents, invitations, marketplace | ~6 candidate pages |
| `text-4xl md:text-5xl font-bold` | Candidate not-found page | `g:\code\splits.network\apps\candidate\src\app\not-found.tsx` |
| `text-5xl font-bold` | Legal/policy pages (all three apps) | ~9 pages |
| `text-5xl md:text-6xl font-bold` | Portal public marketing pages | ~6 pages |
| `text-5xl md:text-6xl lg:text-7xl font-bold` | Portal + corporate hero sections | 2 hero components |
| `text-5xl md:text-7xl font-bold` | Candidate hero section | `g:\code\splits.network\apps\candidate\src\components\landing\sections\hero-section.tsx` |
| `text-9xl font-bold text-primary` | Portal 404 page | `g:\code\splits.network\apps\portal\src\app\not-found.tsx` |
| `text-[12rem] md:text-[16rem] font-black` | Corporate 404 page | `g:\code\splits.network\apps\corporate\src\app\not-found.tsx` |
| `card-title text-2xl` | Accept invitation page | `g:\code\splits.network\apps\portal\src\app\(auth)\accept-invitation\[id]\AcceptInvitationClient.tsx` |

**Standard says:** h1 should be `text-2xl md:text-3xl font-bold`.

**Assessment:** The `PageHeader` and `AdminPageHeader` components are close to the standard, but inline h1 usage varies wildly. Portal authenticated pages range from `text-2xl` to `text-3xl`. Candidate portal pages jump from `text-3xl` to `text-4xl`. Marketing and public pages use display-level sizes (`text-5xl`+), which is acceptable for hero sections but creates a gap when legal pages also use `text-5xl`.

### 2.2 Multiple h1 Tags Per Page

**`g:\code\splits.network\apps\portal\src\app\portal\billing\components\company-billing-content.tsx`**
- Lines 109 and 134 both render `<h1>` tags. These are in separate conditional branches (one for "no company" state, one for the main view), so only one renders at a time. This is technically acceptable but would be cleaner with a shared header extraction.

**Portal pages using `PageTitle` + having a separate `PageHeader` or inline h1:**
- Some portal authenticated pages set the title via `PageTitle` (which renders h1 in the PortalHeader) AND also render their own h1 in the page body. The portal-header h1 is always visible. If the page body also has an h1, there would be two h1 elements in the DOM. This needs file-by-file verification but is a structural risk.

### 2.3 h2 Sizing Patterns

| Pattern | Context |
|---------|---------|
| `text-2xl font-bold` or `text-2xl font-semibold` | Application wizard steps (candidate) |
| `text-4xl md:text-5xl font-bold` | Corporate landing sections |
| `card-title text-2xl` | Various card headings |
| `text-xl font-bold` | Subsection within portal pages |

**Standard says:** h2 should be `text-xl md:text-2xl font-semibold`.

**Assessment:** Corporate landing page h2 elements are oversized at `text-4xl md:text-5xl`, but this is expected for marketing sections where visual impact overrides strict hierarchy. The portal h2 usage is mostly aligned.

### 2.4 h3 through h6 Usage

- **h3**: Used extensively, generally `text-lg font-semibold` or `font-bold text-xl`. Mostly aligned with standard.
- **h4**: Used in 26+ files. Commonly `card-title` or `text-xs font-semibold uppercase tracking-wider` (section labels). No explicit text size standard exists for h4.
- **h5**: Used in 18+ instances. Inconsistent -- ranges from `font-bold text-sm` to `font-semibold text-base` to bare `font-semibold` with no size class.
- **h6**: Used only in footer components (`footer-title` class). Consistent pattern. 3 files total.

**Finding: h4 and h5 have no defined standard in the type scale.** Components use them for labeling purposes with ad-hoc styling.

### 2.5 Heading Level Skips

Heading level skips (h1 -> h3 without h2, etc.) likely exist but would require full DOM tree analysis of rendered pages to confirm. The component-based architecture makes static analysis difficult since h2 elements may be in child components. The use of `card-title` (which is semantic h2 styling) alongside actual `<h3>` tags within the same card suggests some implicit hierarchy that does not match DOM semantics.

---

## 3. Text Sizing Consistency

### 3.1 Portal Authenticated Pages (Expected: `text-sm` body)

The portal authenticated area (`apps/portal/src/app/portal/`) heavily uses `text-sm` as expected:

- **595 occurrences** of `text-sm` across 121 files in `/portal/`
- Body text, table cells, form labels, and metadata are predominantly `text-sm`

However, some portal pages use larger body text:
- `text-base` description text appears in billing pages and profile pages
- `text-lg` is used for subtitles in some portal pages (e.g., candidate dashboard subtitle: `text-lg text-primary-content/90`)

**Assessment:** Generally compliant. The few `text-base` usages in descriptions and subtitles are acceptable as secondary emphasis text, not primary body text.

### 3.2 Marketing / Public Pages (Expected: `text-base` body)

The public pages (`apps/portal/src/app/public/`, candidate public, corporate) use `text-base` extensively:

- **226 occurrences** of `text-base ` in `apps/portal/src/app/public/` across 35 files
- Documentation pages consistently use `text-base text-base-content/70` for descriptions

**Assessment:** Well-aligned with the standard.

### 3.3 Arbitrary Pixel Sizes (`text-[Npx]`)

Approximately **45 instances** of arbitrary text sizes were found:

| Value | Usage | Files |
|-------|-------|-------|
| `text-[8px]` | Activity heatmap labels | `g:\code\splits.network\apps\candidate\src\components\charts\activity-heatmap.tsx` |
| `text-[9px]` | Activity heatmap axis labels | Same file |
| `text-[10px]` | Metadata timestamps, icon sizing, list meta | ~20 files across portal and candidate |
| `text-[11px]` | Application list item metadata | `g:\code\splits.network\apps\candidate\src\components\dashboard\application-list-item.tsx` |
| `text-[12rem]` / `text-[16rem]` | 404 page display number | `g:\code\splits.network\apps\corporate\src\app\not-found.tsx` |
| `text-[20rem]` | 404 page icon | `g:\code\splits.network\apps\portal\src\app\not-found.tsx` |

**Assessment:** The `text-[10px]` pattern is the most concerning as it appears in ~20 files. This sits between `text-[9px]` (Tailwind `text-xs` equivalent) and should likely be standardized to `text-xs` with appropriate spacing adjustments. The display-size values on 404 pages are acceptable one-off creative treatments. The `text-[8px]`/`text-[9px]` in charts are legitimate micro-typography for data visualization.

---

## 4. Font Weight Usage

### Weight Distribution

| Weight | Class | Occurrences | Primary Usage |
|--------|-------|-------------|--------------|
| 400 | `font-normal` | ~50 | Explicit normal weight resets |
| 500 | `font-medium` | ~200 | Labels, navigation, secondary headings, form helpers |
| 600 | `font-semibold` | ~400 | Card titles, h2/h3, table headers, sidebar items |
| 700 | `font-bold` | ~800 | h1 headings, stat values, emphasis, marketing text |
| 800 | `font-extrabold` | 0 (in apps) | Not used in frontend (email h1 only) |
| 900 | `font-black` | 1 | Corporate 404 page |
| 300 | `font-light` | 0 | Not used |
| 100 | `font-thin` | 0 | Not used |

**Finding:** `font-bold` is the dominant weight class at ~800 occurrences. While many of these are on headings and stat values (correct usage), the sheer volume suggests it may be over-applied. The standard warns: "Using `font-bold` on everything dilutes the visual hierarchy."

**Specific concern:** Marketing content pages apply `font-bold` to h2 section headings where the standard specifies `font-semibold`. Examples:
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\solution-section.tsx:118` -- `text-4xl md:text-5xl font-bold`
- `g:\code\splits.network\apps\corporate\src\components\landing\sections\problem-section.tsx:145` -- `text-4xl md:text-5xl font-bold`
- All corporate landing h2 elements use `font-bold` instead of `font-semibold`

---

## 5. Text Color Hierarchy

### 5.1 Semantic Color Usage (Correct)

The codebase overwhelmingly uses DaisyUI semantic colors. Opacity modifier distribution:

| Modifier | Occurrences | Intended Usage | Actual Usage |
|----------|-------------|----------------|-------------|
| `/30` | 45 | Disabled text | Disabled states, decorative elements, background text |
| `/40` | 80 | (Not in standard) | Timestamps, meta info in list items |
| `/50` | 204 | Muted text | Timestamps, helper text, secondary meta |
| `/60` | 548 | (Not in standard) | Descriptions, subtitles, breadcrumbs, helper text |
| `/70` | 941 | Secondary text | Descriptions, subtitles, muted paragraphs |
| `/80` | 246 | (Not in standard) | Active breadcrumbs, semi-emphasized text |
| `/90` | 9 | (Not in standard) | Slightly muted primary text |

**Finding: The standard defines three tiers (`/70` secondary, `/50` muted, `/30` disabled), but the codebase uses seven distinct tiers.** The most frequently used value is `/70` (941 occurrences) followed by `/60` (548 occurrences). There is significant overlap between `/60` and `/70` -- both are used for "descriptions" and "subtitles" interchangeably.

**Specific examples of inconsistency:**

Same component type, different opacity:
- `AdminPageHeader` subtitle: `text-base-content/70` (`g:\code\splits.network\apps\portal\src\app\portal\admin\components\admin-page-header.tsx:67`)
- `PageHeader` description: `text-base-content/60` (`g:\code\splits.network\apps\portal\src\components\ui\page-header.tsx:75`)
- `PortalHeader` subtitle: `text-base-content/60` (`g:\code\splits.network\apps\portal\src\components\portal-header.tsx:92`)
- `DocPageHeader` description: `text-base-content/70` (`g:\code\splits.network\apps\portal\src\app\public\documentation\components\doc-page-header.tsx:40`)

All four of these serve the same purpose (page subtitle/description) but use two different opacity values.

### 5.2 Hardcoded Color Values (Anti-Pattern)

**`text-gray-600`** (breaks dark mode):
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\table\row.tsx:118` -- GitHub icon
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\table\row.tsx:241` -- GitHub icon

**`text-white`** (acceptable in some contexts, problematic in others):

Approximately 30+ instances of `text-white` found. Most are inside gradient backgrounds (`bg-primary`, `bg-gradient-to-br from-primary to-secondary`) where `text-white` is correct because these backgrounds do not change between light and dark themes. However, some instances warrant review:

- `g:\code\splits.network\apps\portal\src\components\representation-status.tsx:104` -- `badge badge-success text-white` -- DaisyUI badges should use `text-success-content` instead
- `g:\code\splits.network\apps\portal\src\components\representation-status.tsx:108` -- `badge badge-error text-white`
- `g:\code\splits.network\apps\portal\src\components\representation-status.tsx:114` -- `badge badge-warning text-white`
- `g:\code\splits.network\apps\portal\src\components\representation-status.tsx:118` -- `badge badge-info text-white`

These should use the DaisyUI `-content` variant (e.g., `text-error-content`) for theme compatibility.

**Hover-state hardcoded colors** (acceptable UX pattern):
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\grid\item.tsx:116` -- `hover:bg-[#0A66C2] hover:text-white` (LinkedIn brand color)
- `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\grid\item.tsx:142` -- `hover:bg-[#238636] hover:text-white` (GitHub brand color)

These use hardcoded third-party brand colors, which is an acceptable exception.

### 5.3 `opacity-*` vs `text-base-content/*`

The codebase uses **448 instances of raw `opacity-*`** classes (across 117 files). While `opacity-*` affects the entire element (including backgrounds, borders, and children), `text-base-content/70` only affects text color. Many instances of `opacity-60`, `opacity-80` etc. are on landing page animations and are not typography-related. However, some are used on text elements where `text-base-content/*` would be more semantically correct.

---

## 6. Responsive Typography

### Patterns Found

The codebase applies responsive text sizing in these patterns:

| Pattern | Usage |
|---------|-------|
| `text-2xl md:text-3xl` | Standard page heading (h1) |
| `text-2xl sm:text-3xl` | Admin page header |
| `text-3xl md:text-4xl` | Candidate dashboard h1 |
| `text-4xl md:text-5xl` | Corporate section headings |
| `text-5xl md:text-6xl` | Marketing hero headings |
| `text-5xl md:text-6xl lg:text-7xl` | Landing page hero |
| `text-5xl md:text-7xl` | Candidate hero (skips `text-6xl`) |
| `text-base lg:text-lg` | Portal header title |
| `text-xs lg:text-sm` | Portal header subtitle |

**Finding:** The responsive breakpoint prefixes are inconsistent. Some use `sm:`, some `md:`, some `lg:`. The candidate hero jumps from `text-5xl` to `text-7xl` at `md:` (skipping `text-6xl`), while the portal hero goes `text-5xl -> text-6xl -> text-7xl` across three breakpoints. These should use the same scaling progression.

**Missing responsive treatment:** Many inline h1 elements lack responsive sizing entirely:
- `text-5xl font-bold` (legal pages) -- No responsive reduction for mobile
- `text-4xl font-bold` (candidate documents) -- No responsive reduction
- `text-3xl font-bold` (billing, integrations) -- No responsive reduction

At `text-5xl` (3rem / 48px) on mobile viewports, headings may overflow or create poor readability.

---

## 7. Cross-App Consistency

### 7.1 Theme Token Alignment

All three apps share the same base token values for `base-content`:

| Token | Portal Light | Candidate Light | Corporate Light |
|-------|-------------|-----------------|-----------------|
| `--color-base-content` | `#111827` | `#111827` | `#111827` |
| `--color-primary` | `#233876` | `#233876` | `#233876` |
| `--color-secondary` | `#0f9d8a` | `#0f9d8a` | `#0f9d8a` |
| `--color-accent` | `#945769` | `#60a5fa` | `#60a5fa` |

**Finding:** The `accent` color differs between portal (`#945769` -- mauve/rose) and candidate/corporate (`#60a5fa` -- sky blue). This is intentional branding but worth documenting as it affects `text-accent` usage.

### 7.2 PageHeader Component Duplication

Both portal and candidate apps have a `PageHeader` component at identical paths:
- `g:\code\splits.network\apps\portal\src\components\ui\page-header.tsx`
- `g:\code\splits.network\apps\candidate\src\components\ui\page-header.tsx`

These are **identical** in implementation (text-2xl font-bold, text-base-content/60 description). This is good for consistency but represents code duplication. The component could be extracted to `packages/shared-ui/`.

### 7.3 StatCard Component Duplication

Both apps have `StatCard` components:
- `g:\code\splits.network\apps\portal\src\components\ui\cards\stat-card.tsx`
- `g:\code\splits.network\apps\candidate\src\components\ui\cards\stat-card.tsx`

These are near-identical. Both use DaisyUI `stat-value` and `stat-desc` classes for typography, which is correct. Minor difference: portal version has `stat-title whitespace-normal` while candidate version has `stat-title` without the whitespace override.

### 7.4 `text-gradient-primary` Missing from Candidate/Corporate

The `.text-gradient-primary` utility class is defined only in `g:\code\splits.network\apps\portal\src\app\globals.css:160`. It is not available in the candidate or corporate apps. While it is not currently used in those apps either, any future use would fail silently.

### 7.5 CSS Design Tokens

The portal `globals.css` contains a comprehensive design token system (elevation shadows, animations, etc.) that is absent from candidate and corporate. Typography-specific items are limited to the `.text-gradient-primary` class. The candidate and corporate `globals.css` files are minimal (only Tailwind imports and theme references).

---

## 8. Email Template Typography

### 8.1 `heading()` Function (Consistent)

The `heading()` function in `g:\code\splits.network\services\notification-service\src\templates\components.ts` defines:

| Level | Font Size | Weight | Color | Line Height |
|-------|-----------|--------|-------|-------------|
| h1 | 28px | 800 | #111827 | 1.2 |
| h2 | 22px | 700 | #111827 | 1.2 |
| h3 | 18px | 600 | #111827 | 1.2 |

These align with the standard.

### 8.2 `markdownToHtml()` Function (Inconsistent)

The `markdownToHtml()` function in the same file applies different heading styles than `heading()`:

| Element | `heading()` | `markdownToHtml()` | Discrepancy |
|---------|-----------|-------------------|-------------|
| h1 | 28px / weight 800 / #111827 | 24px / weight 600 / #233876 | Size -4px, weight -200, different color |
| h2 | 22px / weight 700 / #111827 | 20px / weight 600 / #233876 | Size -2px, weight -100, different color |
| h3 | 18px / weight 600 / #111827 | 18px / weight 600 / #233876 | Same size/weight, different color |

**Finding:** When email content includes markdown (e.g., job descriptions), the headings will be smaller and lighter than the template headings. The color also differs -- `markdownToHtml()` uses brand blue `#233876` while `heading()` uses dark gray `#111827`. This creates inconsistent visual hierarchy within a single email if both systems produce headings.

### 8.3 Other Email Typography Elements (Consistent)

| Element | Implementation | Alignment |
|---------|---------------|-----------|
| Body paragraph | 15px / weight 400 / #374151 / line-height 24px | Matches standard |
| Small/muted | 13px / weight 500 / #6b7280 / line-height 20px | Matches standard |
| Button text | 16px / weight 600 / #ffffff | Matches standard |
| Badge text | 13px / weight 600 | Matches standard |
| Alert text | 14px / weight 700 (title), 14px / line-height 20px (body) | Slightly different from standard body (15px) |
| Info card labels | 13px / weight 500 / #6b7280 | Matches muted text standard |
| Info card values | 14px / weight 600 / #111827 | Consistent |
| Info card title h3 | 16px / weight 700 / #111827 | Consistent |
| Footer links | 14px / weight 600 | Consistent |
| Footer legal | 13px / line-height 20px | Matches small/muted standard |

### 8.4 Email Font Family

The base email template uses `-apple-system, 'Segoe UI', sans-serif` matching the standard. The MSO fallback specifies `"Segoe UI", sans-serif` for Outlook. This is correct.

---

## 9. Component-Level Text Patterns

### 9.1 Buttons

Buttons use DaisyUI `btn` classes exclusively. No custom font-size or font-weight overrides were found on button elements. Typography is handled by DaisyUI's component styling. This is correct.

### 9.2 Badges

The `.badge` class has a global override in portal's `globals.css`:
```css
.badge {
    @apply h-auto;
}
```

Badge text typically uses either DaisyUI's default badge styling or explicit `text-xs font-semibold` when customized. This aligns with the standard.

### 9.3 Form Labels / Fieldset Labels

Form labels use `text-sm font-medium` or DaisyUI `fieldset-label` class. Helper text beneath form fields uses `text-xs text-base-content/60`. The standard specifies `text-xs text-base-content/60` for helper text, which matches.

### 9.4 Table Headers

Table headers in the portal admin pages use `text-sm font-semibold` via the DataTable components. This is consistent across the codebase.

### 9.5 Monospace / Code Text

Usage of `font-mono` is found in 60+ instances across the codebase. Common patterns:
- `font-mono text-sm` -- API keys, IDs, integration details (matches standard)
- `font-mono text-xs` -- Cookie names, technical identifiers (appropriate size reduction)
- `font-mono text-lg tracking-wider` -- Invitation codes (portal join flow)
- `font-mono text-2xl font-bold` -- Large code displays (invitation codes, fee amounts)

**Assessment:** Mostly aligned. The `font-mono text-2xl` pattern for invitation codes is a creative choice that works well for that context.

---

## 10. Specific Inconsistencies by File

### High Priority

| File | Issue | Current | Expected |
|------|-------|---------|----------|
| `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\table\row.tsx:118` | Hardcoded `text-gray-600` | `text-gray-600` | `text-base-content/60` |
| `g:\code\splits.network\apps\portal\src\app\portal\candidates\components\table\row.tsx:241` | Hardcoded `text-gray-600` | `text-gray-600` | `text-base-content/60` |
| `g:\code\splits.network\apps\portal\src\components\representation-status.tsx:104,108,114,118` | `text-white` on badges | `text-white` | Remove (DaisyUI handles badge text color) or use `-content` variant |
| `g:\code\splits.network\apps\portal\src\components\ui\page-header.tsx:75` | Description opacity inconsistent with AdminPageHeader | `text-base-content/60` | `text-base-content/70` (match standard secondary text) |
| `g:\code\splits.network\services\notification-service\src\templates\components.ts:228-230` | `markdownToHtml()` heading sizes deviate from `heading()` | 24px/20px/18px @ 600 | 28px/22px/18px @ 800/700/600 |

### Medium Priority

| File | Issue |
|------|-------|
| `g:\code\splits.network\apps\candidate\src\app\public\terms-of-service\page.tsx:18` | `text-5xl` h1 with no responsive reduction for mobile |
| `g:\code\splits.network\apps\candidate\src\app\public\cookies\page.tsx:14` | Same -- `text-5xl` with no breakpoint |
| `g:\code\splits.network\apps\candidate\src\app\public\privacy\page.tsx:14` | Same pattern |
| `g:\code\splits.network\apps\corporate\src\app\terms-of-service\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\corporate\src\app\privacy-policy\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\corporate\src\app\cookie-policy\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\portal\src\app\public\terms-of-service\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\portal\src\app\public\privacy-policy\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\portal\src\app\public\cookie-policy\page.tsx:18` | Same pattern |
| `g:\code\splits.network\apps\candidate\src\app\portal\documents\page.tsx:229` | h1 `text-4xl` instead of standard `text-2xl md:text-3xl` for portal page |
| `g:\code\splits.network\apps\candidate\src\app\portal\dashboard\page.tsx:304` | h1 `text-3xl md:text-4xl` instead of standard `text-2xl md:text-3xl` for portal page |
| `g:\code\splits.network\apps\candidate\src\app\portal\notifications\page.tsx:128` | h1 `text-3xl` -- slightly oversized for portal context |
| `g:\code\splits.network\apps\corporate\src\app\layout.tsx:134` | `antialiased` present only on corporate |

### Low Priority

| File | Issue |
|------|-------|
| `g:\code\splits.network\apps\portal\src\app\public\documentation\not-found.tsx:8` | h1 uses `font-semibold` while other not-found pages use `font-bold` |
| `g:\code\splits.network\apps\corporate\src\app\not-found.tsx:24` | Uses `font-black` (weight 900) -- only instance in codebase |
| `g:\code\splits.network\apps\candidate\src\components\dashboard\quick-actions-grid.tsx` | 6 instances of `text-[10px]` -- should standardize to `text-xs` |
| Various chart components | `text-[8px]`, `text-[9px]` -- micro-typography for data viz, acceptable but could use Tailwind classes |

---

## 11. Recommended Standards

### Consolidate Opacity Tiers

Reduce from 7 tiers to the 4 defined in the standard:

| Purpose | Current (fragmented) | Recommended |
|---------|---------------------|-------------|
| Primary text | `text-base-content` | `text-base-content` (no change) |
| Secondary text (descriptions, subtitles) | `/60`, `/70`, `/80` used interchangeably | `/70` only |
| Muted text (timestamps, helper text) | `/50`, `/60` used interchangeably | `/50` only |
| Disabled text | `/30`, `/40` | `/30` only |

### Standardize h1 Sizing by Context

| Context | Standard | Current Adherence |
|---------|----------|-------------------|
| Portal authenticated pages | `text-2xl md:text-3xl font-bold` | Low -- varies from `text-2xl` to `text-3xl` |
| Candidate portal pages | `text-2xl md:text-3xl font-bold` | Low -- uses `text-3xl` to `text-4xl` |
| Documentation pages | `text-2xl md:text-3xl font-bold` | Medium -- uses `text-3xl font-semibold` |
| Marketing pages (hero) | `text-5xl md:text-6xl lg:text-7xl font-bold` (display) | High |
| Legal/policy pages | `text-3xl md:text-4xl font-bold` (recommended) | Low -- currently `text-5xl` with no responsive |

### Eliminate Hardcoded Colors

Remove all instances of `text-gray-*` and replace `text-white` on DaisyUI semantic components (badges, alerts) with their `-content` variant.

### Standardize Arbitrary Pixel Values

Replace `text-[10px]` with `text-xs` (12px) throughout, adjusting spacing as needed. Document `text-[8px]` and `text-[9px]` as acceptable exceptions for chart/data visualization micro-typography.

### Add Missing Gradient Utility

Add `.text-gradient-primary` to candidate and corporate `globals.css` if the utility is needed, or extract it to a shared CSS file.

### Fix Email Markdown Heading Scale

Update `markdownToHtml()` in `g:\code\splits.network\services\notification-service\src\templates\components.ts` to match the `heading()` function's sizes and weights for consistency within emails.

---

## 12. Summary Statistics

| Metric | Value |
|--------|-------|
| Total h1 instances found | ~90 |
| Distinct h1 styling patterns | 16 |
| Total h2 instances found | ~150 |
| Total h3 instances found | ~120 |
| Total h4 instances found | ~30 |
| Total h5 instances found | ~20 |
| Total h6 instances found | 6 |
| Hardcoded `text-gray-*` values | 2 |
| `text-white` instances | ~35 |
| `text-base-content/*` total usages | ~2,073 |
| Arbitrary `text-[Npx]` values | ~45 |
| `font-mono` usages | ~60 |
| DaisyUI `stat-value`/`stat-desc` usages | ~180 |
| `card-title` usages | ~410 |
| Pages with `text-5xl`+ h1 without responsive sizing | 9 |
| `font-black` / `font-extrabold` in frontend | 1 |
| Email heading scale mismatches | 2 (h1, h2 in `markdownToHtml`) |

---

*End of audit. No code changes were made. This report is based on static analysis of the codebase on the `staging` branch as of 2026-02-11.*
