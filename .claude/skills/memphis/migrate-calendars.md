# migrate-calendars

Migrate a calendars page to Memphis design.

## Page Type Characteristics
Calendar pages display date-based events in switchable views (month grid, week grid, day list). The layout includes a navigation header with month/year controls and view toggle buttons, a main calendar grid, and a selected-date detail panel. Events are color-coded chips inside day cells with overflow indicators.

## Key Components to Transform

- **Month Navigation**: Chevron buttons (`w-10 h-10`, `border: 3px solid dark`, white background) flanking a bold uppercase `text-2xl` month/year heading.
- **View Toggle**: `border: 4px solid dark` segmented control with `month | week | day` buttons. Active button has dark background with yellow text. Buttons separated by `borderRight: 2px solid dark`.
- **Month View Grid**: 7-column grid with dark-background day headers (yellow uppercase text), day cells with `min-h-[80px]`, today highlight (`border: 3px solid coral`, yellow tint background), selected cell (dark background, white text), and event chips inside cells.
- **Event Chip**: `px-1.5 py-0.5 text-[10px] font-bold truncate`, colored background, no border-radius, with icon prefix. Max 2 visible + "+N more" overflow indicator.
- **Week View**: 8-column grid (time + 7 days), dark header row, time column on cream background, today column with yellow tint. Events rendered as small bordered chips.
- **Day View**: Hourly rows with time labels (`w-20`, right-aligned) and event blocks (`border: 3px solid dark`, colored background, icon + title + time).
- **Selected Date Details**: Card list below the calendar, each event as a `border: 4px solid dark` row with colored icon box (`w-10 h-10`) and event info.
- **Today Indicator Legend**: Small colored squares with labels explaining the color coding.
- **Event Tooltip**: Absolute-positioned popup with event details on hover.

## Memphis Patterns for Calendars

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// View toggle
<div className="flex gap-0" style={{ border: `4px solid ${COLORS.dark}`, borderRadius: 0 }}>
  {(['month', 'week', 'day'] as ViewMode[]).map((v) => (
    <button key={v} onClick={() => setView(v)}
      className="px-5 py-2 font-black text-xs uppercase tracking-wider transition-colors"
      style={{
        background: view === v ? COLORS.dark : '#fff',
        color: view === v ? COLORS.yellow : COLORS.dark,
        borderRight: v !== 'day' ? `2px solid ${COLORS.dark}` : 'none',
        borderRadius: 0,
      }}>{v}</button>
  ))}
</div>

// Day cell with events
<div onClick={() => onSelectDate(dateStr)}
  className="p-2 min-h-[80px] cursor-pointer transition-colors relative"
  style={{
    background: isSelected ? COLORS.dark : isToday ? COLORS.yellow + '40' : '#fff',
    border: isToday ? `3px solid ${COLORS.coral}` : '1px solid #e5e5e5',
    borderRadius: 0,
  }}>
  <span className="font-black text-sm"
    style={{ color: isSelected ? '#fff' : isToday ? COLORS.coral : COLORS.dark }}>{d}</span>
  <div className="mt-1 space-y-0.5">
    {dayEvents.slice(0, 2).map((ev) => (
      <div key={ev.id} className="px-1.5 py-0.5 text-[10px] font-bold truncate"
        style={{ background: ev.color, color: COLORS.dark, borderRadius: 0 }}>
        <i className={`fa-duotone fa-solid ${ev.icon} mr-1`} />{ev.title}
      </div>
    ))}
    {dayEvents.length > 2 && (
      <span className="text-[10px] font-black" style={{ color: COLORS.purple }}>+{dayEvents.length - 2} more</span>
    )}
  </div>
</div>

// Navigation button
<button onClick={prevMonth}
  className="w-10 h-10 flex items-center justify-center font-black transition-all hover:opacity-80"
  style={{ background: '#fff', border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  <i className="fa-duotone fa-solid fa-chevron-left" />
</button>

// Day header row
<div className="grid grid-cols-7" style={{ background: COLORS.dark }}>
  {DAYS.map((d) => (
    <div key={d} className="p-3 text-center font-black text-xs uppercase tracking-wider"
      style={{ color: COLORS.yellow }}>{d}</div>
  ))}
</div>
```

## Common Violations
- Using DaisyUI calendar or date-picker components
- Rounded day cells, event chips, or toggle buttons
- Thin borders instead of 3-4px on containers and navigation
- Missing the GSAP cell entrance animation (`scale: 0.8 -> 1, stagger: 0.01`)
- Not differentiating today (coral border + yellow tint) from selected (dark fill)
- Missing the "+N more" overflow indicator on days with many events
- Using text color alone for event types instead of colored background chips
- Not supporting multi-day events spanning across cells
- Missing the dark-background day header row with yellow text

## Reference
Showcase: `.claude/memphis/showcase/calendars-six.tsx`
