# shared-ui

Standardized UI components shared across all frontend apps.

## Modules

```
src/loading/          # LoadingState, LoadingSpinner, SkeletonLoader, ButtonLoading,
                      # ModalLoadingOverlay, ChartLoadingState
src/browse/           # Browse/filter components
src/markdown/         # Markdown rendering
src/activity/         # Activity feed components
src/application-notes/ # Application note components
src/application-timeline/ # Timeline components
src/portal/           # Portal-specific shared UI
src/seo/              # SEO components
src/service-status/   # Service health status display
```

## Loading Components (Primary Export)

**All apps MUST use these — never create manual loading spinners.**

```tsx
import {
    LoadingState, LoadingSpinner, SkeletonLoader,
    ButtonLoading, ModalLoadingOverlay, ChartLoadingState,
} from '@splits-network/shared-ui';
```

Sizes: `xs` (inline), `sm` (buttons), `md` (charts/modals), `lg` (full page).

See `docs/guidance/loading-patterns-usage-guide.md` for complete usage guide.
