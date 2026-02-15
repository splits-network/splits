# extract-from-notifications-ui

Extract reusable components from the notifications-ui showcase page.

## Available Components

1. **ToastItem** - Animated floating notification with auto-dismiss
2. **ToastContainer** - Fixed-position container managing toast stack
3. **AlertBanner** - Persistent inline alert banner
4. **Badge** - Status indicator with optional count
5. **StatusDot** - Inline presence/status dot indicator
6. **Snackbar** - Bottom-centered feedback bar with optional action
7. **MiniToast** - Compact positional toast for demo/preview
8. **SectionHeading** - Section title with icon and subtitle

## Component Details

### ToastItem
```tsx
// Props: { toast: { id: number; type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string }; onDismiss: (id: number) => void }
// GSAP: slides in from x:80, slides out on dismiss
// Type colors: success=teal, error=coral, warning=yellow, info=purple
// Icons: success=fa-circle-check, error=fa-circle-xmark, warning=fa-triangle-exclamation, info=fa-circle-info
<div ref={ref}
  style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="p-4 min-w-[320px] flex items-start gap-3">
  <i className={`fa-duotone fa-solid ${meta.icon} text-xl mt-0.5`} />
  <div className="flex-1">
    <p className="font-black text-sm uppercase tracking-wide">{toast.title}</p>
    <p className="text-sm mt-1 font-medium">{toast.message}</p>
  </div>
  <button onClick={dismiss} className="font-black text-lg leading-none hover:opacity-60 transition-opacity">&times;</button>
</div>
```

### ToastContainer
```tsx
// Props: { toasts: Toast[]; onDismiss: (id: number) => void }
// Manages the fixed-position stack in top-right corner
<div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
  {toasts.map((t) => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
</div>
```

### AlertBanner
```tsx
// Props: { type: 'success' | 'error' | 'warning' | 'info'; children: React.ReactNode; onDismiss?: () => void }
<div style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="p-4 flex items-center gap-3">
  <i className={`fa-duotone fa-solid ${meta.icon} text-lg`} />
  <span className="font-bold text-sm flex-1">{children}</span>
  <button className="font-black hover:opacity-60">&times;</button>
</div>
```

### Badge
```tsx
// Props: { label: string; count?: number; color: string }
<span style={{ background: color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="inline-flex items-center gap-2 px-3 py-1 font-black text-xs uppercase tracking-wider">
  {label}
  {count !== undefined && (
    <span style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}
      className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black">{count}</span>
  )}
</span>
```

### StatusDot
```tsx
// Props: { label: string; color: string }
<span className="flex items-center gap-2 font-bold text-sm" style={{ color: COLORS.dark }}>
  <span style={{ background: color, width: 12, height: 12, border: `2px solid ${COLORS.dark}`, borderRadius: '50%' }} className="inline-block" />
  {label}
</span>
```

### Snackbar
```tsx
// Props: { message: string; action?: string; visible: boolean; onAction?: () => void }
// GSAP: slides up/down based on visible prop (y: 80 <-> 0)
<div ref={ref}
  style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0, color: '#fff',
    opacity: 0, transform: 'translateY(80px)' }}
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 flex items-center gap-4">
  <span className="font-bold text-sm">{message}</span>
  {action && (
    <button style={{ color: COLORS.yellow }} className="font-black text-sm uppercase tracking-wider hover:underline">
      {action}
    </button>
  )}
</div>
```

### MiniToast
```tsx
// Props: { position: string; color: string; label: string; icon: string }
// Used for positional preview demos inside a mock viewport
<div className={`absolute ${position} px-4 py-2 flex items-center gap-2`}
  style={{ background: color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}>
  <i className={`fa-duotone fa-solid ${icon} text-sm`} />
  <span className="font-black text-xs uppercase tracking-wider">{label}</span>
</div>
```

### SectionHeading
```tsx
// Props: { icon: string; title: string; subtitle: string }
<div>
  <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3" style={{ color: COLORS.dark }}>
    <i className={`fa-duotone fa-solid ${icon}`} style={{ color: COLORS.coral }} />
    {title}
  </h2>
  <p className="mt-1 font-bold text-sm uppercase tracking-widest" style={{ color: COLORS.purple }}>
    {subtitle}
  </p>
</div>
```

## Dependencies
- `ToastContainer` composes multiple `ToastItem` instances
- `ToastItem` relies on `TOAST_META` type-to-style mapping
- `AlertBanner` shares the same `TOAST_META` config as `ToastItem`
- `Snackbar` requires GSAP for animation
- All components use the Memphis color palette `COLORS`

## Reference
Source: `.claude/memphis/showcase/notifications-ui-six.tsx`
Target: `packages/memphis-ui/src/components/`
