# migrate-lists

Migrate a lists page to Memphis design.

## Page Type Characteristics
List pages are data-rich interactive views with sidebar navigation, search/filter controls, and multiple view modes (table, grid, split/gmail). Key traits:
- Memphis header section with stats pills and page title
- Persistent sidebar navigation with active state indicators
- Controls bar with search input, dropdown filters, and view mode toggles
- Three view modes: Table (expandable rows), Grid (cards with optional detail sidebar), Gmail/Split (list + detail pane)
- Detail panel with structured sections (header, stats grid, requirements, responsibilities, benefits, tags, recruiter info)
- Client-side filtering, search, and state management (`"use client"`)

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Page header | Dark bg, Memphis shapes, badge pill, massive uppercase title with accent word + underline bar, stats pills with `border-2` and colored values |
| Sidebar nav | Dark bg (`#1A1A2E`), nav items with colored icon boxes, active state: `border-left: 4px solid color` + tinted bg + colored text, logo block, Memphis decoration footer |
| Controls bar | `border-4` container on white bg, search input with coral magnifying glass, bordered select dropdowns, view mode toggle buttons with active dark fill |
| Table view | `border-4` outer border, dark header row with colored column headers cycling `ACCENT_CYCLE`, alternating row colors, active row with colored `borderLeft`, expandable detail row |
| Grid view | Cards with `border-4`, corner accent block, featured badge, status badge, tag pills with `border-2`, recruiter avatar with colored border, optional sticky detail sidebar |
| Gmail/Split view | `border-4` two-pane layout, left list with active indicator bar, right detail panel, empty state with Memphis shapes |
| Detail panel | Header with `border-b-4`, stats grid with 3 columns, requirements/responsibilities lists with chevron icons, benefits as bordered pills, skills as colored tags, recruiter card with `border-4` |
| Status badges | Solid colored backgrounds: open=teal, filled=coral, pending=yellow, closed=purple |
| Empty state | Centered Memphis shapes (rotated square, circle, diamond), bold uppercase heading, muted subtext, reset button |

## Memphis Patterns for Lists

### Controls Bar Pattern
```tsx
<div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 p-4 border-4"
    style={{ borderColor: "#1A1A2E", backgroundColor: "#FFFFFF" }}>
    {/* Search */}
    <div className="flex-1 flex items-center gap-2 px-3 py-2 border-2"
        style={{ borderColor: "rgba(26,26,46,0.3)" }}>
        <i className="fa-duotone fa-regular fa-magnifying-glass text-sm" style={{ color: "#FF6B6B" }}></i>
        <input type="text" className="flex-1 bg-transparent outline-none text-sm font-semibold" />
    </div>
    {/* Filter dropdown */}
    <select className="px-3 py-2 text-xs font-bold uppercase border-2 bg-transparent outline-none cursor-pointer"
        style={{ borderColor: "#4ECDC4", color: "#1A1A2E" }}>
        <option>All</option>
    </select>
    {/* View mode toggle */}
    <div className="flex items-center border-2" style={{ borderColor: "#1A1A2E" }}>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: "#1A1A2E", color: "#FFE66D" }}>
            <i className="fa-duotone fa-regular fa-grid-2"></i>
            Grid
        </button>
    </div>
</div>
```

### Sidebar Nav Pattern
```tsx
<aside className="w-56 flex-shrink-0 border-r-4"
    style={{ backgroundColor: "#1A1A2E", borderColor: "rgba(255,255,255,0.08)" }}>
    <nav className="p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-left"
            style={{
                backgroundColor: "rgba(78,205,196,0.12)",
                borderLeft: "4px solid #4ECDC4",
            }}>
            <div className="w-7 h-7 flex items-center justify-center"
                style={{ backgroundColor: "#4ECDC4" }}>
                <i className="fa-duotone fa-regular fa-briefcase text-xs" style={{ color: "#FFFFFF" }}></i>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
                Roles
            </span>
        </button>
    </nav>
</aside>
```

### Grid Card Pattern
```tsx
<div className="cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative"
    style={{ borderColor: "rgba(26,26,46,0.3)", backgroundColor: "#FFFFFF" }}>
    <div className="absolute top-0 right-0 w-8 h-8" style={{ backgroundColor: accent }} />
    <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1"
        style={{ color: "#1A1A2E" }}>Title</h3>
    <div className="text-sm font-bold mb-2" style={{ color: accent }}>Subtitle</div>
    <span className="px-2 py-0.5 text-[10px] font-bold uppercase"
        style={{ backgroundColor: statusColor, color: "#FFFFFF" }}>Status</span>
</div>
```

## Common Violations
- Using DaisyUI `table`, `card`, or `badge` classes instead of raw Memphis styling
- Missing view mode toggles (table/grid/split)
- Sidebar without colored active indicator bars
- Filters without Memphis bordered styling
- Cards without corner accent blocks
- Missing Memphis shape decorations in header section
- Using rounded borders on cards or badges
- Status colors not mapped to the Memphis palette

## Reference
Showcase: `.claude/memphis/showcase/lists-six.tsx`
