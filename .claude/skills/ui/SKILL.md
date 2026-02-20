---
name: ui
description: DaisyUI 5 component patterns, semantic tokens, form controls, and theme compliance for all frontend apps.
---

# /ui - UI Component Patterns

On-demand reference for DaisyUI 5 + TailwindCSS patterns. For deep audits, spawns the `ui-compliance` agent.

## Theme Tokens (NEVER hardcode colors)

```
primary / primary-content       — Brand blue (#233876 light, #3b5ccc dark)
secondary / secondary-content   — Teal (#0f9d8a light, #14b8a6 dark)
accent / accent-content         — Rose (#945769)
neutral / neutral-content       — Dark gray (#111827)
base-100                        — Page background (white / #020617)
base-200                        — Subtle surfaces
base-300                        — Borders, muted
base-content                    — Main text
info, success, warning, error   — Semantic states (+ -content variants)
```

Theme definitions: `apps/portal/src/app/themes/light.css` and `dark.css`

## Component Quick Reference

### Buttons
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary btn-outline">Outline</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-ghost">Ghost</button>
```

### Cards
```html
<div class="card bg-base-100 shadow-sm">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary btn-sm">Action</button>
    </div>
  </div>
</div>
```

### Form Controls
Use `fieldset` wrapper. No `-bordered` suffixes (see `docs/guidance/form-controls.md`).

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Label</legend>
  <input type="text" class="input w-full" />
</fieldset>
```

### Badges
```html
<span class="badge badge-primary">Active</span>
<span class="badge badge-secondary badge-outline">Draft</span>
```

### Modals
```html
<dialog id="my-modal" class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Title</h3>
    <p>Content</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

### Tables
```html
<div class="overflow-x-auto">
  <table class="table">
    <thead><tr><th>Name</th><th>Status</th></tr></thead>
    <tbody>
      <tr><td>Item</td><td><span class="badge badge-success">Active</span></td></tr>
    </tbody>
  </table>
</div>
```

### Tabs
```html
<div role="tablist" class="tabs tabs-bordered">
  <button role="tab" class="tab tab-active">Tab 1</button>
  <button role="tab" class="tab">Tab 2</button>
</div>
```

## Custom Utilities (from globals.css)

- `shadow-elevation-1` through `shadow-elevation-4` — Layered shadows
- `hover-lift` — translateY(-2px) on hover
- `animate-fade-in`, `animate-scale-in`, `animate-slide-up`
- `text-gradient-primary` — Primary→secondary gradient text
- `focus-ring` — Accessible focus indicator
- `scrollbar-thin` — Custom thin scrollbar

## Key Rules

1. **DaisyUI semantic classes first** — `btn-primary`, `bg-base-200`, `text-base-content`
2. **Never hardcode hex/rgb** — Use theme tokens that respect light/dark mode
3. **`fieldset` for form groups** — No `-bordered` class suffixes
4. **Icons**: FontAwesome inline `<i className='fa-duotone fa-regular fa-icon'>`
5. **Loading states**: Always use `@splits-network/shared-ui` components
