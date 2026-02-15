# extract-from-faqs

Extract reusable components from the faqs showcase page.

## Available Components

1. **AccordionItem** - Single expandable FAQ with GSAP animation
2. **AccordionList** - Container managing open/close state across items
3. **SearchBar** - Memphis-styled search input with clear button
4. **CategoryFilter** - Category pill filter bar with count badges
5. **CategoryPill** - Individual category filter button
6. **SupportCTA** - "Still Need Help" call-to-action section
7. **QuickStatCard** - Small metric display card
8. **EmptySearchState** - No-results placeholder

## Component Details

### AccordionItem
```tsx
// Props: { faq: { id: number; question: string; answer: string; category: string }; isOpen: boolean; onToggle: () => void; categories: Category[] }
// Features: GSAP height animation (0 -> auto), GSAP opacity (0 -> 1), GSAP chevron rotation (0 -> 180)
// Open state: dark header background, white text, yellow chevron, white icon box border
// Closed state: white header background, dark text, dark chevron, dark icon box border
<div style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <button onClick={onToggle}
    className="w-full flex items-center gap-4 p-5 text-left transition-colors"
    style={{ background: isOpen ? COLORS.dark : '#fff', borderRadius: 0 }}>
    <span className="w-8 h-8 flex items-center justify-center shrink-0"
      style={{ background: cat.color, border: `3px solid ${isOpen ? '#fff' : COLORS.dark}`, borderRadius: 0 }}>
      <i className={`fa-duotone fa-solid ${cat.icon} text-xs`} style={{ color: COLORS.dark }} />
    </span>
    <span className="flex-1 font-black text-sm uppercase tracking-wide"
      style={{ color: isOpen ? '#fff' : COLORS.dark }}>{faq.question}</span>
    <i ref={iconRef} className="fa-duotone fa-solid fa-chevron-down text-sm"
      style={{ color: isOpen ? COLORS.yellow : COLORS.dark }} />
  </button>
  <div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
    <div className="p-5" style={{ borderTop: `3px solid ${COLORS.dark}` }}>
      <p className="text-sm font-medium leading-relaxed" style={{ color: COLORS.dark }}>{faq.answer}</p>
    </div>
  </div>
</div>
```

### AccordionList
```tsx
// Props: { faqs: FAQ[]; categories: Category[] }
// Internal state: openId (only one open at a time)
<div className="space-y-4">
  {faqs.map((faq) => (
    <AccordionItem key={faq.id} faq={faq} isOpen={openId === faq.id}
      onToggle={() => setOpenId(prev => prev === faq.id ? null : faq.id)} categories={categories} />
  ))}
</div>
```

### SearchBar
```tsx
// Props: { value: string; onChange: (v: string) => void; placeholder?: string }
<div className="flex items-center gap-3 p-4"
  style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <i className="fa-duotone fa-solid fa-magnifying-glass text-lg" style={{ color: COLORS.teal }} />
  <input type="text" placeholder={placeholder || "Search..."} value={value}
    onChange={(e) => onChange(e.target.value)}
    className="flex-1 bg-transparent outline-none font-bold text-sm placeholder:font-bold"
    style={{ color: COLORS.dark, borderRadius: 0 }} />
  {value && (
    <button onClick={() => onChange('')}
      className="font-black text-lg hover:opacity-60" style={{ color: COLORS.dark }}>&times;</button>
  )}
</div>
```

### CategoryFilter
```tsx
// Props: { categories: { key: string; label: string; icon: string; color: string }[]; active: string; onChange: (key: string) => void; counts: Record<string, number> }
<div className="flex flex-wrap gap-3">
  {categories.map((cat) => (
    <CategoryPill key={cat.key} category={cat} active={active === cat.key}
      count={counts[cat.key]} onClick={() => onChange(cat.key)} />
  ))}
</div>
```

### CategoryPill
```tsx
// Props: { category: { key: string; label: string; icon: string; color: string }; active: boolean; count: number; onClick: () => void }
<button onClick={onClick}
  className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
  style={{
    background: active ? category.color : '#fff',
    color: COLORS.dark,
    border: `3px solid ${COLORS.dark}`,
    borderRadius: 0,
  }}>
  <i className={`fa-duotone fa-solid ${category.icon} mr-2`} />{category.label}
  <span className="ml-2 px-1.5 py-0.5 text-[10px]"
    style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}>{count}</span>
</button>
```

### SupportCTA
```tsx
// Props: { title: string; accentWord: string; description: string; actions: { label: string; icon: string; color: string }[] }
<section className="p-8 text-center"
  style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0 }}>
  <i className="fa-duotone fa-solid fa-headset text-5xl mb-4" style={{ color: COLORS.teal }} />
  <h3 className="text-2xl font-black uppercase tracking-tight text-white">
    {title} <span style={{ color: COLORS.coral }}>{accentWord}</span>
  </h3>
  <p className="mt-2 text-sm font-medium max-w-md mx-auto" style={{ color: '#ccc' }}>{description}</p>
  <div className="flex flex-wrap gap-4 justify-center mt-6">
    {actions.map((action) => (
      <button key={action.label}
        className="px-6 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
        style={{ background: action.color, border: `4px solid ${action.color}`, borderRadius: 0, color: COLORS.dark }}>
        <i className={`fa-duotone fa-solid ${action.icon} mr-2`} />{action.label}
      </button>
    ))}
  </div>
</section>
```

### QuickStatCard
```tsx
// Props: { label: string; value: string; icon: string; color: string }
<div className="p-5 text-center"
  style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <i className={`fa-duotone fa-solid ${icon} text-2xl mb-2`} style={{ color: COLORS.dark }} />
  <p className="text-2xl font-black" style={{ color: COLORS.dark }}>{value}</p>
  <p className="font-black text-xs uppercase tracking-widest" style={{ color: COLORS.dark }}>{label}</p>
</div>
```

### EmptySearchState
```tsx
// Props: { icon?: string; title?: string; subtitle?: string }
<div className="text-center py-12">
  <i className={`fa-duotone fa-solid ${icon || 'fa-face-thinking'} text-5xl mb-4`} style={{ color: '#ccc' }} />
  <p className="font-black text-lg uppercase" style={{ color: '#999' }}>{title || "No FAQs match your search"}</p>
  <p className="font-bold text-sm mt-1" style={{ color: '#bbb' }}>{subtitle || "Try different keywords or clear the filter."}</p>
</div>
```

## Dependencies
- `AccordionList` manages state and renders multiple `AccordionItem` components
- `AccordionItem` requires GSAP for height/opacity/rotation animations
- `AccordionItem` needs access to the `CATEGORIES` array to display the category icon
- `CategoryFilter` composes multiple `CategoryPill` components
- `SearchBar` is independent and reusable across any page type
- `SupportCTA` is independent but uses Memphis color palette for action buttons
- All components use the Memphis color palette `COLORS`

## Reference
Source: `.claude/memphis/showcase/faqs-six.tsx`
Target: `packages/memphis-ui/src/components/`
