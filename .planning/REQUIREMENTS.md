# Requirements: Pricing Page Redesign

**Defined:** 2026-01-31
**Core Value:** Recruiters see concrete dollar amounts showing how upgrading pays for itself with a single placement.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Visual Redesign

- [x] **VIS-01**: Pricing page uses GSAP scroll-triggered animations (fade, scale, stagger)
- [ ] **VIS-02**: Hero section matches landing page style (video bg or gradient, animated headline)
- [ ] **VIS-03**: Pricing cards animate on scroll (scale in, stagger reveal)
- [ ] **VIS-04**: Animated number counters for prices and payout examples
- [ ] **VIS-05**: Feature comparison table has scroll-triggered row reveals

### RTI Calculator

- [ ] **CALC-01**: Input field for placement fee amount (with optional salary + fee % mode)
- [ ] **CALC-02**: Multi-select for recruiter roles (Candidate Recruiter, Job Owner, Company Recruiter, Candidate Sourcer, Company Sourcer)
- [ ] **CALC-03**: Side-by-side payout display for all three tiers (Free, Paid, Premium)
- [ ] **CALC-04**: Animated counters that update when inputs change
- [ ] **CALC-05**: Highlight upgrade value (show dollar difference between tiers)
- [ ] **CALC-06**: Mobile-responsive layout (stacked on small screens)

### Integration

- [ ] **INT-01**: Calculator component is reusable (could be embedded elsewhere)
- [x] **INT-02**: Uses existing animation utilities from landing page

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Calculator

- **CALC-07**: Preset scenario buttons (e.g., "I'm a closer", "I sourced and closed")
- **CALC-08**: Annual savings view (show subscription cost vs extra earnings over 12 months)
- **CALC-09**: Share calculator results via URL parameters

### Additional Animations

- **VIS-06**: Particle or confetti effect on "Get Started" hover
- **VIS-07**: 3D card tilt effect on pricing cards

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend API for commission rates | Rates are fixed, hardcode in frontend |
| Stripe checkout integration | Separate flow, not part of pricing page |
| A/B testing framework | Premature optimization |
| Internationalization | English-only for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 1 | Complete |
| VIS-02 | Phase 2 | Pending |
| VIS-03 | Phase 2 | Pending |
| VIS-04 | Phase 2 | Pending |
| VIS-05 | Phase 2 | Pending |
| CALC-01 | Phase 3 | Pending |
| CALC-02 | Phase 3 | Pending |
| CALC-03 | Phase 3 | Pending |
| CALC-04 | Phase 3 | Pending |
| CALC-05 | Phase 3 | Pending |
| CALC-06 | Phase 3 | Pending |
| INT-01 | Phase 3 | Pending |
| INT-02 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13/13
- Unmapped: 0

---
*Requirements defined: 2026-01-31*
*Last updated: 2026-01-31 after roadmap creation*
