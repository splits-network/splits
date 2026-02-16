# Candidate App Memphis Migration - Visual Design Guide

**Complete Before/After Transformation Reference**

---

## Design Philosophy Shift

### Before (DaisyUI Generic)
- Rounded corners everywhere (`rounded-lg`, `rounded-xl`)
- Subtle shadows (`shadow-sm`, `shadow-md`)
- Muted color palette (base-100, base-200, base-300)
- CSS transitions for hover states
- Standard button styles (`btn-primary`, `btn-outline`)
- Gentle spacing and padding
- Professional but generic

### After (Memphis Design System)
- **Sharp corners** (no border-radius except circles)
- **Border-4** thick borders for visual weight
- **Bold Memphis colors** (coral #FF6B6B, teal #4ECDC4, yellow #FFE66D, purple #A06CD5)
- **GSAP animations** for dynamic entrance effects
- **Geometric shapes** floating in backgrounds
- **Font-black uppercase** headings for strong typography
- **Corner accent blocks** for visual hierarchy
- **Playful yet professional** - distinctive brand identity

---

## Color Palette Comparison

### Before (DaisyUI)
```css
--primary: hsl(var(--p))     /* Generic blue */
--secondary: hsl(var(--s))   /* Generic purple */
--accent: hsl(var(--a))      /* Generic teal */
--neutral: hsl(var(--n))     /* Gray */
--base-100: hsl(var(--b1))   /* White */
```

### After (Memphis)
```css
--coral: #FF6B6B      /* Vibrant red-orange */
--teal: #4ECDC4       /* Bright cyan */
--yellow: #FFE66D     /* Sunny yellow */
--purple: #A06CD5     /* Soft purple */
--dark: #2D3436       /* Near-black */
--cream: #FFFEF7      /* Off-white */
```

**Usage Pattern:**
- Coral: Primary CTAs, important actions
- Teal: Secondary CTAs, badges, success states
- Yellow: Warnings, highlights (dark text on yellow)
- Purple: Accents, decorative elements
- Dark: Text, borders, hero backgrounds
- Cream: Page backgrounds, card backgrounds

---

## Typography Transformation

### Before
```tsx
<h1 className="text-5xl font-bold mb-4">
  How It Works
</h1>
```
- Font-weight: 700 (bold)
- Title case or sentence case
- Normal letter-spacing

### After
```tsx
<h1 className="text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] text-dark">
  HERE'S HOW IT <span className="text-coral">WORKS</span>
</h1>
```
- Font-weight: 900 (black)
- **ALL UPPERCASE** for impact
- Tracking-tight for headings
- Split-color technique (dark + accent)
- Responsive sizing (mobile → tablet → desktop)
- Tight line-height for stacked words

**Small Labels:**
```tsx
<span className="text-xs font-bold uppercase tracking-[0.2em] bg-teal text-white px-5 py-2">
  The Process
</span>
```
- Extreme tracking (0.2em) for readability
- Font-bold for small sizes
- Background color for badge effect

---

## Border & Shape Evolution

### Before (Subtle Borders)
```tsx
<div className="card bg-base-100 shadow-sm border border-base-300">
  <div className="card-body">
    Content
  </div>
</div>
```
- 1px border (`border`)
- Subtle shadow
- Rounded corners

### After (Memphis Bold Borders)
```tsx
<div className="relative p-8 border-4 border-dark bg-white">
  {/* Corner accent */}
  <div className="absolute top-0 right-0 w-16 h-16 bg-coral" />

  <div className="relative">
    Content
  </div>
</div>
```
- **4px border** (`border-4`)
- No shadow
- **Sharp corners**
- Corner accent block for visual interest
- Relative positioning for layering

**Accent Variation:**
```tsx
<div className="border-4 border-coral bg-white">
  {/* Colored border */}
</div>

<div className="border-4 border-dark bg-coral">
  {/* Colored background */}
</div>

<div className="border-4 border-teal bg-cream">
  {/* Soft variation */}
</div>
```

---

## Hero Section Comparison

### Before (Clean Hero)
```tsx
<section className="hero min-h-screen bg-base-200">
  <div className="hero-content text-center">
    <div className="max-w-md">
      <h1 className="text-5xl font-bold">How It Works</h1>
      <p className="py-6">Simple 3-step process...</p>
      <button className="btn btn-primary">Get Started</button>
    </div>
  </div>
</section>
```

### After (Memphis Hero with Floating Shapes)
```tsx
<section className="relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
  {/* Memphis decorative shapes - 6 total */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="memphis-shape absolute top-[10%] left-[5%] w-28 h-28 rounded-full border-4 border-coral opacity-0" />
    <div className="memphis-shape absolute top-[50%] right-[8%] w-24 h-24 rounded-full bg-teal opacity-0" />
    <div className="memphis-shape absolute bottom-[15%] left-[18%] w-16 h-16 rounded-full bg-yellow opacity-0" />
    <div className="memphis-shape absolute top-[25%] right-[25%] w-20 h-20 rotate-12 bg-purple opacity-0" />
    <div className="memphis-shape absolute bottom-[35%] right-[35%] w-28 h-12 -rotate-6 border-4 border-coral opacity-0" />
    <div className="memphis-shape absolute top-[55%] left-[22%] w-12 h-12 rotate-45 bg-coral opacity-0" />
  </div>

  <div className="container mx-auto px-4 relative z-10 py-20">
    <div className="max-w-4xl mx-auto text-center">
      {/* Badge */}
      <div className="hero-badge inline-block mb-6 opacity-0">
        <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-teal text-white">
          <i className="fa-duotone fa-regular fa-map"></i>
          The Process
        </span>
      </div>

      {/* Title with split color */}
      <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 opacity-0 text-white">
        HERE'S HOW IT <span className="text-coral">WORKS</span>
      </h1>

      {/* Subtitle */}
      <p className="hero-subtext text-lg md:text-xl leading-relaxed mb-8 opacity-0 text-white/70">
        From profile creation to job placement — the complete step-by-step guide...
      </p>

      {/* Stat badge */}
      <div className="hero-stat inline-flex items-center gap-2 px-4 py-2 border-4 border-purple text-xs font-bold uppercase tracking-wider opacity-0 text-white/60">
        <i className="fa-duotone fa-regular fa-clock text-purple"></i>
        <span>From sign-up to offer in 2-4 weeks</span>
      </div>
    </div>
  </div>
</section>
```

**GSAP Animation:**
```tsx
// Memphis shapes entrance with elastic easing
gsap.fromTo($(".memphis-shape"),
  { opacity: 0, scale: 0, rotation: -180 },
  {
    opacity: 0.35, scale: 1, rotation: 0,
    duration: 0.8, ease: "elastic.out(1, 0.4)",
    stagger: { each: 0.06, from: "random" }
  }
);

// Continuous floating animation
$(".memphis-shape").forEach((shape, i) => {
  gsap.to(shape, {
    y: `+=${6 + (i % 3) * 3}`,
    x: `+=${3 + (i % 2) * 4}`,
    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
    duration: 3 + i * 0.4,
    ease: "sine.inOut",
    repeat: -1, yoyo: true
  });
});

// Hero content timeline
heroTimeline
  .fromTo($1(".hero-badge"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, ease: "back.out(1.4)" })
  .fromTo($1(".hero-headline"), { opacity: 0, y: 50, skewY: 2 }, { opacity: 1, y: 0, skewY: 0 }, "-=0.3")
  .fromTo($1(".hero-subtext"), { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.4");
```

---

## Button Evolution

### Before
```tsx
<button className="btn btn-primary">Get Started</button>
<button className="btn btn-outline">Learn More</button>
```

### After
```tsx
<a href="/sign-up" className="btn btn-coral btn-lg uppercase tracking-wider">
  <i className="fa-duotone fa-regular fa-user-plus"></i>
  Create Your Profile
</a>

<a href="/public/jobs" className="btn btn-outline-dark btn-lg uppercase tracking-wider">
  <i className="fa-duotone fa-regular fa-briefcase"></i>
  Browse Jobs First
</a>
```

**Memphis Button Classes:**
- `btn-coral` - Solid coral button (white text)
- `btn-teal` - Solid teal button (dark text)
- `btn-yellow` - Solid yellow button (dark text)
- `btn-purple` - Solid purple button (white text)
- `btn-dark` - Solid dark button (white text)
- `btn-outline-dark` - Dark border, transparent bg
- `btn-outline-white` - White border (for dark backgrounds)

**Always:**
- Uppercase text
- Icon included (FontAwesome duotone)
- Tracking-wider for readability
- Size specified (sm/md/lg)

---

## Card Layouts: Before vs After

### Before (Standard Card)
```tsx
<div className="card bg-base-100 shadow">
  <div className="card-body">
    <h2 className="card-title">Feature Title</h2>
    <p>Description text here...</p>
  </div>
</div>
```

### After (Memphis Card with Corner Accent)
```tsx
<div className="relative p-8 border-4 border-coral bg-white">
  {/* Top-right corner accent */}
  <div className="absolute top-0 right-0 w-16 h-16 bg-coral" />

  <div className="relative">
    {/* Icon block */}
    <div className="w-16 h-16 flex items-center justify-center bg-coral mb-4">
      <i className="fa-duotone fa-regular fa-icon text-2xl text-white"></i>
    </div>

    {/* Title */}
    <h3 className="text-xl font-black uppercase tracking-tight text-dark mb-3">
      Feature Title
    </h3>

    {/* Description */}
    <p className="text-base leading-relaxed text-dark/70">
      Description text here...
    </p>
  </div>
</div>
```

**Variations:**

1. **Small Corner Accent (10x10):**
```tsx
<div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
```

2. **Multiple Corner Accents:**
```tsx
<div className="absolute top-0 left-0 w-12 h-12 bg-coral" />
<div className="absolute bottom-0 right-0 w-12 h-12 bg-teal" />
```

3. **Icon in Accent Color Background:**
```tsx
<div className="w-16 h-16 bg-yellow flex items-center justify-center">
  <i className="fa-duotone fa-regular fa-icon text-2xl text-dark"></i>
</div>
```

---

## Grid Patterns

### Before (Simple Grid)
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => (
    <div key={item.id} className="card bg-base-100">
      {item.content}
    </div>
  ))}
</div>
```

### After (Memphis Grid with Accent Cycling)
```tsx
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map((item, idx) => {
    const accent = accentAt(idx);
    return (
      <div key={item.id} className={`relative p-6 border-4 border-${accent} bg-white`}>
        <div className={`absolute top-0 right-0 w-10 h-10 bg-${accent}`} />
        <div className="relative">{item.content}</div>
      </div>
    );
  })}
</div>
```

**Result:** Automatic color variety without manual assignment. Each card gets a different accent color in sequence.

---

## FAQ/Accordion Comparison

### Before (DaisyUI Collapse)
```tsx
<div className="collapse collapse-plus bg-base-200">
  <input type="radio" name="faq" defaultChecked={index === 0} />
  <div className="collapse-title text-xl font-medium">
    {question}
  </div>
  <div className="collapse-content">
    <p>{answer}</p>
  </div>
</div>
```

### After (Memphis Details/Summary)
```tsx
<details className="group border-2 border-dark/10 bg-cream">
  <summary className="cursor-pointer p-5 font-bold text-base uppercase tracking-wide text-dark flex items-center justify-between hover:bg-dark/5 transition-colors">
    <span className="flex items-center gap-3">
      <i className="fa-duotone fa-regular fa-circle-question text-dark/40"></i>
      {question}
    </span>
    <i className="fa-duotone fa-regular fa-chevron-down text-dark/40 group-open:rotate-180 transition-transform"></i>
  </summary>

  <div className="p-5 pt-0 text-base leading-relaxed text-dark/70 border-t-2 border-dark/10">
    {answer}
  </div>
</details>
```

**Benefits:**
- Native HTML (better accessibility)
- Icon rotation on open (`group-open:rotate-180`)
- No JavaScript state management needed
- Keyboard accessible by default

---

## Process Steps: Alternating Layout

### Before (Stacked)
```tsx
{steps.map(step => (
  <div key={step.number} className="card">
    <div className="card-body">
      <h3>{step.title}</h3>
      <p>{step.description}</p>
    </div>
  </div>
))}
```

### After (Alternating Left/Right with Number Badges)
```tsx
{PROCESS_STEPS.map((step, idx) => {
  const accent = accentAt(idx);
  const isEven = idx % 2 === 0;

  return (
    <div key={step.number} className={`process-step relative opacity-0`}>
      <div className={`grid lg:grid-cols-12 gap-8 items-center ${
        isEven ? "" : "lg:grid-flow-dense"
      }`}>
        {/* Number Badge */}
        <div className={`lg:col-span-2 flex ${
          isEven ? "justify-start" : "justify-end"
        }`}>
          <div className={`w-24 h-24 flex items-center justify-center border-4 border-${accent} bg-white`}>
            <span className="text-3xl font-black text-dark">
              {step.number}
            </span>
          </div>
        </div>

        {/* Content Card */}
        <div className={`lg:col-span-10 relative p-8 border-4 border-dark bg-white ${
          isEven ? "lg:col-start-3" : "lg:col-start-1 lg:row-start-1"
        }`}>
          {/* Corner accent */}
          <div className={`absolute top-0 ${isEven ? "right-0" : "left-0"} w-16 h-16 bg-${accent}`} />

          <div className="relative">
            {/* Time badge */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] bg-${accent} text-white`}>
                <i className="fa-duotone fa-regular fa-clock"></i>
                {step.time}
              </span>
            </div>

            {/* Title */}
            <h3 className={`text-2xl md:text-3xl font-black uppercase tracking-tight text-dark mb-4 ${
              isEven ? "text-left" : "lg:text-right"
            }`}>
              <i className={`fa-duotone fa-regular ${step.icon} text-${accent} mr-2`}></i>
              {step.title}
            </h3>

            {/* Description */}
            <p className={`text-base leading-relaxed text-dark/70 mb-6 ${
              isEven ? "text-left" : "lg:text-right"
            }`}>
              {step.description}
            </p>

            {/* Features Grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
              isEven ? "text-left" : "lg:text-right"
            }`}>
              {step.features.map((feature, i) => (
                <div key={i} className={`flex items-start gap-2 ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}>
                  <i className={`fa-duotone fa-regular fa-check-circle text-${accent} mt-1 flex-shrink-0`}></i>
                  <span className="text-sm font-medium text-dark">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
})}
```

**Visual Flow:**
```
Step 01:  [01] [────────────── Content ──────────────]
Step 02:  [────────────── Content ──────────────] [02]
Step 03:  [03] [────────────── Content ──────────────]
Step 04:  [────────────── Content ──────────────] [04]
```

---

## Animation Patterns

### Before (CSS Transitions)
```tsx
<div className="card hover:shadow-lg transition-shadow">
  Content
</div>
```

### After (GSAP ScrollTrigger)

**1. Hero Timeline (Sequential):**
```tsx
const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });

heroTl
  .fromTo($1(".hero-badge"),
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.4)" }
  )
  .fromTo($1(".hero-headline"),
    { opacity: 0, y: 50, skewY: 2 },
    { opacity: 1, y: 0, skewY: 0, duration: 1.0 },
    "-=0.3"  // Overlap with previous
  )
  .fromTo($1(".hero-subtext"),
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6 },
    "-=0.4"
  );
```

**2. Staggered Grid (Parallel with Delay):**
```tsx
gsap.fromTo($(".card"),
  { opacity: 0, y: 30, scale: 0.95 },
  {
    opacity: 1, y: 0, scale: 1,
    duration: 0.6,
    ease: "back.out(1.4)",
    stagger: { each: 0.1, from: "start" },
    scrollTrigger: {
      trigger: $1(".cards-container"),
      start: "top 80%"
    }
  }
);
```

**3. Section Reveal (On Scroll):**
```tsx
$(".section-card").forEach((card) => {
  gsap.fromTo(card,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: card,
        start: "top 85%"
      }
    }
  );
});
```

**4. Continuous Float (Infinite Loop):**
```tsx
$(".memphis-shape").forEach((shape, i) => {
  gsap.to(shape, {
    y: `+=${6 + (i % 3) * 3}`,
    x: `+=${3 + (i % 2) * 4}`,
    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
    duration: 3 + i * 0.4,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true
  });
});
```

**5. Alternating Step Entrance:**
```tsx
$(".process-step").forEach((step, idx) => {
  gsap.fromTo(step,
    {
      opacity: 0,
      x: idx % 2 === 0 ? -40 : 40,  // Left or right
      scale: 0.95
    },
    {
      opacity: 1, x: 0, scale: 1,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: step,
        start: "top 85%"
      }
    }
  );
});
```

---

## Icon Usage Evolution

### Before (Basic Icons)
```tsx
<i className="fa-solid fa-check"></i>
<i className="fa-regular fa-user"></i>
```

### After (Duotone Icons with Color)
```tsx
<i className="fa-duotone fa-regular fa-check-circle text-coral"></i>
<i className="fa-duotone fa-regular fa-user-plus text-teal"></i>
<i className="fa-duotone fa-regular fa-briefcase text-yellow"></i>
```

**Always:**
- `fa-duotone` for two-tone effect
- `fa-regular` for consistent weight
- Specific Memphis color class
- Semantic icon choice

**In Badges:**
```tsx
<span className="inline-flex items-center gap-2 px-5 py-2 bg-teal text-white">
  <i className="fa-duotone fa-regular fa-map"></i>
  The Process
</span>
```

**In Buttons:**
```tsx
<a href="/sign-up" className="btn btn-coral">
  <i className="fa-duotone fa-regular fa-user-plus"></i>
  Create Account
</a>
```

---

## Spacing & Rhythm

### Before (Standard Spacing)
```tsx
<section className="py-12">
  <div className="container mx-auto px-6">
    <div className="mb-8">
      <h2 className="text-3xl mb-4">Section Title</h2>
    </div>
  </div>
</section>
```

### After (Memphis Rhythm)
```tsx
<section className="py-20 overflow-hidden bg-cream">
  <div className="container mx-auto px-4">
    <div className="max-w-6xl mx-auto">
      {/* Section intro */}
      <div className="text-center mb-16 opacity-0">
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] mb-3 bg-dark text-white">
          Section Label
        </span>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-dark">
          Section <span className="text-teal">Title</span>
        </h2>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cards */}
      </div>
    </div>
  </div>
</section>
```

**Memphis Spacing Scale:**
- Section padding: `py-16`, `py-20` (large breathing room)
- Content gaps: `gap-4`, `gap-6` (consistent rhythm)
- Margin bottom: `mb-12`, `mb-16` (generous section spacing)
- Card padding: `p-6`, `p-8` (comfortable content padding)
- Container: `max-w-6xl`, `max-w-7xl` (wide but readable)

---

## Search/Filter UI

### Before (Standard Input)
```tsx
<input
  type="text"
  placeholder="Search..."
  className="input input-bordered w-full"
/>
```

### After (Memphis Search Bar)
```tsx
<div className="relative">
  <input
    type="text"
    placeholder="Search help articles... (e.g., 'reset password', 'apply to job')"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="w-full px-6 py-4 pr-14 bg-white border-2 border-dark/20 focus:border-dark outline-none text-base font-medium tracking-tight"
  />
  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
    <i className="fa-duotone fa-regular fa-magnifying-glass text-dark/40 text-xl"></i>
  </div>
</div>

{searchQuery && (
  <div className="mt-3 flex items-center justify-between">
    <p className="text-sm text-dark/60">
      Found <span className="font-bold">{resultCount}</span> results
    </p>
    <button
      onClick={() => setSearchQuery("")}
      className="text-xs font-bold uppercase tracking-wider text-coral hover:text-dark transition-colors"
    >
      Clear
    </button>
  </div>
)}
```

**Features:**
- No rounded corners
- Border-2 (thinner for inputs)
- Focus state: `focus:border-dark`
- Icon positioned absolutely
- Results count display
- Clear button with Memphis styling

---

## Stats/Metrics Display

### Before (Simple Cards)
```tsx
<div className="stats shadow">
  <div className="stat">
    <div className="stat-value">93%</div>
    <div className="stat-desc">Success Rate</div>
  </div>
</div>
```

### After (Memphis Colored Blocks)
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4">
  {SUCCESS_METRICS.map((metric, idx) => (
    <div
      key={idx}
      className={`metric-block p-8 md:p-12 text-center opacity-0 bg-${metric.accent} ${
        metric.accent === "yellow" ? "text-dark" : "text-white"
      }`}
    >
      <div className="metric-value text-4xl md:text-6xl font-black mb-2">
        {metric.value}
      </div>
      <div className="text-sm md:text-base font-bold uppercase tracking-[0.15em]">
        {metric.label}
      </div>
    </div>
  ))}
</div>
```

**Visual:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ CORAL BG     │ TEAL BG      │ YELLOW BG    │ PURPLE BG    │
│  12 days     │   3.5x       │    94%       │   $15k+      │
│ Avg Time to  │ More Interview│ Candidate   │ Average Salary│
│   Offer      │   Requests   │ Satisfaction │   Increase   │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

No gaps between blocks - solid color bar.

---

## Mobile Responsiveness

### Typography Scaling
```tsx
{/* Desktop: 7xl, Tablet: 6xl, Mobile: 4xl */}
<h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase">
  TITLE
</h1>

{/* Desktop: 3xl, Tablet: 2xl, Mobile: xl */}
<h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase">
  SUBTITLE
</h2>

{/* Desktop: xl, Mobile: lg */}
<p className="text-lg md:text-xl leading-relaxed">
  Body text
</p>
```

### Grid Breakpoints
```tsx
{/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items}
</div>

{/* Mobile: 1 col, Desktop: 2 cols */}
<div className="grid md:grid-cols-2 gap-6">
  {items}
</div>
```

### Process Steps Alignment
```tsx
{/* Desktop: alternating left/right, Mobile: all left */}
<div className={`grid lg:grid-cols-12 gap-8 ${
  isEven ? "" : "lg:grid-flow-dense"
}`}>
  {/* Content adapts to mobile stacking */}
</div>
```

---

## Prefers-Reduced-Motion

### GSAP Accessibility Pattern
```tsx
useGSAP(() => {
  if (!containerRef.current) return;

  // Check user preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Instantly show all content (no animations)
    gsap.set(
      containerRef.current.querySelectorAll("[class*='opacity-0']"),
      { opacity: 1 }
    );
    return;
  }

  // Normal animations proceed...
  gsap.fromTo(...);
}, { scope: containerRef });
```

**All elements start with `opacity-0`**, then either:
1. Animated in via GSAP (normal users)
2. Instantly shown via `gsap.set` (reduced-motion users)

---

## Summary: Visual Impact

### Before
- Professional but generic
- Could be any SaaS product
- Relies on content for differentiation
- Safe design choices

### After
- **Bold, distinctive brand identity**
- **Instantly recognizable** Memphis aesthetic
- **Playful yet professional** tone
- **Energetic, dynamic** feel from animations
- **Strong visual hierarchy** from thick borders
- **Confident typography** with font-black uppercase
- **Memorable color palette** (coral/teal/yellow/purple)

The Memphis transformation took the candidate app from "clean and professional" to "distinctive and unforgettable" while maintaining usability and accessibility.

---

**Result:** A complete visual identity that stands out in the recruiting marketplace while remaining functional, accessible, and conversion-optimized.
