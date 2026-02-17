# Memphis Marketplace Architecture Diagram

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                     MarketplaceMemphisPage                      │
│                       (Server Component)                        │
│                                                                 │
│  - Fetches initial recruiter data from API                     │
│  - Builds params from URL searchParams                         │
│  - Handles SSR and metadata                                    │
│  - Passes initialData to client component                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ props: { initialData, initialPagination }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MarketplaceMemphisClient                      │
│                      (Client Component)                         │
│                                                                 │
│  State:                                                         │
│  - viewMode: "grid" | "table"                                  │
│  - searchQuery: string                                         │
│  - selectedRecruiter: Recruiter | null                         │
│                                                                 │
│  Logic:                                                         │
│  - Client-side filtering based on searchQuery                  │
│  - View mode switching                                         │
│  - Recruiter selection handling                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ wraps children
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MarketplaceAnimator                         │
│                      (GSAP Wrapper)                             │
│                                                                 │
│  - Orchestrates entrance animations                            │
│  - Handles reduced motion preference                           │
│  - Provides containerRef scope                                 │
│                                                                 │
│  Timeline:                                                      │
│  1. Hero title (0s)                                            │
│  2. Hero subtitle (0.2s)                                       │
│  3. Search bar (0.4s)                                          │
│  4. Stats (0.6s)                                               │
│  5. Controls bar (0.8s)                                        │
│  6. Content area (1s)                                          │
│  7. Recruiter cards (1.2s, staggered)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ renders sections
                             ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│     Hero Section        │   │   Controls Bar          │
│   (bg-dark, py-24)      │   │   (sticky, border-4)    │
│                         │   │                         │
│ - Title (text-cream)    │   │ - Results count         │
│ - Subtitle              │   │ - View mode toggle      │
│ - Search bar (Input)    │   │   - Grid button         │
│ - Stats cards           │   │   - Table button        │
└─────────────────────────┘   └─────────────────────────┘

                             │
                             ▼
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   RecruiterGrid         │   │   RecruiterTable        │
│   (grid layout)         │   │   (table layout)        │
│                         │   │                         │
│ Maps filtered           │   │ - border-4 border-dark  │
│ recruiters to cards     │   │ - bg-dark header        │
└────────────┬────────────┘   │ - Accent cycling cols   │
             │                │ - Hover states          │
             │                └───────────┬─────────────┘
             │                            │
             │ renders                    │ renders
             ▼                            ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│ RecruiterCardMemphis    │   │   Table Rows            │
│ (individual card)       │   │   (inline in table)     │
│                         │   │                         │
│ Structure:              │   │ - Avatar circle         │
│ ┌─────────────────────┐ │   │ - Name + tagline        │
│ │ Header (bg-accent)  │ │   │ - Location + years      │
│ │ - Avatar circle     │ │   │ - Specialization        │
│ │ - Name (uppercase)  │ │   │ - Rating star           │
│ │ - Tagline           │ │   │ - View button           │
│ └─────────────────────┘ │   └─────────────────────────┘
│ ┌─────────────────────┐ │
│ │ Body (p-6)          │ │
│ │ - Bio snippet       │ │
│ │ - Location + exp    │ │
│ │ - Industry badges   │ │
│ │ - Reputation badge  │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Footer (p-6)        │ │
│ │ - View Profile btn  │ │
│ └─────────────────────┘ │
└────────────┬────────────┘
             │
             │ uses
             ▼
┌─────────────────────────┐
│ ReputationBadgeMemphis  │
│ (reputation display)    │
│                         │
│ - Rating star (left)    │
│ - Score number          │
│ - Placements (right)    │
│ - border-4 border-cream │
└─────────────────────────┘
```

## Detail Page Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   RecruiterDetailPage [id]                      │
│                       (Server Component)                        │
│                                                                 │
│  - Fetches recruiter by ID from API                            │
│  - Generates metadata (title, description, OG)                 │
│  - Handles 404 if recruiter not found                          │
│  - Passes recruiter to client component                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ props: { recruiter }
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  RecruiterDetailMemphis                         │
│                      (Client Component)                         │
│                                                                 │
│  GSAP Animations:                                               │
│  1. Back button (slide in from left)                           │
│  2. Hero avatar (scale up)                                     │
│  3. Hero name (fade in)                                        │
│  4. Hero tagline (fade in)                                     │
│  5. Content sections (staggered fade in)                       │
│                                                                 │
│  Layout:                                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Back Button (border-4 border-dark)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Hero Section (bg-coral, py-24)                          │   │
│  │ - Avatar (w-32 h-32, rounded-full, border-4)           │   │
│  │ - Name (text-4xl/6xl, font-black, uppercase)           │   │
│  │ - Tagline (text-xl/2xl)                                │   │
│  │ - Location + Years                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Section 1: Reputation (border-4 border-teal)           │   │
│  │ - ReputationBadgeMemphis                               │   │
│  │ - Success rate                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Section 2: About (border-4 border-mint)                │   │
│  │ - Full bio text                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Section 3: Specializations (border-4 border-coral)     │   │
│  │ - Industry badges (flex wrap)                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Section 4: Contact CTA (bg-dark)                       │   │
│  │ - Heading + description                                │   │
│  │ - Sign Up button (bg-coral)                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────┐
│   User      │
│   Browser   │
└──────┬──────┘
       │
       │ 1. Request /public/marketplace-memphis
       ▼
┌─────────────────────────┐
│   Next.js Server        │
│   (page.tsx)            │
└──────────┬──────────────┘
           │
           │ 2. Fetch from API
           ▼
┌─────────────────────────┐
│   API Client            │
│   GET /recruiters       │
└──────────┬──────────────┘
           │
           │ 3. Return data
           ▼
┌─────────────────────────┐
│   Server Component      │
│   - initialData         │
│   - initialPagination   │
└──────────┬──────────────┘
           │
           │ 4. Render with data
           ▼
┌─────────────────────────┐
│   Client Component      │
│   (hydrated in browser) │
└──────────┬──────────────┘
           │
           │ 5. User interacts
           ▼
┌─────────────────────────┐
│   Client State          │
│   - viewMode            │
│   - searchQuery         │
│   - selectedRecruiter   │
└──────────┬──────────────┘
           │
           │ 6. Client-side filtering
           ▼
┌─────────────────────────┐
│   Filtered Recruiters   │
│   (no API call)         │
└──────────┬──────────────┘
           │
           │ 7. Re-render UI
           ▼
┌─────────────────────────┐
│   Updated View          │
│   (grid or table)       │
└─────────────────────────┘
```

## Animation Timeline

```
Time (seconds)
│
0.0s  ─┬─ Hero Title (opacity 0 → 1, y 30 → 0)
      │
0.2s  ─┼─ Hero Subtitle (opacity 0 → 1, y 20 → 0)
      │
0.4s  ─┼─ Search Bar (opacity 0 → 1, y 20 → 0)
      │
0.6s  ─┼─ Stats (opacity 0 → 1, y 20 → 0, stagger 0.08s)
      │   ├─ Stat 1
      │   ├─ Stat 2
      │   └─ Stat 3
      │
0.8s  ─┼─ Controls Bar (opacity 0 → 1, y 20 → 0)
      │
1.0s  ─┼─ Content Area (opacity 0 → 1, y 30 → 0)
      │
1.2s  ─┼─ Recruiter Cards (opacity 0 → 1, y 30 → 0, stagger 0.1s)
      │   ├─ Card 1 (1.2s)
      │   ├─ Card 2 (1.3s)
      │   ├─ Card 3 (1.4s)
      │   ├─ Card 4 (1.5s)
      │   └─ ...
      │
2.0s  ─┴─ All animations complete
```

## File Dependencies

```
marketplace-memphis/
│
├── page.tsx
│   ├── imports: MarketplaceMemphisClient
│   ├── imports: apiClient (@/lib/api-client)
│   ├── imports: buildCanonical (@/lib/seo)
│   └── imports: StandardListParams, StandardListResponse (@splits-network/shared-types)
│
├── marketplace-memphis-client.tsx
│   ├── imports: MarketplaceAnimator
│   ├── imports: RecruiterGrid
│   ├── imports: RecruiterTable
│   ├── imports: SearchFiltersMemphis
│   ├── imports: Input, Button (@splits-network/memphis-ui)
│   └── imports: StandardListResponse (@splits-network/shared-types)
│
├── marketplace-animator.tsx
│   ├── imports: useGSAP (@gsap/react)
│   ├── imports: gsap
│   └── exports: MarketplaceAnimator
│
└── components/
    │
    ├── recruiter-grid.tsx
    │   ├── imports: RecruiterCardMemphis
    │   └── imports: Recruiter type (from parent)
    │
    ├── recruiter-table.tsx
    │   ├── imports: ReputationBadgeMemphis
    │   ├── imports: Link (next/link)
    │   └── imports: Recruiter type (from parent)
    │
    ├── recruiter-card-memphis.tsx
    │   ├── imports: Link (next/link)
    │   ├── imports: Badge (@splits-network/memphis-ui)
    │   ├── imports: ReputationBadgeMemphis
    │   └── imports: Recruiter type (from parent)
    │
    ├── reputation-badge-memphis.tsx
    │   └── exports: ReputationBadgeMemphis
    │
    └── search-filters-memphis.tsx
        ├── imports: Input, Select (@splits-network/memphis-ui)
        └── exports: SearchFiltersMemphis
```

## Memphis UI Package Usage

```
@splits-network/memphis-ui
├── Badge          ✅ Used in: recruiter-card-memphis.tsx
├── Button         ✅ Used in: marketplace-memphis-client.tsx, recruiter-detail-memphis.tsx
├── Input          ✅ Used in: marketplace-memphis-client.tsx, search-filters-memphis.tsx
├── Select         ⏳ Imported in: search-filters-memphis.tsx (placeholder)
└── Card           ❌ Not used (built custom cards for more control)
```

## Accent Color Cycling Logic

```
Index  →  Accent Color
─────────────────────
  0    →   coral
  1    →   teal
  2    →   mint
  3    →   coral     (0 % 3 = 0)
  4    →   teal      (1 % 3 = 1)
  5    →   mint      (2 % 3 = 2)
  6    →   coral     (3 % 3 = 0)
  7    →   teal      (4 % 3 = 1)
  8    →   mint      (5 % 3 = 2)
  ...

Formula: ACCENT_COLORS[index % ACCENT_COLORS.length]

Applied to:
- Card borders
- Card header backgrounds
- Avatar borders
- Badge colors
- Table column headers
- Detail page section borders
```

## State Management Flow

```
┌──────────────────────────────────────────────────────────────┐
│                   Component State                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  viewMode: "grid" | "table"                                 │
│    ├─ Initial: "grid"                                       │
│    ├─ Changed by: View toggle buttons                       │
│    └─ Used by: Conditional rendering (grid vs table)        │
│                                                              │
│  searchQuery: string                                        │
│    ├─ Initial: ""                                           │
│    ├─ Changed by: Search input onChange                     │
│    └─ Used by: Client-side filtering                        │
│                                                              │
│  selectedRecruiter: Recruiter | null                        │
│    ├─ Initial: null                                         │
│    ├─ Changed by: Card/row onClick                          │
│    └─ Used by: Highlight selected card/row                  │
│                                                              │
│  filteredRecruiters: Recruiter[]                            │
│    ├─ Computed: useMemo based on searchQuery               │
│    └─ Used by: Render cards/rows                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Responsive Breakpoints

```
Screen Size      Breakpoint    Grid Columns    Table Columns
──────────────────────────────────────────────────────────────
Mobile           < 768px       1               Simplified
Tablet           768-1024px    2               Medium
Desktop          > 1024px      3               Full
Large Desktop    > 1280px      3 (could be 4)  Full
```

## Performance Optimization Points

```
1. Server-Side Rendering
   - Initial data fetched on server
   - HTML sent to browser (instant first paint)
   - Client hydration happens after

2. Client-Side Filtering
   - No API calls on search
   - Instant results
   - Reduced server load

3. GSAP Scoping
   - Selectors limited to containerRef
   - No global DOM queries
   - Faster animation initialization

4. Lazy Detail Pages
   - Only load when user clicks
   - Code splitting via Next.js
   - Reduced initial bundle size

5. Conditional Rendering
   - Only render active view mode
   - Hidden components not in DOM
   - Reduced memory usage
```

## Future Architecture Enhancements

```
1. Server-Side Pagination
   ┌──────────────────┐
   │ API Client       │  ← Add page param
   │ /recruiters?     │  ← Add limit param
   │   page=2&limit=24│
   └──────────────────┘

2. Server-Side Filtering
   ┌──────────────────┐
   │ API Client       │  ← Add filter params
   │ /recruiters?     │  ← industry, rating, exp
   │   filters={...}  │
   └──────────────────┘

3. Real-Time Updates
   ┌──────────────────┐
   │ WebSocket        │  ← Subscribe to changes
   │ /recruiters      │  ← Auto-refresh data
   └──────────────────┘

4. Virtualized List
   ┌──────────────────┐
   │ react-window     │  ← Render only visible
   │ FixedSizeList    │  ← 100+ recruiters
   └──────────────────┘
```

---

This architecture provides a solid foundation for the Memphis marketplace with clear separation of concerns, efficient data flow, and room for future enhancements.