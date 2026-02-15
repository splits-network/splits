# migrate-details

Migrate a details page to Memphis design.

## Page Type Characteristics
Details pages display a single entity (job, candidate, placement) in depth. They feature:
- A **dark hero header** with breadcrumb, status tags, title, metadata row, and action buttons
- **Tab navigation** below the hero for switching content sections (e.g., Overview, Timeline, Similar)
- A **2-column layout**: main content (2/3) + sidebar (1/3) using `lg:grid-cols-3`
- Multiple **bordered content sections** in the main area, each with a section heading + icon badge
- **Sidebar cards** for quick facts, related entities, and contextual info

## Key Components to Transform

### Hero Header
- Dark background (`backgroundColor: C.dark`), full-width
- Breadcrumb trail: uppercase, `text-xs font-bold tracking-wider`, links colored `C.teal`
- Status tags: `px-3 py-1 text-xs font-black uppercase tracking-wider` with solid or outline border-2 styles
- Title: `text-4xl md:text-5xl font-black uppercase tracking-tight leading-[1]`
- Metadata row: icon + label pairs with colored icons

### Action Buttons
- Icon buttons: `w-11 h-11 border-3` square, no border-radius
- Primary CTA: `px-6 py-3 text-sm font-black uppercase tracking-wider border-3`
- All with `transition-transform hover:-translate-y-0.5`

### Tab Navigation
- Container: `border-b-4` with `backgroundColor: C.white, borderColor: C.dark`
- Each tab: `px-6 py-4 text-sm font-black uppercase tracking-wider border-b-4 -mb-1`
- Active state: `borderColor: tab.color, color: C.dark`; inactive: `borderColor: transparent, color: rgba(26,26,46,0.4)`

### Content Sections
- Card wrapper: `border-4 p-8` with `borderColor` per section color, `backgroundColor: C.white`
- Section heading: `text-lg font-black uppercase tracking-wider` with icon badge (`w-8 h-8` colored square)
- List items use checkmark boxes: `w-6 h-6 border-2` with check icon

### Sidebar Cards
- Each card: `border-4 p-6` with distinct `borderColor`
- Section heading: `text-sm font-black uppercase tracking-wider` with `w-6 h-6` icon badge
- Key-value rows: `flex items-center justify-between py-2 border-b-2`
- Compact stat grids: `grid grid-cols-3 gap-2`

### Timeline
- Vertical line: `absolute left-5 top-0 bottom-0 w-0.5`
- Timeline nodes: `w-10 h-10 border-3` with icon, connected to bordered content cards

## Memphis Patterns for Details

```tsx
{/* Color Accent Bar - always at page top */}
<div className="flex h-1.5">
    <div className="flex-1" style={{ backgroundColor: C.coral }} />
    <div className="flex-1" style={{ backgroundColor: C.teal }} />
    <div className="flex-1" style={{ backgroundColor: C.yellow }} />
    <div className="flex-1" style={{ backgroundColor: C.purple }} />
</div>

{/* Section with icon badge heading */}
<div className="border-4 p-8" style={{ borderColor: C.coral, backgroundColor: C.white }}>
    <h2 className="text-lg font-black uppercase tracking-wider mb-5 flex items-center gap-2"
        style={{ color: C.dark }}>
        <span className="w-8 h-8 flex items-center justify-center" style={{ backgroundColor: C.coral }}>
            <i className="fa-duotone fa-regular fa-file-lines text-sm" style={{ color: C.white }}></i>
        </span>
        Section Title
    </h2>
</div>

{/* Sidebar key-value row */}
<div className="flex items-center justify-between py-2 border-b-2" style={{ borderColor: C.cream }}>
    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.5 }}>
        Label
    </span>
    <span className="text-sm font-bold" style={{ color: C.coral }}>Value</span>
</div>

{/* Split fee bar */}
<div className="flex h-3 border-2 overflow-hidden" style={{ borderColor: C.dark }}>
    <div className="h-full" style={{ width: "60%", backgroundColor: C.coral }} />
    <div className="h-full" style={{ width: "40%", backgroundColor: C.teal }} />
</div>
```

## Common Violations
- Using rounded corners (`rounded-lg`, `rounded-xl`) -- Memphis uses sharp edges (no border-radius except avatars)
- Using `shadow-*` classes -- Memphis uses thick borders (`border-3`, `border-4`) instead of shadows
- Using DaisyUI card/badge/tab components -- use raw styled elements
- Soft pastel colors -- Memphis uses bold, saturated colors from the C palette
- Thin borders (`border`) -- Memphis uses `border-2`, `border-3`, `border-4`
- Missing uppercase tracking on headings -- all headings use `font-black uppercase tracking-wider`
- Using `gap-1` for metadata -- use `gap-4` for breathing room

## Reference
Showcase: `apps/corporate/src/app/showcase/details/six/page.tsx`
