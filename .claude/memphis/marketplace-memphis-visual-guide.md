# Memphis Marketplace Visual Design Guide

## Color Palette Usage

### Primary Memphis Colors
```
coral:  #FF6B6B (accent, CTAs, headings)
teal:   #4ECDC4 (accent, inputs, badges)
mint:   #A8E6CF (accent, highlights)
dark:   #1A1A2E (text, borders, backgrounds)
cream:  #F5F0EB (backgrounds, neutrals)
white:  #FFFFFF (cards, content areas)
```

### Color Application

**Hero Section:**
- Background: `bg-dark`
- Title: `text-cream` with `text-coral` accent word
- Subtitle: `text-cream/70`
- Search border: `border-4 border-teal`
- Stats: `text-coral`, `text-teal`, `text-mint`

**Cards:**
- Border: `border-4` cycling through `border-coral`, `border-teal`, `border-mint`
- Header: `bg-{accent}` (matches border color)
- Body: `bg-white`
- Button: `bg-dark text-cream`

**Table:**
- Container: `border-4 border-dark`
- Header: `bg-dark` with column headers cycling accent colors
- Rows: `bg-white` with `hover:bg-cream/50`

## Typography Patterns

### Memphis Typography Rules
1. **Headings**: UPPERCASE, `font-black`, `tracking-tight` or `tracking-wider`
2. **Subheadings**: `font-bold` or `font-semibold`, `tracking-[0.2em]`
3. **Labels**: UPPERCASE, `text-[10px]`, `tracking-[0.2em]`, `font-bold`
4. **Body**: `font-medium` or `font-normal`, `leading-relaxed`

### Implementation Examples

**Page Title:**
```tsx
<h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-cream">
    Find Your <span className="text-coral">Perfect</span> Recruiter
</h1>
```

**Card Title:**
```tsx
<h3 className="text-lg font-black uppercase tracking-tight text-dark">
    {name}
</h3>
```

**Section Label:**
```tsx
<p className="text-[10px] uppercase tracking-[0.2em] font-bold text-dark/40">
    Rating
</p>
```

**Body Text:**
```tsx
<p className="text-sm text-dark/70 leading-relaxed">
    {bio}
</p>
```

## Border Patterns

### Memphis Border Rules
1. **Always 4px**: Use `border-4` exclusively
2. **Sharp corners**: No rounded corners (`rounded-none` is default)
3. **Bold outlines**: Borders define structure, not subtle dividers
4. **Accent colors**: Borders can match accent or use `border-dark`

### Border Examples

**Card with Accent:**
```tsx
<div className="border-4 border-coral bg-white p-6">
    {children}
</div>
```

**Input with Focus:**
```tsx
<Input className="border-4 border-teal focus:border-coral" />
```

**Table Container:**
```tsx
<div className="border-4 border-dark bg-white">
    <table>...</table>
</div>
```

**Avatar Circle:**
```tsx
<div className="w-20 h-20 rounded-full border-4 border-dark bg-cream">
    {initials}
</div>
```

## Layout Patterns

### Grid System
```tsx
// Mobile-first responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Hero Section
```tsx
<section className="bg-dark py-16 lg:py-24">
    <div className="container mx-auto px-6 lg:px-12">
        <div className="max-w-4xl">
            {/* Hero content */}
        </div>
    </div>
</section>
```

### Sticky Controls Bar
```tsx
<section className="sticky top-0 z-30 bg-white border-b-4 border-dark">
    <div className="container mx-auto px-6 lg:px-12 py-4">
        {/* Controls */}
    </div>
</section>
```

## Component Patterns

### Memphis Card Pattern
```tsx
<div className="border-4 border-{accent} bg-white">
    {/* Header with accent background */}
    <div className="bg-{accent} p-6">
        <h3 className="font-black uppercase text-dark">Title</h3>
    </div>

    {/* Body */}
    <div className="p-6">
        <p>Content</p>
    </div>

    {/* Footer */}
    <div className="p-6 pt-0">
        <button className="bg-dark text-cream border-4 border-dark">
            Action
        </button>
    </div>
</div>
```

### Memphis Badge Pattern
```tsx
<Badge className="bg-{accent} text-dark border-2 border-dark">
    Label
</Badge>
```

### Memphis Button Pattern
```tsx
<button className="px-4 py-2 bg-{accent} text-dark border-4 border-{accent} font-black uppercase tracking-wider transition-transform hover:-translate-y-0.5">
    Click Me
</button>
```

### Memphis Input Pattern
```tsx
<Input
    type="text"
    className="border-4 border-{accent} bg-white text-dark"
    placeholder="Enter text..."
/>
```

## Animation Patterns

### GSAP Timeline Pattern
```tsx
useGSAP(() => {
    const $1 = gsap.utils.selector(containerRef);

    // Check reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set($1("[class*='opacity-0']"), { opacity: 1 });
        return;
    }

    // Animate element
    const element = $1(".hero-title")[0];
    if (element) {
        gsap.fromTo(
            element,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
    }
}, { scope: containerRef });
```

### Stagger Pattern
```tsx
const cards = $1(".recruiter-card");
if (cards.length > 0) {
    gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            delay: 1.2,
        }
    );
}
```

## Accent Color Cycling

### Pattern
```tsx
const ACCENT_COLORS = ["coral", "teal", "mint"] as const;
const accentColor = ACCENT_COLORS[index % ACCENT_COLORS.length];

// Use in className
<div className={`border-4 border-${accentColor}`}>
```

### Application
- **Grid cards**: Each card cycles through accents
- **Table headers**: Column headers cycle through accents
- **Detail sections**: Each section uses different accent

## Responsive Breakpoints

### Tailwind Breakpoints Used
- `sm`: 640px (mobile landscape)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Mobile-First Classes
```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Hide on mobile, show on desktop
<div className="hidden lg:block">

// Different text sizes
<h1 className="text-4xl md:text-6xl lg:text-7xl">

// Different padding
<section className="py-12 lg:py-24">
```

## State Patterns

### Hover State
```tsx
className="transition-transform hover:-translate-y-1"
```

### Selected State
```tsx
className={`
    border-4
    ${isSelected ? 'border-coral bg-cream' : 'border-dark bg-white'}
`}
```

### Loading State (Opacity Pattern)
```tsx
// Initial state (for GSAP)
<div className="opacity-0">
    Content
</div>

// GSAP animates to opacity: 1
```

## Empty State Pattern
```tsx
<div className="text-center py-20 border-4 border-dark bg-white">
    {/* Memphis shapes decoration */}
    <div className="flex justify-center gap-3 mb-6">
        <div className="w-8 h-8 rotate-12 bg-coral" />
        <div className="w-8 h-8 rounded-full bg-teal" />
        <div className="w-8 h-8 rotate-45 bg-mint" />
    </div>

    <h3 className="font-black text-2xl uppercase tracking-tight mb-2 text-dark">
        No Results Found
    </h3>
    <p className="text-sm text-dark/50 mb-4">
        Try adjusting your search
    </p>

    <button className="bg-coral text-white border-4 border-coral">
        Clear Search
    </button>
</div>
```

## Memphis Shapes Decoration Pattern
```tsx
<div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
    <div className="absolute top-[10%] left-[5%] w-20 h-20 rounded-full border-4 border-coral" />
    <div className="absolute top-[40%] right-[8%] w-16 h-16 bg-teal" />
    <div className="absolute bottom-[15%] left-[15%] w-12 h-12 rotate-45 bg-mint" />
</div>
```

## Icon Patterns

### FontAwesome Pattern
```tsx
// Inline icons (preferred)
<i className="fa-duotone fa-regular fa-star text-coral"></i>

// With text
<div className="flex items-center gap-2">
    <i className="fa-duotone fa-regular fa-location-dot"></i>
    <span>{location}</span>
</div>

// Button icon
<button>
    <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
    Back
</button>
```

## Best Practices Summary

1. **Colors**: Always use Tailwind theme classes, never hex codes
2. **Borders**: Always 4px, always `border-4`
3. **Typography**: Uppercase headings, tight tracking, bold weights
4. **Spacing**: Generous padding (p-6, p-8), clear visual hierarchy
5. **Animations**: Smooth, reduced-motion support, null guards
6. **Responsive**: Mobile-first, test all breakpoints
7. **Accessibility**: High contrast, semantic HTML, ARIA labels
8. **Performance**: Lazy load images, optimize GSAP scope
9. **Consistency**: Follow Memphis UI package patterns
10. **Self-contained**: No external dependencies outside Memphis ecosystem