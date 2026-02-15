# migrate-faqs

Migrate a FAQs page to Memphis design.

## Page Type Characteristics
FAQ pages use an accordion-based layout with category filtering and search. The page has a dark hero section, search bar, category filter pills (each with count badge), an accordion list of questions that expand/collapse with GSAP animation, a "Still Need Help" CTA section, and a stats row. Each accordion item shows the question as the header and the answer as expandable content.

## Key Components to Transform

- **Search Bar**: `border: 4px solid dark`, white background, no border-radius. Teal magnifying glass icon, `font-bold text-sm` input, conditional clear X button.
- **Category Filter Pills**: `flex flex-wrap gap-3` of `border: 3px solid dark` buttons. Active pill fills with its category color. Each pill has an icon and a count sub-badge (`background: dark, color: white, text-[10px]`).
- **Accordion Item**: `border: 4px solid dark`, white background. Header is a `w-full flex items-center gap-4 p-5` button. When open, header fills with dark background (white text). Contains: category icon box (`w-8 h-8`, colored background, `border: 3px solid`), bold uppercase question text, animated chevron that rotates 180 degrees on open.
- **Accordion Content**: Hidden by default (`height: 0, opacity: 0, overflow: hidden`), animated to `height: auto, opacity: 1` with GSAP. Content area has `borderTop: 3px solid dark`, `p-5`, `text-sm font-medium leading-relaxed`.
- **CTA Section**: Dark background with teal border, centered headset icon, bold uppercase heading with accent word, description text, and action buttons (teal, coral, purple) each `border: 4px solid`, no radius.
- **Quick Stats Row**: 3-column grid of colored cards with icon, value, and label. `border: 4px solid dark`, colored background.
- **Empty State**: Centered thinking face icon, uppercase heading, subtitle.

## Memphis Patterns for FAQs

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// Search bar
<div className="flex items-center gap-3 p-4"
  style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <i className="fa-duotone fa-solid fa-magnifying-glass text-lg" style={{ color: COLORS.teal }} />
  <input type="text" placeholder="Search FAQs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
    className="flex-1 bg-transparent outline-none font-bold text-sm placeholder:font-bold"
    style={{ color: COLORS.dark, borderRadius: 0 }} />
  {searchQuery && (
    <button onClick={() => setSearchQuery('')}
      className="font-black text-lg hover:opacity-60" style={{ color: COLORS.dark }}>&times;</button>
  )}
</div>

// Category filter pill
<button onClick={() => setActiveCategory(cat.key)}
  className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-all hover:opacity-80"
  style={{
    background: activeCategory === cat.key ? cat.color : '#fff',
    color: COLORS.dark,
    border: `3px solid ${COLORS.dark}`,
    borderRadius: 0,
  }}>
  <i className={`fa-duotone fa-solid ${cat.icon} mr-2`} />{cat.label}
  <span className="ml-2 px-1.5 py-0.5 text-[10px]"
    style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}>{count}</span>
</button>

// Accordion item (open state header)
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

// Accordion content (animated)
<div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
  <div className="p-5" style={{ borderTop: `3px solid ${COLORS.dark}` }}>
    <p className="text-sm font-medium leading-relaxed" style={{ color: COLORS.dark }}>{faq.answer}</p>
  </div>
</div>
```

## Common Violations
- Using DaisyUI `collapse`, `accordion`, or `join` components
- Rounded corners on accordion items, search bar, or filter pills
- CSS-only expand/collapse instead of GSAP animated height + opacity + chevron rotation
- Missing the category icon box inside accordion headers
- Not changing header background to dark when accordion item is open
- Missing the chevron rotation animation (GSAP `rotation: 0 -> 180`)
- Thin borders instead of 3-4px
- Using simple text links instead of bordered action buttons in the CTA section
- Missing count badges on category filter pills

## Reference
Showcase: `apps/corporate/src/app/showcase/faqs/six/page.tsx`
