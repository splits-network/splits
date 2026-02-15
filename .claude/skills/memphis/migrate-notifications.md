# migrate-notifications

Migrate a notifications page to Memphis design.

## Page Type Characteristics
Notifications pages are list-driven layouts displaying grouped, filterable notification items. The page uses a dark header with badge/title, followed by a filter bar and chronologically grouped notification cards (Today, Yesterday, This Week). Each notification is a horizontal card with icon, content, timestamp, type badge, and action buttons.

## Key Components to Transform

- **Page Header**: Dark background section with a colored badge label (`backgroundColor: coral, color: white`), bold uppercase title with accent span, unread count badge, and action buttons ("Mark All Read", "Settings").
- **Color Bar**: 4-segment colored bar at the very top of the page.
- **Filter Bar**: `border-4` white container with two filter groups (Type and Status), separated by a vertical divider. Filter pills use `border-2`, `text-[10px] font-black uppercase tracking-wider`. Active state fills with the type's accent color.
- **Notification Groups**: Each group has a left color accent bar (`w-1.5 h-5`), uppercase label, and count badge with `border-2`.
- **Notification Items**: `border-3` cards with left-colored border for unread. Contains: icon box (`w-10 h-10`), title with optional unread dot, truncated description, timestamp, type label badge, and action buttons (mark read/unread, delete).
- **Empty State**: Centered card with icon in bordered square, uppercase heading, and subtitle.

## Memphis Patterns for Notifications

```tsx
const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

// Notification header badge
<span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]"
  style={{ backgroundColor: C.coral, color: C.white }}>
  <i className="fa-duotone fa-regular fa-bell"></i>Notifications
</span>

// Filter pill (active)
<button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all"
  style={{ borderColor: meta.color, backgroundColor: meta.color, color: C.white }}>
  {label}
</button>

// Notification item (unread)
<div className="border-3 p-4 flex items-start gap-4"
  style={{ borderColor: meta.color, backgroundColor: "rgba(255,255,255,0.8)" }}>
  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: meta.color }}>
    <i className={`${meta.icon} text-sm`} style={{ color: C.white }}></i>
  </div>
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
      <h4 className="text-sm font-bold truncate" style={{ color: C.dark }}>{title}</h4>
    </div>
    <p className="text-xs truncate" style={{ color: C.dark, opacity: 0.5 }}>{description}</p>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>{time}</span>
      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border" style={{ borderColor: meta.color, color: meta.color }}>{meta.label}</span>
    </div>
  </div>
</div>

// Group header
<div className="flex items-center gap-2 mb-3">
  <div className="w-1.5 h-5" style={{ backgroundColor: color }} />
  <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: C.dark }}>{label}</span>
  <span className="text-[10px] font-bold px-2 py-0.5 border-2" style={{ borderColor: color, color }}>{count}</span>
</div>
```

## Common Violations
- Using DaisyUI `alert`, `badge`, or `card` classes
- Rounded notification cards or badges (Memphis is always `borderRadius: 0`)
- Thin `border` instead of `border-3` or `border-4`
- Missing the unread dot indicator next to notification titles
- Using colored text without a border-based type badge
- Not grouping notifications by time period with accent bars
- Missing read/unread visual distinction (opacity, border color changes)
- No GSAP staggered entrance animation on notification items

## Reference
Showcase: `apps/corporate/src/app/showcase/notifications/six/page.tsx`
