# Basel Service Status Banner

A universal service status banner component following Basel design system principles for use across all Splits Network applications (Portal, Candidate, Corporate).

## Features

- **Basel Design System**: Uses DaisyUI semantic tokens exclusively (no Memphis colors)
- **Editorial Layout**: Asymmetric 60/40 grid with typography-driven hierarchy
- **Sharp Corners**: No border-radius following Basel principles
- **Border Accents**: Left border accents using `border-l-4`
- **Subtle Shadows**: Editorial depth with `shadow-sm`, `shadow-md`
- **DaisyUI First**: Component classes prioritized over raw Tailwind
- **Universal**: Single implementation for all apps

## Design Principles

### Color System (CRITICAL)

Basel uses **DaisyUI semantic tokens ONLY**:

- `primary`, `primary-content`
- `secondary`, `secondary-content`
- `accent`, `accent-content`
- `neutral`, `neutral-content`
- `base-100`, `base-200`, `base-300`, `base-content`
- `success`, `error`, `warning`, `info` (+ `-content` variants)

**FORBIDDEN**: Memphis colors (coral, teal, cream, dark, yellow, purple), raw Tailwind palette (red-500, blue-600), hardcoded hex values.

### Layout

- **Editorial grids**: Asymmetric 60/40 layouts instead of centered content
- **Typography hierarchy**: Large headings, comfortable line-height
- **Sharp corners**: All elements use `rounded-none` (border-radius: 0)
- **Border-left accents**: `border-l-4` for editorial emphasis
- **Subtle shadows**: `shadow-sm`, `shadow-md` for depth

## Usage

### Simple (Recommended)

```tsx
import { ServiceStatusProvider } from "@splits-network/basel-ui";

export function App() {
    return (
        <div>
            <ServiceStatusProvider statusHref="/status" />
            <main>{/* Your app content */}</main>
        </div>
    );
}
```

### Advanced (Custom Hook)

```tsx
import {
    ServiceStatusBanner,
    useSiteNotifications,
} from "@splits-network/basel-ui";

export function CustomStatusBanner() {
    const { notifications, isLoading, dismiss } = useSiteNotifications({
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
    });

    return (
        <ServiceStatusBanner
            statusHref="/custom-status"
            notifications={notifications}
            isLoading={isLoading}
            onDismiss={dismiss}
        />
    );
}
```

## API Reference

### ServiceStatusProvider

```tsx
interface ServiceStatusProviderProps {
    statusHref?: string; // Default: "/status"
}
```

### ServiceStatusBanner

```tsx
interface ServiceStatusBannerProps {
    statusHref?: string;
    notifications: SiteNotification[];
    isLoading: boolean;
    onDismiss: (id: string) => void;
}
```

### SiteNotification

```tsx
interface SiteNotification {
    id: string;
    type: string;
    title: string;
    message: string | null;
    severity: string; // critical, error, warning, info, primary, secondary, accent, neutral
    dismissible: boolean;
    metadata?: {
        display_name?: string;
        [key: string]: any;
    };
}
```

## Severity Mapping

| Severity    | DaisyUI Classes                          | Icon                              | Use Case                |
| ----------- | ---------------------------------------- | --------------------------------- | ----------------------- |
| `critical`  | `bg-error`, `text-error-content`         | `fa-triangle-exclamation fa-beat` | System down             |
| `error`     | `bg-error`, `text-error-content`         | `fa-bug fa-beat`                  | Features broken         |
| `warning`   | `bg-warning`, `text-warning-content`     | `fa-wrench`                       | Degraded performance    |
| `info`      | `bg-info`, `text-info-content`           | `fa-megaphone`                    | Maintenance notices     |
| `primary`   | `bg-primary`, `text-primary-content`     | `fa-bullhorn`                     | Important announcements |
| `secondary` | `bg-secondary`, `text-secondary-content` | `fa-sparkles`                     | Feature updates         |
| `accent`    | `bg-accent`, `text-accent-content`       | `fa-star`                         | Promotional content     |
| `neutral`   | `bg-neutral`, `text-neutral-content`     | `fa-circle-info`                  | General information     |

## Migration from Memphis

### Before (Memphis - Portal App)

```tsx
// ❌ Memphis version with hardcoded colors
const SEVERITY_STYLES = {
    critical: {
        bg: "bg-coral", // Memphis color
        text: "text-dark", // Memphis color
        border: "border-dark", // Memphis color
    },
};
```

### After (Basel - Universal)

```tsx
// ✅ Basel version with DaisyUI semantic tokens
const SEVERITY_STYLES = {
    critical: {
        bg: "bg-error", // DaisyUI semantic
        text: "text-error-content", // DaisyUI semantic
        border: "border-error", // DaisyUI semantic
    },
};
```

## Layout Differences

### Memphis (Before)

- Centered content with equal padding
- Rounded corners (`border-4`)
- Geometric Memphis styling
- Hardcoded accent colors

### Basel (After)

- Editorial 60/40 asymmetric grid
- Sharp corners (no border-radius)
- Left border accents (`border-l-4`)
- DaisyUI semantic tokens
- Typography-driven hierarchy
- Subtle editorial shadows

## Integration

1. **Install**: Already included in `@splits-network/basel-ui`
2. **Replace**: Remove existing service status banners from apps
3. **Import**: Use `ServiceStatusProvider` for simple integration
4. **Customize**: Use individual components for advanced use cases

## Apps Integration Plan

### Portal App

```tsx
// Replace apps/portal/src/components/service-status-banner.tsx
import { ServiceStatusProvider } from "@splits-network/basel-ui";
```

### Candidate App

```tsx
// Replace apps/candidate/src/components/service-status-banner.tsx
import { ServiceStatusProvider } from "@splits-network/basel-ui";
```

### Corporate App

```tsx
// Replace apps/corporate/src/components/service-status-banner.tsx
import { ServiceStatusProvider } from "@splits-network/basel-ui";
```

## Dependencies

- Next.js 16+
- React 19+
- DaisyUI (for semantic tokens)
- TailwindCSS
- FontAwesome (for icons)

## Performance

- **Auto-refresh**: 60-second intervals (configurable)
- **Session storage**: Dismissed notifications persist 10 minutes
- **ResizeObserver**: Dynamic height calculation for sticky positioning
- **CSS variables**: `--banner-h` for layout coordination

## Accessibility

- ARIA labels on dismiss buttons
- Semantic HTML structure
- High contrast color combinations from DaisyUI
- Keyboard navigation support
- Screen reader friendly
