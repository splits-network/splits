/**
 * Standardized loading components
 *
 * Based on patterns documented in docs/guidance/loading-states-patterns.md
 *
 * @module @splits-network/shared-ui/loading
 */

// Core components
export { LoadingSpinner, type LoadingSpinnerProps } from './loading-spinner';
export { LoadingState, type LoadingStateProps } from './loading-state';
export {
    SkeletonLoader,
    SkeletonList,
    type SkeletonLoaderProps,
    type SkeletonListProps,
    type SkeletonVariant,
} from './skeleton-loader';
export { ButtonLoading, type ButtonLoadingProps } from './button-loading';
export {
    ModalLoadingOverlay,
    type ModalLoadingOverlayProps,
} from './modal-loading-overlay';
export {
    ChartLoadingState,
    type ChartLoadingStateProps,
} from './chart-loading-state';
export {
    SplashLoading,
    type SplashLoadingProps,
} from './splash-loading';

// Types and constants
export type {
    SpinnerSize,
    SpinnerType,
    LoadingColor,
} from './types';
export { SIZE_GUIDELINES, COLOR_GUIDELINES } from './types';
