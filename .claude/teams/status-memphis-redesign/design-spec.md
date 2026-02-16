# Memphis Status Page Design Specification

**Project**: Memphis Redesign of Status Pages (Portal, Candidate, Corporate)
**Reference**: `apps/corporate/src/app/showcase/articles/six/page.tsx` (primary), `dashboards/six` (secondary)
**Created**: 2026-02-16
**Status**: Draft for Review

---

## Design Philosophy

The Memphis status page is NOT a traditional "status dashboard." It's a **bold, confident declaration** that combines real-time system health data with Memphis design's signature visual punch.

### Core Principles
1. **Status as storytelling** - Don't just show green/red dots. Tell the user what's happening and why it matters.
2. **Visual hierarchy through color** - Status states use Memphis colors (coral=degraded, teal=operational, yellow=investigating)
3. **Geometric confidence** - Memphis shapes reinforce stability and structure
4. **Real-time pulse** - Animations subtly communicate "this is live data"
5. **Brand differentiation** - Each app (Portal/Candidate/Corporate) feels distinct through color emphasis and copy

---

## Layout Architecture

### **Layout Pattern: Hero + Dual-Column**

```
┌─────────────────────────────────────────────────────────────┐
│                    HERO STATUS BANNER                        │
│  [Memphis shapes] + [System status] + [Health metrics]      │
│  Background color = current system state                     │
└─────────────────────────────────────────────────────────────┘
┌──────────────────────────────────┬──────────────────────────┐
│  MAIN COLUMN (2/3 width)         │  SIDEBAR (1/3 width)     │
│                                  │                          │
│  ┌─────────────────────────────┐│  ┌───────────────────┐  │
│  │ SERVICE STATUS GRID         ││  │ PING SUPPORT      │  │
│  │ (not a boring table!)       ││  │ Contact form      │  │
│  └─────────────────────────────┘│  └───────────────────┘  │
│                                  │                          │
│  ┌─────────────────────────────┐│  ┌───────────────────┐  │
│  │ LIVE INCIDENT FEED          ││  │ SUPPORT HOURS     │  │
│  │ (bold alert cards)          ││  │                   │  │
│  └─────────────────────────────┘│  └───────────────────┘  │
│                                  │                          │
│  ┌─────────────────────────────┐│  ┌───────────────────┐  │
│  │ PAST INCIDENTS              ││  │ QUICK LINKS       │  │
│  │ (timeline style)            ││  │                   │  │
│  └─────────────────────────────┘│  └───────────────────┘  │
└──────────────────────────────────┴──────────────────────────┘
```

**Why NOT the original 3-column card grid?**
- Memphis design favors **bold sections** over generic card grids
- Dual-column creates stronger visual hierarchy
- Sidebar pattern matches showcase patterns (dashboards/six)
- More room for bold typography and geometric shapes

---

## Section-by-Section Breakdown

### 1. Hero Status Banner

**Purpose**: Immediate, at-a-glance system health with Memphis visual impact

**Design**:
```tsx
<section className="relative min-h-[50vh] overflow-hidden flex items-center {bg-state-color}">
  {/* Memphis floating shapes - 5-7 shapes */}
  <div className="memphis-shapes absolute inset-0 pointer-events-none">
    {/* Circles, squares, triangles in accent colors */}
    {/* Animated with GSAP elastic bounce + continuous float */}
  </div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-5xl mx-auto">
      {/* Status badge */}
      <div className="hero-badge opacity-0">
        <span className="badge badge-{accent} badge-lg uppercase tracking-wider">
          Live System Status
        </span>
      </div>

      {/* Main status headline */}
      <h1 className="hero-headline opacity-0 text-5xl md:text-7xl font-black uppercase tracking-tight text-{content-color} mt-6">
        {/* e.g., "All Systems Operational" or "Investigating Degradation" */}
      </h1>

      {/* Status description */}
      <p className="hero-subtext opacity-0 text-xl md:text-2xl text-{content-color}/70 mt-4 max-w-3xl">
        {/* Bold, direct explanation of current state */}
      </p>

      {/* Health metrics bar */}
      <div className="hero-metrics opacity-0 mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* 4 metric blocks: Services Healthy, Avg Response, Uptime, Last Check */}
        <div className="metric-block p-6 bg-{content-color}/10 border-4 border-{accent}">
          <div className="text-4xl font-black">{value}</div>
          <div className="text-sm font-bold uppercase tracking-wider opacity-70">{label}</div>
        </div>
      </div>
    </div>
  </div>
</section>
```

**State Colors** (background):
- `bg-teal` - All systems operational (content: dark)
- `bg-coral` - Service degradation detected (content: white)
- `bg-yellow` - Investigating anomalies (content: dark)
- `bg-dark` - Major outage (content: cream)

**GSAP Animations**:
1. Memphis shapes: elastic bounce in from scale 0, continuous floating
2. Badge: fade + slide down
3. Headline: fade + slide up with slight skew
4. Subtext: fade + slide up
5. Metrics: stagger fade + scale bounce

---

### 2. Service Status Grid

**Purpose**: Service-by-service health, but NOT a boring table

**Design Pattern**: **Card grid with accent color coding**

```tsx
<section className="service-status py-16 bg-cream">
  <div className="container mx-auto px-4">
    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
      {/* Main column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Section header */}
        <div className="section-header opacity-0">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-dark">
            Service <span className="text-teal">Breakdown</span>
          </h2>
          <p className="text-base text-dark/70 mt-2">
            Real-time health across all infrastructure layers
          </p>
        </div>

        {/* Service grid - NOT a table, Memphis cards */}
        <div className="service-grid opacity-0 grid md:grid-cols-2 gap-4">
          {services.map((service, idx) => (
            <div key={service.name}
              className="service-card relative p-6 bg-white border-4 border-dark">
              {/* Accent color stripe */}
              <div className="absolute top-0 right-0 w-16 h-2 bg-{accentColor}" />

              {/* Service icon + name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 flex items-center justify-center bg-{accentColor}">
                  <i className="{service.icon} text-xl text-white"></i>
                </div>
                <h3 className="font-black text-lg uppercase text-dark">
                  {service.name}
                </h3>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="badge badge-{statusColor}">{statusLabel}</span>
                <span className="text-xs text-dark/50">{responseTime}ms</span>
              </div>

              {/* Error message if unhealthy */}
              {service.error && (
                <div className="mt-3 p-3 bg-coral/10 border-2 border-coral">
                  <p className="text-sm text-dark font-bold">{service.error}</p>
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-dark/40 mt-3">
                Last check: {timestamp}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar (see below) */}
    </div>
  </div>
</section>
```

**Accent Color Cycling** (matches roles page pattern):
```ts
const accentColors = ['coral', 'teal', 'yellow', 'purple'];
const accentAt = (idx: number) => accentColors[idx % 4];
```

**Status Badge Colors**:
- `badge-teal` - Operational
- `badge-coral` - Unhealthy
- `badge-yellow` - Degraded

---

### 3. Live Incident Feed

**Purpose**: Active incidents displayed as bold alert cards (NOT a generic list)

**Design Pattern**: **Memphis alert cards with geometric accents**

```tsx
<div className="incident-feed opacity-0 mt-8">
  <h3 className="text-2xl font-black uppercase tracking-tight text-dark mb-6">
    Active <span className="text-coral">Incidents</span>
  </h3>

  {unhealthyServices.length > 0 ? (
    <div className="space-y-4">
      {unhealthyServices.map((service) => (
        <div key={service.name}
          className="incident-card relative p-6 bg-white border-4 border-coral">
          {/* Corner decoration */}
          <div className="absolute top-0 left-0 w-10 h-10 bg-coral" />

          {/* Icon + service name */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 flex items-center justify-center bg-coral/10 border-2 border-coral">
              <i className="fa-duotone fa-regular fa-triangle-exclamation text-2xl text-coral"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-black text-xl uppercase text-dark mb-2">
                {service.name}
              </h4>
              <p className="text-base text-dark/70 leading-relaxed">
                {service.error || "We're on it. Updates coming shortly."}
              </p>
              <div className="text-xs text-dark/50 mt-3">
                Detected: {timestamp}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    {/* Empty state - Memphis style */}
    <div className="empty-state relative p-10 bg-white border-4 border-teal text-center">
      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-teal/20" />
      <i className="fa-duotone fa-regular fa-circle-check text-5xl text-teal mb-4"></i>
      <p className="text-lg font-bold text-dark">No active incidents.</p>
      <p className="text-base text-dark/60 mt-2">
        All services running smooth. We'll update here if anything changes.
      </p>
    </div>
  )}
</div>
```

---

### 4. Past Incidents Timeline

**Purpose**: Historical incident log in timeline format

**Design Pattern**: **Vertical timeline with colored connectors**

```tsx
<div className="past-incidents opacity-0 mt-12">
  <h3 className="text-2xl font-black uppercase tracking-tight text-dark mb-6">
    Past <span className="text-purple">Incidents</span>
  </h3>

  <div className="timeline space-y-0">
    {pastIncidents.map((incident, idx) => (
      <div key={incident.id} className="timeline-item flex gap-6">
        {/* Timeline marker */}
        <div className="flex flex-col items-center flex-shrink-0">
          <div className="w-12 h-12 flex items-center justify-center bg-dark border-4 border-purple">
            <i className="fa-duotone fa-regular fa-check text-lg text-cream"></i>
          </div>
          {idx < pastIncidents.length - 1 && (
            <div className="w-1 flex-grow bg-purple/30 min-h-[40px]" />
          )}
        </div>

        {/* Incident content */}
        <div className="pb-8 flex-1">
          <div className="text-sm font-bold uppercase tracking-wider text-purple mb-1">
            {incident.service_name}
          </div>
          <div className="text-xs text-dark/50 mb-2">
            {startTime} - {endTime} ({duration})
          </div>
          <p className="text-base text-dark/70">
            {incident.severity === 'unhealthy' ? 'Service outage' : 'Degraded performance'}
          </p>
          <span className="badge badge-teal badge-sm mt-2">Resolved</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

### 5. Sidebar: Contact Form

**Purpose**: Let users report issues in Memphis style

**Design**: **Memphis form with bold labels and 4px borders**

```tsx
<aside className="space-y-6">
  <div className="card relative p-8 bg-white">
    {/* Corner decoration */}
    <div className="absolute top-0 right-0 w-16 h-3 bg-coral" />

    <h2 className="text-2xl font-black uppercase tracking-tight text-dark mb-2">
      Ping <span className="text-coral">Support</span>
    </h2>
    <p className="text-base text-dark/70 mb-6">
      {/* Memphis copy: direct, no fluff */}
      Hit us up if something's broken. We're on it.
    </p>

    <form className="space-y-4">
      <fieldset className="fieldset">
        <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider text-dark">
          Full Name
        </legend>
        <input className="input w-full" placeholder="Casey Operations" />
      </fieldset>

      <fieldset className="fieldset">
        <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider text-dark">
          Email
        </legend>
        <input className="input w-full" type="email" placeholder="you@company.com" />
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <fieldset className="fieldset">
          <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider text-dark">
            Topic
          </legend>
          <select className="select w-full">
            <option>Support</option>
            <option>Automation</option>
            <option>AI Review</option>
          </select>
        </fieldset>

        <fieldset className="fieldset">
          <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider text-dark">
            Urgency
          </legend>
          <select className="select w-full">
            <option>Normal</option>
            <option>High</option>
            <option>Low</option>
          </select>
        </fieldset>
      </div>

      <fieldset className="fieldset">
        <legend className="fieldset-legend font-bold uppercase text-sm tracking-wider text-dark">
          Message
        </legend>
        <textarea className="textarea w-full h-24"
          placeholder="What's happening? Include affected teams and timelines." />
      </fieldset>

      <button className="btn btn-coral btn-md w-full uppercase tracking-wider">
        Send Update
      </button>
    </form>
  </div>

  {/* Support hours card */}
  <div className="card p-6 bg-cream border-4 border-teal">
    <h3 className="font-black text-lg uppercase tracking-tight text-dark mb-3">
      <i className="fa-duotone fa-regular fa-clock text-teal mr-2"></i>
      Support Hours
    </h3>
    <ul className="text-base text-dark/70 space-y-1">
      <li>Weekdays: 8am - 8pm ET</li>
      <li>Weekends: On-call for Sev 1</li>
    </ul>
  </div>

  {/* Quick links card */}
  <div className="card p-6 bg-white border-4 border-purple">
    <h3 className="font-black text-lg uppercase tracking-tight text-dark mb-3">
      <i className="fa-duotone fa-regular fa-circle-info text-purple mr-2"></i>
      Quick Links
    </h3>
    <ul className="text-base text-dark/70 space-y-2">
      <li className="flex items-center gap-2">
        <span className="w-2 h-2 bg-purple"></span>
        <a href="#" className="hover:text-purple">Release notes</a>
      </li>
      <li className="flex items-center gap-2">
        <span className="w-2 h-2 bg-purple"></span>
        <a href="#" className="hover:text-purple">Incident SLA</a>
      </li>
      <li className="flex items-center gap-2">
        <span className="w-2 h-2 bg-purple"></span>
        <a href="#" className="hover:text-purple">Subscribe to RSS</a>
      </li>
    </ul>
  </div>
</aside>
```

---

## GSAP Animation Strategy

**Animator Component**: `status-memphis-animator.tsx` (pattern from articles/six)

### Animation Timeline

**1. Page Load (Hero Section)**
```ts
// Memphis shapes - elastic bounce in, then continuous float
gsap.fromTo($(".memphis-shape"),
  { opacity: 0, scale: 0, rotation: -180 },
  { opacity: 0.4, scale: 1, rotation: 0, duration: 0.8, ease: "elastic.out(1, 0.4)",
    stagger: { each: 0.06, from: "random" }, delay: 0.2 }
);

// Continuous floating animation
$(".memphis-shape").forEach((shape, i) => {
  gsap.to(shape, {
    y: `+=${8 + (i % 3) * 4}`, x: `+=${4 + (i % 2) * 6}`,
    rotation: `+=${(i % 2 === 0 ? 1 : -1) * (4 + i * 2)}`,
    duration: 3 + i * 0.4, ease: "sine.inOut", repeat: -1, yoyo: true
  });
});

// Hero content timeline
const heroTl = gsap.timeline({ defaults: { ease: "power2.out" } });
heroTl.fromTo($1(".hero-badge"), { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5 });
heroTl.fromTo($1(".hero-headline"), { opacity: 0, y: 60, skewY: 2 }, { opacity: 1, y: 0, skewY: 0, duration: 1.0 }, "-=0.3");
heroTl.fromTo($1(".hero-subtext"), { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.4");
heroTl.fromTo($(".hero-metrics .metric-block"),
  { opacity: 0, scale: 0.8 },
  { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.1 },
  "-=0.2"
);
```

**2. Scroll-Triggered (Service Grid, Incidents)**
```ts
// Service grid - stagger card entrances
gsap.fromTo($(".service-card"),
  { opacity: 0, y: 40, scale: 0.9 },
  { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.7)", stagger: 0.1,
    scrollTrigger: { trigger: $1(".service-grid"), start: "top 80%" }
  }
);

// Incident cards - slide in from left
gsap.fromTo($(".incident-card"),
  { opacity: 0, x: -40 },
  { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: 0.15,
    scrollTrigger: { trigger: $1(".incident-feed"), start: "top 80%" }
  }
);

// Timeline items - cascade down
gsap.fromTo($(".timeline-item"),
  { opacity: 0, x: -30 },
  { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", stagger: 0.1,
    scrollTrigger: { trigger: $1(".past-incidents"), start: "top 80%" }
  }
);
```

**3. Status Transitions (Live Updates)**

When status changes (healthy → degraded), animate the hero banner background color transition:
```ts
// Status change animation
const changeStatusColor = (newColor: string) => {
  gsap.to(".hero-banner", {
    backgroundColor: newColor,
    duration: 0.8,
    ease: "power2.inOut"
  });

  // Pulse effect on hero content
  gsap.fromTo(".hero-headline",
    { scale: 1 },
    { scale: 1.02, duration: 0.3, ease: "back.out(2)", yoyo: true, repeat: 1 }
  );
};
```

---

## Color Strategy by App

### Portal (Splits Network)
- **Primary accent**: Coral
- **Hero state colors**: Same as base (teal=healthy, coral=degraded, yellow=investigating)
- **Service card accents**: Cycle through all 4 (coral, teal, yellow, purple)
- **Copy tone**: Direct, professional, recruiter-focused

### Candidate (Applicant Network)
- **Primary accent**: Teal
- **Hero state colors**: Same as base
- **Service card accents**: Emphasize teal and yellow (friendlier colors)
- **Copy tone**: Reassuring, clear, candidate-focused

### Corporate (Employment Networks)
- **Primary accent**: Purple
- **Hero state colors**: Same as base
- **Service card accents**: Emphasize purple and dark (enterprise feel)
- **Copy tone**: Confident, enterprise-appropriate

---

## Responsive Breakpoints

- **Mobile (< 768px)**: Single column, hero metrics stack 2x2, sidebar below main
- **Tablet (768px - 1024px)**: Hero metrics 4 across, service grid 2 columns, sidebar below main
- **Desktop (> 1024px)**: Full dual-column layout, service grid 2 columns, sidebar fixed

---

## Memphis Compliance Checklist

- [ ] ZERO shadows (no shadow-, drop-shadow)
- [ ] ZERO rounded corners (except perfect circles for dots)
- [ ] 4px borders on all containers (cards, modals, sections)
- [ ] Memphis palette ONLY (coral, teal, yellow, purple, dark, cream)
- [ ] Tailwind classes ONLY (no inline hex colors in JSX)
- [ ] Geometric decorations in hero and incident cards
- [ ] Bold, uppercase typography for headlines
- [ ] text-base for body copy (NEVER text-sm or text-xs for main content)
- [ ] GSAP animations for entrances
- [ ] Memphis plugin classes (btn, badge, input, card) used first

---

## Implementation Files

### Portal
```
apps/portal/src/app/public/status-memphis/
├── page.tsx                       # Server component (fetches health data)
├── status-memphis-client.tsx      # Client component (state, auto-refresh, form)
└── status-memphis-animator.tsx    # GSAP animations
```

### Candidate
```
apps/candidate/src/app/public/status-memphis/
├── page.tsx
├── status-memphis-client.tsx
└── status-memphis-animator.tsx
```

### Corporate
```
apps/corporate/src/app/status-memphis/
├── page.tsx
├── status-memphis-client.tsx
└── status-memphis-animator.tsx
```

---

## Copy Guidelines (Delegate to memphis-copy)

See companion document: `copy-spec.md`

Key principles:
- Headlines: UPPERCASE, bold, max 10 words
- Status messages: Direct ("We're on it" not "Investigating anomalies")
- Empty states: Acknowledge + action ("No incidents. All good.")
- Form labels: Clear, concise, uppercase for fieldset legends
- Brand voice: Portal=professional, Candidate=reassuring, Corporate=confident

---

## Next Steps

1. **Review this spec** - User approval on design direction
2. **Create copy spec** - memphis-copy writes all user-facing text
3. **Implement portal** - Build first implementation as template
4. **Adapt for candidate** - Adjust colors and copy
5. **Adapt for corporate** - Adjust colors and copy
6. **Document** - Create rollout and maintenance docs

---

**Notes**:
- This spec assumes the existing `/api/v2/system-health` endpoint structure
- Auto-refresh logic (30s polling) carries over from original
- Form submission to `/api/v2/status-contact` endpoint remains unchanged
- This is a PARALLEL implementation - originals remain untouched
