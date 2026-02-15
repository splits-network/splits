# migrate-footers

Migrate a footers page to Memphis design.

## Page Type Characteristics
Footer pages are site-wide navigation and brand reinforcement components at the bottom of every page. Key traits:
- Dark navy background (`#1A1A2E`) with Memphis geometric decorations
- Newsletter subscription section with email capture form
- 4-column link grid (Platform, Network, Resources, Legal) with colored section headers
- Social links bar with brand block, social icon buttons, and app store badges
- Bottom bar with copyright, legal quick links, color palette dots, and status indicator
- Sections separated by `border-bottom: 4px solid darkGray`
- ScrollTrigger-based GSAP animations for reveal on scroll
- Floating animation on Memphis background shapes

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Newsletter section | Two-column grid: headline with colored accent word + subscribe form, email input with `border-[3px]` + colored submit button, success state with check icon |
| Link columns | Colored icon square header (`w-7 h-7`), section title in accent color, links with icon + uppercase label, `hover:translate-x-1` + `hover:text-white` |
| Brand block | Square logo (`w-12 h-12 border-[3px]`) with accent dots, brand name + tagline |
| Social links | `w-10 h-10 border-[3px]` buttons in accent colors, `hover:-translate-y-1` |
| App badges | `border-[2px]` outline buttons with brand icons and labels |
| Bottom bar | Copyright text, color palette dots (4 small squares), legal links, system status dot + label |
| Memphis shapes | Circles (border-only and filled), squares (rotated), triangles (CSS), zigzag SVG, dot grid, plus sign SVG, all with opacity-0 for animation entry |

## Memphis Patterns for Footers

### Newsletter Section Pattern
```tsx
<div className="py-12 px-4 md:px-10"
    style={{ borderBottom: "4px solid #2D2D44" }}>
    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>
            <div className="inline-block px-3 py-1 border-[3px] mb-4"
                style={{ borderColor: "#FFE66D" }}>
                <span className="text-[9px] font-black uppercase tracking-[0.25em]"
                    style={{ color: "#FFE66D" }}>
                    <i className="fa-duotone fa-regular fa-envelope mr-1.5"></i>
                    Stay Updated
                </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3"
                style={{ color: "#FFFFFF" }}>
                Get the <span style={{ color: "#FFE66D" }}>Inside Track</span>
            </h3>
        </div>
        <form className="flex gap-3">
            <input type="email" placeholder="YOUR EMAIL..."
                className="flex-1 px-4 py-3 border-[3px] text-xs font-bold uppercase tracking-wider outline-none placeholder:opacity-30"
                style={{ borderColor: "#2D2D44", backgroundColor: "rgba(255,255,255,0.03)", color: "#FFFFFF" }} />
            <button className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-[3px] text-xs font-black uppercase tracking-[0.12em]"
                style={{ borderColor: "#FFE66D", backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                <i className="fa-duotone fa-regular fa-paper-plane text-[10px]"></i>
                Subscribe
            </button>
        </form>
    </div>
</div>
```

### Link Column Pattern
```tsx
<div>
    <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 flex items-center justify-center"
            style={{ backgroundColor: "#FF6B6B" }}>
            <i className="fa-duotone fa-regular fa-grid-2 text-[10px]" style={{ color: "#FFFFFF" }}></i>
        </div>
        <span className="text-xs font-black uppercase tracking-[0.15em]"
            style={{ color: "#FF6B6B" }}>Platform</span>
    </div>
    <ul className="space-y-2">
        <li>
            <a href="#" className="group flex items-center gap-2 transition-all hover:translate-x-1"
                style={{ color: "rgba(255,255,255,0.45)" }}>
                <i className="fa-duotone fa-regular fa-briefcase text-[9px]"
                    style={{ color: "rgba(255,107,107,0.33)" }}></i>
                <span className="text-[11px] font-bold uppercase tracking-wider group-hover:text-white">
                    ATS
                </span>
            </a>
        </li>
    </ul>
</div>
```

### Social Links Pattern
```tsx
<div className="flex items-center gap-3">
    <a href="#" className="w-10 h-10 flex items-center justify-center border-[3px] transition-all hover:-translate-y-1"
        style={{ borderColor: "#FF6B6B", color: "#FF6B6B" }}>
        <i className="fa-brands fa-x-twitter text-sm"></i>
    </a>
</div>
```

### Bottom Bar Pattern
```tsx
<div className="py-5 px-4 md:px-10">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Copyright */}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            &copy; 2026 Employment Networks, Inc.
        </span>
        {/* Color palette dots */}
        <div className="flex items-center gap-1">
            {["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA"].map((c) => (
                <div className="w-2 h-2" style={{ backgroundColor: c }} />
            ))}
        </div>
        {/* Status indicator */}
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#4ECDC4" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: "#4ECDC4" }}>
                All Systems Operational
            </span>
        </div>
    </div>
</div>
```

## Common Violations
- Using DaisyUI `footer` component classes
- Rounded social link buttons instead of square with sharp corners
- Missing Memphis geometric decorations in footer background
- Newsletter form without thick borders and uppercase styling
- Link columns without colored icon square headers
- Links without `hover:translate-x-1` interaction
- Missing section separators (`border-bottom: 4px solid darkGray`)
- Bottom bar without color palette dots or status indicator
- Missing app store badges

## Reference
Showcase: `apps/corporate/src/app/showcase/footers/six/page.tsx`
