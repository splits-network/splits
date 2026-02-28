# Phase 18: Page Migration - Context

**Gathered:** 2026-02-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Build all admin pages in the dedicated admin app with full Basel design, including a data-rich dashboard, collapsible sidebar navigation, new /admin/ backend routes, a shared-charts package (ECharts), and real-time infrastructure for live updates. Current portal admin pages serve as a feature spec only — all pages are rebuilt from scratch with Basel design system. Portal admin pages are removed as admin app pages are completed.

</domain>

<decisions>
## Implementation Decisions

### Page Scope
- Move ALL admin pages (~20+) to admin app, not just the 11 in success criteria
- Include all detail views (Jobs/[id], Matches/[id], Content Pages/[id])
- All pages get full Basel design — every UI element (tables, forms, cards, badges, modals, toasts)
- Admin-specific hooks (use-admin-stats, use-bulk-selection) live in admin app only, not shared-hooks
- Basel page header pattern for all pages (no PageTitle component)
- Basel confirmation modal pattern (not shared-ui ConfirmDialog)
- Basel toast notification pattern
- Researcher should study Basel showcase to understand available patterns
- `createAdminClient()` from shared-hooks already exists — admin pages use it

### Sidebar Organization
- Consolidate current 9 sections — Claude proposes a reduced, logical grouping
- Collapsible to icon-only rail mode with tooltips on hover
- Branding ("Splits Admin") at top of sidebar
- Search/filter input that matches page names + keywords, highlights in-place (expands matching sections, hides non-matching)
- Real-time badge counts via WebSocket/SSE (researcher to investigate existing real-time infrastructure)
- Persist collapsed/expanded state and open sections via localStorage
- Smooth animated transitions for collapse/expand
- Fully responsive — hamburger menu in header on mobile opens sidebar drawer
- Section icons + page icons visible in collapsed mode (with dividers)
- No "Back to Portal" link — standalone admin app
- No user profile in sidebar — header handles that
- Toggle button positioned at top-right edge of sidebar, straddling the sidebar border (half on, half off)

### Admin Layout
- Top header bar: branding, breadcrumbs, user button (Clerk)
- Sidebar beneath/beside header
- Root layout is minimal (auth, basic shell, no sidebar)
- `/secure/` layout has sidebar, header, breadcrumbs, and all real-time context providers
- Only authenticated platform_admin users access `/secure/`
- Same DaisyUI theme as portal (no separate admin theme)

### Dashboard Content
- Full redesign with Basel design (not a port of existing dashboard)
- 10+ ECharts charts — Claude proposes metrics based on available data/APIs
- Stat tiles with trend indicators (counts + percentage change, sparklines)
- Action items section (pending approvals, fraud signals, etc.)
- Activity feed with toggle between "Admin Actions" and "All Activity"
- System health indicator (API latency, service status, error rates)
- Real-time data updates via WebSocket/SSE
- Clickable charts/tiles drill down to detail pages
- Global time period selector + per-chart override option
- Fixed layout (not drag-and-drop customizable)
- No quick actions grid — sidebar handles navigation
- Build first, optimize later (no lazy loading concerns for now)

### Backend Architecture
- New `/admin/` prefixed routes in existing domain services (not a new admin-service)
- Admin-suffixed service and repository methods (e.g., `getRecruitersAdmin`, `listJobsAdmin`)
- Admin repositories are permissive — UI drives filtering, not restrictive backends
- Purpose: clean admin API surface, enables future simplification of user-facing endpoints
- Admin-gateway proxies to domain services — Claude decides exact routing approach

### Shared Charts Package
- New `@splits-network/shared-charts` package
- ECharts only (no library-agnostic adapter)
- Reusable chart components designed for both admin and future portal use
- Created as its own plan before dashboard

### Migration Strategy
- All pages move at once (not batched by section)
- Build from scratch — current pages are broken, not the golden rule
- Treat ALL pages as rebuilds using available API endpoints
- Researcher audits all existing pages to understand features (not to check if they work)
- Portal admin pages removed as admin app pages are completed (not waiting for Phase 19)
- Visual verification only — no automated tests for this phase
- Comfortable with large phase (6-10+ plans)
- Plan order: shared-charts → real-time infra → admin backend routes → layout/sidebar → dashboard → page sections
- Real-time infrastructure gets its own dedicated plan

### Code Organization
- URL-addressable state for all navigation (routes or searchParams)
- 200-line file limit — many components expected
- Page-scoped components live in `components/` subfolder under the page
- Consistent Basel-designed data tables across all list pages
- Sub-pages (e.g., payouts/escrow) can be separate routes or tabs — must be URL-addressable

### Claude's Discretion
- Consolidated sidebar section groupings (propose during planning)
- Dashboard chart selection and layout grouping (based on available data)
- Admin-gateway proxy routing approach
- Shared data table component vs per-page tables (must be consistent Basel design)
- Admin repository scoping rules (permissive, UI-driven filtering)
- Routes vs tabs for sub-pages (must be URL-addressable)
- Portal admin removal timing per plan (this phase vs Phase 19)
- Endpoint path matching between admin-gateway and domain services

</decisions>

<specifics>
## Specific Ideas

- "A lot of the current admin pages and functionality do not work" — rebuild everything from scratch
- "The purpose of an admin platform is to manage everything — most filters should be driven by the UI, not by restrictive backends"
- Sidebar toggle button should straddle the sidebar edge — "half on, half off" for clear affordance
- Activity feed should support both admin-only and all-platform-activity views via toggle
- ECharts migration: start with admin, create reusable shared package for future portal migration
- /admin/ prefix + Admin suffix pattern for clean future separation from user-facing APIs

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-page-migration*
*Context gathered: 2026-02-27*
