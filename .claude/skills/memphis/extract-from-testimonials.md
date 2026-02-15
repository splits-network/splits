# extract-from-testimonials

Extract reusable components from the testimonials showcase page.

## Available Components

1. **TestimonialCard** - Quote card with rating and author info
2. **FeaturedTestimonial** - Large hero-style testimonial on dark background
3. **TestimonialCarousel** - Single-testimonial slider with navigation
4. **StarRating** - 5-star rating display
5. **Avatar** - Square initials-based avatar in three sizes
6. **CompanyLogo** - Colored company name block
7. **StatCard** - Large metric display card
8. **CarouselDots** - Navigation dot indicators
9. **CarouselButton** - Previous/next navigation button

## Component Details

### TestimonialCard
```tsx
// Props: { testimonial: { name: string; role: string; company: string; avatar: string; quote: string; rating: number; color: string } }
// Features: GSAP scroll-triggered entrance, quote icon, star rating, author row with separator
<div ref={ref} className="p-6 flex flex-col transition-all hover:opacity-90"
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
```

### FeaturedTestimonial
```tsx
// Props: { testimonial: Testimonial }
// Features: GSAP entrance, dark bg, teal border, two-column layout, large quote icon, decorative divider
<div ref={ref} className="flex flex-col md:flex-row gap-8 p-8"
  style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0 }}>
  {/* left column */}
  <div className="flex flex-col items-center justify-center md:w-1/3">
    <Avatar initials={testimonial.avatar} color={testimonial.color} size="lg" />
    <p className="mt-4 font-black text-lg uppercase text-white">{testimonial.name}</p>
    <p className="text-sm font-bold" style={{ color: COLORS.teal }}>{testimonial.role}</p>
    <p className="text-xs font-bold mt-1" style={{ color: '#999' }}>{testimonial.company}</p>
    <div className="mt-3"><StarRating rating={testimonial.rating} /></div>
  </div>
  {/* right column */}
  <div className="flex-1 flex flex-col justify-center">
    <i className="fa-duotone fa-solid fa-quote-left text-5xl mb-4" style={{ color: COLORS.teal }} />
    <p className="text-xl font-medium leading-relaxed text-white">&ldquo;{testimonial.quote}&rdquo;</p>
    <div className="mt-6 flex items-center gap-3">
      <div className="h-1 flex-1" style={{ background: COLORS.teal }} />
      <span className="font-black text-xs uppercase tracking-widest" style={{ color: COLORS.teal }}>Featured Review</span>
      <div className="h-1 flex-1" style={{ background: COLORS.teal }} />
    </div>
  </div>
</div>
```

### TestimonialCarousel
```tsx
// Props: { testimonials: Testimonial[] }
// Internal state: current index
// Features: GSAP slide animation (opacity:0, x:30 -> opacity:1, x:0) on change, prev/next buttons, dot indicators
<div className="p-8" style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <div ref={slideRef} className="text-center">
    <div className="flex justify-center mb-6"><Avatar initials={t.avatar} color={t.color} size="lg" /></div>
    <i className="fa-duotone fa-solid fa-quote-left text-4xl mb-4 block" style={{ color: t.color }} />
    <p className="text-lg font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: COLORS.dark }}>
      &ldquo;{t.quote}&rdquo;
    </p>
    <div className="mt-6 flex justify-center"><StarRating rating={t.rating} /></div>
    <p className="mt-4 font-black text-base uppercase" style={{ color: COLORS.dark }}>{t.name}</p>
    <p className="text-sm font-bold" style={{ color: '#999' }}>{t.role}, {t.company}</p>
  </div>
  <div className="flex items-center justify-center gap-4 mt-8">
    <CarouselButton direction="prev" onClick={prev} />
    <CarouselDots count={testimonials.length} current={current} onSelect={setCurrent} />
    <CarouselButton direction="next" onClick={next} />
  </div>
</div>
```

### StarRating
```tsx
// Props: { rating: number; max?: number }
<div className="flex gap-1">
  {Array.from({ length: max || 5 }, (_, i) => (
    <i key={i} className={`fa-${i < rating ? 'solid' : 'regular'} fa-star text-sm`}
      style={{ color: i < rating ? COLORS.yellow : '#ccc' }} />
  ))}
</div>
```

### Avatar
```tsx
// Props: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }
// Sizes: sm='w-10 h-10 text-xs', md='w-14 h-14 text-sm', lg='w-20 h-20 text-xl'
<div className={`${sizeClass} flex items-center justify-center font-black uppercase`}
  style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  {initials}
</div>
```

### CompanyLogo
```tsx
// Props: { name: string; color: string }
<div className="px-8 py-4 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80"
  style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  <i className="fa-duotone fa-solid fa-building mr-2" />{name}
</div>
```

### StatCard
```tsx
// Props: { label: string; value: string; icon: string; color: string }
<div className="p-6 text-center"
  style={{ background: color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <i className={`fa-duotone fa-solid ${icon} text-3xl mb-3`} style={{ color: COLORS.dark }} />
  <p className="text-3xl font-black" style={{ color: COLORS.dark }}>{value}</p>
  <p className="font-black text-xs uppercase tracking-widest mt-1" style={{ color: COLORS.dark }}>{label}</p>
</div>
```

### CarouselDots
```tsx
// Props: { count: number; current: number; onSelect: (i: number) => void }
<div className="flex gap-2">
  {Array.from({ length: count }, (_, i) => (
    <button key={i} onClick={() => onSelect(i)} className="w-4 h-4 transition-all"
      style={{ background: i === current ? COLORS.coral : '#ddd', border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
  ))}
</div>
```

### CarouselButton
```tsx
// Props: { direction: 'prev' | 'next'; onClick: () => void }
<button onClick={onClick}
  className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
  style={{ background: COLORS.teal, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  <i className={`fa-duotone fa-solid fa-chevron-${direction === 'prev' ? 'left' : 'right'}`} />
</button>
```

## Dependencies
- `TestimonialCard` composes `StarRating` and `Avatar`
- `FeaturedTestimonial` composes `StarRating` and `Avatar`
- `TestimonialCarousel` composes `StarRating`, `Avatar`, `CarouselDots`, and `CarouselButton`
- `TestimonialCarousel` uses GSAP for slide animation
- `TestimonialCard` uses GSAP for scroll-triggered entrance
- `FeaturedTestimonial` uses GSAP for entrance animation
- All components use the Memphis color palette `COLORS`

## Reference
Source: `.claude/memphis/showcase/testimonials-six.tsx`
Target: `packages/memphis-ui/src/components/`
