# migrate-dashboards

Migrate a dashboards page to Memphis design.

## Page Type Characteristics
Dashboard pages are data-heavy analytical views with KPI cards, charts (line, donut, bar), activity feeds, and quick action grids. Key traits:
- Persistent sidebar navigation (via separate component)
- Main content offset with `lg:ml-[260px]`
- Hero section with badge, headline, subtext, and KPI card grid
- Charts section with SVG-based line chart, donut chart, and bar chart, all inside bordered containers
- Activity feed as a scrollable list of bordered items with user avatars
- Quick actions grid of clickable cards with badge counts
- Bottom CTA section with Memphis decorations

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| KPI cards | `border-4` with accent color, corner accent block, icon in `border-3` box, large `font-black` value, trend indicator pill with tinted bg |
| Line chart | White container with `border-4` (teal), chart header with icon in colored square, SVG with grid lines, area fill, data points as circles |
| Donut chart | White container with `border-4` (purple), SVG donut using `stroke-dasharray`, center total label, legend with colored squares |
| Bar chart | White container with `border-4` (yellow), bars with `border-3` matching color, value above bar, month label below |
| Activity feed | Dark bg, scrollable list (`max-h-[520px]`), each item with `border-4` colored border, initials avatar square, bold user name in accent color, timestamp with icon |
| Quick action cards | `border-4` with accent color, corner accent, icon in `border-4` box, badge count (absolute positioned), "Go" arrow link |
| Dashboard sidebar | Separate component, fixed width 260px, dark bg with nav items |

## Memphis Patterns for Dashboards

### KPI Card Pattern
```tsx
<div className="relative p-5 md:p-6 border-4"
    style={{ borderColor: "#FF6B6B", backgroundColor: "rgba(255,255,255,0.04)" }}>
    <div className="absolute top-0 right-0 w-10 h-10" style={{ backgroundColor: "#FF6B6B" }} />
    <div className="w-10 h-10 flex items-center justify-center mb-3 border-3"
        style={{ borderColor: "#FF6B6B" }}>
        <i className="fa-duotone fa-regular fa-briefcase text-lg" style={{ color: "#FF6B6B" }}></i>
    </div>
    <div className="text-3xl md:text-4xl font-black mb-1" style={{ color: "#FFFFFF" }}>
        47
    </div>
    <div className="text-xs font-bold uppercase tracking-[0.15em] mb-2"
        style={{ color: "rgba(255,255,255,0.6)" }}>
        Active Jobs
    </div>
    <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-bold"
        style={{ backgroundColor: "rgba(78,205,196,0.15)", color: "#4ECDC4" }}>
        <i className="fa-solid fa-arrow-up text-[10px]"></i>
        +12%
    </div>
</div>
```

### Chart Container Pattern
```tsx
<div className="border-4 p-6" style={{ borderColor: "#4ECDC4", backgroundColor: "#FFFFFF" }}>
    <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: "#4ECDC4" }}>
            <i className="fa-duotone fa-regular fa-chart-line text-lg" style={{ color: "#1A1A2E" }}></i>
        </div>
        <div>
            <h3 className="font-black text-lg uppercase tracking-wide" style={{ color: "#1A1A2E" }}>
                Chart Title
            </h3>
            <p className="text-xs uppercase tracking-wider" style={{ color: "rgba(26,26,46,0.5)" }}>
                Subtitle
            </p>
        </div>
    </div>
    {/* SVG chart content */}
</div>
```

### Activity Item Pattern
```tsx
<div className="flex items-start gap-4 p-4 border-4"
    style={{ borderColor: "#4ECDC4", backgroundColor: "rgba(255,255,255,0.04)" }}>
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-black text-sm uppercase"
        style={{ backgroundColor: "#4ECDC4", color: "#FFFFFF" }}>
        SK
    </div>
    <div className="flex-1 min-w-0">
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
            <span className="font-black" style={{ color: "#4ECDC4" }}>Sarah K.</span>{" "}
            posted Senior React Developer at TechCorp
        </p>
        <div className="flex items-center gap-2 mt-1">
            <i className="fa-duotone fa-regular fa-plus-circle text-xs" style={{ color: "#4ECDC4" }}></i>
            <span className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "rgba(255,255,255,0.4)" }}>2 minutes ago</span>
        </div>
    </div>
</div>
```

## Common Violations
- Using third-party chart libraries with non-Memphis styling (rounded lines, gradients)
- KPI cards without corner accent blocks or trend indicators
- Activity items without initials avatars and colored borders
- Charts without Memphis container styling (icon header, thick border)
- Using shadows on cards instead of thick borders
- Sidebar not dark-themed with colored active indicators
- Quick action cards without badge counts or "Go" arrow links

## Reference
Showcase: `.claude/memphis/showcase/dashboards-six.tsx`
