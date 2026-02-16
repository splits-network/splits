# Resource Pages Memphis Migration - Implementation Plan

**Date:** February 16, 2026
**Status:** In Progress - Shared Components Complete

---

## Strategy

Create **2 shared animators** for reuse across all 12 pages:
1. **HubAnimator** - For hub/directory pages (card grids)
2. **ArticleAnimator** - For long-form article pages

This eliminates ~200 lines of duplication per page.

---

## Shared Components (✅ Complete)

### 1. Article Animator
**Path:** `apps/candidate/src/app/public/resources/_shared/article-animator.tsx`
**Size:** 245 lines
**Used By:** 6 career guide articles
**Features:**
- Memphis shapes entrance + float
- Hero timeline (badge → headline → subtext → meta)
- Article cards stagger
- Section reveals with ScrollTrigger
- Pull quotes bounce-in
- Tip boxes slide-in
- Benefits/features grid
- CTA section reveal
- Related articles stagger

### 2. Hub Animator
**Path:** `apps/candidate/src/app/public/resources/_shared/hub-animator.tsx`
**Size:** 130 lines
**Used By:** 6 hub pages
**Features:**
- Memphis shapes (lighter animation)
- Hero timeline (faster, more utilitarian)
- Hub cards staggered grid
- CTA card reveal

---

## Implementation Pattern

### Hub Pages (6 total)
**Pattern:** Hero → Card Grid → CTA

Each hub page follows this structure:
```tsx
// page.tsx (server component)
import { HubClient } from "./hub-client";
export const metadata = { ... };
export default function HubMemphisPage() {
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <HubClient />
    </>
  );
}

// hub-client.tsx (client component)
"use client";
import { HubAnimator } from "../_shared/hub-animator";

const items = [ /* data array */ ];

export function HubClient() {
  return (
    <HubAnimator>
      {/* Hero with Memphis shapes */}
      {/* Card grid with Memphis accent cycling */}
      {/* CTA section */}
    </HubAnimator>
  );
}
```

### Article Pages (6 total)
**Pattern:** Hero → Intro → Sections → Pull Quotes → CTA

Each article follows this structure:
```tsx
// page.tsx (server component)
import { ArticleClient } from "./article-client";
export const metadata = { ... };
export default function ArticleMemphisPage() {
  return (
    <>
      <JsonLd data={articleJsonLd} />
      <ArticleClient />
    </>
  );
}

// article-client.tsx (client component)
"use client";
import { ArticleAnimator } from "../../_shared/article-animator";

const sections = [ /* data array */ ];

export function ArticleClient() {
  return (
    <ArticleAnimator>
      {/* Hero with Memphis shapes + article metadata */}
      {/* Intro section */}
      {/* Content sections with data loops */}
      {/* Pull quotes */}
      {/* Benefits/tips grids */}
      {/* CTA section */}
      {/* Related articles */}
    </ArticleAnimator>
  );
}
```

---

## Pages to Implement

### Priority 1: Hub Pages (6/6)

#### 1. Career Guides Hub (✅ COMPLETE)
- **Path:** `resources/career-guides-memphis/`
- **Files:** page.tsx (43 lines), career-guides-client.tsx (187 lines)
- **Primary Accent:** Coral
- **Data:** 6 guide cards
- **Status:** ✅ Complete

#### 2. Resume Tips Hub
- **Path:** `resources/resume-tips-memphis/`
- **Files:** page.tsx (~40 lines), resume-tips-client.tsx (~200 lines)
- **Primary Accent:** Teal
- **Data:** 4 tip cards, 6 resume sections, checklist
- **Pattern:** Similar to career-guides with do/don't grid

#### 3. Interview Prep Hub
- **Path:** `resources/interview-prep-memphis/`
- **Files:** page.tsx (~40 lines), interview-prep-client.tsx (~180 lines)
- **Primary Accent:** Purple
- **Data:** Interview types, preparation tips, common questions

#### 4. Salary Insights Hub
- **Path:** `resources/salary-insights-memphis/`
- **Files:** page.tsx (~40 lines), salary-insights-client.tsx (~160 lines)
- **Primary Accent:** Yellow
- **Data:** Salary ranges by role/location, negotiation tips

#### 5. Success Stories Hub
- **Path:** `resources/success-stories-memphis/`
- **Files:** page.tsx (~40 lines), success-stories-client.tsx (~160 lines)
- **Primary Accent:** Coral
- **Data:** Candidate success story cards

#### 6. Industry Trends Hub
- **Path:** `resources/industry-trends-memphis/`
- **Files:** page.tsx (~40 lines), industry-trends-client.tsx (~220 lines)
- **Primary Accent:** Teal
- **Data:** Trend articles, industry insights

---

### Priority 2: Article Pages (6/6)

#### 1. Personal Branding (596 lines)
- **Path:** `resources/career-guides/personal-branding-memphis/`
- **Files:** page.tsx (~40 lines), personal-branding-client.tsx (~400 lines)
- **Sections:**
  - 4 pillars (Define, Build, Share, Network)
  - 8 content ideas
  - Example brand statement (before/after)
  - 30-day action plan
  - Do/don't grid
  - Related resources
- **Memphis Elements:**
  - Pull quote with border-4
  - Pillar cards with corner accents
  - Content idea grid
  - Action plan timeline
  - Do/don't comparison cards

#### 2. Negotiating Offers (510 lines)
- **Path:** `resources/career-guides/negotiating-offers-memphis/`
- **Files:** page.tsx (~40 lines), negotiating-offers-client.tsx (~350 lines)
- **Sections:**
  - Preparation phase
  - Negotiation tactics
  - Common mistakes
  - Counter-offer templates
  - Salary research tips
- **Memphis Elements:**
  - Tactic cards with icons
  - Mistake warnings with error styling
  - Template boxes with border-4
  - Pull quotes

#### 3. First 90 Days (416 lines)
- **Path:** `resources/career-guides/first-90-days-memphis/`
- **Files:** page.tsx (~40 lines), first-90-days-client.tsx (~300 lines)
- **Sections:**
  - Day 1-30, 31-60, 61-90 phases
  - Relationship building
  - Quick wins strategy
  - Red flags to avoid
- **Memphis Elements:**
  - Timeline with colored phases
  - Phase cards with numbered badges
  - Quick wins checklist
  - Red flag warnings

#### 4. Networking (362 lines)
- **Path:** `resources/career-guides/networking-memphis/`
- **Files:** page.tsx (~40 lines), networking-client.tsx (~260 lines)
- **Sections:**
  - Online vs offline networking
  - Conversation starters
  - Follow-up templates
  - Event strategies
- **Memphis Elements:**
  - Strategy cards with icons
  - Template boxes
  - Event checklist
  - Pull quotes

#### 5. Remote Work (272 lines)
- **Path:** `resources/career-guides/remote-work-memphis/`
- **Files:** page.tsx (~40 lines), remote-work-client.tsx (~200 lines)
- **Sections:**
  - Setup essentials
  - Productivity tips
  - Communication strategies
  - Work-life boundaries
- **Memphis Elements:**
  - Essentials checklist
  - Tip cards with icons
  - Strategy grid
  - Boundary examples

#### 6. Switch Careers (250 lines)
- **Path:** `resources/career-guides/switch-careers-memphis/`
- **Files:** page.tsx (~40 lines), switch-careers-client.tsx (~180 lines)
- **Sections:**
  - Self-assessment
  - Skills transfer
  - Resume repositioning
  - Interview strategy
- **Memphis Elements:**
  - Assessment framework
  - Skills mapping grid
  - Resume before/after
  - Strategy cards

---

## Memphis Design Patterns for Resources

### Hub Card Pattern
```tsx
<Link
  href={item.href}
  className={`hub-card relative p-6 border-4 border-${accent} bg-white opacity-0 transition-transform hover:scale-[1.02]`}
>
  {/* Corner accent */}
  <div className={`absolute top-0 right-0 w-12 h-12 bg-${accent}`} />

  <div className="relative">
    {/* Icon box */}
    <div className={`w-16 h-16 flex items-center justify-center bg-${accent} mb-4`}>
      <i className={`fa-duotone fa-regular ${icon} text-2xl`}></i>
    </div>

    {/* Category badge */}
    <span className={`inline-block px-2 py-1 text-xs font-bold uppercase bg-${accent}/10 mb-3`}>
      {category}
    </span>

    {/* Title */}
    <h2 className="text-xl font-black uppercase tracking-tight text-dark mb-3">
      {title}
    </h2>

    {/* Description */}
    <p className="text-sm leading-relaxed text-dark/70 mb-4">
      {description}
    </p>

    {/* Footer with read time */}
    <div className="flex items-center justify-between pt-4 border-t-2 border-dark/10">
      <span className="text-xs font-bold uppercase text-dark/40">
        <i className="fa-duotone fa-regular fa-clock"></i> {readTime}
      </span>
      <i className={`fa-duotone fa-regular fa-arrow-right text-${accent}`}></i>
    </div>
  </div>
</Link>
```

### Article Hero Pattern
```tsx
<section className="relative min-h-[60vh] overflow-hidden flex items-center bg-dark">
  {/* Memphis shapes (6 total) */}
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* ... shapes ... */}
  </div>

  <div className="container mx-auto px-4 relative z-10 py-20">
    <div className="max-w-4xl mx-auto">
      {/* Category + Meta */}
      <div className="hero-meta flex flex-wrap items-center gap-4 mb-8 opacity-0">
        <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em] bg-coral text-white">
          <i className="fa-duotone fa-regular fa-icon"></i>
          Category
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-yellow">
          <i className="fa-duotone fa-regular fa-clock"></i> {readTime}
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/50">
          {date}
        </span>
      </div>

      {/* Headline */}
      <h1 className="hero-headline text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-8 opacity-0 text-white">
        {title} <span className="text-coral">{titleAccent}</span>
      </h1>

      {/* Subtext */}
      <p className="hero-subtext text-lg md:text-xl leading-relaxed opacity-0 text-white/70">
        {description}
      </p>
    </div>
  </div>
</section>
```

### Pull Quote Pattern
```tsx
<section className="py-16 bg-dark">
  <div className="container mx-auto px-4">
    <div className="pullquote max-w-4xl mx-auto relative p-8 md:p-12 border-4 border-teal opacity-0">
      {/* Opening quote mark */}
      <div className="absolute -top-8 left-8 text-7xl font-black leading-none text-teal">
        &ldquo;
      </div>

      {/* Quote text */}
      <p className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mt-4 text-white">
        {quote}
      </p>

      {/* Attribution */}
      <div className="mt-6 pt-4 border-t-4 border-teal">
        <span className="text-sm font-bold uppercase tracking-wider text-teal">
          — {attribution}
        </span>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
    </div>
  </div>
</section>
```

### Tip Box Pattern
```tsx
<div className="tip-box relative p-6 border-4 border-l-8 border-purple bg-purple/5 opacity-0">
  <div className="flex items-start gap-4">
    <div className="w-12 h-12 flex items-center justify-center bg-purple">
      <i className="fa-duotone fa-regular fa-lightbulb text-xl text-white"></i>
    </div>
    <div className="flex-1">
      <h3 className="font-black text-base uppercase tracking-wide text-dark mb-2">
        {tipTitle}
      </h3>
      <p className="text-sm leading-relaxed text-dark/70">
        {tipContent}
      </p>
    </div>
  </div>
</div>
```

### Do/Don't Grid Pattern
```tsx
<div className="grid md:grid-cols-2 gap-6">
  {/* DO column */}
  <div className="relative p-6 border-4 border-teal bg-teal/5">
    <div className="absolute top-0 right-0 w-10 h-10 bg-teal" />
    <h3 className="font-black text-lg uppercase tracking-wide text-teal mb-4 flex items-center gap-2">
      <i className="fa-duotone fa-regular fa-check-circle"></i>
      Do This
    </h3>
    <ul className="space-y-3">
      {doItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-dark/80">
          <i className="fa-duotone fa-regular fa-check text-teal mt-1 flex-shrink-0"></i>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>

  {/* DON'T column */}
  <div className="relative p-6 border-4 border-coral bg-coral/5">
    <div className="absolute top-0 right-0 w-10 h-10 bg-coral" />
    <h3 className="font-black text-lg uppercase tracking-wide text-coral mb-4 flex items-center gap-2">
      <i className="fa-duotone fa-regular fa-times-circle"></i>
      Avoid This
    </h3>
    <ul className="space-y-3">
      {dontItems.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-dark/80">
          <i className="fa-duotone fa-regular fa-times text-coral mt-1 flex-shrink-0"></i>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
</div>
```

---

## Memphis Compliance Checklist

### Typography ✅
- [ ] Font-black (font-weight: 900) for all headings
- [ ] ALL UPPERCASE for headings and labels
- [ ] Tracking-tight for large headings
- [ ] Tracking-wide/wider for small labels

### Colors ✅
- [ ] Memphis palette only: coral/teal/yellow/purple/dark/cream
- [ ] NO hex colors in JSX
- [ ] Tailwind classes only: `bg-coral`, `text-teal`, `border-yellow`
- [ ] Text on yellow: always `text-dark`

### Borders ✅
- [ ] Border-4 everywhere (except inputs)
- [ ] Sharp corners (no rounded except circles)
- [ ] Corner accent blocks on cards

### Animations ✅
- [ ] GSAP for all entrance effects
- [ ] ScrollTrigger for section reveals
- [ ] Prefers-reduced-motion fallback
- [ ] All animated elements start opacity-0

### Icons ✅
- [ ] Always duotone: `fa-duotone fa-regular`
- [ ] Memphis color class
- [ ] Semantic choices

---

## Implementation Order

1. ✅ Shared animators (article-animator.tsx, hub-animator.tsx)
2. ✅ Career Guides Hub (template for all hubs)
3. Resume Tips Hub → Interview Prep Hub → Salary Insights Hub → Success Stories Hub → Industry Trends Hub
4. Personal Branding Article (template for all articles)
5. Negotiating Offers → First 90 Days → Networking → Remote Work → Switch Careers

---

## Estimated File Counts

**Total files:** 24 files
- 12 page.tsx files (~40 lines each) = ~480 lines
- 12 client.tsx files (160-400 lines each) = ~3,000 lines
- 2 shared animators (245 + 130 lines) = ~375 lines

**Total:** ~3,855 lines of new code

**Code reuse:**
- Shared animators used by all 12 pages (saved ~2,400 lines of duplication)
- Memphis patterns reused across all pages
- Data-driven structure makes content easy to maintain

---

**Next:** Complete hub pages 2-6, then implement article pages 1-6.
