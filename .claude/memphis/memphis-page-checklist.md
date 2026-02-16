# Memphis Page Implementation Checklist

**Use this checklist when creating new Memphis pages or migrating existing ones.**

---

## Pre-Implementation

### 1. Planning
- [ ] Identify page type (marketing, legal, info, functional)
- [ ] Determine if Memphis is appropriate (content pages = yes, functional dashboards = maybe not)
- [ ] Choose primary accent color (coral/teal/yellow/purple)
- [ ] Sketch content structure and sections
- [ ] Identify reusable patterns from existing Memphis pages

### 2. File Structure
- [ ] Create parallel directory: `{page-name}-memphis/`
- [ ] Plan file split:
  - [ ] `page.tsx` - Server component (metadata, data fetching)
  - [ ] `{page-name}-client.tsx` - Client component (UI, state)
  - [ ] `{page-name}-animator.tsx` - GSAP animations (if unique patterns needed)
  - [ ] Or reuse existing animator (e.g., `legal-animator.tsx`)

---

## Implementation: Server Component (`page.tsx`)

### Metadata
- [ ] Title: Descriptive, under 60 characters
- [ ] Description: 150-160 characters, includes key terms
- [ ] Keywords: Relevant search terms (comma-separated)
- [ ] OpenGraph title, description, url
- [ ] Canonical URL via `buildCanonical()`

### Example Template
```tsx
import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { PageClient } from "./page-client";

export const metadata: Metadata = {
    title: "Page Title - Applicant Network | Tagline",
    description: "Descriptive summary of page content...",
    keywords: "keyword1, keyword2, keyword3",
    openGraph: {
        title: "Page Title - Applicant Network | Tagline",
        description: "Descriptive summary of page content...",
        url: "https://applicant.network/path/to/page",
        type: "website",
    },
    ...buildCanonical("/path/to/page"),
};

export default function PageMemphisPage() {
    return <PageClient />;
}
```

---

## Implementation: Client Component

### Required Imports
```tsx
"use client";

import { PageAnimator } from "./page-animator";
// or
import { LegalAnimator } from "../_shared/legal-animator";
```

### Hero Section Checklist
- [ ] Dark background (`bg-dark`)
- [ ] Min height: `min-h-[60vh]` or `min-h-[40vh]`
- [ ] 6 Memphis shapes (mix of circles, squares, polylines)
  - [ ] Varying sizes (w-12 to w-28)
  - [ ] Random positions (top-[%], left-[%])
  - [ ] Mix of borders and fills
  - [ ] Memphis accent colors
  - [ ] All start with `opacity-0`
  - [ ] Class: `memphis-shape`
- [ ] Container with relative z-10
- [ ] Badge with icon
  - [ ] `inline-flex items-center gap-2`
  - [ ] `px-5 py-2`
  - [ ] `text-xs font-bold uppercase tracking-[0.2em]`
  - [ ] Memphis bg color
  - [ ] Class: `hero-badge`
  - [ ] Start `opacity-0`
- [ ] Headline
  - [ ] `text-4xl md:text-6xl lg:text-7xl`
  - [ ] `font-black uppercase tracking-tight leading-[0.95]`
  - [ ] Split color: dark + accent span
  - [ ] Class: `hero-headline`
  - [ ] Start `opacity-0`
- [ ] Subtitle
  - [ ] `text-lg md:text-xl leading-relaxed`
  - [ ] `text-white/70`
  - [ ] Class: `hero-subtext`
  - [ ] Start `opacity-0`

### Content Sections Checklist
- [ ] Section wrapper: `<section className="py-16 md:py-20 bg-{color}">`
- [ ] Container: `<div className="container mx-auto px-4">`
- [ ] Max width: `<div className="max-w-6xl mx-auto">` or `max-w-7xl`
- [ ] Section intro (if applicable):
  - [ ] Label badge (small uppercase)
  - [ ] Heading with split color
  - [ ] Start `opacity-0` with unique class for GSAP targeting

### Card Pattern Checklist
- [ ] Parent: `<div className="relative p-6 md:p-8 border-4 border-{accent} bg-white">`
- [ ] Corner accent: `<div className="absolute top-0 right-0 w-16 h-16 bg-{accent}" />`
- [ ] Content wrapper: `<div className="relative">` (ensures content above corner)
- [ ] Icon (if applicable):
  - [ ] `w-16 h-16 flex items-center justify-center bg-{accent}`
  - [ ] `fa-duotone fa-regular fa-{icon} text-2xl`
- [ ] Title:
  - [ ] `text-xl md:text-2xl lg:text-3xl`
  - [ ] `font-black uppercase tracking-tight text-dark`
- [ ] Description:
  - [ ] `text-base leading-relaxed text-dark/70`

### Memphis Accent Cycling
```tsx
const ACCENT_COLORS = ["coral", "teal", "yellow", "purple"] as const;
const accentAt = (idx: number) => ACCENT_COLORS[idx % 4];

// In map:
{items.map((item, idx) => {
  const accent = accentAt(idx);
  return <div className={`border-4 border-${accent}`}>...</div>;
})}
```

### Button Checklist
- [ ] Always with icon: `<i className="fa-duotone fa-regular fa-{icon}"></i>`
- [ ] Uppercase: `uppercase tracking-wider`
- [ ] Size specified: `btn-sm`, `btn-md`, `btn-lg`
- [ ] Memphis color: `btn-coral`, `btn-teal`, `btn-outline-dark`, etc.

### FAQ/Accordion Pattern
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

---

## Implementation: Animator Component

### Setup
```tsx
"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

// Animation constants
const D = { fast: 0.3, normal: 0.5, slow: 0.8, hero: 1.0 };
const E = {
    smooth: "power2.out",
    bounce: "back.out(1.7)",
    elastic: "elastic.out(1, 0.4)",
};
const S = { tight: 0.06, normal: 0.1, loose: 0.15 };

interface PageAnimatorProps {
    children: ReactNode;
}

export function PageAnimator({ children }: PageAnimatorProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        if (!containerRef.current) return;

        // Prefers-reduced-motion support
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(containerRef.current.querySelectorAll("[class*='opacity-0']"), { opacity: 1 });
            return;
        }

        const $ = (sel: string) => containerRef.current!.querySelectorAll(sel);
        const $1 = (sel: string) => containerRef.current!.querySelector(sel);

        // Animations here...

    }, { scope: containerRef });

    return <div ref={containerRef}>{children}</div>;
}
```

### Animation Checklist
- [ ] Memphis shapes entrance
  - [ ] `fromTo` with `opacity: 0, scale: 0, rotation: -180`
  - [ ] To: `opacity: 0.3-0.35, scale: 1, rotation: 0`
  - [ ] Duration: `D.slow` or `D.hero`
  - [ ] Ease: `E.elastic`
  - [ ] Stagger: `{ each: S.tight, from: "random" }`
- [ ] Memphis shapes float (continuous)
  - [ ] Small y/x translations (3-8px)
  - [ ] Rotation (±3-6deg)
  - [ ] Duration: 3-5 seconds
  - [ ] Ease: `sine.inOut`
  - [ ] `repeat: -1, yoyo: true`
- [ ] Hero timeline
  - [ ] Badge → Headline → Subtext → (Optional stat)
  - [ ] Overlap with `"-=0.3"`, `"-=0.4"`
  - [ ] Bounce for badge/stat, smooth for text
- [ ] Section reveals (ScrollTrigger)
  - [ ] `fromTo` with `opacity: 0, y: 30`
  - [ ] `scrollTrigger: { trigger, start: "top 80%" }`
  - [ ] Stagger for grids
- [ ] Null checks before animating
  - [ ] Always check `if (element) { ... }` before GSAP calls
  - [ ] Prevents errors from conditional rendering

### Hero Animation Template
```tsx
// Memphis shapes entrance
gsap.fromTo($(".memphis-shape"),
  { opacity: 0, scale: 0, rotation: -180 },
  {
    opacity: 0.35, scale: 1, rotation: 0,
    duration: D.slow, ease: E.elastic,
    stagger: { each: S.tight, from: "random" },
    delay: 0.2,
  }
);

// Continuous float
$(".memphis-shape").forEach((shape, i) => {
  gsap.to(shape, {
    y: `+=${6 + (i % 3) * 3}`,
    x: `+=${3 + (i % 2) * 4}`,
    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (3 + i * 1.5)}`,
    duration: 3 + i * 0.4,
    ease: "sine.inOut",
    repeat: -1, yoyo: true,
  });
});

// Hero content timeline
const heroTl = gsap.timeline({ defaults: { ease: E.smooth } });

const heroBadge = $1(".hero-badge");
if (heroBadge) {
  heroTl.fromTo(heroBadge,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: D.normal, ease: E.bounce }
  );
}

const heroHeadline = $1(".hero-headline");
if (heroHeadline) {
  heroTl.fromTo(heroHeadline,
    { opacity: 0, y: 50, skewY: 2 },
    { opacity: 1, y: 0, skewY: 0, duration: D.hero },
    "-=0.3"
  );
}

const heroSubtext = $1(".hero-subtext");
if (heroSubtext) {
  heroTl.fromTo(heroSubtext,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: D.normal },
    "-=0.4"
  );
}
```

### Section Reveal Template
```tsx
gsap.fromTo($(".section-card"),
  { opacity: 0, y: 30 },
  {
    opacity: 1, y: 0,
    duration: D.normal,
    ease: E.smooth,
    stagger: { each: S.normal, from: "start" },
    scrollTrigger: {
      trigger: $1(".section-container"),
      start: "top 80%",
    },
  }
);
```

---

## Memphis Design Validation

### Typography ✅
- [ ] All headings: `font-black uppercase`
- [ ] Large headings: `tracking-tight`
- [ ] Small labels: `tracking-wide` or `tracking-[0.2em]`
- [ ] No sentence case headings
- [ ] Responsive sizing: `text-xl md:text-2xl lg:text-3xl`

### Colors ✅
- [ ] Memphis palette only: coral/teal/yellow/purple/dark/cream
- [ ] NO hex colors in JSX (`#FF6B6B` ❌)
- [ ] NO inline styles for colors (`style={{ color: "#..." }}` ❌)
- [ ] Tailwind classes only: `bg-coral`, `text-teal`, `border-yellow`
- [ ] Text on yellow: always `text-dark` (not white)

### Borders ✅
- [ ] Border-4 everywhere (except inputs: border-2)
- [ ] NO border-3, border-5, or other widths
- [ ] Sharp corners (no `rounded-lg`, `rounded-xl`)
- [ ] Circles only: `rounded-full`
- [ ] Corner accent blocks on cards

### Layout ✅
- [ ] Section padding: `py-16` or `py-20`
- [ ] Container: `container mx-auto px-4`
- [ ] Max width: `max-w-6xl` or `max-w-7xl`
- [ ] Grid gaps: `gap-4`, `gap-6`
- [ ] No fractional gaps: `gap-3.5` ❌

### Icons ✅
- [ ] Always duotone: `fa-duotone fa-regular`
- [ ] Memphis color class: `text-coral`, `text-teal`, etc.
- [ ] Semantic choices (fa-check-circle, fa-user-plus, etc.)

### Animations ✅
- [ ] GSAP for entrance effects (not CSS transitions)
- [ ] ScrollTrigger for section reveals
- [ ] Prefers-reduced-motion fallback
- [ ] All animated elements start `opacity-0`
- [ ] Stagger for lists/grids
- [ ] Elastic/bounce easings for playful feel

### Accessibility ✅
- [ ] Semantic HTML (`<section>`, `<article>`, `<nav>`)
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] Alt text on images
- [ ] Aria labels on interactive elements
- [ ] Keyboard navigation support
- [ ] Focus states visible
- [ ] Color contrast WCAG AA minimum
- [ ] Prefers-reduced-motion support

---

## Testing Checklist

### Visual
- [ ] Hero displays correctly (dark bg, shapes, content)
- [ ] All sections render with proper spacing
- [ ] Cards have corner accents
- [ ] Borders are 4px thick
- [ ] No rounded corners (except circles)
- [ ] Colors match Memphis palette
- [ ] Icons are duotone and colored

### Responsive
- [ ] Mobile (375px): Single column, readable text
- [ ] Tablet (768px): 2 columns where appropriate
- [ ] Desktop (1280px+): Full layout, max-width enforced
- [ ] Typography scales appropriately
- [ ] Grids reflow correctly

### Animation
- [ ] Memphis shapes float in and continue floating
- [ ] Hero content animates in sequence
- [ ] Sections reveal on scroll
- [ ] No animation jank or stuttering
- [ ] Reduced motion: instant visibility

### Performance
- [ ] No layout shift (CLS)
- [ ] Smooth 60fps animations
- [ ] Images optimized
- [ ] No console errors
- [ ] Fast Time to Interactive

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## Common Mistakes to Avoid

### ❌ Don't
- Use hex colors in JSX: `style={{ color: "#FF6B6B" }}`
- Use rounded corners: `rounded-lg`, `rounded-xl`
- Use border widths other than 4: `border-2`, `border-3`
- Forget corner accents on cards
- Use sentence case headings: "How it works"
- Forget to add `opacity-0` to animated elements
- Skip prefers-reduced-motion fallback
- Use CSS transitions for entrance (use GSAP)
- Forget to null-check GSAP selectors
- Use font-bold for headings (use font-black)
- Forget uppercase on headings and labels

### ✅ Do
- Use Memphis color classes: `bg-coral`, `text-teal`
- Use sharp corners: `border-4 border-dark`
- Use border-4 everywhere (inputs exception: border-2)
- Add corner accent blocks: `absolute top-0 right-0 w-16 h-16 bg-{accent}`
- Use ALL UPPERCASE: `uppercase tracking-tight`
- Start with `opacity-0` for GSAP elements
- Always add `prefers-reduced-motion` check
- Use GSAP ScrollTrigger for reveals
- Null-check before animating: `if (element) { ... }`
- Use font-black for headings: `font-black uppercase`
- Accent cycling for automatic color variety

---

## File Size Guidelines

### Client Component
- **Small page:** 200-400 lines (simple content, few sections)
- **Medium page:** 400-700 lines (multiple sections, grids, FAQs)
- **Large page:** 700-1000 lines (complex layout, many sections)
- **Very large:** 1000+ lines (landing pages, comprehensive guides)

### Animator Component
- **Reuse existing:** 0 lines (use shared animator)
- **Simple:** 150-250 lines (basic hero + section reveals)
- **Complex:** 250-400 lines (unique patterns, many sections)

### When to Extract
- **Shared animator:** If 3+ pages have similar structure
- **Component library:** If pattern repeats 5+ times
- **Helper functions:** If logic exceeds 50 lines

---

## Documentation Template

After completing a Memphis page, document it:

```markdown
# [Page Name] Memphis Implementation

**Path:** `apps/{app}/src/app/{path}/`
**Status:** ✅ Complete
**Primary Accent:** Coral/Teal/Yellow/Purple
**Date:** YYYY-MM-DD

## Features
- Feature 1
- Feature 2
- Feature 3

## Design Patterns Used
- Hero with Memphis shapes
- Section cards with corner accents
- Memphis accent cycling
- Details/summary accordion (if applicable)

## Files
- `page.tsx` (XX lines) - Server component
- `{page}-client.tsx` (XXX lines) - Client component
- `{page}-animator.tsx` (XXX lines) - GSAP animations

## Memphis Compliance
- [x] Border-4 throughout
- [x] Font-black uppercase headings
- [x] Memphis colors only
- [x] Sharp corners
- [x] GSAP animations
- [x] Prefers-reduced-motion support

## Unique Patterns
[Describe any unique patterns introduced by this page]

## Challenges Overcome
[Describe any implementation challenges and solutions]
```

---

## Quick Reference: Memphis Classes

### Colors (Backgrounds)
- `bg-coral` - Vibrant red-orange (#FF6B6B)
- `bg-teal` - Bright cyan (#4ECDC4)
- `bg-yellow` - Sunny yellow (#FFE66D)
- `bg-purple` - Soft purple (#A06CD5)
- `bg-dark` - Near-black (#2D3436)
- `bg-cream` - Off-white (#FFFEF7)

### Colors (Text)
- `text-coral`
- `text-teal`
- `text-yellow`
- `text-purple`
- `text-dark`
- `text-white`
- `text-dark/70` - 70% opacity dark
- `text-white/60` - 60% opacity white

### Colors (Borders)
- `border-coral`
- `border-teal`
- `border-yellow`
- `border-purple`
- `border-dark`
- `border-white`
- `border-dark/10` - 10% opacity dark

### Buttons
- `btn-coral` - Solid coral button (white text)
- `btn-teal` - Solid teal button (dark text)
- `btn-yellow` - Solid yellow button (dark text)
- `btn-purple` - Solid purple button (white text)
- `btn-dark` - Solid dark button (white text)
- `btn-outline-dark` - Dark border, transparent bg
- `btn-outline-white` - White border (for dark backgrounds)
- `btn-sm` / `btn-md` / `btn-lg` - Size variants

### Typography
- `font-black` - Font-weight 900
- `uppercase` - Text-transform uppercase
- `tracking-tight` - Tight letter-spacing (headings)
- `tracking-wide` - Wide letter-spacing (labels)
- `tracking-[0.2em]` - Custom tracking (badges)
- `leading-[0.95]` - Tight line-height (large headings)
- `leading-relaxed` - Comfortable line-height (body)

### Borders
- `border-4` - 4px border (standard)
- `border-2` - 2px border (inputs only)
- `rounded-full` - Circle (only allowed rounded class)

### Spacing
- `py-16` / `py-20` - Section vertical padding
- `px-4` - Container horizontal padding
- `gap-4` / `gap-6` - Grid/flex gaps
- `mb-12` / `mb-16` - Section bottom margin
- `p-6` / `p-8` - Card padding

---

## Success Criteria

A Memphis page is complete when:
- ✅ All sections render correctly
- ✅ Memphis design rules validated 100%
- ✅ GSAP animations working smoothly
- ✅ Responsive on all breakpoints
- ✅ Accessible (keyboard, screen readers, reduced motion)
- ✅ No console errors
- ✅ Performance metrics good (CLS < 0.1, LCP < 2.5s)
- ✅ Documentation created
- ✅ Peer review passed (if applicable)

---

**Use this checklist for every Memphis page to ensure consistency and quality across the entire application.**
