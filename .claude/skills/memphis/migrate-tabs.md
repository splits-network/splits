# migrate-tabs

Migrate a tabs page to Memphis design.

## Page Type Characteristics
Tab pages contain navigation components that switch between content panels. The Memphis showcase demonstrates seven distinct tab patterns: horizontal, vertical, pill, underline, badge, nested, and disabled. All use thick borders, no border-radius, bold uppercase labels, and GSAP-animated panel transitions.

## Key Components to Transform

- **Horizontal Tabs**: Container with `border: 4px solid dark`, tabs separated by subtle right borders. Active tab gets a sliding bottom indicator (`h-1`, coral) animated with GSAP. Each tab is `flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider` with icon.
- **Vertical Tabs**: Side-by-side layout with `borderRight: 4px solid dark` on the tab list (`w-48`). Active tab fills with teal background. Content panel animates in with GSAP (`opacity: 0, x: 12`).
- **Pill Tabs**: `flex flex-wrap gap-3` of `border: 3px solid dark` buttons. Active pill gets coral background fill.
- **Underline Tabs**: Bottom-border-only style. Active tab has `borderBottom: 4px solid coral` with `marginBottom: -4px` overlap.
- **Badge Tabs**: Like horizontal but with count badges inside each tab. `border: 4px solid dark` container, active tab fills with dark background (white text). Badge is a small colored pill with count.
- **Nested Tabs**: Two-level tabs -- outer dark-background tabs with yellow underline indicator, inner pill-style tabs with teal fill on active.
- **Disabled Tab**: Grayed out with `cursor: not-allowed`, `#e5e5e5` background, `#aaa` text, lock icon.
- **Tab Panel**: Content area with `border: 4px solid dark, borderTop: none`, animated with GSAP on tab change.

## Memphis Patterns for Tabs

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// Horizontal tab container
<div className="relative flex overflow-hidden"
  style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
  {/* Sliding indicator */}
  <div ref={indicatorRef} className="absolute bottom-0 h-1" style={{ background: COLORS.coral, borderRadius: 0 }} />
  {tabs.map((tab, i) => (
    <button key={tab.label} onClick={() => setActive(i)}
      className="flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
      style={{
        color: active === i ? COLORS.coral : COLORS.dark,
        borderRight: i < tabs.length - 1 ? `2px solid ${COLORS.dark}20` : 'none',
        borderRadius: 0,
      }}>
      <i className={`fa-duotone fa-solid ${tab.icon}`} />{tab.label}
    </button>
  ))}
</div>

// Tab panel with animation
<div ref={ref}
  style={{ border: `4px solid ${COLORS.dark}`, borderTop: 'none', borderRadius: 0, background: '#fff' }}
  className="p-6">
  {/* GSAP: fromTo opacity:0, y:12 -> opacity:1, y:0 on index change */}
</div>

// Pill tab
<button className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
  style={{ background: active ? COLORS.coral : '#fff', color: COLORS.dark,
    border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}>
  {label}
</button>

// Badge tab item
<button className="flex-1 px-4 py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
  style={{
    background: active ? COLORS.dark : 'transparent',
    color: active ? '#fff' : COLORS.dark,
    borderRight: i < items.length - 1 ? `2px solid ${COLORS.dark}30` : 'none',
    borderRadius: 0,
  }}>
  {label}
  {count > 0 && (
    <span className="px-2 py-0.5 text-[10px] font-black"
      style={{ background: color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
      {count}
    </span>
  )}
</button>
```

## Common Violations
- Using DaisyUI `tabs`, `tab`, or `tab-bordered` classes
- Rounded tab containers or indicators
- Missing GSAP sliding indicator animation on horizontal tabs
- Missing GSAP content panel transition on tab change
- Using CSS-only transitions for panel content switching
- Thin borders instead of 3-4px thick borders
- Missing icon alongside tab labels
- Not handling disabled state with lock icon and `cursor: not-allowed`

## Reference
Showcase: `apps/corporate/src/app/showcase/tabs/six/page.tsx`
