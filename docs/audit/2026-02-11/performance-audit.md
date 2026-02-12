# Frontend Performance Audit Report

**Date:** 2026-02-11
**Auditor:** Performance Agent (Claude Opus 4.6)
**Branch:** staging
**Scope:** apps/portal, apps/candidate, apps/corporate

---

## Executive Summary

This audit examines the frontend performance posture of all three Splits Network Next.js applications. The codebase has a well-structured monorepo architecture with proper separation between server and client components in several areas. However, there are significant performance opportunities being missed that impact Core Web Vitals across all three apps.

**Key findings:**

- **CRITICAL:** Nearly zero usage of `next/image` across the entire codebase. 80+ raw `<img>` tags found with no optimization, no lazy loading control, no responsive sizing, and no WebP conversion.
- **CRITICAL:** Zero `dynamic()` imports anywhere in the codebase. Heavy libraries (chart.js, react-md-editor, GSAP, Stripe) are statically imported into their respective bundles with no code-splitting.
- **HIGH:** Markdown editor CSS (~60KB combined) is loaded globally in root `layout.tsx` for both portal and candidate apps, even on pages that never use the editor.
- **HIGH:** GSAP animation library is imported in 40+ files across all three apps (not just corporate as expected), adding significant JavaScript weight to many page bundles.
- **HIGH:** 27 portal page files and 16 public content pages have `"use client"` at the top level, preventing Server-Side Rendering optimizations for content that could be partially or fully server-rendered.
- **MEDIUM:** No `loading.tsx` route segment files exist anywhere. The App Router's built-in streaming SSR with instant loading states is completely unused.
- **MEDIUM:** No `next/font` usage detected. System fonts rely on browser defaults plus an external FontAwesome CDN stylesheet that is render-blocking.
- **MEDIUM:** FontAwesome loaded as a render-blocking external stylesheet on all three apps, despite a `rel="preload"` hint that does not prevent the render-block.

**Estimated bundle savings from implementing recommendations: 150-300KB of JavaScript per initial page load (gzipped).**

---

## 1. Critical Performance Issues

### 1.1 No `next/image` Usage (CLS, LCP Impact)

**Severity:** CRITICAL
**Impact:** CLS violations, missed WebP conversion, no responsive sizing, no automatic lazy loading
**Affected apps:** All three

Only 3 files in the entire codebase import from `next/image`:

- `g:\code\splits.network\apps\portal\src\app\public\press\press-content.tsx`
- `g:\code\splits.network\apps\portal\src\components\common\UserAvatar.tsx`
- `g:\code\splits.network\apps\portal\src\components\ui\user-avatar.tsx`

Meanwhile, 80+ raw `<img>` tags exist across the apps. Key offenders:

| File                                                                                                      | Issue                                               |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `g:\code\splits.network\apps\portal\src\components\header.tsx` (line 69)                                  | Logo in sticky navbar, no dimensions, no `priority` |
| `g:\code\splits.network\apps\portal\src\components\footer.tsx` (line 28)                                  | Logo, no dimensions                                 |
| `g:\code\splits.network\apps\portal\src\components\portal-header.tsx` (line 76)                           | Authenticated portal logo, no dimensions            |
| `g:\code\splits.network\apps\candidate\src\components\navigation\header.tsx` (lines 144-149)              | Two logos, no dimensions                            |
| `g:\code\splits.network\apps\candidate\src\components\navigation\footer.tsx` (line 9)                     | Logo, no dimensions                                 |
| `g:\code\splits.network\apps\corporate\src\components\Header.tsx` (line 32)                               | Logo, no dimensions                                 |
| `g:\code\splits.network\apps\corporate\src\components\Footer.tsx` (line 12)                               | Logo, no dimensions                                 |
| `g:\code\splits.network\apps\corporate\src\components\landing\sections\hero-section.tsx` (lines 136, 149) | Platform badge images on landing hero               |
| `g:\code\splits.network\apps\portal\src\components\ui\cards\entity-card.tsx` (line 170)                   | Dynamic company logos, no dimensions                |
| `g:\code\splits.network\apps\candidate\src\components\ui\cards\entity-card.tsx` (line 170)                | Dynamic company logos, no dimensions                |
| `g:\code\splits.network\apps\portal\src\components\ui\cards\thumbnail-gallery.tsx` (line 26)              | Gallery thumbnails, no dimensions                   |
| `g:\code\splits.network\apps\portal\src\app\portal\roles\components\grid\card.tsx` (line 91)              | Role card company logo                              |
| `g:\code\splits.network\apps\portal\src\app\portal\roles\components\details-view.tsx` (lines 210, 1154)   | Role detail company logos                           |
| `g:\code\splits.network\apps\candidate\src\app\public\jobs\components\grid\item.tsx` (line 42)            | Job card company logo                               |
| `g:\code\splits.network\apps\candidate\src\app\public\jobs\components\browse\list-item.tsx` (line 40)     | Job list company logo                               |

**Every raw `<img>` without explicit `width` and `height` attributes risks Cumulative Layout Shift (CLS).** Logos in the header/navbar are above-the-fold and directly impact LCP if they are the largest painted element.

**Recommended fix:**

```tsx
// Before (current)
<img src="/logo.svg" alt="Splits Network" className="h-10" />;

// After
import Image from "next/image";
<Image src="/logo.svg" alt="Splits Network" width={160} height={40} priority />;
```

For dynamic user/company images loaded from Supabase:

```tsx
<Image
    src={company.logo_url}
    alt={company.name}
    width={48}
    height={48}
    className="rounded-full"
/>
```

**Note:** The portal `next.config.mjs` already has `images.remotePatterns` configured for Supabase and Clerk. The candidate app's `next.config.mjs` is missing this configuration entirely, which would need to be added before `next/image` can be used with remote URLs.

**Estimated impact:** CLS improvement from >0.1 to <0.05; LCP improvement of 200-500ms from WebP conversion and responsive sizing; bandwidth savings of 30-50% on image-heavy pages.

---

### 1.2 Zero Dynamic Imports / No Code Splitting (FID/INP, Bundle Size)

**Severity:** CRITICAL
**Impact:** Oversized JavaScript bundles, increased Time to Interactive, degraded FID/INP
**Affected apps:** Portal, Candidate

There are zero uses of `next/dynamic` or `React.lazy` across the entire codebase. Several heavy dependencies are statically imported and included in page bundles even when they are not needed on initial render:

#### Chart.js + react-chartjs-2

10 chart component files in portal, 4 in candidate, all statically imported:

- `g:\code\splits.network\apps\portal\src\components\charts\analytics-chart.tsx` -- imports ALL six chart types (Line, Bar, Pie, Doughnut, Radar, PolarArea) plus full Chart.js registration
- `g:\code\splits.network\apps\portal\src\components\charts\roles-trends-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\roles-status-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\applications-trends-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\recruiter-activity-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\monthly-placements-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\company-trends-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\time-to-hire-trends-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\candidates-trends-chart.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\invitations-trends-chart.tsx`

**chart.js is approximately 60KB gzipped.** It should only load on dashboard and stats pages.

**Recommended fix:**

```tsx
// Before
import { AnalyticsChart } from "@/components/charts/analytics-chart";

// After
import dynamic from "next/dynamic";
const AnalyticsChart = dynamic(
    () =>
        import("@/components/charts/analytics-chart").then((m) => ({
            default: m.AnalyticsChart,
        })),
    { loading: () => <ChartLoadingState height={300} /> },
);
```

#### @uiw/react-md-editor (Markdown Editor)

The markdown editor component is used in `g:\code\splits.network\packages\shared-ui\src\markdown\markdown-editor.tsx` and re-exported from `g:\code\splits.network\apps\portal\src\components\markdown-editor.tsx`. It is only used on forms that edit rich text (job descriptions, notes). However, its CSS is globally imported in the root layout:

- `g:\code\splits.network\apps\portal\src\app\layout.tsx` (line 9-10)
- `g:\code\splits.network\apps\candidate\src\app\layout.tsx` (line 11-12)

```tsx
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
```

**These two CSS files add ~60KB of unminified CSS to every single page load**, even pages that never render a markdown editor. The CSS includes editor toolbar styles, syntax highlighting themes, and preview formatting.

**Recommended fix:** Remove the global CSS imports from layout.tsx and instead import them inside the `MarkdownEditor` component itself, or use `next/dynamic` to lazy-load the editor component which will naturally scope the CSS.

#### Stripe (@stripe/stripe-js, @stripe/react-stripe-js, @stripe/connect-js)

Stripe is only used on billing pages, but the `loadStripe` call in `g:\code\splits.network\apps\portal\src\components\stripe\stripe-provider.tsx` initializes the Stripe.js script globally on first use. This is acceptable since `loadStripe` is called lazily. However, the StripeProvider component itself and the Stripe Connect provider are statically imported wherever used. Consider dynamic imports for billing-related components.

**Estimated impact:** Dynamic importing charts alone could save 60-80KB gzipped per non-dashboard page. Scoping markdown CSS could save 40-60KB on every page.

---

### 1.3 GSAP Imported Across All Apps (Not Just Corporate)

**Severity:** HIGH
**Impact:** Unnecessary JavaScript on pages that do not use animations
**Affected apps:** All three (contrary to the expectation that GSAP is corporate-only)

GSAP + @gsap/react + ScrollTrigger is imported in **40+ files** across all three apps:

- **Corporate:** 10 landing section components (expected)
- **Portal:** 20+ files including landing sections, public content pages (about, pricing, blog, press, careers, features, how-it-works, partners, transparency, updates, for-recruiters, for-companies, integration-partners), and even a calculator component
- **Candidate:** 12+ files including landing sections, resource pages, and public content pages

Key portal files importing GSAP that are NOT landing pages:

| File                                                                                      | Why GSAP may not be needed |
| ----------------------------------------------------------------------------------------- | -------------------------- |
| `g:\code\splits.network\apps\portal\src\app\public\about\about-content.tsx`               | Static content page        |
| `g:\code\splits.network\apps\portal\src\app\public\blog\blog-content.tsx`                 | Blog listing page          |
| `g:\code\splits.network\apps\portal\src\app\public\press\press-content.tsx`               | Press page                 |
| `g:\code\splits.network\apps\portal\src\app\public\careers\careers-content.tsx`           | Careers page               |
| `g:\code\splits.network\apps\portal\src\app\public\transparency\transparency-content.tsx` | Transparency page          |
| `g:\code\splits.network\apps\portal\src\app\public\updates\updates-content.tsx`           | Updates page               |
| `g:\code\splits.network\apps\portal\src\components\calculator\rti-calculator.tsx`         | Calculator widget          |

**GSAP core is ~30KB gzipped. ScrollTrigger adds ~10KB. @gsap/react adds ~3KB.** That is ~43KB of JavaScript loaded on every page that imports any of these animation components.

Furthermore, GSAP is listed as a dependency in both `apps/portal/package.json` and `apps/candidate/package.json`, where it was originally expected only in `apps/corporate/package.json`.

**Recommended fix:**

1. For landing page sections that NEED GSAP animations, use `next/dynamic` to lazy-load the animated components.
2. For static content pages (about, blog, press, etc.), evaluate whether CSS animations/transitions would suffice instead of GSAP.
3. Consider extracting a shared `GsapSection` wrapper component that dynamically loads GSAP only when the section enters the viewport.

```tsx
// Example: Lazy-load animated section
const AnimatedHeroSection = dynamic(
    () =>
        import("@/components/landing/sections/hero-section").then((m) => ({
            default: m.HeroSection,
        })),
    { ssr: false },
);
```

---

## 2. Major Optimization Opportunities

### 2.1 Excessive `"use client"` on Page Components (SSR Impact)

**Severity:** HIGH
**Impact:** Prevents server-side rendering, increases hydration time, larger JavaScript bundles
**Affected apps:** Portal (primary), Candidate

**27 portal page files** (`page.tsx`) have `"use client"` at the top:

- All browse pages: roles, candidates, applications, placements, invitations, companies, invite-companies, marketplace/recruiters
- All admin pages: metrics, notifications, assignments, fraud, automation, ai-matches, users, candidates, companies, organizations
- Profile, teams, integrations, messages, company-invitations, notifications

**16 portal public content pages** (under `apps/portal/src/app/public/`) also use client components for their content, primarily because they import GSAP for scroll animations.

While many of these pages genuinely need client-side interactivity (filters, search, view toggles, data fetching), the pattern of putting `"use client"` directly on `page.tsx` prevents Next.js from:

- Streaming the page shell as HTML immediately
- Running data fetches on the server
- Reducing the JavaScript sent to the client

The better pattern (already used by the dashboard page at `g:\code\splits.network\apps\portal\src\app\portal\dashboard\page.tsx`) is to keep `page.tsx` as a server component and delegate to a client component:

```tsx
// page.tsx (Server Component - no "use client")
import { CandidatesClient } from "./candidates-client";

export default function CandidatesPage() {
    return <CandidatesClient />;
}
```

This allows Next.js to:

- Export metadata from the page (some pages do this already, like `about/page.tsx`)
- Stream the page shell
- Use `loading.tsx` for instant loading states
- Potentially server-side render parts of the page

**Estimated impact:** 10-30% reduction in Time to First Byte (TTFB) for pages that can partially server-render.

---

### 2.2 No `loading.tsx` Route Segments (Streaming SSR)

**Severity:** HIGH
**Impact:** No instant loading states, no streaming SSR, blank screen during navigation
**Affected apps:** All three

Zero `loading.tsx` files exist across the entire monorepo. The Next.js App Router uses `loading.tsx` to:

1. Show an instant loading state while the page chunk downloads
2. Enable React Suspense streaming for server components
3. Provide a smooth transition between routes

For a portal application with many authenticated routes, this is a significant missed opportunity. Users see either a blank screen or a full-page spinner while JavaScript loads and data fetches.

**Recommended locations for `loading.tsx`:**

| Path                                                  | Why                                  |
| ----------------------------------------------------- | ------------------------------------ |
| `apps/portal/src/app/portal/loading.tsx`              | Global portal loading state          |
| `apps/portal/src/app/portal/dashboard/loading.tsx`    | Dashboard with multiple data fetches |
| `apps/portal/src/app/portal/roles/loading.tsx`        | Roles browse page                    |
| `apps/portal/src/app/portal/candidates/loading.tsx`   | Candidates browse page               |
| `apps/portal/src/app/portal/applications/loading.tsx` | Applications browse page             |
| `apps/portal/src/app/portal/admin/loading.tsx`        | Admin section                        |
| `apps/candidate/src/app/portal/loading.tsx`           | Candidate portal loading             |
| `apps/candidate/src/app/public/jobs/loading.tsx`      | Public job listings                  |

**Example implementation:**

```tsx
// apps/portal/src/app/portal/loading.tsx
import { LoadingState } from "@splits-network/shared-ui";

export default function Loading() {
    return <LoadingState message="Loading..." />;
}
```

---

### 2.3 FontAwesome as Render-Blocking External CSS

**Severity:** HIGH
**Impact:** Increased LCP, delayed First Contentful Paint
**Affected apps:** All three

All three apps load FontAwesome via an external stylesheet from `kit.fontawesome.com`:

```html
<link
    rel="preload"
    as="style"
    href="https://kit.fontawesome.com/728c8ddec8.css"
/>
<link
    rel="stylesheet"
    href="https://kit.fontawesome.com/728c8ddec8.css"
    crossorigin="anonymous"
/>
```

While there is a `preload` hint, the actual `<link rel="stylesheet">` is still render-blocking. The browser will not paint the page until this CSS file is downloaded and parsed. This involves:

1. DNS lookup for `kit.fontawesome.com`
2. TLS handshake
3. HTTP request
4. CSS download (~100-200KB depending on kit configuration)
5. Font file downloads referenced by the CSS

**The `preload` + `stylesheet` double-load pattern also causes the CSS to be fetched twice in some browsers.**

**Recommended fixes (in order of preference):**

1. **Self-host FontAwesome subset:** Download only the icons used in the app, bundle them with the build. This eliminates the external dependency entirely.
2. **Async load with `media="print"` trick:**
    ```html
    <link
        rel="stylesheet"
        href="https://kit.fontawesome.com/728c8ddec8.css"
        media="print"
        onload="this.media='all'"
        crossorigin="anonymous"
    />
    <noscript
        ><link
            rel="stylesheet"
            href="https://kit.fontawesome.com/728c8ddec8.css"
    /></noscript>
    ```
3. **Use `next/script` with `afterInteractive` strategy** for the CSS (less ideal but removes render-blocking behavior).

**Estimated impact:** 200-500ms improvement in FCP/LCP depending on network conditions.

---

### 2.4 No `next/font` Usage

**Severity:** MEDIUM
**Impact:** Font swap flash (FOIT/FOUT), extra network requests, potential CLS
**Affected apps:** All three

None of the three apps use `next/font` for loading web fonts. The `globals.css` files do not reference any `@font-face` declarations or Google Fonts imports. The apps appear to rely entirely on system fonts (via Tailwind's default font stack) plus FontAwesome icons.

While system fonts avoid the FOIT/FOUT problem, the lack of explicit font configuration means:

- No font `display: swap` is set
- No font preloading
- If custom fonts are ever added, they will not benefit from Next.js font optimization

If the apps intentionally use only system fonts, this is acceptable but should be documented. If any custom fonts are intended in the future, `next/font` should be configured from the start.

---

### 2.5 Markdown Editor CSS Loaded Globally

**Severity:** HIGH
**Impact:** ~60KB of unnecessary CSS on every page
**Affected files:**

- `g:\code\splits.network\apps\portal\src\app\layout.tsx` (lines 9-10)
- `g:\code\splits.network\apps\candidate\src\app\layout.tsx` (lines 11-12)

```tsx
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
```

These CSS files are imported at the root layout level, which means they are included in every single page's CSS bundle. The markdown editor is only used on a handful of form pages (job description editing, notes).

**Recommended fix:** Move these imports into the `MarkdownEditor` component itself (`g:\code\splits.network\packages\shared-ui\src\markdown\markdown-editor.tsx`). Since this component already has `"use client"`, the CSS will only be loaded when the component is rendered.

```tsx
// In packages/shared-ui/src/markdown/markdown-editor.tsx
"use client";

import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import MDEditor from "@uiw/react-md-editor";
// ...
```

Also consider importing markdown-preview CSS in the markdown-renderer component for read-only preview contexts.

---

## 3. Moderate Issues

### 3.1 Candidate App Missing `images` Config in next.config.mjs

**Severity:** MEDIUM
**Impact:** Cannot use `next/image` with remote URLs (Supabase, Clerk)
**Affected file:** `g:\code\splits.network\apps\candidate\next.config.mjs`

The portal's `next.config.mjs` has:

```js
images: {
    remotePatterns: [
        { protocol: 'https', hostname: '**.supabase.co', pathname: '/storage/v1/object/public/**' },
        { protocol: 'https', hostname: 'img.clerk.com' },
    ],
},
```

The candidate app's config has no `images` property at all. This must be added before migrating to `next/image` for company logos and user avatars.

---

### 3.2 ThemeInitializer Loads Chart.js Dependency on Every Page

**Severity:** MEDIUM
**Impact:** chart-options.tsx pulled into the main bundle
**Affected files:**

- `g:\code\splits.network\apps\portal\src\app\theme-initializer.tsx`
- `g:\code\splits.network\apps\portal\src\components\charts\chart-options.tsx`

The `ThemeInitializer` component is rendered in the root layout and imports `initThemeListener` from `chart-options.tsx`. While `chart-options.tsx` does not directly import chart.js, it defines a `chartRegistry` and `applyThemeToChart` function. The module-level `dataset` constant calls `getColorCache()` immediately on import, which reads CSS variables.

The concern is that `chart-options.tsx` is pulled into the main JavaScript bundle for every page, even those without charts. The `initThemeListener` function sets up a `MutationObserver` on every page load.

**Recommended fix:** Extract `initThemeListener` into a separate lightweight module that does not pull in chart-related code, or use `next/dynamic` to lazy-load the ThemeInitializer.

---

### 3.3 ServiceStatusBanner Fetches on Every Page

**Severity:** LOW
**Impact:** Extra API call on every page load
**Affected files:**

- `g:\code\splits.network\packages\shared-ui\src\service-status\service-status-banner.tsx`
- All three app layouts

The `ServiceStatusBanner` component runs `useSiteNotifications` with `autoRefresh: true` and a 60-second interval on every page. This means every page load triggers an API call to check service status, and sets up a recurring interval.

While this is functionally correct for showing real-time status, it adds latency to every page. Consider:

1. Caching the response in `sessionStorage` for a short period
2. Using a server component to fetch initial status and only hydrating the client-side refresh
3. Using the `stale-while-revalidate` pattern

---

### 3.4 Global Presence Tracking Overhead

**Severity:** LOW
**Impact:** Event listener overhead, periodic API calls
**Affected file:** `g:\code\splits.network\apps\portal\src\hooks\use-global-presence.ts`

The `useGlobalPresence` hook in `g:\code\splits.network\apps\portal\src\app\portal\layout-client.tsx` adds event listeners for `mousemove`, `keydown`, and `visibilitychange` on every authenticated page. It sends a presence ping every 30 seconds.

The event listeners themselves are lightweight, but `mousemove` in particular fires at high frequency. Ensure there is debouncing on the activity tracking (the current code uses a `lastActivityRef` pattern which is efficient).

---

### 3.5 Dashboard Client Manually Creates Loading Spinners

**Severity:** LOW
**Impact:** Inconsistent loading UX, violates CLAUDE.md guidelines
**Affected file:** `g:\code\splits.network\apps\portal\src\app\portal\dashboard\components\dashboard-client.tsx`

Lines 14-18:

```tsx
if (isLoading || !profile) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}
```

Per CLAUDE.md: "Never manually create loading spinners. Use standardized components for consistency." This should use `<LoadingState message="Loading dashboard..." />` from `@splits-network/shared-ui`.

---

## 4. Minor Improvements

### 4.1 Suspense Usage Is Minimal

Only 8 files use React `Suspense` across all apps. Given the number of pages with data fetching, many more components could benefit from Suspense boundaries for progressive loading.

**Files currently using Suspense:**

- `g:\code\splits.network\apps\candidate\src\app\public\marketplace\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\public\jobs\page.tsx`
- `g:\code\splits.network\apps\portal\src\app\sso-callback\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\(auth)\sso-callback\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\portal\applications\page.tsx`
- `g:\code\splits.network\apps\portal\src\app\portal\notifications\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\portal\messages\page.tsx`
- `g:\code\splits.network\apps\candidate\src\app\portal\documents\page.tsx`

### 4.2 UserProfileProvider Makes 3 Sequential API Calls

**Affected file:** `g:\code\splits.network\apps\portal\src\contexts\user-profile-context.tsx`

The provider makes three API calls in sequence:

1. `fetchProfile` (on mount)
2. `fetchSubscription` (when profile loads, triggered by `useEffect` on `profile`)
3. `fetchManageableCompanies` (when profile loads, triggered by `useEffect` on `profile`)

Calls 2 and 3 depend on `profile.recruiter_id` and fire in parallel (both triggered by the same `profile` state change), which is good. However, this creates a waterfall:

- Auth loads -> Profile fetches -> Subscription + Companies fetch

If the API gateway supported a `/users/me?include=subscription,manageable_companies` endpoint, this could be a single round-trip.

### 4.3 `analytics-chart.tsx` Imports All Six Chart Types

**Affected file:** `g:\code\splits.network\apps\portal\src\components\charts\analytics-chart.tsx` (line 21)

```tsx
import { Line, Bar, Pie, Doughnut, Radar, PolarArea } from "react-chartjs-2";
```

This imports every chart type even when only one is used. Combined with the full Chart.js registration (9 modules registered), this ensures the maximum possible chart.js bundle is loaded.

**Recommended fix:** Use dynamic imports based on the `chartComponent` prop:

```tsx
const chartComponents = {
    line: () => import("react-chartjs-2").then((m) => m.Line),
    bar: () => import("react-chartjs-2").then((m) => m.Bar),
    // ...
};
```

### 4.4 Corporate App Loads GSAP in All 10 Landing Sections

Every landing section component in `g:\code\splits.network\apps\corporate\src\components\landing\sections\` imports GSAP independently:

```tsx
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
```

While webpack/Next.js will deduplicate the module, each component independently calls `gsap.registerPlugin(ScrollTrigger)`. This is harmless but wasteful. A single shared provider pattern (similar to `g:\code\splits.network\apps\portal\src\components\landing\shared\gsap-provider.tsx`) would be cleaner.

### 4.5 Cookie Consent Imports Clerk Auth Unnecessarily on Public Pages

**Affected file:** `g:\code\splits.network\apps\portal\src\components\cookie-consent.tsx`

The `CookieConsent` component imports `useAuth` from Clerk to sync consent to the database when signed in. Since CookieConsent is rendered in the root layout (including public/unauthenticated pages), this pulls Clerk's auth hook into every page's component tree. The Clerk SDK itself is already loaded via `ClerkProvider`, but the auth hook initialization adds some overhead.

---

## 5. Positive Findings

Several areas are well-implemented from a performance perspective:

1. **Server-side pagination:** The `useStandardList` hook (`g:\code\splits.network\apps\portal\src\hooks\use-standard-list.ts`) implements server-side pagination with proper URL synchronization. No client-side filtering of large datasets detected.

2. **Debounced search:** Search inputs use 300ms debouncing via the standard list hook, preventing excessive API calls.

3. **Analytics scripts deferred correctly:** Microsoft Clarity, Google Analytics, and GTM all use `strategy="afterInteractive"` via `next/script`, which is the correct approach.

4. **Theme initialization is non-blocking:** The inline `<script>` in `<head>` for theme initialization prevents FOUC without blocking rendering.

5. **Progressive data loading pattern:** The `UserProfileProvider` loads primary data first, then secondary data when primary is available. This is the correct pattern.

6. **Stripe lazy initialization:** The `loadStripe` call in `stripe-provider.tsx` is wrapped in a singleton pattern that only initializes on first use.

7. **Event listener cleanup:** All `addEventListener` calls have corresponding `removeEventListener` in cleanup functions.

8. **CSS-only animations:** The portal uses CSS `@keyframes` for most UI animations (slide-up, fade-in, scale-in, expand-down). These are GPU-accelerated and do not require JavaScript.

9. **DaisyUI as CSS-only plugin:** DaisyUI v5 is configured via `@plugin "daisyui"` in Tailwind CSS 4, which is a build-time CSS-only approach with no runtime JavaScript.

10. **Proper `getToken` handling:** Following the MEMORY.md guidance, `getToken` is excluded from dependency arrays with appropriate ESLint disable comments across the codebase.

---

## 6. Prioritized Recommendations

### Tier 1: Quick Wins (1-2 days each, high impact)

| #   | Action                                                                       | Estimated Impact                      | Files to Change |
| --- | ---------------------------------------------------------------------------- | ------------------------------------- | --------------- |
| 1   | Move markdown editor CSS imports from layout.tsx to MarkdownEditor component | -60KB CSS on every page               | 3 files         |
| 2   | Add `loading.tsx` to key route segments                                      | Instant loading states, streaming SSR | 8-10 new files  |
| 3   | Dynamic import chart components                                              | -60-80KB JS on non-chart pages        | 10-15 files     |
| 4   | Add `images` config to candidate `next.config.mjs`                           | Enable `next/image` for candidate app | 1 file          |

### Tier 2: Medium Effort (3-5 days each, high impact)

| #   | Action                                                                    | Estimated Impact                        | Files to Change |
| --- | ------------------------------------------------------------------------- | --------------------------------------- | --------------- |
| 5   | Migrate all `<img>` tags to `next/image`                                  | CLS fix, WebP, lazy loading, responsive | 80+ files       |
| 6   | Dynamic import GSAP sections on public pages                              | -43KB JS per public page                | 40+ files       |
| 7   | Convert static public pages to server components (remove GSAP dependency) | SSR, reduced JS                         | 16 files        |
| 8   | Make FontAwesome non-render-blocking                                      | 200-500ms FCP improvement               | 3 files         |

### Tier 3: Larger Refactors (1-2 weeks, moderate impact)

| #   | Action                                                                    | Estimated Impact              | Files to Change        |
| --- | ------------------------------------------------------------------------- | ----------------------------- | ---------------------- |
| 9   | Refactor page.tsx files to server components with client child delegation | Better SSR, metadata support  | 27 files               |
| 10  | Add Suspense boundaries for progressive loading                           | Smoother transitions          | 20-30 files            |
| 11  | Consolidate user profile + subscription into single API call              | Eliminate 1 waterfall         | API + 1 file           |
| 12  | Self-host FontAwesome icon subset                                         | Eliminate external dependency | Build config + 3 files |

---

## 7. Core Web Vitals Risk Assessment

| Metric      | Current Risk | Primary Causes                                                                                   | Target            |
| ----------- | ------------ | ------------------------------------------------------------------------------------------------ | ----------------- |
| **LCP**     | HIGH         | Render-blocking FontAwesome CSS; no `priority` on hero images; large JS bundles blocking paint   | < 2.5s            |
| **CLS**     | HIGH         | 80+ `<img>` tags without explicit dimensions; no `next/image` for responsive sizing              | < 0.1             |
| **FID/INP** | MEDIUM       | Large hydration payloads from `"use client"` on page files; chart.js + GSAP loaded unnecessarily | < 100ms / < 200ms |
| **TTFB**    | LOW-MEDIUM   | All pages client-rendered; no streaming SSR via `loading.tsx`                                    | < 800ms           |

---

## Appendix A: Dependency Size Reference

| Dependency                         | Approx. Size (gzipped) | Currently Loaded On                                 |
| ---------------------------------- | ---------------------- | --------------------------------------------------- |
| chart.js + react-chartjs-2         | ~60-80KB               | Dashboard, stats pages, but bundled into many pages |
| @uiw/react-md-editor CSS           | ~40KB                  | Every page (global layout import)                   |
| @uiw/react-markdown-preview CSS    | ~20KB                  | Every page (global layout import)                   |
| gsap + ScrollTrigger + @gsap/react | ~43KB                  | 40+ pages across all apps                           |
| @stripe/stripe-js                  | ~30KB                  | Billing pages (lazy-loaded via loadStripe)          |
| @clerk/nextjs                      | ~50-80KB               | Every authenticated page (necessary)                |
| FontAwesome CSS kit                | ~100-200KB             | Every page (render-blocking)                        |

## Appendix B: File Counts

| Metric                        | Portal | Candidate | Corporate | Total |
| ----------------------------- | ------ | --------- | --------- | ----- |
| `"use client"` files          | 274    | 94        | 12        | 380   |
| `"use client"` page.tsx files | 27     | ~8        | 0         | ~35   |
| Raw `<img>` tags (in .tsx)    | ~45    | ~20       | ~15       | ~80   |
| `next/image` usage            | 3      | 0         | 0         | 3     |
| `dynamic()` imports           | 0      | 0         | 0         | 0     |
| `loading.tsx` files           | 0      | 0         | 0         | 0     |
| `Suspense` usage              | 2      | 6         | 0         | 8     |
| GSAP imports                  | ~20    | ~12       | 10        | ~42   |
| Chart component files         | 10     | 4         | 0         | 14    |
| `useEffect` occurrences       | ~290   | ~100      | ~3        | ~393  |
