# migrate-settings

Migrate a settings page to Memphis design.

## Page Type Characteristics
Settings pages provide form-based configuration organized by category. They feature:
- A **dark header** with badge and title (simpler than profile/detail headers)
- A **sidebar + content** layout using `lg:grid-cols-4` (1 sidebar + 3 content)
- **Vertical sidebar navigation** with left-border active indicator
- **Section-specific form content** that changes based on active section
- **Form fields** using Memphis-styled inputs, toggles, selects
- **Notification groups** with category headers and toggle rows
- **Team member list** with avatars and role badges
- **Integration cards** with connect/disconnect states
- **Save/cancel footer bar**
- **Danger zone** for destructive actions

## Key Components to Transform

### Settings Sidebar Navigation
- Container: `border-4 p-4` with `borderColor: C.dark, backgroundColor: C.white`
- Each item: full-width button with `borderLeft: 4px solid`
- Active: `borderLeft` colored, `backgroundColor: C.cream, color: C.dark`
- Inactive: `borderLeft: transparent, color: rgba(26,26,46,0.5)`
- Text: `text-xs font-black uppercase tracking-wider`
- Icon: colored when active, default when inactive

### Section Header
- `text-lg font-black uppercase tracking-wider` with `w-8 h-8` icon badge square
- Optional "Saved" confirmation badge: `backgroundColor: C.teal`

### SettingsField (Key Component)
- Row layout: `flex items-start justify-between gap-4 py-4 border-b-2`
- Label: `text-sm font-bold`, description: `text-xs mt-0.5, opacity: 0.5`
- Control on right side (input, toggle, button, select)

### Memphis Toggle
- Container: `w-12 h-7 relative border-3`
- Track: `borderColor` and `backgroundColor` change with state
- Thumb: `absolute w-4 h-4 border-2` that slides left/right
- No border-radius on track or thumb (sharp Memphis corners)

### Memphis Input
- `px-3 py-2 border-3 text-sm font-semibold outline-none w-64`
- `borderColor: C.dark, backgroundColor: C.cream, color: C.dark`
- No rounded corners

### Notification Group Header
- `p-3 border-3` with `borderColor` matching category color
- Label: `text-xs font-bold uppercase tracking-wider` with icon, colored text

### Team Member Row
- `flex items-center gap-4 p-4 border-b-2` with `borderColor: C.cream`
- Avatar: `w-10 h-10 rounded-full border-2` with initials
- Name: `text-sm font-bold`, email: `text-xs, opacity: 0.5`
- Role badge: `px-2 py-1 text-[10px] font-black uppercase border-2`

### Integration Card
- `flex items-center gap-4 p-4 border-3` with `borderColor: color`
- Icon box: `w-10 h-10` solid bg with brand icon
- Name + description text
- Connect button: outline when disconnected, solid when connected

### Billing Plan Card
- `border-3 p-6` with `borderColor: C.purple`
- Plan name: `text-2xl font-black uppercase` in accent color
- Price: `text-3xl font-black` + `/month` suffix
- Status badge: "Active" tag
- Upgrade/Change buttons

### Appearance Selector
- Button group: side-by-side buttons, active one filled, inactive outline
- Same pattern for theme (dark/light) and density (compact/comfortable/spacious)

### Save Bar
- `flex items-center justify-end gap-3`
- Cancel: outline `border-3` button
- Save: solid `border-3` button with spinner state

### Danger Zone
- `p-4 border-3` with `borderColor: C.coral`
- Warning label: `text-xs font-black uppercase tracking-wider` in `C.coral` with triangle-exclamation icon
- Destructive button: solid coral

## Memphis Patterns for Settings

```tsx
{/* Settings sidebar nav item */}
<button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-wider text-left"
    style={{
        borderLeft: `4px solid ${active ? color : "transparent"}`,
        backgroundColor: active ? C.cream : "transparent",
        color: active ? C.dark : "rgba(26,26,46,0.5)",
    }}>
    <i className={`${icon} text-sm`} style={{ color: active ? color : undefined }}></i>
    {label}
</button>

{/* Settings field row */}
<div className="flex items-start justify-between gap-4 py-4 border-b-2" style={{ borderColor: C.cream }}>
    <div className="flex-1">
        <p className="text-sm font-bold" style={{ color: C.dark }}>Label</p>
        <p className="text-xs mt-0.5" style={{ color: C.dark, opacity: 0.5 }}>Description</p>
    </div>
    <div className="flex-shrink-0">{/* Control */}</div>
</div>

{/* Memphis toggle */}
<button onClick={() => onChange(!enabled)} className="w-12 h-7 relative border-3 transition-all"
    style={{ borderColor: enabled ? color : "rgba(26,26,46,0.2)", backgroundColor: enabled ? color : C.cream }}>
    <div className="absolute top-0.5 w-4 h-4 transition-all border-2"
        style={{ left: enabled ? "calc(100% - 20px)" : "2px", borderColor: C.dark, backgroundColor: C.white }} />
</button>

{/* Save bar */}
<div className="mt-6 flex items-center justify-end gap-3">
    <button className="px-5 py-3 text-xs font-black uppercase tracking-wider border-3"
        style={{ borderColor: C.dark, color: C.dark }}>Cancel</button>
    <button className="px-6 py-3 text-xs font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
        style={{ borderColor: C.teal, backgroundColor: C.teal, color: C.dark }}>
        <i className="fa-duotone fa-regular fa-floppy-disk text-xs mr-1"></i>Save Changes
    </button>
</div>
```

## Common Violations
- Using DaisyUI `toggle`, `input`, `select`, `menu` components -- use raw Memphis styled elements
- Rounded toggle switches -- Memphis toggle has sharp corners on both track and thumb
- Settings nav with rounded pills instead of left-border indicators
- Missing `border-b-2` separators between settings field rows
- Using default browser form styling without Memphis borders and colors
- Notification toggles without category group headers
- Missing danger zone styling for destructive actions
- Save button without loading spinner state

## Reference
Showcase: `.claude/memphis/showcase/settings-six.tsx`
