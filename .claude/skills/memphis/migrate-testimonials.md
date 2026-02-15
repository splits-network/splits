# migrate-testimonials

Migrate a testimonials page to Memphis design.

## Page Type Characteristics
Testimonial pages showcase user reviews and social proof in multiple display formats: featured hero testimonial, card grid, carousel with navigation, company logo bar, and stats section. Each format emphasizes the quote, author info (avatar, name, role, company), and star rating. The design uses thick borders, square avatars with initials, and bold Memphis typography.

## Key Components to Transform

- **Featured Testimonial**: Full-width dark-background card with teal border, split into left (avatar, name, role, rating) and right (large quote icon, quote text, decorative divider). Uses `border: 4px solid teal` on dark background.
- **Testimonial Card**: White card, `border: 4px solid dark`, no border-radius. Contains a colored quote icon (`fa-quote-left`), quote text in `text-sm font-medium leading-relaxed`, star rating, then author row with avatar, name, and role separated by a top border.
- **Carousel**: Single testimonial at a time with centered avatar, quote icon, large quote text, rating, author info. Previous/next buttons (`w-10 h-10`, teal background, `border: 3px solid dark`), dot indicators (`w-4 h-4`, `border: 2px solid dark`, active=coral fill).
- **Avatar**: Square (`borderRadius: 0`), initials-based, `border: 4px solid dark`, colored background. Three sizes: sm (`w-10 h-10 text-xs`), md (`w-14 h-14 text-sm`), lg (`w-20 h-20 text-xl`).
- **Star Rating**: 5 stars using `fa-solid fa-star` (filled, yellow) and `fa-regular fa-star` (empty, gray).
- **Company Logo Bar**: `flex flex-wrap gap-4 justify-center` of colored blocks with building icon + company name. Each `border: 4px solid dark`, colored background.
- **Stats Section**: 4-column grid of colored cards with icon, large value, and uppercase label. `border: 4px solid dark`.

## Memphis Patterns for Testimonials

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// Testimonial card
<div className="p-6 flex flex-col transition-all hover:opacity-90"
  style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <i className="fa-duotone fa-solid fa-quote-left text-3xl mb-4" style={{ color: testimonial.color }} />
  <p className="text-sm font-medium flex-1 leading-relaxed" style={{ color: COLORS.dark }}>
    &ldquo;{testimonial.quote}&rdquo;
  </p>
  <div className="mt-4 mb-4"><StarRating rating={testimonial.rating} /></div>
  <div className="flex items-center gap-3 pt-4" style={{ borderTop: `3px solid ${COLORS.dark}20` }}>
    <Avatar initials={testimonial.avatar} color={testimonial.color} size="sm" />
    <div>
      <p className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>{testimonial.name}</p>
      <p className="text-xs font-bold" style={{ color: '#999' }}>{testimonial.role}, {testimonial.company}</p>
    </div>
  </div>
</div>

// Square avatar
<div className={`${sizeClass} flex items-center justify-center font-black uppercase`}
  style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  {initials}
</div>

// Star rating
<div className="flex gap-1">
  {Array.from({ length: 5 }, (_, i) => (
    <i key={i} className={`fa-${i < rating ? 'solid' : 'regular'} fa-star text-sm`}
      style={{ color: i < rating ? COLORS.yellow : '#ccc' }} />
  ))}
</div>

// Featured testimonial (dark variant)
<div className="flex flex-col md:flex-row gap-8 p-8"
  style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0 }}>
  {/* Left: avatar, name, role, rating */}
  {/* Right: large quote icon, quote text, decorative divider */}
</div>

// Carousel navigation
<button className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
  style={{ background: COLORS.teal, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  <i className="fa-duotone fa-solid fa-chevron-left" />
</button>
// Carousel dots
<button className="w-4 h-4 transition-all"
  style={{ background: active ? COLORS.coral : '#ddd', border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
```

## Common Violations
- Using rounded avatars (circles) instead of square Memphis avatars
- Using DaisyUI `card`, `avatar`, or `rating` components
- Photo avatars instead of initials-based squares with colored backgrounds
- Missing the quote icon (`fa-quote-left`) at the top of testimonial cards
- Thin borders or rounded corners on cards
- CSS-only carousel transitions instead of GSAP slide animation
- Missing the author row separator (`borderTop: 3px solid dark + 20% opacity`)
- Using gradient or shadow-based cards instead of flat colored borders
- Stats section with rounded or shadowed cards instead of flat colored blocks

## Reference
Showcase: `.claude/memphis/showcase/testimonials-six.tsx`
