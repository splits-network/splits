# migrate-timelines

Migrate a timelines page to Memphis design.

## Page Type Characteristics
Timeline pages display sequential events in either vertical (alternating left/right cards with a central connector) or horizontal (milestone nodes on a track line) layouts. Cards are expandable, color-coded by event type, and feature GSAP scroll-triggered entrance animations. The page includes an event type legend section.

## Key Components to Transform

- **Vertical Timeline**: Alternating left/right layout using `flex` with `md:flex-row` / `md:flex-row-reverse`. Each item has a card, center connector dot, and spacer. The connector dot is a square `w-12 h-12` icon box with `border: 4px solid dark`, connected by a vertical bar (`w-1 h-16`, dark background).
- **Timeline Card**: `border: 4px solid dark`, white background, no border-radius. Contains a type badge (`text-[10px] font-black uppercase`, colored background with `border: 2px solid dark`), timestamp, bold uppercase title, description. Optional expandable section with GSAP height animation.
- **Horizontal Timeline**: Track line (`h-1`, dark background) with square milestone nodes (`w-14 h-14`, colored background, `border: 4px solid dark`). Each node has a date label above and milestone label below. Status badges ("Complete" in teal, "In Progress" in yellow).
- **Expand/Collapse Button**: `text-xs font-black uppercase tracking-wider` in teal with chevron icon, toggles expandable content with GSAP (`height: auto/0, opacity: 1/0`).
- **Event Type Legend**: `flex flex-wrap gap-4` of colored label chips (`border: 3px solid dark`, colored background, icon + uppercase label).

## Memphis Patterns for Timelines

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// Vertical timeline card
<div style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }} className="p-5">
  <div className="flex items-center gap-2 mb-2">
    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
      style={{ background: event.color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
      {event.type}
    </span>
    <span className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</span>
  </div>
  <h3 className="font-black text-base uppercase" style={{ color: COLORS.dark }}>{event.title}</h3>
  <p className="text-sm font-medium mt-1" style={{ color: COLORS.dark }}>{event.description}</p>
</div>

// Center connector dot
<div className="flex flex-col items-center shrink-0">
  <div className="w-12 h-12 flex items-center justify-center"
    style={{ background: event.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
    <i className={`fa-duotone fa-solid ${event.icon} text-lg`} style={{ color: COLORS.dark }} />
  </div>
  <div className="w-1 h-16" style={{ background: COLORS.dark }} />
</div>

// Horizontal milestone node
<div className="flex-1 flex flex-col items-center text-center">
  <span className="text-xs font-bold uppercase mb-2" style={{ color: '#999' }}>{date}</span>
  <div className="w-14 h-14 flex items-center justify-center z-10"
    style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
    <i className={`fa-duotone fa-solid ${icon} text-lg`} style={{ color: COLORS.dark }} />
  </div>
  <span className="mt-3 font-black text-sm uppercase tracking-wider" style={{ color: COLORS.dark }}>{label}</span>
  <span className="mt-1 px-2 py-0.5 text-[10px] font-black uppercase"
    style={{ background: COLORS.teal, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
    Complete
  </span>
</div>

// Expandable content
<div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
  <p className="text-sm font-medium mt-3 p-3"
    style={{ background: COLORS.cream, color: COLORS.dark, border: `2px solid ${COLORS.dark}30`, borderRadius: 0 }}>
    {expandableContent}
  </p>
</div>
<button onClick={() => setExpanded(!expanded)}
  className="mt-2 text-xs font-black uppercase tracking-wider hover:underline"
  style={{ color: COLORS.teal }}>
  {expanded ? 'Show Less' : 'Show More'}
  <i className={`fa-duotone fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-1`} />
</button>
```

## Common Violations
- Using DaisyUI `timeline` or `steps` components
- Rounded connector dots or milestone nodes (Memphis uses squares)
- Thin connecting lines instead of `w-1` solid dark bars
- Missing scroll-triggered GSAP entrance animations (items should slide in from left/right)
- Missing GSAP expand/collapse animation on expandable content
- Not alternating card sides on vertical timeline
- Using colored text labels instead of colored-background type badges with dark borders
- Missing the horizontal track line (`h-1`, dark) connecting milestone nodes

## Reference
Showcase: `.claude/memphis/showcase/timelines-six.tsx`
