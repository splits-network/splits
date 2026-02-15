# migrate-cards

Migrate a cards page to Memphis design.

## Page Type Characteristics
Cards pages display collections of entities in grid layouts. They feature:
- A **centered page heading** with badge, large title (with colored keyword + underline), and subtitle
- A **featured/hero card** spanning full width with 2-3 column split layout
- **Category filter bar** with pill-style toggle buttons and result count
- **Card grids** using `md:grid-cols-2 lg:grid-cols-3` (or 4 for smaller cards)
- Multiple card variants: job cards, recruiter cards, company list cards
- **Section dividers** with label badge + horizontal line

## Key Components to Transform

### Page Heading
- Badge: `inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]` with solid bg
- Title: `text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]`
- Highlighted keyword: colored text + `absolute -bottom-2 left-0 w-full h-2` underline bar
- Subtitle: `text-lg` with `rgba(255,255,255,0.6)`

### Featured Card
- Full-width, `border-4` with accent color border
- Left panel: solid colored background with title, company, tags
- Right panel: white background with description, salary badge, meta, CTAs
- Corner badge: `absolute top-0 right-0 px-4 py-1.5 text-xs font-black uppercase`

### Category Filters
- Filter label: `text-xs font-black uppercase tracking-wider` muted
- Filter buttons: `px-4 py-2 text-xs font-black uppercase tracking-wider border-3`
- Active: `borderColor: color, backgroundColor: color, color: C.white`
- Inactive: `borderColor: rgba(255,255,255,0.15), backgroundColor: transparent`
- Result count: `ml-auto text-xs font-bold` muted

### Job Card (Grid)
- Container: `border-4 p-0` with top color strip (`h-1.5`)
- Hover: `borderColor` changes to `job.color`, `translateY(-4px)`
- Header: type tag (solid) + remote tag (outline) + bookmark button
- Title: `text-base font-black uppercase tracking-wide leading-tight`
- Salary: `text-lg font-black` in accent color
- Tags: `px-2 py-0.5 text-[10px] font-bold uppercase border-2`
- Footer: `border-t-2` divider with applicant count and time

### Recruiter Card (Grid)
- Container: `border-4 p-6 text-center` with colored border
- Circular avatar: `w-16 h-16 border-4 rounded-full` (exception to no-radius rule)
- Name: `text-sm font-black uppercase tracking-wide`
- Specialty tags: `px-2 py-0.5 text-[10px] font-bold uppercase border-2`
- Stats: side-by-side with `text-lg font-black` value + `text-[10px]` label
- Full-width CTA button

### Company List Card (Horizontal)
- Container: `border-4 p-4 flex items-center gap-4`
- Logo square: `w-14 h-14 border-3` with initials
- Company info: name (bold uppercase) + sector
- Metric: `text-lg font-black` colored + label

## Memphis Patterns for Cards

```tsx
{/* Featured card with split layout */}
<div className="border-4 p-0 relative overflow-hidden" style={{ borderColor: C.coral, backgroundColor: C.white }}>
    <div className="absolute top-0 right-0 px-4 py-1.5 text-xs font-black uppercase tracking-wider z-10"
        style={{ backgroundColor: C.coral, color: C.white }}>
        <i className="fa-duotone fa-regular fa-star mr-1"></i> Featured
    </div>
    <div className="grid md:grid-cols-3">
        <div className="p-8 flex flex-col justify-center" style={{ backgroundColor: C.coral }}>
            {/* Title + tags on colored bg */}
        </div>
        <div className="md:col-span-2 p-8">
            {/* Description, salary, CTAs on white bg */}
        </div>
    </div>
</div>

{/* Section divider with label */}
<div className="flex items-center gap-3 mb-8">
    <span className="px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em]"
        style={{ backgroundColor: C.purple, color: C.white }}>
        <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>Section Label
    </span>
    <div className="flex-1 h-1" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
</div>

{/* Job card with top color strip */}
<div className="border-4 p-0 cursor-pointer" style={{ borderColor: C.dark, backgroundColor: C.white }}>
    <div className="h-1.5" style={{ backgroundColor: job.color }} />
    <div className="p-5">
        {/* Card content */}
    </div>
</div>
```

## Common Violations
- Using DaisyUI `card`, `badge`, `btn` components -- use raw Memphis styled elements
- Card shadows instead of thick borders
- Rounded card corners -- Memphis cards have sharp corners
- Using `text-gray-500` for muted text -- use `style={{ color: C.dark, opacity: 0.5 }}`
- Using Tailwind color classes (`bg-red-500`) -- always use inline `style` with Memphis palette
- Missing hover translate effect -- all interactive cards need `hover:-translate-y-1`
- Grid cards without consistent border width -- always `border-4` for cards, `border-3` for inner elements

## Reference
Showcase: `.claude/memphis/showcase/cards-six.tsx`
