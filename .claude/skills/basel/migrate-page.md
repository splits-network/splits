# migrate-page

Migrate a single page to Basel (Designer One) design system. This is a **consolidated skill** that handles ALL page types by dynamically selecting the appropriate Designer One showcase reference.

## Usage

This skill is invoked by `basel-orchestrator` or `basel-designer` to migrate individual pages of any type.

## Showcase Reference Lookup

Automatically match the target page to the correct Designer One showcase reference based on page PURPOSE:

| Page Purpose | Showcase Reference |
|-------------|-------------------|
| Navigation/header | `showcase/headers/one/page.tsx` |
| Footer | `showcase/footers/one/page.tsx` |
| Landing/hero | `showcase/landing/one/page.tsx` |
| Card layouts | `showcase/cards/one/page.tsx` |
| Dashboard/analytics | `showcase/dashboards/one/page.tsx` |
| Data tables/lists | `showcase/tables/one/page.tsx` |
| Forms/inputs | `showcase/forms/one/page.tsx` |
| Detail views | `showcase/details/one/page.tsx` |
| Pricing pages | `showcase/pricing/one/page.tsx` |
| Modal dialogs | `showcase/modals/one/page.tsx` |
| User profiles | `showcase/profiles/one/page.tsx` |
| Settings pages | `showcase/settings/one/page.tsx` |
| Notifications | `showcase/notifications-ui/one/page.tsx` |
| Tab layouts | `showcase/tabs/one/page.tsx` |
| Testimonials/reviews | `showcase/testimonials/one/page.tsx` |
| FAQ/help | `showcase/faqs/one/page.tsx` |
| Timelines/activity | `showcase/timelines/one/page.tsx` |
| Calendar/scheduling | `showcase/calendars/one/page.tsx` |
| Articles/content | `showcase/articles/one/page.tsx` |
| Auth pages | `showcase/landing/one/page.tsx` (editorial auth) |
| Search/browse | `showcase/tables/one/page.tsx` + `showcase/cards/one/page.tsx` |
| Messaging/chat | `showcase/notifications-ui/one/page.tsx` |
| Onboarding/steps | `showcase/forms/one/page.tsx` + `showcase/timelines/one/page.tsx` |
| Empty states | `showcase/cards/one/page.tsx` (minimal card pattern) |

For complex pages (e.g., a dashboard with tables AND cards), reference MULTIPLE showcase pages.

## Process

1. **Analyze Target**
   - Read target page file
   - Extract DATA LAYER ONLY: API calls, data fetching hooks, event handlers, route params, auth checks, types
   - IGNORE: Layout, component structure, UI patterns, styling

2. **Find Reference**
   - Match to Designer One showcase page(s) using the lookup table above
   - Read showcase page(s) to extract Basel design patterns
   - For complex pages, reference 2-3 showcase pages

3. **Create Parallel Page**
   - Create `{feature}-basel/page.tsx` (NEVER modify original)
   - Design FROM SCRATCH using showcase patterns
   - Wire up the extracted data layer

4. **Apply Basel Transformations**

   ### DaisyUI Components First
   ```tsx
   // Use DaisyUI class-based components
   <button className="btn btn-primary">Action</button>
   <div className="card card-bordered bg-base-100"><div className="card-body">...</div></div>
   <input className="input input-bordered input-primary" />
   <div className="badge badge-secondary">Status</div>
   <div className="tabs tabs-bordered">...</div>
   ```

   ### Editorial Layout
   ```tsx
   // Asymmetric grid
   <div className="grid grid-cols-5 gap-8">
     <div className="col-span-3">Main content</div>
     <div className="col-span-2">Sidebar</div>
   </div>
   ```

   ### Typography Hierarchy
   ```tsx
   // Kicker + heading pattern
   <div className="border-l-4 border-primary pl-4">
     <span className="text-sm uppercase tracking-[0.2em] text-primary font-medium">Section</span>
     <h2 className="text-4xl font-black tracking-tight text-base-content">Heading</h2>
   </div>
   ```

   ### Cards with Border-Left Accent
   ```tsx
   <div className="card card-bordered bg-base-100 border-l-4 border-primary shadow-sm">
     <div className="card-body">...</div>
   </div>
   ```

   ### Sharp Corners
   ```tsx
   // Override DaisyUI rounded defaults where needed
   // Basel: border-radius 0 on all structural elements
   ```

   ### Frosted Glass Header
   ```tsx
   <header className="sticky top-0 z-50 backdrop-blur-md bg-base-100/90 border-b border-base-300">
   ```

   ### Clip-Path Hero
   ```tsx
   <section className="bg-primary text-primary-content py-24"
     style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}>
   ```

5. **Validate**
   - DaisyUI semantic colors only (no Memphis, no raw Tailwind palette, no hex)
   - Sharp corners (no rounded-*)
   - No gradients
   - No geometric decorations
   - Editorial layout present
   - Typography hierarchy present
   - Functionality preserved
   - Accessibility maintained

6. **Save**
   - Write migrated file
   - Update build progress
   - Save checkpoint

## Quality Checklist

- [ ] DaisyUI semantic colors only (primary, secondary, accent, neutral, base-*, etc.)
- [ ] No Memphis colors (coral, teal, cream, dark, yellow, purple)
- [ ] No raw Tailwind palette (red-500, blue-600, etc.)
- [ ] No hardcoded hex values
- [ ] No Memphis UI imports
- [ ] Sharp corners on all elements (no rounded-*)
- [ ] No gradients
- [ ] No geometric decorations (floating shapes)
- [ ] Subtle shadows only (shadow-sm, shadow-md max)
- [ ] Editorial layout with asymmetric grids
- [ ] Typography hierarchy (kicker + heading pattern)
- [ ] Border-left accents on cards/sections
- [ ] DaisyUI component classes used before raw Tailwind
- [ ] Functionality preserved from original
- [ ] Accessibility maintained
- [ ] Build progress updated

## Output

Report migration result:
```
Page migrated: apps/portal/src/app/dashboard-basel/page.tsx
- Showcase reference: dashboards/one
- DaisyUI components used: card, btn, badge, tabs, table
- Color system: DaisyUI semantic tokens (100% compliant)
- Layout: Asymmetric 3+2 grid with editorial sidebar
- Typography: Kicker + heading hierarchy applied
- Accents: border-l-4 border-primary on 4 cards
- Basel compliance: 100%
```
