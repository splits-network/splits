# migrate-pricing

Migrate a pricing page to Memphis design.

## Page Type Characteristics
Pricing pages present subscription tiers, feature comparisons, and FAQs. They feature:
- **Dark full-page background** (`backgroundColor: C.dark`)
- A **centered heading** with badge, title (colored keyword), subtitle
- **Billing toggle** (monthly/annual) with savings badge
- **Tier cards** in a 3-column grid, with the popular tier elevated
- **Trust indicators** row (compliance, uptime, security, guarantee)
- **Feature comparison table** with check/dash/text cells
- **FAQ accordion** using native `<details>` elements

## Key Components to Transform

### Pricing Header
- Badge: `px-5 py-2 text-sm font-bold uppercase tracking-[0.2em]` in `C.coral`
- Title: `text-4xl md:text-6xl font-black uppercase tracking-tight leading-[0.95]` white + coral keyword
- Subtitle: `text-lg` with `rgba(255,255,255,0.6)`

### Billing Toggle
- `flex items-center justify-center gap-4`
- Labels: `text-sm font-bold uppercase tracking-wider`, active = white, inactive = muted
- Toggle switch: `w-14 h-8 relative border-3`, same pattern as settings toggle but with `C.coral`
- Savings badge: `px-2 py-0.5 text-[10px] font-black uppercase` on `C.yellow`

### Tier Card
- Container: `border-4` with `borderColor: tier.color, backgroundColor: C.white`
- Popular tier: `md:-mt-4 md:mb-4` (elevated) + absolute "Most Popular" badge on top
- Popular badge: `absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1` with star icon
- Plan name: `text-xl font-black uppercase tracking-wider` in tier color
- Description: `text-xs, opacity: 0.5`
- Price: `text-4xl font-black` + `/mo` suffix; annual shows strikethrough + savings
- CTA button: `w-full py-3 border-3`, popular = solid fill, others = outline
- Feature list: `space-y-3`, each with `w-5 h-5` colored check box + text

### Trust Indicators
- `grid grid-cols-2 md:grid-cols-4 gap-4`
- Each: `border-3 p-4 text-center` with `borderColor: color, bg: rgba(255,255,255,0.03)`
- Icon: `text-lg mb-2 block` in accent color
- Label: `text-xs font-black uppercase tracking-wider` in white

### Feature Comparison Table
- Container: `border-4 overflow-hidden` with `borderColor: C.dark, backgroundColor: C.white`
- Header row: `backgroundColor: C.dark`, columns labeled with tier colors
- Feature column: `text-xs font-bold`
- Boolean true: `w-5 h-5` box with `backgroundColor: C.teal` + check icon
- Boolean false: `text-xs, opacity: 0.2` displaying "--"
- Text value: `text-xs font-bold`
- Rows: `border-b-2` with `borderColor: C.cream`

### FAQ Accordion
- Each item: `border-4` with cycling Memphis border colors
- Uses native `<details>` + `<summary>` elements
- Summary: `p-5 font-bold text-sm uppercase tracking-wide` in white, with `bg: rgba(255,255,255,0.03)`
- Toggle icon: `w-7 h-7` colored square with "+" that rotates 45deg on open (`group-open:rotate-45`)
- Content: `px-5 pb-5` with `backgroundColor: C.white`, `text-sm leading-relaxed, opacity: 0.7`

## Memphis Patterns for Pricing

```tsx
{/* Billing toggle */}
<div className="flex items-center justify-center gap-4">
    <span style={{ color: annual ? "rgba(255,255,255,0.4)" : C.white }}>Monthly</span>
    <button onClick={() => setAnnual(!annual)} className="w-14 h-8 relative border-3"
        style={{ borderColor: C.coral, backgroundColor: annual ? C.coral : "transparent" }}>
        <div className="absolute top-1 w-5 h-5 transition-all border-2"
            style={{ left: annual ? "calc(100% - 24px)" : "3px", borderColor: C.dark, backgroundColor: C.white }} />
    </button>
    <span style={{ color: annual ? C.white : "rgba(255,255,255,0.4)" }}>
        Annual <span style={{ backgroundColor: C.yellow, color: C.dark }}
            className="px-2 py-0.5 text-[10px] font-black uppercase">Save 20%</span>
    </span>
</div>

{/* Tier card with popular badge */}
<div className={`border-4 relative ${popular ? "md:-mt-4 md:mb-4" : ""}`}
    style={{ borderColor: color, backgroundColor: C.white }}>
    {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-black uppercase tracking-wider"
            style={{ backgroundColor: color, color: C.white }}>
            <i className="fa-duotone fa-regular fa-star mr-1"></i>Most Popular
        </div>
    )}
    <div className="p-8 text-center">
        <h3 className="text-xl font-black uppercase tracking-wider mb-2" style={{ color }}>{name}</h3>
        <div className="flex items-end justify-center gap-1">
            <span className="text-4xl font-black" style={{ color: C.dark }}>${price}</span>
            <span className="text-sm font-bold mb-1" style={{ color: C.dark, opacity: 0.4 }}>/mo</span>
        </div>
        <button className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 mb-8"
            style={{
                borderColor: color, backgroundColor: popular ? color : "transparent",
                color: popular ? C.white : color,
            }}>{cta}</button>
        {features.map(f => (
            <div className="flex items-start gap-2">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: color }}>
                    <i className="fa-solid fa-check text-[8px]" style={{ color: C.white }}></i>
                </div>
                <span className="text-xs font-semibold" style={{ color: C.dark, opacity: 0.7 }}>{f}</span>
            </div>
        ))}
    </div>
</div>

{/* FAQ accordion item */}
<div className="border-4" style={{ borderColor: color }}>
    <details className="group">
        <summary className="flex items-center justify-between cursor-pointer p-5 font-bold text-sm uppercase tracking-wide"
            style={{ color: C.white, backgroundColor: "rgba(255,255,255,0.03)" }}>
            {question}
            <span className="w-7 h-7 flex items-center justify-center font-black text-lg transition-transform group-open:rotate-45"
                style={{ backgroundColor: color, color: color === C.yellow ? C.dark : C.white }}>+</span>
        </summary>
        <div className="px-5 pb-5" style={{ backgroundColor: C.white }}>
            <p className="text-sm leading-relaxed" style={{ color: C.dark, opacity: 0.7 }}>{answer}</p>
        </div>
    </details>
</div>
```

## Common Violations
- Using DaisyUI `pricing`, `collapse`, `table` components
- Rounded tier cards -- Memphis uses sharp corners
- Toggle with rounded track/thumb -- Memphis toggle is square
- Feature checks as plain colored text instead of small colored square boxes
- FAQ using JavaScript-driven accordion instead of native `<details>/<summary>`
- Missing the popular tier elevation effect (`md:-mt-4 md:mb-4`)
- Trust indicators without borders (just text blocks)
- Comparison table without dark header row
- Missing cycling colors on FAQ items
- Using shadow for popular tier emphasis instead of position shift

## Reference
Showcase: `.claude/memphis/showcase/pricing-six.tsx`
