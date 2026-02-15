# migrate-notifications-ui

Migrate a notifications-ui page to Memphis design.

## Page Type Characteristics
Notifications-UI pages are component showcase layouts demonstrating ephemeral notification primitives: toasts, alert banners, badges, snackbars, and position demos. Unlike the notifications page (which is a feed/list), this page focuses on standalone UI feedback components. Layout is section-based with a dark hero, followed by categorized demo sections on a cream background.

## Key Components to Transform

- **Toast Notifications**: Floating cards that slide in from the right with GSAP (`x: 80 -> 0`). Fixed to `top-6 right-6 z-50`. Colored background matching type (teal=success, coral=error, yellow=warning, purple=info), `border: 4px solid dark`, no border-radius. Contains icon, title (font-black uppercase), message, and dismiss X button. Auto-dismiss after 5 seconds.
- **Alert Banners**: Full-width inline banners, same type coloring as toasts. `border: 4px solid dark`, `p-4 flex items-center gap-3`. Persistent (not auto-dismiss) with manual close button.
- **Badges**: Inline pill-like indicators. `border: 3px solid dark`, colored background, `font-black text-xs uppercase tracking-wider`. Optional count sub-badge with dark background and white text. Also status dot variants with `border: 2px solid dark, borderRadius: 50%`.
- **Snackbar**: Fixed bottom-center, dark background with teal border, slides up with GSAP. Contains message text and optional action button in yellow.
- **Position Demo**: Visual viewport mock showing mini-toasts in all four corners.
- **Section Headings**: `text-3xl font-black uppercase tracking-tight` with coral icon and purple subtitle.

## Memphis Patterns for Notifications-UI

```tsx
const COLORS = { coral: '#FF6B6B', teal: '#4ECDC4', yellow: '#FFE66D', purple: '#A78BFA', dark: '#1A1A2E', cream: '#F5F0EB' };

// Toast notification
<div style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="p-4 min-w-[320px] flex items-start gap-3">
  <i className={`fa-duotone fa-solid ${meta.icon} text-xl mt-0.5`} />
  <div className="flex-1">
    <p className="font-black text-sm uppercase tracking-wide">{title}</p>
    <p className="text-sm mt-1 font-medium">{message}</p>
  </div>
  <button className="font-black text-lg leading-none hover:opacity-60 transition-opacity">&times;</button>
</div>

// Alert banner
<div style={{ background: meta.bg, border: `4px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="p-4 flex items-center gap-3">
  <i className={`fa-duotone fa-solid ${meta.icon} text-lg`} />
  <span className="font-bold text-sm flex-1">{children}</span>
  <button className="font-black hover:opacity-60">&times;</button>
</div>

// Badge with count
<span style={{ background: color, border: `3px solid ${COLORS.dark}`, borderRadius: 0, color: COLORS.dark }}
  className="inline-flex items-center gap-2 px-3 py-1 font-black text-xs uppercase tracking-wider">
  {label}
  {count !== undefined && (
    <span style={{ background: COLORS.dark, color: '#fff', borderRadius: 0 }}
      className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black">{count}</span>
  )}
</span>

// Snackbar
<div style={{ background: COLORS.dark, border: `4px solid ${COLORS.teal}`, borderRadius: 0, color: '#fff' }}
  className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 flex items-center gap-4">
  <span className="font-bold text-sm">{message}</span>
  <button style={{ color: COLORS.yellow }} className="font-black text-sm uppercase tracking-wider hover:underline">{action}</button>
</div>
```

## Common Violations
- Using DaisyUI `toast`, `alert`, or `badge` components
- Rounded corners on toasts, banners, or badges
- Using thin borders (1px or 2px) instead of 3-4px
- Missing GSAP slide-in/slide-out animations for toasts and snackbars
- Using CSS transitions instead of GSAP for entrance/exit
- Native browser notifications instead of custom overlay components
- Light/pastel backgrounds instead of full-saturation Memphis colors
- Missing the dismiss button on toasts/alerts
- Not using the type-to-color mapping (success=teal, error=coral, warning=yellow, info=purple)

## Reference
Showcase: `apps/corporate/src/app/showcase/notifications-ui/page.tsx`
