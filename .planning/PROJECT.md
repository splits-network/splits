# Pricing Page Redesign

## What This Is

Redesign the portal's public pricing page to match the updated landing page design, and add an interactive RTI (Return on Investment) calculator that shows recruiters exactly how upgrading their subscription tier increases their payout on placements.

## Core Value

Recruiters see concrete dollar amounts showing how upgrading pays for itself with a single placement.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Pricing page visual design matches landing page (GSAP animations, scroll triggers, same component patterns)
- [ ] RTI calculator lets recruiters input placement fee amount (or salary + fee %)
- [ ] RTI calculator lets recruiters select their role(s) in a deal (multi-select: Candidate Recruiter, Job Owner, Company Recruiter, Candidate Sourcer, Company Sourcer)
- [ ] Calculator shows side-by-side payout comparison across all three tiers (Free, Paid $99, Premium $249)
- [ ] Calculator highlights the upgrade value (difference in dollars between tiers)
- [ ] Animated number counters for payout amounts (matching landing page style)
- [ ] Mobile-responsive calculator interface

### Out of Scope

- [ ] Backend changes — calculator is purely frontend, uses hardcoded commission rates
- [ ] Stripe integration changes — this is just the pricing display page
- [ ] Authentication — this is a public page

## Context

**Existing codebase:**
- Landing page at `apps/portal/src/app/page.tsx` with GSAP animations
- Current pricing page at `apps/portal/src/app/public/pricing/page.tsx` — static, no animations
- Landing sections use shared animation utilities from `components/landing/shared/animation-utils.ts`
- DaisyUI theme with semantic colors (primary, secondary, accent)

**Commission structure (from docs/flows/):**

| Role | Premium ($249) | Paid ($99) | Free ($0) |
|------|----------------|------------|----------|
| Candidate Recruiter | 40% | 30% | 20% |
| Job Owner | 20% | 15% | 10% |
| Company Recruiter | 20% | 15% | 10% |
| Candidate Sourcer | 10% | 8% | 6% |
| Company Sourcer | 10% | 8% | 6% |
| **Platform Take** | **0%** | **24%** | **48%** |

Recruiters can hold multiple roles in a single deal (e.g., Candidate Recruiter + Candidate Sourcer).

## Constraints

- **Tech stack**: Next.js 16, React 19, GSAP, DaisyUI — must use existing patterns
- **Design language**: Must match landing page animations and visual style
- **Public page**: No authentication required, SEO-friendly

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Frontend-only calculator | Commission rates are fixed, no need for API calls | — Pending |
| Multi-role selection | Recruiters often hold multiple roles in a deal | — Pending |

---
*Last updated: 2026-01-31 after initialization*
