# extract-from-footers

Extract reusable components from the footers showcase page.

## Available Components

1. **MemphisFooter** - Complete footer component with all sections
2. **NewsletterSection** - Email subscription form with headline and success state
3. **FooterLinkColumn** - Single link section with colored icon header and link list
4. **FooterLink** - Individual link with icon and hover translate effect
5. **FooterBrandBlock** - Logo with accent shapes and brand name/tagline
6. **SocialLinksRow** - Row of social media icon buttons
7. **SocialLink** - Single social media button
8. **AppStoreBadges** - App Store and Google Play download buttons
9. **FooterBottomBar** - Copyright, legal links, color dots, and status indicator
10. **StatusIndicator** - System status dot with label
11. **ColorPaletteDots** - Four small colored squares representing Memphis palette
12. **FooterShapesOverlay** - Memphis geometric decorations for footer background

## Component Details

### MemphisFooter
```tsx
// No props needed - self-contained footer component
// Contains: NewsletterSection, FooterLinkColumns, SocialLinksRow, FooterBottomBar
// Dark navy bg, Memphis shapes overlay, sections separated by border-bottom: 4px solid darkGray
```

### NewsletterSection
```tsx
interface NewsletterSectionProps {
    headline?: string;
    accentWord?: string;
    description?: string;
    onSubscribe?: (email: string) => void;
}
// Two-column grid: headline side + form side
// Bordered badge label, bold heading with accent word,
// Email input (border-[3px], dark bg) + Submit button (yellow filled),
// Success state: teal check icon box + "You're In!" message
```

### FooterLinkColumn
```tsx
interface FooterLinkColumnProps {
    title: string;
    icon: string;
    color: string;
    links: { label: string; icon: string; href?: string }[];
}
// Colored icon square (w-7 h-7) + title in accent color,
// Links list with space-y-2, each with hover:translate-x-1
```

### FooterLink
```tsx
interface FooterLinkProps {
    label: string;
    icon: string;
    sectionColor: string;
    href?: string;
}
// flex items-center gap-2, group transition-all hover:translate-x-1,
// icon in muted section color (55 opacity), text-[11px] font-bold uppercase,
// group-hover:text-white transition
```

### FooterBrandBlock
```tsx
// Square logo (w-12 h-12 border-[3px], coral bg),
// teal dot accent (absolute -top-1 -right-1),
// yellow rotated square (absolute -bottom-1 -left-1),
// "Splits Network" in white, "Recruiting, Rewired" tagline in muted
```

### SocialLink
```tsx
interface SocialLinkProps {
    icon: string; // e.g. "fa-brands fa-x-twitter"
    color: string;
    label: string;
    href?: string;
}
// w-10 h-10 border-[3px], colored border and icon,
// transition-all hover:-translate-y-1
```

### AppStoreBadges
```tsx
// Two outline buttons: App Store (purple, Apple icon) and Google Play (teal, Google Play icon)
// border-[2px], px-3.5 py-2, text-[10px] font-bold uppercase,
// hover:-translate-y-0.5
```

### FooterBottomBar
```tsx
interface FooterBottomBarProps {
    companyName?: string;
    year?: number;
    legalLinks?: string[];
    systemStatus?: "operational" | "degraded" | "down";
}
// Three-column flex layout:
// Left: copyright text + color palette dots
// Center: legal quick links (Privacy, Terms, Cookies, Security)
// Right: status indicator dot + label
// All text in tiny uppercase (text-[10px])
```

### StatusIndicator
```tsx
interface StatusIndicatorProps {
    status: "operational" | "degraded" | "down";
}
// Dot colors: operational=teal, degraded=yellow, down=coral
// w-2 h-2 rounded-full dot + text-[9px] font-bold uppercase label
```

### ColorPaletteDots
```tsx
// Four w-2 h-2 squares in coral, teal, yellow, purple
// flex items-center gap-1
// Represents the Memphis color palette
```

### FooterShapesOverlay
```tsx
// Circles (border-only and filled), rotated squares, triangle (CSS borders),
// zigzag SVG, dot grid (4x4), plus sign SVG
// All start at opacity: 0, animated in via GSAP ScrollTrigger
// Floating animation: gentle y movement + rotation, yoyo infinite
```

## Dependencies
- `MemphisFooter` composes all other footer components
- `FooterLinkColumn` renders multiple `FooterLink` components
- `SocialLinksRow` renders multiple `SocialLink` components
- `FooterBottomBar` contains `ColorPaletteDots` and `StatusIndicator`
- `FooterShapesOverlay` requires GSAP + ScrollTrigger for scroll-based reveal and floating animation
- Newsletter form manages its own `email` and `subscribed` state internally
- 4 link sections defined in `FOOTER_SECTIONS` data array
- 5 social links defined in `SOCIAL_LINKS` data array

## Reference
Source: `.claude/memphis/showcase/footers-six.tsx`
Target: `packages/memphis-ui/src/components/`
