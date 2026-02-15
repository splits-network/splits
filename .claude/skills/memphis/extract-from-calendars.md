# extract-from-calendars

Extract reusable components from the calendars showcase page.

## Available Components

1. **MonthView** - Full month grid with day cells, events, and selection
2. **WeekView** - Weekly time-grid with hourly rows
3. **DayView** - Single-day hourly schedule
4. **CalendarNavigation** - Month/year navigation with prev/next buttons
5. **ViewToggle** - Segmented control for month/week/day switching
6. **EventChip** - Small event indicator inside day cells
7. **EventDetailCard** - Expanded event card for selected date panel
8. **EventTooltip** - Hover popup with event details
9. **CalendarDayHeader** - Dark-background weekday header row
10. **CalendarLegend** - Color-coded indicator legend

## Component Details

### MonthView
```tsx
// Props: { year: number; month: number; events: CalendarEvent[]; selectedDate: string | null; onSelectDate: (d: string) => void }
// CalendarEvent: { id: number; title: string; date: string; endDate?: string; time?: string; color: string; icon: string }
// Features: GSAP cell entrance animation (scale: 0.8 -> 1), today highlight, selected state, event chips with overflow
<div>
  <CalendarDayHeader />
  <div ref={gridRef} className="grid grid-cols-7">
    {/* empty leading cells + day cells */}
  </div>
</div>
```

### WeekView
```tsx
// Props: { events: CalendarEvent[] }
// 8-column grid (time + 7 days), dark header, hourly rows, today column tinted
<div className="overflow-x-auto">
  <div className="min-w-[700px]">
    <div className="grid grid-cols-8 gap-0" style={{ background: COLORS.dark }}>
      <div className="p-3 font-black text-xs uppercase text-center" style={{ color: COLORS.teal }}>Time</div>
      {/* day headers - today in coral, others in yellow */}
    </div>
    {hours.map((h) => (
      <div key={h} className="grid grid-cols-8 gap-0" style={{ borderBottom: `1px solid ${COLORS.dark}20` }}>
        <div className="p-2 text-xs font-bold text-center"
          style={{ color: '#999', background: COLORS.cream, borderRight: `2px solid ${COLORS.dark}20` }}>
          {formattedTime}
        </div>
        {/* day cells with event chips */}
      </div>
    ))}
  </div>
</div>
```

### DayView
```tsx
// Props: { events: CalendarEvent[]; selectedDate: string | null }
// Hourly row layout with time labels and event blocks
<div>
  <h3 className="font-black text-lg uppercase mb-4" style={{ color: COLORS.dark }}>
    <i className="fa-duotone fa-solid fa-calendar-day mr-2" style={{ color: COLORS.coral }} />{dateStr}
  </h3>
  {hours.map((h) => (
    <div key={h} className="flex gap-4 p-3"
      style={{ borderBottom: `1px solid ${COLORS.dark}15`, background: hasEvents ? COLORS.yellow + '10' : 'transparent' }}>
      <span className="w-20 shrink-0 font-bold text-xs text-right" style={{ color: '#999' }}>{time}</span>
      <div className="flex-1 flex gap-2 flex-wrap">
        {hourEvents.map((ev) => (
          <div key={ev.id} className="px-3 py-2 font-bold text-sm"
            style={{ background: ev.color, color: COLORS.dark, border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}>
            <i className={`fa-duotone fa-solid ${ev.icon} mr-2`} />{ev.title}
            {ev.time && <span className="ml-2 text-xs font-black">({ev.time})</span>}
          </div>
        ))}
      </div>
    </div>
  ))}
  {/* Empty state if no events */}
</div>
```

### CalendarNavigation
```tsx
// Props: { year: number; month: number; onPrev: () => void; onNext: () => void }
<div className="flex items-center gap-3">
  <button onClick={onPrev}
    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
    style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
    <i className="fa-duotone fa-solid fa-chevron-left" />
  </button>
  <h2 className="text-2xl font-black uppercase tracking-tight" style={{ color: COLORS.dark }}>
    {MONTHS[month]} {year}
  </h2>
  <button onClick={onNext}
    className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
    style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
    <i className="fa-duotone fa-solid fa-chevron-right" />
  </button>
</div>
```

### ViewToggle
```tsx
// Props: { view: ViewMode; onChange: (v: ViewMode) => void; options?: ViewMode[] }
<div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  {options.map((v, i) => (
    <button key={v} onClick={() => onChange(v)}
      className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
      style={{
        background: view === v ? COLORS.dark : '#fff',
        color: view === v ? COLORS.yellow : COLORS.dark,
        borderRight: i < options.length - 1 ? `2px solid ${COLORS.dark}` : 'none',
        borderRadius: 0,
      }}>{v}</button>
  ))}
</div>
```

### EventChip
```tsx
// Props: { event: CalendarEvent }
<div className="px-1.5 py-0.5 text-[10px] font-bold truncate"
  style={{ background: event.color, color: COLORS.dark, borderRadius: 0 }}>
  <i className={`fa-duotone fa-solid ${event.icon} mr-1`} />{event.title}
</div>
```

### EventDetailCard
```tsx
// Props: { event: CalendarEvent }
<div className="flex items-center gap-4 p-4"
  style={{ background: '#fff', border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <div className="w-10 h-10 flex items-center justify-center shrink-0"
    style={{ background: event.color, border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}>
    <i className={`fa-duotone fa-solid ${event.icon}`} style={{ color: COLORS.dark }} />
  </div>
  <div>
    <p className="font-black text-sm uppercase" style={{ color: COLORS.dark }}>{event.title}</p>
    {event.time && <p className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</p>}
    {event.endDate && <p className="text-xs font-bold" style={{ color: COLORS.purple }}>Multi-day: {event.date} -- {event.endDate}</p>}
  </div>
</div>
```

### EventTooltip
```tsx
// Props: { event: CalendarEvent }
<div className="absolute z-50 -top-2 left-full ml-2 p-3 min-w-[200px]"
  style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0 }}>
  <div className="flex items-center gap-2 mb-1">
    <div className="w-3 h-3" style={{ background: event.color, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
    <span className="font-black text-xs uppercase tracking-wider" style={{ color: COLORS.dark }}>{event.title}</span>
  </div>
  {event.time && <p className="text-xs font-bold" style={{ color: '#999' }}>{event.time}</p>}
</div>
```

### CalendarDayHeader
```tsx
// Props: none (uses DAYS constant internally)
<div className="grid grid-cols-7" style={{ background: COLORS.dark }}>
  {DAYS.map((d) => (
    <div key={d} className="p-3 text-center font-black text-xs uppercase tracking-wider"
      style={{ color: COLORS.yellow }}>{d}</div>
  ))}
</div>
```

### CalendarLegend
```tsx
// Props: { items: { label: string; color: string; style?: 'fill' | 'border' }[] }
<div className="flex items-center gap-3">
  {items.map((item) => (
    <Fragment key={item.label}>
      <div className="w-4 h-4" style={{ background: item.color, border: `2px solid ${COLORS.dark}`, borderRadius: 0 }} />
      <span className="font-bold text-xs uppercase tracking-wider" style={{ color: COLORS.dark }}>{item.label}</span>
    </Fragment>
  ))}
</div>
```

## Dependencies
- `MonthView` uses `CalendarDayHeader`, `EventChip`, and internally handles date calculations
- `WeekView` renders event chips in grid cells
- `DayView` renders full event blocks with icon and time
- `EventDetailCard` is used in the selected-date details panel below the calendar
- `ViewToggle` is a general-purpose segmented control reusable beyond calendars
- `CalendarNavigation` is paired with `ViewToggle` in the controls bar
- All components use the Memphis color palette `COLORS` and utility functions (`getDaysInMonth`, `getFirstDayOfMonth`, `formatDate`)

## Reference
Source: `.claude/memphis/showcase/calendars-six.tsx`
Target: `packages/memphis-ui/src/components/`
