# extract-from-pricing

Extract reusable components from the pricing showcase page.

## Available Components

1. **PricingPage** - Full pricing page layout with all sections
2. **BillingToggle** - Monthly/annual toggle switch with savings badge
3. **TierCardGrid** - 3-column grid of pricing tier cards
4. **TierCard** - Individual pricing tier with name, price, CTA, and feature list
5. **PopularBadge** - "Most Popular" floating badge for highlighted tier
6. **TierFeatureList** - List of features with colored checkmark boxes
7. **TierFeatureItem** - Single feature with check box and label
8. **TierPrice** - Price display with value, period suffix, and optional annual savings
9. **TrustIndicatorRow** - Grid of trust/compliance badges
10. **TrustIndicator** - Individual trust badge with icon and label
11. **FeatureComparisonTable** - Full feature comparison table across tiers
12. **ComparisonCell** - Table cell rendering boolean check, dash, or text value
13. **FaqAccordion** - List of FAQ items using native details/summary
14. **FaqItem** - Single collapsible FAQ with colored border and toggle icon

## Component Details

### BillingToggle
```tsx
interface BillingToggleProps {
    annual: boolean;
    onChange: (annual: boolean) => void;
    savingsPercent?: number;   // default 20
}
// flex items-center justify-center gap-4
// "Monthly" label (active white / inactive muted), toggle switch (w-14 h-8), "Annual" label
// Savings badge: px-2 py-0.5 text-[10px] font-black on C.yellow
// Toggle: border-3 with C.coral, sharp corners, sliding thumb
```

### TierCard
```tsx
interface TierCardProps {
    name: string;
    price: { monthly: number; annual: number };
    description: string;
    features: string[];
    cta: string;
    color: string;
    popular?: boolean;
    annual: boolean;
    onSelect?: () => void;
}
// border-4, borderColor: color, backgroundColor: C.white
// Popular: md:-mt-4 md:mb-4 + PopularBadge positioned -top-4
// Name: text-xl font-black uppercase tracking-wider in color
// Price: text-4xl font-black, /mo suffix; annual shows strikethrough + savings
// CTA: w-full py-3 border-3, popular=solid fill, others=outline
// Features: space-y-3, each with w-5 h-5 colored check box
```

### TierPrice
```tsx
interface TierPriceProps {
    monthly: number;
    annual: number;
    showAnnual: boolean;
    color?: string;   // for savings text, default C.teal
}
// Price value: text-4xl font-black
// Period: text-sm font-bold, opacity: 0.4
// Annual savings: strikethrough old price + Save $X/yr text in C.teal
// Free tier ($0): no /mo suffix shown
```

### TierFeatureItem
```tsx
interface TierFeatureItemProps {
    feature: string;
    color: string;
}
// flex items-start gap-2
// Check box: w-5 h-5 flex-shrink-0, backgroundColor: color
// Check icon: fa-solid fa-check text-[8px] in white (or dark for yellow)
// Label: text-xs font-semibold, opacity: 0.7
```

### TrustIndicator
```tsx
interface TrustIndicatorProps {
    icon: string;
    label: string;
    color: string;
}
// border-3 p-4 text-center, borderColor: color, bg: rgba(255,255,255,0.03)
// Icon: text-lg mb-2 block in color
// Label: text-xs font-black uppercase tracking-wider in white
```

### FeatureComparisonTable
```tsx
interface ComparisonRow {
    feature: string;
    free: boolean | string;
    pro: boolean | string;
    enterprise: boolean | string;
}
interface FeatureComparisonTableProps {
    rows: ComparisonRow[];
    tierColors?: { free: string; pro: string; enterprise: string };
}
// border-4 overflow-hidden, borderColor: C.dark, backgroundColor: C.white
// Header: dark bg, tier names colored (free=muted, pro=C.coral, enterprise=C.purple)
// Body rows: border-b-2
// true -> green check box (w-5 h-5, C.teal), false -> "--" text, string -> text value
```

### ComparisonCell
```tsx
interface ComparisonCellProps {
    value: boolean | string;
}
// true: w-5 h-5 mx-auto with backgroundColor: C.teal + check icon
// false: text-xs, opacity: 0.2, displays "--"
// string: text-xs font-bold in C.dark
```

### FaqItem
```tsx
interface FaqItemProps {
    question: string;
    answer: string;
    color: string;
}
// border-4, borderColor: color
// <details className="group">
// Summary: p-5, text-sm font-bold uppercase tracking-wide, color: C.white
// Toggle: w-7 h-7 colored square with "+" that rotates 45deg on open
// Content: px-5 pb-5, backgroundColor: C.white
// Answer: text-sm leading-relaxed, opacity: 0.7
```

### FaqAccordion
```tsx
interface FaqAccordionProps {
    items: { question: string; answer: string }[];
    colors?: string[];   // cycling colors, default [C.coral, C.teal, C.yellow, C.purple]
}
// space-y-4
// Each item gets next color from the cycle array
```

### PopularBadge
```tsx
interface PopularBadgeProps {
    label?: string;     // default "Most Popular"
    color: string;
}
// absolute -top-4 left-1/2 -translate-x-1/2
// px-4 py-1 text-xs font-black uppercase tracking-wider
// backgroundColor: color, color: C.white
// Star icon prefix
```

## Dependencies
- **PricingPage** composes: BillingToggle, TierCardGrid, TrustIndicatorRow, FeatureComparisonTable, FaqAccordion
- **TierCardGrid** composes: TierCard
- **TierCard** composes: PopularBadge (conditional), TierPrice, TierFeatureList
- **TierFeatureList** composes: TierFeatureItem
- **TrustIndicatorRow** composes: TrustIndicator
- **FeatureComparisonTable** composes: ComparisonCell
- **FaqAccordion** composes: FaqItem
- **BillingToggle** is self-contained (uses Memphis toggle pattern)

## Reference
Source: `apps/corporate/src/app/showcase/pricing/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
