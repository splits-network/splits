# Memphis Marketplace Quick Start Guide

## 🚀 Getting Started

### 1. Start the Development Server
```bash
# From repo root
pnpm --filter @splits-network/candidate dev

# Server starts at http://localhost:3000
```

### 2. Visit the Memphis Marketplace
```
http://localhost:3000/public/marketplace-memphis
```

### 3. Test Features
- **Search**: Type in hero search bar to filter recruiters
- **View Toggle**: Switch between Grid and Table views
- **Card Interaction**: Click cards to select/deselect
- **Detail Page**: Click "View Profile" to see recruiter details
- **Back Button**: Return to marketplace from detail page

---

## 📁 File Structure

```
apps/candidate/src/app/public/marketplace-memphis/
├── page.tsx                              # Server component (SSR entry point)
├── marketplace-memphis-client.tsx        # Main client component
├── marketplace-animator.tsx              # GSAP animations
├── components/
│   ├── recruiter-grid.tsx               # Grid view layout
│   ├── recruiter-table.tsx              # Table view layout
│   ├── recruiter-card-memphis.tsx       # Individual card component
│   ├── reputation-badge-memphis.tsx     # Reputation display
│   └── search-filters-memphis.tsx       # Search/filter UI
└── [id]/
    ├── page.tsx                          # Detail page server component
    └── recruiter-detail-memphis.tsx      # Detail page client component
```

**Total**: 10 files (~49 KB)

---

## 🎨 Key Memphis Features

### 1. Bold 4px Borders
Every component uses `border-4` for sharp, geometric outlines.

### 2. Accent Color Cycling
Cards and table headers rotate through coral → teal → mint for visual variety.

### 3. GSAP Entrance Animations
Page loads with orchestrated entrance:
- Hero title (0s)
- Subtitle (0.2s)
- Search (0.4s)
- Stats (0.6s)
- Controls (0.8s)
- Content (1s)
- Cards (1.2s, staggered)

### 4. Reduced Motion Support
Automatically disables animations for users with `prefers-reduced-motion`.

### 5. Responsive Design
- Mobile: 1 column grid
- Tablet: 2 column grid
- Desktop: 3 column grid

---

## 🔧 Customization Guide

### Change Accent Colors
Edit the accent cycling array in card/table components:
```tsx
const ACCENT_COLORS = ["coral", "teal", "mint"] as const;
// Change to: ["teal", "mint", "coral"] for different order
```

### Adjust Animation Timing
Edit constants in `marketplace-animator.tsx`:
```tsx
const D = { fast: 0.3, normal: 0.6, slow: 1 };
const S = { cards: 0.1, stats: 0.08 };
```

### Modify Grid Layout
Edit grid classes in `recruiter-grid.tsx`:
```tsx
// Current: 1-col mobile, 2-col tablet, 3-col desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Change to 4 columns on extra-large screens:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
```

### Add Filter Options
Extend `search-filters-memphis.tsx`:
```tsx
<Select
    value={industryFilter}
    onChange={(e) => setIndustryFilter(e.target.value)}
    className="border-4 border-teal"
>
    <option value="all">All Industries</option>
    <option value="tech">Technology</option>
    <option value="finance">Finance</option>
</Select>
```

---

## 🐛 Troubleshooting

### Issue: Animations not playing
**Solution**: Check browser console for GSAP errors. Ensure `opacity-0` classes are present on animated elements.

### Issue: Colors not appearing
**Solution**: Verify Memphis UI package is built:
```bash
pnpm --filter @splits-network/memphis-ui build
```

### Issue: Cards not cycling colors
**Solution**: Check `ACCENT_COLORS` array is defined and `index` prop is passed to cards.

### Issue: Search not filtering
**Solution**: Verify `searchQuery` state is connected to input and filter logic.

### Issue: Detail page 404
**Solution**: Check recruiter ID is valid and API endpoint returns data.

---

## 📊 Performance Tips

### 1. Optimize GSAP Scope
Always use `{ scope: containerRef }` to limit GSAP selector queries:
```tsx
useGSAP(() => {
    const $1 = gsap.utils.selector(containerRef);
    // Animations here
}, { scope: containerRef });
```

### 2. Lazy Load Images (Future Enhancement)
If adding recruiter photos:
```tsx
import Image from "next/image";

<Image
    src={recruiter.avatar}
    alt={name}
    width={80}
    height={80}
    loading="lazy"
/>
```

### 3. Virtualize Long Lists (Future Enhancement)
For 100+ recruiters, use react-window:
```bash
pnpm add react-window
```

---

## ♿ Accessibility Checklist

- [x] Semantic HTML (header, section, article)
- [x] ARIA labels on buttons and links
- [x] Keyboard navigation support
- [x] Reduced motion support
- [x] High contrast colors (WCAG AA)
- [x] Focus visible states
- [ ] Screen reader testing (TODO)
- [ ] Tab order verification (TODO)

---

## 🧪 Testing Guide

### Manual Testing
1. **Search**: Type partial names, specialties, locations
2. **View Toggle**: Switch between grid and table
3. **Card Selection**: Click to highlight, click again to deselect
4. **Detail Navigation**: Open profile, use back button
5. **Responsive**: Test mobile, tablet, desktop breakpoints
6. **Animations**: Reload page, verify smooth entrance
7. **Reduced Motion**: Enable in OS settings, verify instant display

### Automated Testing (Future)
```tsx
// Example test with React Testing Library
import { render, screen } from '@testing-library/react';
import RecruiterCardMemphis from './recruiter-card-memphis';

test('renders recruiter name', () => {
    const recruiter = { id: '1', name: 'John Doe' };
    render(<RecruiterCardMemphis recruiter={recruiter} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

---

## 📈 Future Enhancements

### Phase 2: Filters
- [ ] Industry checkboxes
- [ ] Experience range slider
- [ ] Rating filter (4+ stars)
- [ ] Location autocomplete

### Phase 3: Split View
- [ ] Gmail-style list on left, detail on right
- [ ] Keyboard shortcuts (j/k navigation)
- [ ] Preview mode without navigation

### Phase 4: Interactions
- [ ] Favorite recruiters
- [ ] Share profile links
- [ ] Contact modal
- [ ] Recruiter comparison

### Phase 5: Analytics
- [ ] Track view mode preference
- [ ] Monitor search queries
- [ ] Profile view analytics
- [ ] Conversion funnel

---

## 🔗 Related Documentation

- [Memphis UI Package](../../packages/memphis-ui/README.md)
- [GSAP Animation Guide](./marketplace-memphis-visual-guide.md#animation-patterns)
- [Memphis Design System](./marketplace-memphis-visual-guide.md)
- [Before/After Comparison](./marketplace-before-after.md)

---

## 💡 Tips & Tricks

### Tip 1: Use Memphis UI Components
Always import from Memphis UI package for consistency:
```tsx
import { Card, Badge, Button, Input } from "@splits-network/memphis-ui";
```

### Tip 2: Follow Border Pattern
Every Memphis component needs `border-4`:
```tsx
<div className="border-4 border-dark">
    {/* Content */}
</div>
```

### Tip 3: Uppercase Headings
Memphis headings are always uppercase:
```tsx
<h1 className="font-black uppercase tracking-tight">
    Heading
</h1>
```

### Tip 4: Accent Cycling
Rotate through accent colors for variety:
```tsx
const ACCENT_COLORS = ["coral", "teal", "mint"] as const;
const accent = ACCENT_COLORS[index % ACCENT_COLORS.length];
```

### Tip 5: Animation Null Guards
Always check elements exist before animating:
```tsx
const element = $1(".selector")[0];
if (element) {
    gsap.fromTo(element, ...);
}
```

---

## 📞 Support

Issues or questions? Check:
1. **Visual Guide**: `marketplace-memphis-visual-guide.md`
2. **Implementation Summary**: `marketplace-memphis-implementation.md`
3. **Before/After**: `marketplace-before-after.md`
4. **Memphis UI Docs**: `packages/memphis-ui/README.md`

---

## ✅ Success Criteria

Your Memphis marketplace is working correctly if:

- [x] Page loads at `/public/marketplace-memphis`
- [x] Hero section displays with dark background
- [x] Search filters recruiters instantly
- [x] Grid view shows cards with 4px borders
- [x] Table view shows data in Memphis-styled table
- [x] Cards use accent color cycling
- [x] Animations play smoothly on page load
- [x] Detail pages load for each recruiter
- [x] Back button returns to marketplace
- [x] Responsive on mobile, tablet, desktop
- [x] Reduced motion disables animations

---

## 🎉 You're Ready!

The Memphis marketplace is now live and ready to showcase bold, geometric design in action. Enjoy exploring the fresh visual language!