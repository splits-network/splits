# Roadmap: Pricing Page Redesign

## Overview

Transform the static pricing page into an animated, interactive experience that matches the landing page design and adds an RTI calculator showing recruiters exact dollar amounts they'll earn across subscription tiers. Three phases deliver this: establish animation infrastructure, redesign visual sections with scroll-triggered animations, and build the interactive calculator with multi-role selection and animated payout comparisons.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Animation Infrastructure** - Setup GSAP integration and reusable animation patterns
- [ ] **Phase 2: Visual Redesign** - Redesign all pricing page sections with scroll-triggered animations
- [ ] **Phase 3: RTI Calculator** - Build interactive calculator with multi-role selection and payout comparison

## Phase Details

### Phase 1: Animation Infrastructure
**Goal**: Pricing page has working GSAP setup and uses landing page animation utilities
**Depends on**: Nothing (first phase)
**Requirements**: VIS-01, INT-02
**Success Criteria** (what must be TRUE):
  1. Pricing page imports and uses animation utilities from landing page shared folder
  2. GSAP and ScrollTrigger are initialized on pricing page mount
  3. At least one element on pricing page animates on scroll (proof of concept)
**Plans**: TBD

Plans:
- [ ] 01-01: TBD

### Phase 2: Visual Redesign
**Goal**: All pricing page sections match landing page design with scroll-triggered animations
**Depends on**: Phase 1
**Requirements**: VIS-02, VIS-03, VIS-04, VIS-05
**Success Criteria** (what must be TRUE):
  1. Hero section has video background or gradient with animated headline (matches landing page style)
  2. Pricing cards scale in and stagger reveal on scroll
  3. Static prices and example numbers use animated counters (count up on appear)
  4. Feature comparison table rows reveal progressively on scroll
  5. Page feels visually cohesive with landing page (same animation timing, easing, patterns)
**Plans**: TBD

Plans:
- [ ] 02-01: TBD

### Phase 3: RTI Calculator
**Goal**: Recruiters can input placement details, select roles, and see animated payout comparisons across tiers
**Depends on**: Phase 2
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, INT-01
**Success Criteria** (what must be TRUE):
  1. User can input placement fee amount OR salary + fee percentage
  2. User can select multiple recruiter roles via checkboxes or multi-select
  3. Three columns display payout amounts for Free, Paid, and Premium tiers side-by-side
  4. Payout numbers animate (count up) when inputs change
  5. Upgrade value is visually highlighted (shows dollar difference between tiers)
  6. Calculator layout adapts to mobile (stacks vertically on small screens)
  7. Calculator component is exported and reusable (could be embedded elsewhere)
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Animation Infrastructure | 0/? | Not started | - |
| 2. Visual Redesign | 0/? | Not started | - |
| 3. RTI Calculator | 0/? | Not started | - |

---
*Roadmap created: 2026-01-31*
*Last updated: 2026-01-31*
