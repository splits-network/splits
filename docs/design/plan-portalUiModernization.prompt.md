# Plan: Full Portal UI Modernization – Cards, Sidebar, Dashboards & All Pages

Comprehensive UI overhaul to transform the Splits Network portal into a modern dashboard-style application with unified card design system, elevated cards, trend indicators, expandable rows, and a refined sidebar—starting with shared card components, then dashboards, then list pages, then detail pages.

## Reference Design Characteristics

- Clean card-based layouts with subtle elevation/shadows
- Expandable table rows that reveal more detail inline (no page navigation)
- Stat cards with colored trend indicators (+X% green / -X% red)
- Subtle dividers and generous whitespace
- Professional dashboard aesthetic with trends/charts
- Hover effects with shadow lift and subtle scale
- Collapsible sidebar with section grouping

---

## Steps

### 1. Create unified card component system

**Location:** `apps/portal/src/components/ui/cards/`

Build foundational card components that all pages will use:

- **`BaseCard`** — Core wrapper with consistent shadow hierarchy (`shadow-sm` → `shadow` → `shadow-xl` on hover), border-radius (`rounded-xl`), background (`bg-base-100`), and padding scales
- **`StatCard`** — Unified stat display with icon, value, label, trend indicator slot, consistent sizing
- **`EntityCard`** — Template for candidate/applications/role cards with gradient header, avatar, status ribbons, hover lift effect
- **`ContentCard`** — Simple content container with optional title, description, and footer actions
- **`EmptyState`** — Consistent empty state pattern with icon, title, description, action button

### 2. Modernize sidebar navigation

**Location:** `apps/portal/src/components/sidebar.tsx`

- Add collapsible section groups (Main, Management, Settings)
- Notification/invitation count badges using `badge badge-sm`
- User avatar at bottom with role indicator
- Hover/active states with subtle left border accent
- Optional collapse to icon-only mode on desktop

### 3. Build shared dashboard UI components

**Location:** `apps/portal/src/components/ui/`

- **`StatCardGrid`** — Responsive stats row using new `StatCard`
- **`PageHeader`** — Title, description, breadcrumb, actions
- **`TrendBadge`** — +X% green / -X% red indicator
- **`ExpandableTableRow`** — Accordion pattern for inline detail reveal

### 4. Upgrade dashboard pages

**Location:** `apps/portal/src/app/(authenticated)/portal/dashboard/components/`

- Replace all inline stat cards with unified `StatCard` components
- Add trend indicators to all metrics
- Integrate area charts using recharts
- Implement expandable recent activity rows

### 5. Migrate all entity cards to unified pattern

Update to use shared `EntityCard` component:

| Card | Location | Status |
|------|----------|--------|
| `CandidateCard` | `apps/portal/src/app/(authenticated)/candidates/components/candidate-card.tsx` | Already modern, extract to shared |
| `ApplicationCard` | `apps/portal/src/app/(authenticated)/applications/components/application-card.tsx` | Already modern, align with shared |
| `RoleCard` | `apps/portal/src/app/(authenticated)/roles/components/roles-list.tsx` (inline) | Extract to shared component |
| `UnifiedProposalCard` | `apps/portal/src/app/(authenticated)/proposals/components/unified-proposal-card.tsx` | Update styling to match system |
| Invitation cards | `apps/portal/src/app/(authenticated)/invitations/components/invitations-client.tsx` | Full rebuild using new components |

### 6. Transform list pages into dashboards

Add header stats section to each list page:

| Page | Stats to Add |
|------|--------------|
| `candidates/page.tsx` | Total, Active, Recently Added, Conversion Rate |
| `applications/page.tsx` | Total, By Stage breakdown, AI Score avg, Pending Review count |
| `invitations/page.tsx` | Replace computed text with visual stat cards |
| `roles/page.tsx` | Add 4th stat (Recently Filled), trend indicators to all |
| `placements/page.tsx` | Add trend indicators to existing stats |

### 7. Implement expandable table rows

Update all table views to expand inline:

- `ApplicationTableRow` — Show full candidate info, AI review, notes, actions
- Role table rows — Show job details, requirements, recruiter assignments
- Candidate table rows — Show contact info, applications, recruiter relationships

Use `ExpandableTableRow` component with chevron toggles.

### 8. Refine settings/form pages

**Pages to update:**
- `apps/portal/src/app/(authenticated)/profile/page.tsx`
- `apps/portal/src/app/(authenticated)/billing/page.tsx`
- `apps/portal/src/app/(authenticated)/company/settings/page.tsx`
- `apps/portal/src/app/(authenticated)/company/team/page.tsx`

- Use unified `ContentCard` for all form sections
- Add header metric cards (profile completeness, activity stats)
- Consistent elevation and spacing

---

## Design Tokens to Establish

### Shadows (Elevation Hierarchy)
```css
--shadow-low: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-high: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-hover: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Card Border Radius
- Entity cards: `rounded-xl` (1rem)
- Stat cards: `rounded-lg` (0.75rem)
- Buttons/inputs: `rounded-lg` (0.75rem)

### Card Padding
- Compact: `p-4`
- Default: `p-6`
- Spacious: `p-8`

### Hover Transitions
```css
transition: all 0.3s ease;
transform: translateY(-2px);
box-shadow: var(--shadow-hover);
```

---

## Further Considerations

### Sidebar badge counts
**Options:**
- Polling every 60s (simpler, recommended initially)
- WebSocket for real-time (future enhancement)

### Chart library
**Recommendation:** Add `recharts` (~45KB) for dashboards only. List pages get stat cards without charts initially.

### Expandable row data loading
**Recommendation:** Lazy load on expand with skeleton loading. Keep list responses fast.

### Card migration approach
**Recommendation:** Create shared components first (Step 1), then migrate page-by-page starting with highest-traffic pages.

---

## Priority Order

### Phase 1 — Foundation (Week 1)
1. Create unified card components (`ui/cards/`)
2. Update `globals.css` with design tokens
3. Modernize sidebar

### Phase 2 — Dashboards (Week 2)
4. Upgrade dashboard pages with new components
5. Add recharts for trend visualizations

### Phase 3 — High-Traffic List Pages (Week 3)
6. Candidates page (missing stats entirely)
7. Applications page (high daily usage)
8. Invitations page (needs visual stats)

### Phase 4 — Remaining Pages (Week 4)
9. Roles page (polish existing)
10. Placements page (add trends)
11. Profile/Settings pages
12. Billing page

### Phase 5 — Detail Pages & Polish (Week 5)
13. Implement expandable rows across all tables
14. Detail page consistency pass
15. Final polish and testing

---

## Files to Create

```
apps/portal/src/components/ui/
├── cards/
│   ├── index.ts
│   ├── base-card.tsx
│   ├── stat-card.tsx
│   ├── entity-card.tsx
│   ├── content-card.tsx
│   └── empty-state.tsx
├── stat-card-grid.tsx
├── page-header.tsx
├── trend-badge.tsx
└── tables/
    └── expandable-row.tsx
```

## Files to Modify

- `apps/portal/src/app/globals.css` — Design tokens, animations
- `apps/portal/src/components/sidebar.tsx` — Full redesign
- `apps/portal/src/app/(authenticated)/portal/dashboard/components/*.tsx` — All dashboard variants
- `apps/portal/src/app/(authenticated)/*/page.tsx` — All list pages
- `apps/portal/src/app/(authenticated)/*/components/*-card.tsx` — All entity cards
