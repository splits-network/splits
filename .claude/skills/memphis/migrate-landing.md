# migrate-landing

Migrate a landing page to Memphis design.

## Page Type Characteristics
Landing pages are the primary marketing entry point. They are long, scroll-based pages composed of distinct full-width sections, each with a unique background color. Key traits:
- Full-viewport hero with bold headline, subtext, and CTA buttons
- Multiple content sections stacked vertically (problem, platforms, how-it-works, metrics, testimonials, FAQ, CTA)
- Heavy use of Memphis geometric background decorations (circles, squares, triangles, dots, zigzags, plus signs)
- Alternating dark (`#1A1A2E`) and light (`#F5F0EB`, `#FFFFFF`) section backgrounds
- Data-driven sections rendered from arrays of objects

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Hero section | Dark navy bg, geometric shapes overlay, overline badge, ultra-bold uppercase headline with colored accent word + underline bar, subtext, dual CTA buttons with `border-4` |
| Section headings | Colored label badge (`px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]`), massive uppercase `font-black` heading with accent-colored word |
| Pain point / feature cards | `border-4` with `borderColor: item.color`, corner accent block (`absolute top-0 right-0 w-12 h-12`), icon in bordered box, `font-black uppercase` title |
| Platform blocks | Full-width colored backgrounds, logo + tagline badge, feature checklist in 2-col grid with `border-2` items, inverted CTA button |
| How-it-works steps | Numbered step cards with `border-4`, floating step number badge (`absolute -top-5 -left-3`), icon + title + description |
| Metrics bar | Edge-to-edge color blocks in `grid-cols-4`, bold counter values, uppercase labels |
| Testimonial cards | `border-4` with accent color, oversized quote mark (`text-6xl font-black`), colored top-border divider on attribution |
| FAQ accordion | `<details>` element, `border-4` with cycling colors, `+` toggle button in colored square that rotates on open |
| CTA section | Dark bg, Memphis shape decorations, role-specific cards with icon boxes and action buttons |

## Memphis Patterns for Landing

### Hero Section Pattern
```tsx
<section className="relative min-h-[100vh] overflow-hidden flex items-center"
    style={{ backgroundColor: "#1A1A2E" }}>
    {/* Memphis geometric decorations */}
    <div className="memphis-shapes absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-32 h-32 rounded-full border-[6px]"
            style={{ borderColor: "#FF6B6B" }} />
        <div className="absolute top-[20%] right-[15%] w-20 h-20 rotate-12"
            style={{ backgroundColor: "#A78BFA" }} />
        {/* ... more shapes */}
    </div>
    <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
            {/* Overline badge */}
            <span className="inline-flex items-center gap-2 px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]"
                style={{ backgroundColor: "#FFE66D", color: "#1A1A2E" }}>
                <i className="fa-duotone fa-regular fa-bolt"></i>
                Badge Text
            </span>
            {/* Headline with accent word */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] uppercase tracking-tight"
                style={{ color: "#FFFFFF" }}>
                Main Text,{" "}
                <span className="relative inline-block">
                    <span style={{ color: "#FF6B6B" }}>Accent</span>
                    <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                </span>
            </h1>
        </div>
    </div>
</section>
```

### Section Heading Pattern
```tsx
<span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-4"
    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
    Section Label
</span>
<h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight"
    style={{ color: "#1A1A2E" }}>
    Heading With{" "}
    <span style={{ color: "#FF6B6B" }}>Accent</span>
</h2>
```

### CTA Button Pattern
```tsx
<a className="inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold uppercase tracking-wider border-4 transition-transform hover:-translate-y-1"
    style={{ backgroundColor: "#FF6B6B", borderColor: "#FF6B6B", color: "#FFFFFF" }}>
    <i className="fa-duotone fa-regular fa-rocket"></i>
    Button Text
</a>
```

## Common Violations
- Using gradients instead of flat solid colors
- Rounded corners (`rounded-*`) instead of sharp square corners
- Thin borders (`border` or `border-2`) instead of thick `border-4`
- Using DaisyUI component classes (`btn`, `card`, `badge`) instead of raw utility classes with inline styles
- Lowercase or sentence-case headings instead of `uppercase font-black`
- Missing Memphis geometric decorations in hero/CTA sections
- Using shadows (`shadow-*`) instead of thick borders for depth
- Missing corner accent blocks on cards

## Reference
Showcase: `.claude/memphis/showcase/landing-six.tsx`
