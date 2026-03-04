# grid-card

Basel grid card patterns for entity listing pages. Follow these patterns when creating or modifying grid cards across portal, candidate, and corporate apps.

## Card Anatomy

Every Basel grid card follows this vertical section order:

```
┌─────────────────────────────────┐
│ HEADER BAND (bg-base-300)       │
│  Kicker row: badges (status/new)│
│  Avatar + Title block           │
│  Location + date meta           │
├─────────────────────────────────┤
│ ABOUT SECTION                   │
│  Section label + MarkdownRenderer│
├─────────────────────────────────┤
│ STATS GRID (2x2)                │
│  Colored icon squares + values  │
├─────────────────────────────────┤
│ TAGS / BADGES SECTION(S)        │
│  Skills, tech stack, perks, etc.│
├─────────────────────────────────┤
│ DETAIL BADGES (optional)        │
│  Employment type, level, etc.   │
├─────────────────────────────────┤
│ FOOTER (mt-auto)                │
│  Entity name + actions toolbar  │
└─────────────────────────────────┘
```

## Card Container

```tsx
<article
    onClick={onSelect}
    className={[
        "group cursor-pointer flex flex-col bg-base-100 border border-base-300 border-l-4 transition-all hover:shadow-md",
        isSelected
            ? "border-l-primary border-primary"
            : "border-l-primary",
    ].join(" ")}
>
```

Key rules:
- `flex flex-col` for vertical stacking
- `border-l-4 border-l-primary` accent on all cards
- `group` for hover state propagation
- `hover:shadow-md` for lift effect
- Selected state adds `border-primary` on all sides

## Header Band

```tsx
<div className="bg-base-300 border-b border-base-300 px-6 pt-5 pb-4">
    {/* Kicker row */}
    <div className="flex items-center justify-between mb-3">
        {/* Left: status + conditional badges */}
        <div className="flex items-center gap-2 flex-wrap">
            <BaselBadge color={statusColor} variant="soft" size="sm">
                {statusLabel}
            </BaselBadge>
            {isNew && (
                <BaselBadge color="warning" variant="soft" size="sm" icon="fa-sparkles">
                    New
                </BaselBadge>
            )}
        </div>
        {/* Right: contextual badge (industry, 3rd party, etc.) */}
    </div>

    {/* Avatar + Title */}
    <div className="flex items-end gap-3">
        <div className="relative shrink-0">
            {/* Logo or initials fallback */}
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt={name}
                    className="w-14 h-14 object-contain bg-base-100 border border-base-300 p-1"
                />
            ) : (
                <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center text-lg font-black tracking-tight select-none">
                    {initials}
                </div>
            )}
            {/* Gamification badge overlay */}
            {level && (
                <div className="absolute -bottom-1 -right-1">
                    <LevelBadge level={level} size="sm" />
                </div>
            )}
        </div>
        <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                {entityKicker} {/* "Role", "Company", etc. */}
            </p>
            <h3 className="text-xl font-black tracking-tight leading-none text-base-content truncate group-hover:text-primary transition-colors">
                {title}
            </h3>
        </div>
    </div>

    {/* Location + date */}
    <div className="flex items-center gap-3 mt-2.5 text-sm text-base-content/40">
        {location && (
            <span className="flex items-center gap-1.5">
                <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                {location}
            </span>
        )}
        {location && date && (
            <span className="text-base-content/20">|</span>
        )}
        {date && (
            <span className="flex items-center gap-1.5">
                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                {date}
            </span>
        )}
    </div>
</div>
```

## Always-Visible Sections (CRITICAL)

All content sections MUST be always visible. Never conditionally hide entire sections. Use empty state placeholders when data is missing. This ensures consistent card heights across the grid.

```tsx
{/* CORRECT — always visible with empty state */}
<div className="px-6 py-4 border-b border-base-300">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
        About
    </p>
    {description ? (
        <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
            <MarkdownRenderer content={description} />
        </div>
    ) : (
        <p className="text-sm text-base-content/20 italic">No description added yet</p>
    )}
</div>

{/* WRONG — conditionally hidden */}
{description && (
    <div className="px-6 py-4 border-b border-base-300">...</div>
)}
```

### Empty State Pattern

All empty states use this exact styling:
```tsx
<p className="text-sm text-base-content/20 italic">{message}</p>
```

Common messages:
- `"No description added yet"` — About sections
- `"No skills listed"` — Skills/tech stack
- `"No perks listed"` — Perks
- `"No culture tags listed"` — Culture tags
- `"No details available"` — Detail badges

### Section Label Pattern

Every section starts with an uppercase tracking label:
```tsx
<p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
    Section Name
</p>
```

Use `mb-1.5` for text content sections, `mb-2` for badge/tag sections.

## About Section

Always uses `MarkdownRenderer` from `@splits-network/shared-ui` with `line-clamp-2`:

```tsx
<div className="px-6 py-4 border-b border-base-300">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-1.5">
        About
    </p>
    {content ? (
        <div className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
            <MarkdownRenderer content={content} />
        </div>
    ) : (
        <p className="text-sm text-base-content/20 italic">No description added yet</p>
    )}
</div>
```

## Stats Grid (2x2)

Stats use a 2-column grid with colored icon squares. Each icon cycles through 4 semantic colors.

```tsx
const iconStyles = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

const stats = [
    { label: "Salary", value: salary || "TBD", icon: "fa-duotone fa-regular fa-dollar-sign" },
    { label: "Split Fee", value: `${feePercent}%`, icon: "fa-duotone fa-regular fa-handshake" },
    { label: "Est. Payout", value: payout, icon: "fa-duotone fa-regular fa-coins" },
    { label: "Applicants", value: String(count), icon: "fa-duotone fa-regular fa-users" },
];
```

```tsx
<div className="border-b border-base-300">
    <div className="grid grid-cols-2 divide-x divide-y divide-base-300">
        {stats.map((stat, i) => (
            <div
                key={stat.label}
                className="flex items-center gap-2 px-2 py-3 min-w-0 overflow-hidden"
            >
                <div
                    className={`w-7 h-7 flex items-center justify-center shrink-0 ${iconStyles[i % iconStyles.length]}`}
                >
                    <i className={`${stat.icon} text-xs`} />
                </div>
                <div className="min-w-0">
                    <span className="text-sm font-black text-base-content leading-none block truncate">
                        {stat.value}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate block">
                        {stat.label}
                    </span>
                </div>
            </div>
        ))}
    </div>
</div>
```

Key rules:
- `grid grid-cols-2` — always 2 columns
- `divide-x divide-y divide-base-300` — grid lines between cells
- Icon square: `w-7 h-7` with semantic color background, cycling through primary → secondary → accent → warning
- Value: `text-sm font-black` (bold, prominent)
- Label: `text-xs font-semibold uppercase tracking-wide text-base-content/30` (muted)
- Each cell: `px-2 py-3 min-w-0 overflow-hidden` for compact fit with truncation

## Tag/Badge Sections

For skills, tech stack, perks, culture tags — all follow the same pattern:

```tsx
<div className="px-6 py-4 border-b border-base-300">
    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
        Required Skills
    </p>
    {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
            {items.slice(0, maxVisible).map((item) => (
                <BaselBadge key={item} variant="outline" size="sm">
                    {item}
                </BaselBadge>
            ))}
            {items.length > maxVisible && (
                <span className="text-sm font-semibold text-base-content/40 self-center">
                    +{items.length - maxVisible} more
                </span>
            )}
        </div>
    ) : (
        <p className="text-sm text-base-content/20 italic">No skills listed</p>
    )}
</div>
```

Badge variants by content type:
- **Skills / Tech Stack**: `variant="outline"` (neutral outline)
- **Perks**: `color="secondary"` (teal fill)
- **Culture Tags**: `color="accent"` (accent fill)
- **Detail Badges**: `color="primary"` or `color="secondary"` with `icon` prop

Typical `maxVisible` values: 4 for skills/perks/culture, 6 for tech stack.

## Footer

```tsx
<div className="mt-auto flex items-center justify-between gap-3 px-6 py-4">
    <div className="min-w-0">
        <div className="text-sm font-semibold text-base-content truncate">
            {entityName}
        </div>
        {subtitle && (
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 truncate">
                {subtitle}
            </div>
        )}
    </div>

    {/* Actions toolbar (portal only) */}
    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <ActionsToolbar variant="icon-only" size="sm" />
    </div>
</div>
```

Key rules:
- `mt-auto` pushes footer to bottom of card
- `stopPropagation` on actions to prevent card click
- Candidate-facing cards may omit the actions toolbar

## Reference Implementations

- **Portal roles card**: `apps/portal/src/app/portal/roles/components/grid/grid-card.tsx`
- **Portal companies card**: `apps/portal/src/app/portal/companies/components/grid/grid-card.tsx`
- **Candidate jobs card**: `apps/candidate/src/app/(public)/jobs/components/grid/grid-card.tsx`
- **Stats extraction**: `apps/portal/src/app/portal/companies/components/grid/grid-card-stats.tsx`

## Checklist for New Grid Cards

- [ ] Card uses `article` with `flex flex-col` and `border-l-4 border-l-primary`
- [ ] Header band has `bg-base-300` with kicker row, avatar+title, and location+date
- [ ] Avatar uses `w-14 h-14` with logo or initials fallback
- [ ] Gamification `LevelBadge` overlay on avatar (if applicable)
- [ ] Kicker label above title (`text-xs font-bold uppercase tracking-[0.2em] text-primary`)
- [ ] All content sections are ALWAYS VISIBLE with empty state placeholders
- [ ] About section uses `MarkdownRenderer` with `line-clamp-2`
- [ ] Stats use 2x2 grid with colored icon squares cycling through 4 semantic colors
- [ ] Tag sections use `BaselBadge` with appropriate variant/color per content type
- [ ] Tag sections show max N items + "+X more" overflow text
- [ ] Empty states use `text-sm text-base-content/20 italic`
- [ ] Footer uses `mt-auto` to stick to bottom
- [ ] Actions toolbar wrapped with `stopPropagation`
- [ ] All section dividers use `border-b border-base-300`
- [ ] Section padding is `px-6 py-4` (or `px-5 py-4` for company cards)
