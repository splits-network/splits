# extract-from-tabs

Extract reusable components from the tabs showcase page.

## Available Components

1. **HorizontalTabs** - Full-width tabbed navigation with sliding GSAP indicator
2. **VerticalTabs** - Side-panel tab navigation with content area
3. **PillTabs** - Wrapped pill-style toggle buttons
4. **UnderlineTabs** - Bottom-border-only tab style
5. **BadgeTabs** - Tabs with notification count badges
6. **NestedTabs** - Two-level hierarchical tab navigation
7. **DisabledTabDemo** - Tab set with disabled/locked state
8. **TabPanel** - Animated content panel for horizontal tabs
9. **Section** - Section wrapper with icon heading and scroll animation

## Component Details

### HorizontalTabs
```tsx
// Props: { tabs: { label: string; icon: string }[]; activeIndex: number; onChange: (i: number) => void }
// Features: GSAP animated sliding indicator bar, icon + label, inter-tab dividers
<div className="relative flex overflow-hidden"
  style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
  <div ref={indicatorRef} className="absolute bottom-0 h-1"
    style={{ background: COLORS.coral, borderRadius: 0 }} />
  {tabs.map((tab, i) => (
    <button key={tab.label} ref={(el) => { tabRefs.current[i] = el; }}
      onClick={() => onChange(i)}
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
```

### VerticalTabs
```tsx
// Props: { tabs: { label: string; icon: string; content: string }[]; activeIndex: number; onChange: (i: number) => void }
// Features: Left sidebar (w-48) with right-border divider, GSAP panel slide-in
<div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
  <div className="w-48 shrink-0" style={{ borderRight: `4px solid ${COLORS.dark}` }}>
    {tabs.map((tab, i) => (
      <button key={tab.label} onClick={() => onChange(i)}
        className="w-full px-5 py-4 text-left font-black text-sm uppercase tracking-wider flex items-center gap-2 transition-colors"
        style={{
          background: active === i ? COLORS.teal : 'transparent',
          color: COLORS.dark,
          borderBottom: i < tabs.length - 1 ? `2px solid ${COLORS.dark}20` : 'none',
          borderRadius: 0,
        }}>
        <i className={`fa-duotone fa-solid ${tab.icon}`} />{tab.label}
      </button>
    ))}
  </div>
  <div ref={panelRef} className="flex-1 p-6">
    {/* GSAP: fromTo opacity:0, x:12 -> opacity:1, x:0 */}
    <h3 className="font-black text-lg uppercase" style={{ color: COLORS.dark }}>{tabs[active].label}</h3>
    <p className="mt-2 font-medium text-sm" style={{ color: COLORS.dark }}>{tabs[active].content}</p>
  </div>
</div>
```

### PillTabs
```tsx
// Props: { items: string[]; activeIndex: number; onChange: (i: number) => void }
<div className="flex flex-wrap gap-3">
  {items.map((pill, i) => (
    <button key={pill} onClick={() => onChange(i)}
      className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
      style={{
        background: active === i ? COLORS.coral : '#fff',
        color: COLORS.dark,
        border: `3px solid ${COLORS.dark}`,
        borderRadius: 0,
      }}>
      {pill}
    </button>
  ))}
</div>
```

### UnderlineTabs
```tsx
// Props: { items: string[]; activeIndex: number; onChange: (i: number) => void }
<div className="flex gap-0" style={{ borderBottom: `4px solid ${COLORS.dark}` }}>
  {items.map((item, i) => (
    <button key={item} onClick={() => onChange(i)}
      className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-colors"
      style={{
        color: active === i ? COLORS.coral : COLORS.dark,
        borderBottom: active === i ? `4px solid ${COLORS.coral}` : '4px solid transparent',
        marginBottom: '-4px', borderRadius: 0,
      }}>
      {item}
    </button>
  ))}
</div>
```

### BadgeTabs
```tsx
// Props: { items: { label: string; count: number; color: string }[]; activeIndex: number; onChange: (i: number) => void }
<div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
  {items.map((item, i) => (
    <button key={item.label} onClick={() => onChange(i)}
      className="flex-1 px-4 py-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
      style={{
        background: active === i ? COLORS.dark : 'transparent',
        color: active === i ? '#fff' : COLORS.dark,
        borderRight: i < items.length - 1 ? `2px solid ${COLORS.dark}30` : 'none',
        borderRadius: 0,
      }}>
      {item.label}
      {item.count > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-black"
          style={{ background: item.color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
          {item.count}
        </span>
      )}
    </button>
  ))}
</div>
```

### NestedTabs
```tsx
// Props: { outerItems: string[]; innerMap: string[][]; outerIndex: number; innerIndex: number; onOuterChange: (i: number) => void; onInnerChange: (i: number) => void }
// Two-level tab system: dark outer bar with yellow underline, inner pill bar with teal active fill
<div style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0, background: '#fff' }}>
  {/* outer tabs on dark background */}
  <div className="flex" style={{ background: COLORS.dark }}>
    {outerItems.map((item, i) => (
      <button key={item} onClick={() => { onOuterChange(i); onInnerChange(0); }}
        className="flex-1 px-6 py-4 font-black text-sm uppercase tracking-wider transition-colors"
        style={{
          color: outer === i ? COLORS.yellow : '#999',
          borderBottom: outer === i ? `4px solid ${COLORS.yellow}` : '4px solid transparent',
          borderRadius: 0,
        }}>{item}</button>
    ))}
  </div>
  {/* inner tabs */}
  <div className="flex gap-3 p-4" style={{ borderBottom: `3px solid ${COLORS.dark}20` }}>
    {innerMap[outer].map((item, i) => (
      <button key={item} onClick={() => onInnerChange(i)}
        className="px-4 py-2 font-black text-xs uppercase tracking-wider"
        style={{
          background: inner === i ? COLORS.teal : 'transparent',
          color: COLORS.dark,
          border: `3px solid ${inner === i ? COLORS.dark : COLORS.dark + '30'}`,
          borderRadius: 0,
        }}>{item}</button>
    ))}
  </div>
  <div className="p-6">{/* content */}</div>
</div>
```

### DisabledTabDemo
```tsx
// Props: { items: { label: string; disabled: boolean }[]; activeIndex: number; onChange: (i: number) => void }
// Disabled tabs show #e5e5e5 background, #aaa text, cursor not-allowed, lock icon
```

### TabPanel
```tsx
// Props: { children: React.ReactNode; index: number }
// GSAP fromTo opacity:0, y:12 -> opacity:1, y:0 on index change
<div ref={ref}
  style={{ border: `4px solid ${COLORS.dark}`, borderTop: 'none', borderRadius: 0, background: '#fff' }}
  className="p-6">
  {children}
</div>
```

### Section
```tsx
// Props: { title: string; icon: string; children: React.ReactNode }
// Scroll-triggered GSAP entrance animation
<div ref={ref}>
  <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3 mb-6" style={{ color: COLORS.dark }}>
    <i className={`fa-duotone fa-solid ${icon}`} style={{ color: COLORS.coral }} />{title}
  </h2>
  {children}
</div>
```

## Dependencies
- `HorizontalTabs` composes `TabPanel` for its content area
- `HorizontalTabs` uses GSAP to animate the indicator ref based on measured `offsetLeft`/`offsetWidth` of tab button refs
- `VerticalTabs` uses GSAP for panel slide animation
- `NestedTabs` manages both outer and inner active indices
- All components use the Memphis color palette `COLORS`

## Reference
Source: `.claude/memphis/showcase/tabs-six.tsx`
Target: `packages/memphis-ui/src/components/`
