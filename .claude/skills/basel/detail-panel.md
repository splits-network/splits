# detail-panel

Basel detail panel patterns for entity detail views used in grid view drawers, table row expansion, and split view detail areas. Follow these patterns when creating or migrating detail panels across portal, candidate, and corporate apps.

## Showcase Reference

All detail panel patterns are demonstrated in the Designer One showcase:
`apps/corporate/src/app/showcase/detail-panel/one/`

### File Structure

```
showcase/detail-panel/one/
├── page.tsx              # Main showcase page (hero + 10 panel sections)
├── panel-section.tsx     # Reusable section wrapper
└── panels/
    ├── panel-header.tsx  # ★ Shared PanelHeader + PanelTabs components
    ├── recruiter-*       # Gold standard reference
    ├── candidate-*       # Profile, resume, applications, documents
    ├── company-*         # Overview, roles, contacts
    ├── role-*            # Recruiter brief, candidate, financials, company
    ├── application-*     # 7 tabs: overview, candidate, role, AI, docs, notes, timeline
    ├── placement-*       # Financials, dates, splits
    ├── firm-*            # Members, billing, settings
    ├── match-*           # Factors, skills, AI analysis, details
    ├── invitation-*      # Details, history
    └── referral-*        # Overview, performance, settings
```

Each feature has `{feature}-data.ts` (mock data) and `{feature}-panel.tsx` (component).

### Feature → Showcase File Lookup

| Feature | Showcase Panel | Real Portal Component |
|---------|---------------|----------------------|
| Recruiters | `panels/recruiter-panel.tsx` | `portal/recruiters/components/shared/recruiter-detail.tsx` |
| Candidates | `panels/candidate-panel.tsx` | `portal/candidates/components/shared/candidate-detail.tsx` |
| Companies | `panels/company-panel.tsx` | `portal/companies/components/shared/company-detail.tsx` |
| Roles/Jobs | `panels/role-panel.tsx` | `portal/roles/components/shared/job-detail.tsx` |
| Applications | `panels/application-panel.tsx` | `portal/applications/components/shared/application-detail.tsx` |
| Placements | `panels/placement-panel.tsx` | `portal/placements/components/shared/detail-panel.tsx` |
| Firms | `panels/firm-panel.tsx` | `portal/firms/components/shared/firm-detail.tsx` |
| Matches | `panels/match-panel.tsx` | `portal/matches/components/shared/match-detail-panel.tsx` |
| Invitations | `panels/invitation-panel.tsx` | `portal/invitations/components/shared/invitation-detail.tsx` |
| Referral Codes | `panels/referral-panel.tsx` | `portal/referral-codes/` (table only, no detail yet) |

## Panel Anatomy

Every Basel detail panel follows this vertical structure:

```
┌──────────────────────────────────────────┐
│ HEADER (bg-neutral text-neutral-content) │
│  ┌── Diagonal accent (bg-primary/10)     │
│  │   clipPath: polygon(15% 0,100%...)    │
│  ├── Kicker row: category + badges       │
│  ├── Avatar (20x20) + Title + Subtitle   │
│  ├── Meta row (location, date, etc.)     │
│  ├── Actions toolbar (btn-sm buttons)    │
│  └── Stats strip (N-column grid)         │
│       Colored icon boxes cycling:        │
│       primary → secondary → accent →     │
│       warning                            │
├──────────────────────────────────────────┤
│ TAB BAR (BaselTabBar)                    │
│  bg-base-100 border-b border-base-300    │
├──────────────────────────────────────────┤
│ TAB CONTENT                              │
│  Sections with border-l-4 accents,       │
│  badge groups, info grids, timelines     │
└──────────────────────────────────────────┘
```

## Shared Components

### PanelHeader

Located at `showcase/detail-panel/one/panels/panel-header.tsx`. Accepts:

```tsx
interface PanelHeaderProps {
    kicker: string;                                    // Uppercase category text
    badges: { label: string; className: string }[];    // Status badges
    avatar?: { initials: string; imageUrl?: string };  // Square avatar
    title: string;                                     // 3xl font-black
    subtitle?: string;                                 // Primary kicker above title
    meta?: { icon: string; text: string }[];           // Location, date, etc.
    stats: { label: string; value: string; icon: string }[];  // Stats strip
    actions?: { icon: string; label: string; className?: string }[];  // Toolbar buttons
}
```

### PanelTabs

Render-prop wrapper around `BaselTabBar`:

```tsx
<PanelTabs
    tabs={[
        { label: "About", value: "about", icon: "fa-duotone fa-regular fa-user" },
        { label: "Contact", value: "contact", icon: "fa-duotone fa-regular fa-address-book" },
    ]}
>
    {(activeTab) => activeTab === "about" ? <AboutTab /> : <ContactTab />}
</PanelTabs>
```

## Header Patterns

### Dark Header with Diagonal Accent

```tsx
<header className="relative bg-neutral text-neutral-content border-l-4 border-l-primary">
    <div
        className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
        style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
    />
    <div className="relative px-6 pt-6 pb-0">
        {/* content */}
    </div>
</header>
```

### Kicker Row

```tsx
<div className="flex items-center justify-between mb-6">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-content/40 truncate">
        {categoryText}
    </p>
    <div className="flex items-center gap-2 shrink-0">
        <span className="badge badge-success">Active</span>
        <span className="badge badge-warning badge-soft badge-outline">New</span>
    </div>
</div>
```

### Stats Strip

```tsx
<div
    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
    style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}
>
    {stats.map((stat, i) => {
        const iconStyles = [
            "bg-primary text-primary-content",
            "bg-secondary text-secondary-content",
            "bg-accent text-accent-content",
            "bg-warning text-warning-content",
        ];
        return (
            <div key={stat.label} className="flex items-center gap-2.5 px-3 py-4">
                <div className={`w-9 h-9 flex items-center justify-center shrink-0 ${iconStyles[i % 4]}`}>
                    <i className={`${stat.icon} text-sm`} />
                </div>
                <div>
                    <span className="text-lg font-black text-neutral-content leading-none block">
                        {stat.value}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-content/40 leading-none">
                        {stat.label}
                    </span>
                </div>
            </div>
        );
    })}
</div>
```

## Content Section Patterns

### Border-Left Accent Section

```tsx
<div className="border-l-4 border-l-primary pl-6">
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
        Section Title
    </p>
    <p className="text-sm text-base-content/70 leading-relaxed">{content}</p>
</div>
```

### Badge Group

```tsx
<div>
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
        Skills
    </p>
    <div className="flex flex-wrap gap-2">
        {items.map((item) => (
            <span key={item} className="badge badge-primary">{item}</span>
        ))}
    </div>
</div>
```

Badge variants by content type:
- **Required skills**: `badge badge-primary`
- **Nice-to-have skills**: `badge badge-soft badge-outline`
- **Industries**: `badge badge-soft badge-outline`
- **Perks**: `badge badge-secondary`
- **Culture tags**: `badge badge-accent`
- **Matched skills**: `badge badge-success badge-outline`
- **Missing skills**: `badge badge-error badge-outline`
- **Status active**: `badge badge-info badge-soft badge-outline`
- **Status pending**: `badge badge-warning badge-soft badge-outline`
- **Status inactive**: `badge badge-ghost`

### Info Card (Contact, Details)

```tsx
<div className="bg-base-200 border border-base-300 border-l-4 border-l-primary">
    <div className="px-6 py-4 border-b border-base-300">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40">
            Card Title
        </p>
    </div>
    <div className="divide-y divide-base-300">
        {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-4 px-6 py-4">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center shrink-0">
                    <i className={`${row.icon} text-primary text-xs`} />
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-0.5">
                        {row.label}
                    </p>
                    <p className="text-sm font-semibold text-base-content truncate">
                        {row.value}
                    </p>
                </div>
            </div>
        ))}
    </div>
</div>
```

### Stats Grid (Financial/Data)

```tsx
<div className="grid grid-cols-3 gap-[2px] bg-base-300">
    {cells.map((cell) => (
        <div key={cell.label} className="bg-base-100 p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">{cell.label}</p>
            <p className={`text-lg font-black tracking-tight ${cell.accent ? "text-primary" : ""}`}>
                {cell.value}
            </p>
        </div>
    ))}
</div>
```

### Timeline

```tsx
<div className="space-y-0">
    {events.map((event, i) => (
        <div key={i} className="flex gap-4 pb-5 relative">
            {i < events.length - 1 && (
                <div className="absolute left-[14px] top-8 bottom-0 w-px bg-base-300" />
            )}
            <div className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                event.done ? "bg-success text-success-content" : "bg-base-300 text-base-content/40"
            }`}>
                <i className={`fa-duotone fa-regular ${event.done ? "fa-check" : "fa-circle"} text-xs`} />
            </div>
            <div className="pt-0.5">
                <p className="text-sm font-bold">{event.label}</p>
                <p className="text-xs text-base-content/40">{event.date}</p>
            </div>
        </div>
    ))}
</div>
```

### Score Bar (Match Panels)

```tsx
<div>
    <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-base-content/60">{label}</span>
        <span className="text-sm font-bold">{value}</span>
    </div>
    <div className="h-2 bg-base-300 w-full">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
    </div>
</div>
```

## Migration Process

When migrating an existing detail panel to Basel:

1. **Read the showcase panel** for the target feature from the lookup table above
2. **Read the showcase data file** (`{feature}-data.ts`) to understand all fields
3. **Read the real portal detail component** to understand data flow and hooks
4. **Create the Basel version** at `{feature}-detail-basel/` or modify in-place:
   - Keep the data layer (API calls, hooks, types)
   - Replace the UI with showcase patterns
   - Use `PanelHeader` and `PanelTabs` (or inline the patterns)
   - Match all tabs, sections, badges from the showcase
5. **Validate** against the checklist below

## Checklist

- [ ] Dark header with `bg-neutral text-neutral-content border-l-4 border-l-primary`
- [ ] Diagonal clip-path accent (`bg-primary/10`)
- [ ] Kicker row with uppercase tracking and status badges
- [ ] Avatar uses `w-20 h-20` with image or initials fallback
- [ ] Title uses `text-3xl font-black tracking-tight`
- [ ] Stats strip with cycling icon colors (primary → secondary → accent → warning)
- [ ] `BaselTabBar` from `@splits-network/basel-ui` for tab navigation
- [ ] Content sections use `border-l-4 border-l-primary pl-6` for emphasis
- [ ] Badge groups use correct variant per content type
- [ ] DaisyUI semantic tokens only (no raw colors, no hex)
- [ ] Sharp corners throughout (no `rounded-*`)
- [ ] No gradients — solid fills with opacity variants
- [ ] FontAwesome icons: `fa-duotone fa-regular fa-{icon}`
- [ ] Section headers: `text-xs font-bold uppercase tracking-[0.22em]`
- [ ] All data from the real component is represented
- [ ] File stays under 200 lines (split into sub-components if needed)

## Reference Implementations

- **Gold standard**: `apps/portal/src/app/portal/recruiters/components/shared/recruiter-detail.tsx`
- **Showcase page**: `apps/corporate/src/app/showcase/detail-panel/one/page.tsx`
- **Shared header**: `apps/corporate/src/app/showcase/detail-panel/one/panels/panel-header.tsx`
