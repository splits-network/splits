# migrate-articles

Migrate an articles page to Memphis design.

## Page Type Characteristics
Article pages are long-form editorial content with a magazine-like layout. They alternate between text sections, pull quotes, image breaks, data visualizations, and CTA blocks. Key traits:
- Hero with category badge, read time, date, title with accent word + underline bar, subtitle, and author byline
- Stats bar immediately below hero (edge-to-edge colored blocks)
- Prose sections on a narrow max-width (`max-w-3xl`) with generous leading
- Full-width pull quotes with oversized quote marks and corner accents
- Image breaks with color overlay and Memphis border frame
- Timeline visualization with year badges and connector lines
- Comparison cards (Old Way vs New Way) side by side
- Benefits grid cards identical to landing pain-point cards
- Article CTA section matching the landing CTA pattern

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Article hero | Dark bg, Memphis shapes, category badge + read time + date in a flex row, massive uppercase title, author byline with initials square |
| Stats bar | Edge-to-edge `grid-cols-4` colored blocks with bold value and uppercase label |
| Prose section | `max-w-3xl mx-auto`, `text-lg leading-relaxed`, section heading with accent word |
| Pull quote | `border-4` with accent color, oversized `text-7xl font-black` quote mark, uppercase bold text, colored top-border attribution, corner accent block |
| Image break | Full-width image with solid color overlay (not gradient), inner `border-4` frame, centered bold uppercase caption |
| Timeline | Year badge in colored block, vertical connector line, title in accent color, descriptive text |
| Comparison cards | Side-by-side `border-4` cards, icon in colored square + uppercase heading, list items with check/x icons |
| Benefits grid | 2-col grid of `border-4` cards with corner accent, bordered icon box, bold title, descriptive text |

## Memphis Patterns for Articles

### Article Hero Pattern
```tsx
<section className="relative min-h-[70vh] overflow-hidden flex items-center"
    style={{ backgroundColor: "#1A1A2E" }}>
    {/* Memphis shapes overlay */}
    <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]"
                    style={{ backgroundColor: "#FF6B6B", color: "#FFFFFF" }}>
                    <i className="fa-duotone fa-regular fa-newspaper"></i>
                    Category
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.15em]"
                    style={{ color: "#FFE66D" }}>
                    <i className="fa-duotone fa-regular fa-clock mr-1"></i>
                    12 min read
                </span>
                <span className="text-xs font-bold uppercase tracking-[0.15em]"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    February 14, 2026
                </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8"
                style={{ color: "#FFFFFF" }}>
                Title With{" "}
                <span className="relative inline-block">
                    <span style={{ color: "#FF6B6B" }}>Accent</span>
                    <span className="absolute -bottom-2 left-0 w-full h-2" style={{ backgroundColor: "#FF6B6B" }} />
                </span>
            </h1>
            {/* Author byline */}
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center font-black text-lg"
                    style={{ backgroundColor: "#4ECDC4", color: "#1A1A2E" }}>
                    EN
                </div>
                <div>
                    <div className="font-bold uppercase tracking-wide text-sm" style={{ color: "#FFFFFF" }}>Author Name</div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.5)" }}>Role</div>
                </div>
            </div>
        </div>
    </div>
</section>
```

### Pull Quote Pattern
```tsx
<div className="max-w-4xl mx-auto relative p-8 md:p-12 border-4"
    style={{ borderColor: "#4ECDC4" }}>
    <div className="absolute -top-8 left-8 text-7xl font-black leading-none"
        style={{ color: "#4ECDC4" }}>&ldquo;</div>
    <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4"
        style={{ color: "#FFFFFF" }}>
        Quote text here.
    </p>
    <div className="mt-6 pt-4" style={{ borderTop: "3px solid #4ECDC4" }}>
        <span className="text-sm font-bold uppercase tracking-wider" style={{ color: "#4ECDC4" }}>
            -- Attribution
        </span>
    </div>
    <div className="absolute top-0 right-0 w-10 h-10" style={{ backgroundColor: "#4ECDC4" }} />
</div>
```

### Image Break Pattern
```tsx
<section className="relative overflow-hidden" style={{ minHeight: "400px" }}>
    <img src="..." className="w-full h-full object-cover absolute inset-0" />
    <div className="absolute inset-0" style={{ backgroundColor: "#1A1A2E", opacity: 0.75 }} />
    <div className="absolute inset-4 md:inset-8 border-4 pointer-events-none"
        style={{ borderColor: "#FFE66D" }} />
    <div className="relative z-10 flex items-center justify-center py-24 px-8">
        <p className="text-2xl md:text-4xl font-black uppercase tracking-tight leading-tight text-center"
            style={{ color: "#FFFFFF" }}>
            Bold statement with <span style={{ color: "#FFE66D" }}>accent</span>.
        </p>
    </div>
</section>
```

## Common Violations
- Using `<blockquote>` with default styling instead of Memphis pull quote pattern
- Image sections with gradient overlays instead of solid color overlay
- Missing Memphis frame border on image breaks
- Prose sections wider than `max-w-3xl`
- Timeline without colored year badges and connector lines
- Comparison cards without icon squares and check/x list styling
- Article headings in sentence case instead of uppercase

## Reference
Showcase: `apps/corporate/src/app/showcase/articles/six/page.tsx`
