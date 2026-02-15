# extract-from-settings

Extract reusable components from the settings showcase page.

## Available Components

1. **SettingsLayout** - Full settings page layout with sidebar nav + content area
2. **SettingsSidebarNav** - Vertical navigation with left-border active indicators
3. **SettingsNavItem** - Individual sidebar nav button
4. **SettingsContentPanel** - Right-side content container with section header
5. **SettingsSectionHeader** - Section title with icon badge + optional "Saved" indicator
6. **SettingsField** - Label/description + control row with bottom border
7. **MemphisToggle** - On/off toggle switch with sharp Memphis styling
8. **MemphisInput** - Text input field with Memphis borders and colors
9. **MemphisSelect** - Styled select dropdown
10. **NotificationGroupHeader** - Category header for notification sections
11. **TeamMemberRow** - Team member display with avatar, info, role badge
12. **IntegrationCard** - Integration with icon, info, connect/disconnect button
13. **BillingPlanCard** - Current plan display with price, status, and action buttons
14. **AppearanceSelector** - Button group for theme/density selection
15. **DangerZone** - Warning section with destructive action button
16. **SettingsSaveBar** - Save/cancel button footer with loading state
17. **SavedConfirmation** - Brief "Saved" success indicator badge

## Component Details

### SettingsSidebarNav
```tsx
interface NavSection { key: string; label: string; icon: string; color: string; }
interface SettingsSidebarNavProps {
    sections: NavSection[];
    active: string;
    onChange: (key: string) => void;
}
// border-4 p-4, borderColor: C.dark, backgroundColor: C.white
// Each item: left-border active indicator, icon + label text
```

### SettingsField
```tsx
interface SettingsFieldProps {
    label: string;
    description?: string;
    children: ReactNode;   // the control element (input, toggle, button, etc.)
}
// flex items-start justify-between gap-4 py-4 border-b-2
// Label: text-sm font-bold, Description: text-xs, opacity 0.5
// Children rendered on right side (flex-shrink-0)
```

### MemphisToggle
```tsx
interface MemphisToggleProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
    color?: string;   // default C.teal
}
// w-12 h-7 relative border-3
// Track: filled with color when enabled, C.cream when disabled
// Thumb: w-4 h-4 border-2 absolute, slides from left to right
// Sharp corners (no border-radius)
```

### MemphisInput
```tsx
interface MemphisInputProps {
    value: string;
    onChange: (value: string) => void;
    type?: string;
    className?: string;   // for width control, e.g., "w-64"
}
// px-3 py-2 border-3 text-sm font-semibold outline-none
// borderColor: C.dark, backgroundColor: C.cream, color: C.dark
```

### NotificationGroupHeader
```tsx
interface NotificationGroupHeaderProps {
    icon: string;
    label: string;
    color: string;
}
// p-3 border-3 with borderColor: color
// text-xs font-bold uppercase tracking-wider, colored text with icon
```

### TeamMemberRow
```tsx
interface TeamMemberRowProps {
    name: string;
    email: string;
    role: string;
    color: string;
    initials: string;
}
// flex items-center gap-4 p-4 border-b-2
// Circular avatar: w-10 h-10 rounded-full border-2 with initials
// Role: px-2 py-1 text-[10px] font-black uppercase border-2
```

### IntegrationCard
```tsx
interface IntegrationCardProps {
    name: string;
    description: string;
    icon: string;
    connected: boolean;
    color: string;
    onToggle?: () => void;
}
// flex items-center gap-4 p-4 border-3, borderColor: color
// Icon box: w-10 h-10 solid bg with icon
// Button: solid bg when connected, outline when not
```

### BillingPlanCard
```tsx
interface BillingPlanCardProps {
    planName: string;
    price: number;
    period: string;
    status: string;
    color: string;
    onUpgrade?: () => void;
    onChangePlan?: () => void;
}
// border-3 p-6, borderColor: color
// Plan name: text-2xl font-black uppercase in color
// Price: text-3xl font-black + period suffix
// Status badge + action buttons
```

### AppearanceSelector
```tsx
interface AppearanceSelectorProps {
    options: string[];
    selected: string;
    onChange: (value: string) => void;
    color?: string;   // default C.yellow
}
// Horizontal button group: active filled, inactive outline
// Each: px-3/4 py-2 text-xs font-black uppercase border-3
```

### DangerZone
```tsx
interface DangerZoneProps {
    label?: string;        // default "Danger Zone"
    actionLabel: string;
    onAction: () => void;
}
// p-4 border-3 borderColor: C.coral
// Warning icon + label in C.coral
// Destructive button: solid C.coral bg
```

### SettingsSaveBar
```tsx
interface SettingsSaveBarProps {
    saving: boolean;
    onSave: () => void;
    onCancel: () => void;
}
// flex justify-end gap-3
// Cancel: outline border-3, Save: solid C.teal border-3
// Saving state: spinner icon + "Saving..." text, disabled
```

## Dependencies
- **SettingsLayout** composes: SettingsSidebarNav, SettingsContentPanel, SettingsSaveBar
- **SettingsContentPanel** composes: SettingsSectionHeader, SettingsField
- **SettingsField** takes children -- typically MemphisToggle, MemphisInput, MemphisSelect, or custom buttons
- **TeamMemberRow** uses ProfileAvatar pattern (from profiles) in circular variant
- **IntegrationCard** is self-contained

## Reference
Source: `.claude/memphis/showcase/settings-six.tsx`
Target: `packages/memphis-ui/src/components/`
