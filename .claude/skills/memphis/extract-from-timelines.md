# extract-from-timelines

Extract reusable components from the timelines showcase page.

## Available Components

1. **VerticalItem** - Single vertical timeline event with card, connector, and expand
2. **VerticalTimeline** - Complete vertical timeline with alternating cards
3. **HorizontalTimeline** - Horizontal milestone progress track
4. **TimelineConnector** - Center dot + vertical bar connector
5. **TimelineCard** - Event card with type badge, title, description, expand
6. **MilestoneNode** - Single horizontal milestone with icon, label, status
7. **EventTypeLegend** - Color-coded event type reference chips
8. **StatusBadge** - Inline status indicator (Complete, In Progress)

## Component Details

### VerticalItem
```tsx
// Props: { event: TimelineEvent; index: number; totalCount: number }
// TimelineEvent: { id: number; icon: string; color: string; title: string; description: string; time: string; type: string; expandable?: string }
// Features: Alternates left/right based on index, GSAP scroll-triggered slide-in (x: -40 or +40), expandable content
<div className={`flex items-start gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
  <div ref={ref} className="flex-1">
    <TimelineCard event={event} />
  </div>
  <TimelineConnector event={event} isLast={index >= totalCount - 1} />
  <div className="flex-1 hidden md:block" />
</div>
```

### VerticalTimeline
```tsx
// Props: { events: TimelineEvent[] }
<div className="space-y-0">
  {events.map((e, i) => (
    <VerticalItem key={e.id} event={e} index={i} totalCount={events.length} />
  ))}
</div>
```

### HorizontalTimeline
```tsx
// Props: { milestones: { label: string; icon: string; color: string; date: string; status?: 'complete' | 'in-progress' }[] }
// Features: GSAP staggered entrance (y:30, back.out ease), horizontal track line
<div ref={containerRef} className="relative overflow-x-auto pb-4">
  <div className="absolute top-14 left-8 right-8 h-1" style={{ background: COLORS.dark }} />
  <div className="flex gap-0 min-w-[700px]">
    {milestones.map((m) => <MilestoneNode key={m.label} milestone={m} />)}
  </div>
</div>
```

### TimelineConnector
```tsx
// Props: { event: { icon: string; color: string }; isLast: boolean }
<div className="flex flex-col items-center shrink-0">
  <div className="w-12 h-12 flex items-center justify-center"
    style={{ background: event.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
    <i className={`fa-duotone fa-solid ${event.icon} text-lg`} style={{ color: COLORS.dark }} />
  </div>
  {!isLast && <div className="w-1 h-16 md:h-12" style={{ background: COLORS.dark }} />}
</div>
```

### TimelineCard
```tsx
// Props: { event: TimelineEvent }
// Features: Type badge, title, description, optional expand/collapse with GSAP
<div style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }} className="p-5">
  <div className="flex items-center gap-2 mb-2">
    <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
      style={{ background: event.color, color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
      {event.type}
    </span>
    <span className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</span>
  </div>
  <h3 className="font-black text-base uppercase" style={{ color: COLORS.dark }}>{event.title}</h3>
  <p className="text-sm font-medium mt-1" style={{ color: COLORS.dark }}>{event.description}</p>
  {event.expandable && (
    <>
      <div ref={contentRef} style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
        <p className="text-sm font-medium mt-3 p-3"
          style={{ background: COLORS.cream, color: COLORS.dark, border: `2px solid ${COLORS.dark}30`, borderRadius: 0 }}>
          {event.expandable}
        </p>
      </div>
      <button onClick={() => setExpanded(!expanded)}
        className="mt-2 text-xs font-black uppercase tracking-wider hover:underline"
        style={{ color: COLORS.teal }}>
        {expanded ? 'Show Less' : 'Show More'}
        <i className={`fa-duotone fa-solid ${expanded ? 'fa-chevron-up' : 'fa-chevron-down'} ml-1`} />
      </button>
    </>
  )}
</div>
```

### MilestoneNode
```tsx
// Props: { milestone: { label: string; icon: string; color: string; date: string; status?: string } }
<div data-milestone className="flex-1 flex flex-col items-center text-center">
  <span className="text-xs font-bold uppercase mb-2" style={{ color: '#999' }}>{milestone.date}</span>
  <div className="w-14 h-14 flex items-center justify-center z-10"
    style={{ background: milestone.color, border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
    <i className={`fa-duotone fa-solid ${milestone.icon} text-lg`} style={{ color: COLORS.dark }} />
  </div>
  <span className="mt-3 font-black text-sm uppercase tracking-wider" style={{ color: COLORS.dark }}>
    {milestone.label}
  </span>
  {milestone.status && <StatusBadge status={milestone.status} />}
</div>
```

### EventTypeLegend
```tsx
// Props: { items: { label: string; color: string; icon: string }[] }
<div className="flex flex-wrap gap-4">
  {items.map((item) => (
    <div key={item.label} className="flex items-center gap-2 px-4 py-2"
      style={{ background: item.color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
      <i className={`fa-duotone fa-solid ${item.icon} text-sm`} />
      <span className="font-black text-xs uppercase tracking-wider">{item.label}</span>
    </div>
  ))}
</div>
```

### StatusBadge
```tsx
// Props: { status: 'complete' | 'in-progress' | string }
// Complete = teal background, In Progress = yellow background
<span className="mt-1 px-2 py-0.5 text-[10px] font-black uppercase"
  style={{ background: status === 'complete' ? COLORS.teal : COLORS.yellow,
    color: COLORS.dark, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }}>
  {status === 'complete' ? 'Complete' : 'In Progress'}
</span>
```

## Dependencies
- `VerticalItem` composes `TimelineCard` and `TimelineConnector`
- `VerticalTimeline` renders multiple `VerticalItem` components
- `HorizontalTimeline` renders multiple `MilestoneNode` components
- `MilestoneNode` uses `StatusBadge`
- `TimelineCard` uses GSAP for expand/collapse animation
- `VerticalItem` uses GSAP scroll-triggered entrance animation
- All components use the Memphis color palette `COLORS`

## Reference
Source: `apps/corporate/src/app/showcase/timelines/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
