# migrate-search

Migrate a search page to Memphis design.

## Page Type Characteristics
Search pages enable users to find and filter entities with advanced criteria. They feature:
- A **dark header** with search bar input prominently centered
- A **sidebar + results** layout using `lg:grid-cols-4` (1 sidebar + 3 results)
- **Filter panel** in the sidebar with checkbox groups, radio groups, range sliders, selects
- **Active filter pills** displayed above results for quick removal
- **Results header** with count and sort dropdown
- **Result list cards** in a vertical stack (not grid) with left color accent stripe
- **No-results empty state** when filters yield zero matches
- **Mobile filter toggle** for responsive behavior

## Key Components to Transform

### Search Header
- Dark background container
- Badge: `px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]` on `C.yellow`
- Title: `text-4xl md:text-6xl font-black uppercase tracking-tight` with colored underlined keyword
- Search bar: `border-4` composite input with colored icon area + text input + colored submit button

### Sidebar Filter Panel
- Container: `border-4 p-6` with `borderColor: C.dark, backgroundColor: C.white`
- Header: "Filters" label + "Clear All" button
- Each filter group: `h4` label with `w-1.5 h-4` colored accent bar + `text-xs font-black uppercase tracking-[0.15em]`
- Checkbox: `w-5 h-5 border-2` square, filled with color + check when selected
- Radio: `w-4 h-4 rounded-full border-2` with inner dot
- Range slider: native `<input type="range">` with `accentColor` + flanking labels
- Select: `border-3` styled select with `backgroundColor: C.cream`
- Save search button: full-width `border-3` toggle

### Active Filter Pills
- Horizontal flex wrap with "Active:" label
- Each pill: `border-2` with `px-3 py-1.5 text-xs font-bold uppercase tracking-wider` + X icon
- "Clear All" link in `C.coral`

### Results Header
- Flex row: count (`text-lg font-black uppercase`) with colored number + sort `<select>`
- Sort select: `border-3 text-xs font-bold uppercase`

### Result Card (List Style)
- Container: `border-4 p-0` with left color accent stripe (`w-1.5`)
- Content: `flex` layout with left info + right salary/action
- Tags row: type (solid), remote (outline), experience (outline)
- Title: `text-base font-black uppercase tracking-wide`
- Company/location: icon-prefixed metadata
- Skills: small `border-2` tags
- Salary: `text-lg font-black` in accent color
- View button: small `border-3` button

### No-Results State
- Centered: bordered icon container + heading + description + reset button

## Memphis Patterns for Search

```tsx
{/* Composite search bar */}
<div className="flex border-4" style={{ borderColor: C.white }}>
    <div className="flex items-center px-5" style={{ backgroundColor: C.yellow }}>
        <i className="fa-duotone fa-regular fa-magnifying-glass text-lg" style={{ color: C.dark }}></i>
    </div>
    <input type="text" placeholder="Job title, company, or keyword..."
        className="flex-1 px-5 py-4 text-sm font-semibold outline-none"
        style={{ backgroundColor: C.white, color: C.dark }} />
    <button className="px-6 text-sm font-black uppercase tracking-wider"
        style={{ backgroundColor: C.coral, color: C.white }}>Search</button>
</div>

{/* Filter checkbox group */}
<div className="mb-6">
    <h4 className="text-xs font-black uppercase tracking-[0.15em] mb-3 flex items-center gap-2"
        style={{ color: C.dark }}>
        <div className="w-1.5 h-4" style={{ backgroundColor: C.coral }} />
        Employment Type
    </h4>
    <div className="space-y-2">
        <button className="flex items-center gap-2.5 w-full text-left">
            <div className="w-5 h-5 border-2 flex items-center justify-center"
                style={{ borderColor: C.coral, backgroundColor: C.coral }}>
                <i className="fa-solid fa-check text-[9px]" style={{ color: C.white }}></i>
            </div>
            <span className="text-sm font-semibold" style={{ color: C.dark }}>Full-Time</span>
        </button>
    </div>
</div>

{/* Result card with accent stripe */}
<div className="border-4 p-0 hover:-translate-y-0.5 cursor-pointer"
    style={{ borderColor: C.dark, backgroundColor: C.white }}>
    <div className="flex">
        <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: job.color }} />
        <div className="flex-1 p-5">
            {/* Content */}
        </div>
    </div>
</div>

{/* Active filter pill */}
<button className="flex items-center gap-1.5 px-3 py-1.5 border-2 text-xs font-bold uppercase tracking-wider"
    style={{ borderColor: color, color: C.dark }}>
    Remote <i className="fa-solid fa-xmark text-[10px]" style={{ color }}></i>
</button>
```

## Common Violations
- Using DaisyUI `input`, `select`, `checkbox`, `radio` components -- use raw Memphis styled elements
- Search bar with rounded corners -- Memphis uses sharp-cornered composite input
- Filter sidebar as a dropdown/popover instead of persistent panel
- Using Tailwind color utilities instead of inline Memphis palette styles
- Cards with shadows instead of `border-4`
- Missing the left color accent stripe on result cards
- Sort/filter controls with default browser styling -- style with `border-3` and Memphis colors

## Reference
Showcase: `.claude/memphis/showcase/search-six.tsx`
