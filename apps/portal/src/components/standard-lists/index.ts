// Thin re-export wrapper — 34 portal consumers import from @/components/standard-lists
// Individual component files have been moved to @splits-network/shared-ui
export {
    SearchInput,
    PaginationControls,
    EmptyState,
    ErrorState,
    ViewModeToggle,
    MobileDetailOverlay,
    // StandardListLoadingState re-exported as LoadingState to preserve backward compat
    StandardListLoadingState as LoadingState,
} from '@splits-network/shared-ui';
