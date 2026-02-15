# extract-from-notifications

Extract reusable components from the notifications showcase page.

## Available Components

1. **NotificationItem** - Individual notification card with icon, content, time, type badge, actions
2. **NotificationGroup** - Time-grouped section with accent bar, label, and count badge
3. **NotificationFilterBar** - Combined type and status filter controls
4. **NotificationFilterPill** - Individual toggle-able filter button
5. **NotificationHeader** - Dark header with badge, title, unread count, action buttons
6. **NotificationEmptyState** - Empty results placeholder
7. **UnreadBadge** - Unread count indicator pill
8. **NotificationTypeBadge** - Inline type label with colored border

## Component Details

### NotificationItem
```tsx
// Props: { notification: Notification; typeMeta: { icon: string; color: string; label: string }; onToggleRead: (id: number) => void; onDelete: (id: number) => void }
<div className="notif-item border-3 p-4 flex items-start gap-4 transition-all"
  style={{
    borderColor: n.read ? "rgba(26,26,46,0.08)" : meta.color,
    backgroundColor: n.read ? "transparent" : "rgba(255,255,255,0.8)",
    opacity: n.read ? 0.7 : 1,
  }}>
  {/* Icon box */}
  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center"
    style={{ backgroundColor: n.read ? C.cream : meta.color }}>
    <i className={`${meta.icon} text-sm`}
      style={{ color: n.read ? "rgba(26,26,46,0.4)" : (meta.color === C.yellow ? C.dark : C.white) }}></i>
  </div>
  {/* Content */}
  <div className="flex-1 min-w-0">
    <div className="flex items-center gap-2 mb-1">
      {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />}
      <h4 className="text-sm font-bold truncate" style={{ color: C.dark }}>{n.title}</h4>
    </div>
    <p className="text-xs truncate" style={{ color: C.dark, opacity: 0.5 }}>{n.description}</p>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>{n.time}</span>
      <NotificationTypeBadge label={meta.label} color={meta.color} />
    </div>
  </div>
  {/* Action buttons */}
  <div className="flex items-center gap-1 flex-shrink-0">
    <button onClick={() => onToggleRead(n.id)} className="w-7 h-7 flex items-center justify-center border-2"
      style={{ borderColor: "rgba(26,26,46,0.1)", color: n.read ? "rgba(26,26,46,0.3)" : meta.color }}>
      <i className={`fa-${n.read ? "regular" : "solid"} fa-circle text-[8px]`}></i>
    </button>
    <button onClick={() => onDelete(n.id)} className="w-7 h-7 flex items-center justify-center border-2"
      style={{ borderColor: "rgba(26,26,46,0.1)", color: "rgba(26,26,46,0.3)" }}>
      <i className="fa-duotone fa-regular fa-trash text-[10px]"></i>
    </button>
  </div>
</div>
```

### NotificationGroup
```tsx
// Props: { label: string; items: Notification[]; color: string; renderItem: (n: Notification) => React.ReactNode }
<div className="mb-6">
  <div className="flex items-center gap-2 mb-3">
    <div className="w-1.5 h-5" style={{ backgroundColor: color }} />
    <span className="text-xs font-black uppercase tracking-[0.15em]" style={{ color: C.dark }}>{label}</span>
    <span className="text-[10px] font-bold px-2 py-0.5 border-2" style={{ borderColor: color, color }}>{items.length}</span>
  </div>
  <div className="space-y-2">{items.map(renderItem)}</div>
</div>
```

### NotificationFilterBar
```tsx
// Props: { typeFilter: string; statusFilter: string; onTypeChange: (f: string) => void; onStatusChange: (s: string) => void; types: { key: string; color: string; label: string }[]; resultCount: number }
<div className="border-4 p-4 mb-6 flex flex-wrap items-center gap-3" style={{ borderColor: C.dark, backgroundColor: C.white }}>
  <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>Type:</span>
  <div className="flex flex-wrap gap-1">{/* type pills */}</div>
  <div className="w-px h-6 mx-1" style={{ backgroundColor: "rgba(26,26,46,0.1)" }} />
  <span className="text-xs font-black uppercase tracking-wider" style={{ color: C.dark, opacity: 0.4 }}>Status:</span>
  <div className="flex gap-1">{/* status pills */}</div>
  <span className="ml-auto text-xs font-bold" style={{ color: C.dark, opacity: 0.3 }}>{resultCount} notifications</span>
</div>
```

### NotificationFilterPill
```tsx
// Props: { label: string; active: boolean; color: string; onClick: () => void }
<button onClick={onClick}
  className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-2 transition-all"
  style={{
    borderColor: active ? color : "rgba(26,26,46,0.1)",
    backgroundColor: active ? color : "transparent",
    color: active ? (color === C.yellow ? C.dark : C.white) : "rgba(26,26,46,0.5)",
  }}>
  {label}
</button>
```

### NotificationHeader
```tsx
// Props: { unreadCount: number; onMarkAllRead: () => void }
// Dark background with badge label, title, unread count, and action buttons
```

### NotificationEmptyState
```tsx
// Props: { icon?: string; title?: string; subtitle?: string }
<div className="border-4 p-12 text-center" style={{ borderColor: C.dark, backgroundColor: C.white }}>
  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4" style={{ borderColor: C.teal }}>
    <i className="fa-duotone fa-regular fa-bell-slash text-2xl" style={{ color: C.teal }}></i>
  </div>
  <h3 className="text-lg font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>{title || "All Caught Up"}</h3>
  <p className="text-sm" style={{ color: C.dark, opacity: 0.5 }}>{subtitle}</p>
</div>
```

### UnreadBadge
```tsx
// Props: { count: number }
<span className="px-3 py-1 text-xs font-black uppercase"
  style={{ backgroundColor: C.coral, color: C.white }}>{count} unread</span>
```

### NotificationTypeBadge
```tsx
// Props: { label: string; color: string }
<span className="px-1.5 py-0.5 text-[9px] font-bold uppercase border"
  style={{ borderColor: color, color }}>{label}</span>
```

## Dependencies
- `NotificationItem` uses `NotificationTypeBadge` internally
- `NotificationFilterBar` composes multiple `NotificationFilterPill` components
- All components rely on the Memphis color palette constant `C` and the `TYPE_META` mapping

## Reference
Source: `apps/corporate/src/app/showcase/notifications/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
