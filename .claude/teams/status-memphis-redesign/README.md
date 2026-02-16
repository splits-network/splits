# Memphis Status Pages Redesign — Project Brief

**Status**: Design & Copy Complete — Ready for Implementation Review
**Team**: status-memphis-redesign
**Lead**: Memphis Orchestrator
**Created**: 2026-02-16

---

## 🎯 Mission

Transform the functional-but-generic status pages across all three apps (Portal, Candidate, Corporate) into **bold, memorable, distinctly Memphis** experiences that communicate system health with confidence and visual impact.

---

## ✅ Phase 1 Complete: Design & Copy Specifications

### What's Been Delivered

**1. Complete Design Specification** (`design-spec.md`)
- Full layout architecture (Hero + Dual-Column pattern)
- Section-by-section component breakdown
- GSAP animation strategy
- Memphis compliance checklist
- Responsive design breakpoints
- Color strategy for each app

**2. Complete Copy Specification** (`copy-spec.md`)
- Status state messaging for all scenarios (healthy, degraded, outage, investigating)
- Brand-differentiated copy for Portal, Candidate, and Corporate
- Form copy, support messaging, incident notifications
- Tone matrix and voice guidelines
- Typography and formatting rules

---

## 🎨 Design Highlights

### What Makes This Memphis (Not Generic Status Page)

**Current State** (all three apps):
- Generic 3-column card grid
- Standard DaisyUI components with shadows and rounded corners
- Corporate, safe messaging ("All systems operational")
- Functional but forgettable

**Memphis Vision**:
- **Hero-driven layout**: Bold status banner with floating geometric shapes and GSAP animations
- **Card grid → Accent-coded grid**: Service cards with Memphis accent stripe (coral/teal/yellow/purple cycling)
- **Alerts → Bold incident cards**: Active incidents as prominent Memphis alert boxes with corner decorations
- **Timeline → Vertical timeline**: Past incidents in timeline format with colored connectors
- **Sidebar**: Contact form, support hours, quick links in Memphis card style
- **Animations**: GSAP entrance animations (elastic bounce, scroll triggers, continuous float)

### Key Design Decisions

1. **Hero Banner Changes Color by State**
   - Teal = All operational
   - Coral = Degraded service
   - Yellow = Investigating
   - Dark = Major outage

2. **Service Grid Uses Accent Cycling** (like roles page)
   - Each service card gets a rotating accent color (coral → teal → yellow → purple)
   - 4px accent stripe on top-right corner
   - Icon badge in accent color

3. **Incidents as Bold Alerts** (NOT boring list items)
   - 4px coral border
   - Corner decoration square
   - Large icon + service name + description
   - Empty state celebrates "No incidents" with teal accents

4. **Timeline for History** (visual storytelling)
   - Vertical timeline with colored markers
   - Connecting lines between incidents
   - Resolved badge on each item

5. **GSAP Animations Throughout**
   - Memphis shapes elastic bounce in on load
   - Hero content cascades (badge → headline → subtext → metrics)
   - Scroll-triggered section entrances
   - Status transition animations for live updates

---

## ✍️ Copy Highlights

### Voice Calibration: Designer Six

**Too Corporate**:
> "We are currently investigating service anomalies and will provide updates as they become available."

**Too Casual**:
> "Oops! Something broke. We're fixing it, lol."

**Just Right (Designer Six)**:
> "We're on it. The issue is isolated. Updates in 15 minutes."

### Brand Differentiation

**Portal (Splits Network)** — Recruiter-focused:
- Direct, professional, action-oriented
- "Hit us up if something's broken. We'll loop you into the incident thread."

**Candidate (Applicant Network)** — Candidate-focused:
- Reassuring but not patronizing
- "Let us know what's not working. We'll get back to you fast."

**Corporate (Employment Networks)** — Enterprise-focused:
- Confident, SLA-aware, precise
- "Enterprise support line. Response within 2 hours for Sev 1 incidents."

### Status State Examples

**All Healthy (Teal Hero)**:
```
Portal: "ALL SYSTEMS OPERATIONAL"
"Recruiter dashboards, pipelines, automations, and AI review signals are green."

Candidate: "EVERYTHING'S RUNNING SMOOTH"
"Your profile, applications, and recruiter connections are all green."

Corporate: "FULL SYSTEM HEALTH"
"Platform infrastructure, marketplace services, and network integrations are operational."
```

**Degraded (Coral Hero)**:
```
Portal: "INVESTIGATING SERVICE DEGRADATION"
"We detected a hiccup in {service}. Core features still work — you can browse, apply, and message."

Candidate: "ONE SERVICE RUNNING SLOW"
"We spotted an issue with {service}. Your profile and applications are safe."

Corporate: "DEGRADED PERFORMANCE DETECTED"
"{service} is experiencing elevated response times. The issue is isolated."
```

---

## 📂 Project Structure

### Implementation Plan (Blocked, Awaiting Approval)

```
✅ Task #1: Design Memphis status page for portal app [COMPLETED]
✅ Task #2: Write Memphis-style copy for all three status pages [COMPLETED]

⏸️ Task #3: Implement portal status-memphis page [BLOCKED — needs #1, #2 approval]
⏸️ Task #4: Adapt Memphis design for candidate app status page [BLOCKED — needs #3]
⏸️ Task #5: Adapt Memphis design for corporate app status page [BLOCKED — needs #4]
⏸️ Task #6: Create Memphis status pages documentation [BLOCKED — needs #3, #4, #5]
```

### File Structure (When Implemented)

**Portal**:
```
apps/portal/src/app/public/status-memphis/
├── page.tsx                       # Server component (fetches /api/v2/system-health)
├── status-memphis-client.tsx      # Client component (state, auto-refresh, form)
└── status-memphis-animator.tsx    # GSAP animations
```

**Candidate** (same structure):
```
apps/candidate/src/app/public/status-memphis/
├── page.tsx
├── status-memphis-client.tsx
└── status-memphis-animator.tsx
```

**Corporate** (path differs):
```
apps/corporate/src/app/status-memphis/
├── page.tsx
├── status-memphis-client.tsx
└── status-memphis-animator.tsx
```

---

## 🔍 Design Spec Deep Dive

See [`design-spec.md`](./design-spec.md) for:
- Complete section-by-section layout breakdown
- Component-level JSX examples
- GSAP animation timeline code
- Color strategy by app
- Responsive breakpoint details
- Memphis compliance checklist

### Key Sections

1. **Hero Status Banner** — Dynamic background color, floating shapes, bold headline, 4-metric grid
2. **Service Status Grid** — Accent-coded cards (NOT table), status badges, response times
3. **Live Incident Feed** — Bold alert cards with corner decorations
4. **Past Incidents Timeline** — Vertical timeline with colored markers
5. **Sidebar** — Contact form (Memphis fieldsets), support hours, quick links

---

## 📝 Copy Spec Deep Dive

See [`copy-spec.md`](./copy-spec.md) for:
- Complete status state messaging (4 states × 3 apps = 12 variants)
- Section headlines for each app
- Form copy (labels, placeholders, buttons, success/error messages)
- Support hours and quick links copy
- Incident notification templates
- Tone matrix and voice guidelines

### Key Copy Elements

1. **Status State Headlines** — UPPERCASE, bold, direct (e.g., "ALL SYSTEMS OPERATIONAL")
2. **Status Descriptions** — 1-2 sentences, action-focused, brand-differentiated
3. **Incident Messages** — Time-specific, honest, resolute
4. **Form Copy** — Direct, no fluff ("Hit us up" vs "Please contact us")
5. **Empty States** — Celebrate success ("No incidents. All good." vs "There are currently no items to display.")

---

## 🎯 Memphis Compliance

### Design Rules (STRICT)

✅ **Required**:
- ZERO shadows (no `shadow-`, `drop-shadow`)
- ZERO rounded corners (except perfect circles)
- 4px borders on containers (`border-memphis`, `border-4`, or `card` class)
- 3px borders on interactive elements (`btn`, `badge`, `input` classes)
- Memphis palette ONLY (coral, teal, yellow, purple, dark, cream)
- Tailwind classes ONLY (NO inline hex colors in JSX)
- Geometric decorations (shapes, stripes, corner squares)
- Bold, uppercase typography for headlines
- `text-base` for body copy (NEVER `text-sm` or `text-xs` for main content)

❌ **Forbidden**:
- Hardcoded hex values (`style={{ backgroundColor: "#FF6B6B" }}`)
- Color constant objects (`const M = { coral: "#FF6B6B" }`)
- Shadows, gradients, blur effects
- Rounded corners (except `rounded-full` for dots)
- Non-Memphis colors (blue, green, gray, etc.)

### Copy Rules

✅ **Required**:
- Direct, confident voice (Designer Six)
- UPPERCASE headlines, max 5 words
- Action verbs, not passive voice
- Time-specific when possible ("15 minutes" not "soon")
- Brand-differentiated (Portal ≠ Candidate ≠ Corporate)

❌ **Forbidden**:
- Corporate jargon (synergy, leverage, ecosystem)
- Weasel words (might, could, potentially)
- Vague timeframes ("soon", "shortly")
- Generic messaging ("We apologize for the inconvenience")

---

## 🚀 Next Steps (User Decision Required)

### Option 1: Proceed with Implementation

**If you approve the design and copy**:
1. I'll update Task #3 to `in_progress` and begin implementing the portal status-memphis page
2. Implementation will follow the exact specs in `design-spec.md` and `copy-spec.md`
3. Once portal is complete, I'll adapt for candidate and corporate apps
4. Final documentation will be created after all three implementations

**Estimated timeline**:
- Portal implementation: ~2-3 hours (page.tsx + client + animator)
- Candidate adaptation: ~1 hour (copy + color adjustments)
- Corporate adaptation: ~1 hour (copy + color adjustments)
- Documentation: ~30 minutes
- **Total**: ~5 hours

---

### Option 2: Request Design Revisions

**If you want changes to the design or copy**:
- Specify what sections/elements need revision
- I'll update the specs and re-present for approval
- Implementation will wait until specs are approved

---

### Option 3: See a Mockup First

**If you want to see visual mockups before implementation**:
- I can create static HTML/CSS mockups of key sections
- This adds ~1-2 hours but provides visual preview
- Mockups would not be connected to live API data

---

## 📊 Design Comparison: Before vs After

### Current Status Page (All Apps)

**Layout**: 3-column card grid
**Components**: Generic DaisyUI cards with shadows and rounded corners
**Typography**: Mixed case, standard sizing
**Colors**: Generic (blue, green, gray)
**Animation**: None
**Copy**: Corporate, safe ("All systems operational")
**Feel**: Functional, forgettable, generic SaaS

### Memphis Status Page

**Layout**: Hero banner + dual-column (main + sidebar)
**Components**: Memphis cards with accent stripes, bold borders, geometric decorations
**Typography**: UPPERCASE headlines, bold, tight tracking
**Colors**: Memphis palette (coral, teal, yellow, purple, dark, cream)
**Animation**: GSAP (elastic bounce, scroll triggers, floating shapes)
**Copy**: Designer Six voice (direct, confident, brand-differentiated)
**Feel**: Bold, memorable, distinctly Memphis

---

## 🎨 Showcase References Used

**Primary**:
- `apps/corporate/src/app/showcase/articles/six/page.tsx` — Hero layout, GSAP animations, Memphis sections
- `apps/corporate/src/app/showcase/articles/six/article-six-animator.tsx` — Animation patterns

**Secondary**:
- `apps/corporate/src/app/showcase/dashboards/six/page.tsx` — Dual-column layout, sidebar pattern
- Memphis UI components from `packages/memphis-ui/src/react/components/`

---

## 📝 Files Delivered

1. **`design-spec.md`** (11,000+ words) — Complete design specification
2. **`copy-spec.md`** (6,000+ words) — Complete copy specification
3. **`README.md`** (this file) — Project brief and decision guide

---

## ❓ Questions for User

1. **Design Direction**: Do you approve the Hero + Dual-Column layout with Memphis accent cycling?
2. **Copy Voice**: Does the Designer Six voice (bold, direct, confident) feel right for status pages?
3. **Brand Differentiation**: Are the Portal/Candidate/Corporate tone differences clear and appropriate?
4. **Animation Level**: Is the GSAP animation strategy (floating shapes, scroll triggers) appropriate, or too much?
5. **Implementation Path**: Should I proceed directly to implementation, create mockups first, or request revisions?

---

## 🎯 What Happens Next

**Once approved**, I will:
1. Mark Task #3 as in-progress
2. Implement the portal status-memphis page (page.tsx + client + animator)
3. Test against live `/api/v2/system-health` endpoint
4. Share implementation for review
5. Adapt for candidate and corporate apps
6. Create final documentation

**Timeline**: ~5 hours total implementation time (portal first, then candidate/corporate adaptations)

---

**Ready to proceed?** Reply with:
- "Approved — proceed with implementation" (I'll start Task #3)
- "Request revisions — [specific feedback]" (I'll update specs)
- "Show mockups first" (I'll create HTML/CSS previews)

---

**Team**: status-memphis-redesign
**Contact**: team-lead@status-memphis-redesign
**Project Folder**: `.claude/teams/status-memphis-redesign/`
