# migrate-profiles

Migrate a profiles page to Memphis design.

## Page Type Characteristics
Profile pages display a person or entity's full public-facing information. They feature:
- A **dark profile header** with large avatar, name, title, verification badges, metadata, stats grid, and action buttons
- **Tab navigation** for content sections (About, Activity, Reviews)
- A **2-column layout**: main content (2/3) + sidebar (1/3) using `lg:grid-cols-3`
- **Bio section** with text content
- **Specialization/skills tags** grouped by category
- **Experience timeline** with vertical line and bordered entries
- **Activity feed** and **review cards** as tab content
- **Sidebar** with contact info, related profiles, and availability status

## Key Components to Transform

### Profile Header
- Dark background with `border-b-4`
- Avatar: `w-28 h-28 border-4` square with initials, solid colored bg
- Verification badge: `absolute -bottom-2 -right-2 w-8 h-8 border-2` with check icon
- Status badges: `px-3 py-1 text-[10px] font-black uppercase tracking-wider` solid bg
- Name: `text-3xl md:text-4xl font-black uppercase tracking-tight`
- Title: `text-sm font-bold` in accent color
- Metadata row: icon-prefixed labels in muted white

### Stats Grid
- `grid grid-cols-2 md:grid-cols-4 gap-4` in the header area
- Each stat: `border-3 p-4 text-center` with `borderColor: stat.color`
- Value: `text-2xl font-black` in accent color
- Label: `text-[10px] font-bold uppercase tracking-wider` muted

### Profile Content Sections
- Bio: `border-4 p-8` with icon badge heading, paragraph text at `opacity: 0.7`
- Specializations: bordered tags `px-3 py-1.5 text-xs font-bold uppercase border-3`
- Skills: smaller tags `px-2 py-1 text-[10px] font-bold uppercase border-2` cycling colors

### Experience Timeline
- Vertical line: `absolute left-4 top-0 bottom-0 w-0.5`
- Nodes: `w-9 h-9 border-3` with icon, `backgroundColor: C.white`, `z-10`
- Entries: `border-3 p-4` with role title, period badge, company, description

### Activity Feed Items
- `border-3 p-4` with `borderColor: item.color`, `hover:-translate-y-0.5`
- Icon box: `w-10 h-10` solid bg with icon
- Action text: `text-sm font-bold`, detail: `text-xs, opacity: 0.5`
- Timestamp: `text-[10px] font-bold uppercase tracking-wider`, right-aligned

### Review Cards
- `border-3 p-5` with colored border
- Avatar: `w-9 h-9 border-2 rounded-full` (exception for avatar circles)
- Star rating: `fa-solid fa-star` / `fa-regular fa-star` in `C.yellow`
- Review text: `text-sm leading-relaxed, opacity: 0.7`

### Sidebar Cards
- Contact info: icon + text list, each with colored icon
- Related profiles: compact list with circular avatar, name, title, metric
- Availability: green dot (`w-3 h-3 rounded-full`) + status text + description

## Memphis Patterns for Profiles

```tsx
{/* Profile avatar with verification badge */}
<div className="relative flex-shrink-0">
    <div className="w-28 h-28 border-4 flex items-center justify-center"
        style={{ borderColor: C.coral, backgroundColor: C.coral }}>
        <span className="text-4xl font-black" style={{ color: C.white }}>MT</span>
    </div>
    <div className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-2"
        style={{ backgroundColor: C.teal, borderColor: C.dark }}>
        <i className="fa-solid fa-check text-xs" style={{ color: C.dark }}></i>
    </div>
</div>

{/* Stats block */}
<div className="stat-block border-3 p-4 text-center"
    style={{ borderColor: C.coral, backgroundColor: "rgba(255,255,255,0.03)" }}>
    <p className="text-2xl font-black" style={{ color: C.coral }}>147</p>
    <p className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: "rgba(255,255,255,0.5)" }}>Placements</p>
</div>

{/* Activity feed item */}
<div className="flex items-start gap-4 p-4 border-3 transition-transform hover:-translate-y-0.5"
    style={{ borderColor: C.coral }}>
    <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: C.coral }}>
        <i className="fa-duotone fa-regular fa-trophy text-sm" style={{ color: C.white }}></i>
    </div>
    <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: C.dark }}>Placed a candidate</p>
        <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Senior Frontend Engineer at TechCorp</p>
    </div>
    <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
        style={{ color: C.dark, opacity: 0.3 }}>2 hours ago</span>
</div>
```

## Common Violations
- Circular profile images with `img` tags -- Memphis uses square avatars with initials (circles only for small inline avatars)
- Soft gradient headers -- Memphis uses flat dark backgrounds
- Using DaisyUI `avatar`, `badge`, `stat` components -- use raw Memphis styled elements
- Star ratings with SVG components -- use FontAwesome `fa-star` icons colored in `C.yellow`
- Missing thick borders on stat blocks and content sections
- Timeline without vertical connecting line
- Activity items without colored icon box (just icon alone)

## Reference
Showcase: `apps/corporate/src/app/showcase/profiles/six/page.tsx`
