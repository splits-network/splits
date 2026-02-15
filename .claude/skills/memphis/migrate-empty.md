# migrate-empty

Migrate an empty state page to Memphis design.

## Page Type Characteristics
Empty state pages communicate "no data" scenarios with engaging visuals and helpful CTAs. They feature:
- **Dark background** (`backgroundColor: C.dark`) with floating Memphis background shapes
- **Full-size empty state cards** in a 2-column grid for different scenarios (no results, first time, error, access denied)
- **Inline/compact empty states** for in-context "no data" messages within existing layouts
- **Custom SVG illustrations** built from Memphis geometric shapes (circles, squares, triangles, zigzags)
- **Action buttons** guiding users to the next step

## Key Components to Transform

### Memphis Background Shapes (Floating)
- `absolute` positioned geometric shapes with `pointer-events-none`
- Circles: `rounded-full border-[4px]` or solid fill
- Squares: plain or `rotate-45` with border or fill
- Triangles: CSS border trick (`borderLeft/Right: transparent, borderBottom: solid`)
- Zigzag lines: SVG `<polyline>` with `strokeLinecap="round"`
- Cross marks: SVG `<line>` pairs
- All have low `opacity-10` to `opacity-15`
- GSAP float animation: `y`, `x`, `rotation` yoyo with `sine.inOut` ease

### Full Empty State Card
- Container: `border-4 overflow-hidden` with `borderColor: color, backgroundColor: C.white`
- Top color strip: `h-1.5` solid
- Badge: `px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]` solid bg
- Centered illustration (custom SVG/CSS)
- Title: `text-xl font-black uppercase tracking-wider`
- Description: `text-sm leading-relaxed` with `opacity: 0.6`, max-w-sm
- Action buttons: primary (solid) + secondary (outline), `border-3`

### Memphis Illustrations
- Built from CSS shapes + SVG elements, no raster images
- Search Empty: magnifying glass (circle + rotated rectangle) + X mark + accent shapes
- First Time: cross/plus shape (two perpendicular rectangles) + dashed circle + accents
- Error: triangle (CSS borders) + exclamation mark (rectangle + circle) + zigzag SVG
- Access Denied: lock (rectangle body + rounded-top shackle) + keyhole + accents

### Inline Empty State
- Horizontal layout: `border-4 p-6 flex items-center gap-6`
- Icon box: `w-14 h-14 border-3` with `borderColor` matching theme
- Text: title (`text-sm font-black uppercase tracking-wider`) + description (`text-xs, opacity: 0.5`)
- Action: single CTA button or status icon on right

## Memphis Patterns for Empty States

```tsx
{/* Full empty state card */}
<div className="border-4 overflow-hidden" style={{ borderColor: C.coral, backgroundColor: C.white }}>
    <div className="h-1.5" style={{ backgroundColor: C.coral }} />
    <div className="pt-6 px-8">
        <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
            style={{ backgroundColor: C.coral, color: C.white }}>Empty Search</span>
    </div>
    <div className="p-8 text-center">
        {/* Illustration */}
        <h3 className="text-xl font-black uppercase tracking-wider mb-3" style={{ color: C.dark }}>
            No Results Found
        </h3>
        <p className="text-sm leading-relaxed mb-8 max-w-sm mx-auto"
            style={{ color: C.dark, opacity: 0.6 }}>Description text here.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3"
                style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
                <i className="fa-duotone fa-regular fa-rotate-left text-xs mr-2"></i>Reset Filters
            </button>
        </div>
    </div>
</div>

{/* Inline empty state */}
<div className="border-4 p-6 flex items-center gap-6"
    style={{ borderColor: C.dark, backgroundColor: C.white }}>
    <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center border-3"
        style={{ borderColor: C.teal }}>
        <i className="fa-duotone fa-regular fa-comments text-xl" style={{ color: C.teal }}></i>
    </div>
    <div className="flex-1">
        <h4 className="text-sm font-black uppercase tracking-wider mb-1" style={{ color: C.dark }}>
            No Messages Yet</h4>
        <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>Description here.</p>
    </div>
    <button className="px-4 py-2.5 text-xs font-black uppercase tracking-wider border-3 flex-shrink-0"
        style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>Start Chat</button>
</div>

{/* Memphis background shape examples */}
<div className="absolute inset-0 pointer-events-none">
    <div className="memphis-bg-shape absolute top-[6%] left-[4%] w-20 h-20 rounded-full border-[4px] opacity-15"
        style={{ borderColor: C.coral }} />
    <div className="memphis-bg-shape absolute top-[40%] right-[5%] w-16 h-16 rounded-full opacity-10"
        style={{ backgroundColor: C.teal }} />
    <div className="memphis-bg-shape absolute bottom-[18%] left-[8%] w-12 h-12 rotate-45 opacity-10"
        style={{ backgroundColor: C.yellow }} />
</div>
```

## Common Violations
- Using generic placeholder text or stock illustrations -- Memphis uses custom geometric illustrations
- Centered single-line text without uppercase bold heading
- Missing action buttons on empty states -- always provide clear next-step CTAs
- Light/muted borders -- empty state cards use bold `border-4` with Memphis accent colors
- Missing the top color strip on full cards
- Flat colored divs instead of Memphis geometric compositions for illustrations
- Not using dark background for full-page empty state showcase

## Reference
Showcase: `apps/corporate/src/app/showcase/empty/six/page.tsx`
