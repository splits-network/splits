# migrate-headers

Migrate a headers page to Memphis design.

## Page Type Characteristics
Header pages showcase navigation components in both desktop and mobile variants. Key traits:
- Desktop header: two-row layout with top bar (utility links) and main nav bar (logo, nav items, search, notifications, CTAs, user menu)
- Mobile header: compact single-row with hamburger toggle, expandable full menu with accordion nav
- Memphis decorations in the header background (circles, squares, triangles, zigzags, dots)
- Bold `border-[3px]` throughout on all interactive elements
- Thick bottom border (`border-bottom: 5px solid`) as header terminator
- Dropdown menus with border-[4px], platform tools with icon boxes
- Navigation items as bordered buttons with color on hover/active
- GSAP animations for entrance (bounce, elastic, scale, rotation)

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Top utility bar | Dark bg, small colored text links with icons, `text-[9px] font-bold uppercase tracking-[0.2em]`, separated by `border-bottom: 3px solid darkGray` |
| Logo block | Square logo box (`w-11 h-11 border-[3px]`), small colored dot accent, bold uppercase name + colored subtext |
| Nav items | `border-[3px]` buttons, transparent default, colored border + tinted bg on hover/active, FontAwesome icon in accent color, chevron for dropdowns |
| Dropdown menu | `border-[4px]` in accent color, dark bg, items with `border-left: 3px` on hover, icon in bordered square, title + description, colored bottom bar |
| Search toggle | `w-10 h-10 border-[3px]` button, toggles to X icon when open, dropdown with bordered input |
| Notification bell | `w-10 h-10 border-[3px]`, count badge (absolute positioned, coral bg, tiny font) |
| CTA buttons | Primary: filled coral bg + border-[3px], uppercase text; Secondary: outline purple border-[3px] |
| User avatar | Circle-less square with initials (`w-9 h-9 border-[2px]`), colored fill, chevron |
| Mobile hamburger | `w-9 h-9 border-[3px]`, toggles between bars/xmark, color changes on open |
| Mobile menu | Accordion nav items with chevron toggle, nested links with colored left border, CTA buttons at bottom |

## Memphis Patterns for Headers

### Desktop Header Pattern
```tsx
<header style={{ backgroundColor: "#1A1A2E", borderBottom: "5px solid #FF6B6B" }}>
    {/* Memphis background decorations */}
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-2 right-12 w-8 h-8 rounded-full border-[3px] opacity-20"
            style={{ borderColor: "#4ECDC4" }} />
        {/* more shapes... */}
    </div>
    <div className="relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 lg:px-10"
            style={{ borderBottom: "3px solid #2D2D44" }}>
            {/* utility links */}
        </div>
        {/* Main nav */}
        <div className="flex items-center justify-between px-6 lg:px-10 py-3.5">
            {/* Logo + Nav + Actions */}
        </div>
    </div>
</header>
```

### Nav Item Pattern
```tsx
<button className="flex items-center gap-2 px-3.5 py-2 text-xs font-black uppercase tracking-[0.12em] border-[3px] transition-all hover:-translate-y-0.5"
    style={{
        borderColor: isActive ? color : "transparent",
        backgroundColor: isActive ? `${color}12` : "transparent",
        color: isActive ? color : "#FFFFFF",
    }}>
    <i className={`${icon} text-[10px]`} style={{ color }}></i>
    {label}
    {hasDropdown && <i className="fa-solid fa-chevron-down text-[8px] opacity-50"></i>}
</button>
```

### Mobile Header Pattern
```tsx
<header style={{ backgroundColor: "#1A1A2E", borderBottom: "5px solid #4ECDC4" }}>
    <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        {/* Search + Bell + Hamburger buttons */}
    </div>
    {menuOpen && (
        <div className="px-4 pb-4" style={{ borderTop: "3px solid #2D2D44" }}>
            {/* Accordion nav + CTAs */}
        </div>
    )}
</header>
```

## Common Violations
- Using DaisyUI `navbar`, `dropdown`, or `menu` classes
- Rounded elements (rounded-full on avatars, rounded-lg on buttons)
- Missing thick bottom border on header (5px solid)
- Nav items without bordered treatment on hover/active
- Logo without square box and accent dot
- Missing Memphis geometric decorations in header background
- Notification badge as rounded pill instead of square
- Mobile menu without accordion expand/collapse pattern
- Missing top utility bar on desktop

## Reference
Showcase: `apps/corporate/src/app/showcase/headers/six/page.tsx`
