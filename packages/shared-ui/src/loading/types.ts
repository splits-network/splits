/**
 * Loading component types and configurations
 * Based on standardization from docs/guidance/loading-states-patterns.md
 */

/**
 * Spinner size variants
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Spinner type variants
 */
export type SpinnerType = 'spinner' | 'dots' | 'ring' | 'ball';

/**
 * Semantic color variants
 */
export type LoadingColor =
    | 'default'
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'success'
    | 'info'
    | 'warning'
    | 'error'
    | 'white';

/**
 * Size guidelines based on context
 */
export const SIZE_GUIDELINES = {
    xs: 'Inline actions, icon buttons, small operations',
    sm: 'Form buttons, submit/save actions',
    md: 'Modal/card content, chart areas',
    lg: 'Full page load, major section load',
} as const;

/**
 * Color usage guidelines
 */
export const COLOR_GUIDELINES = {
    default: 'Most loading states',
    success: 'Success confirmation loading, positive actions',
    error: 'Retry operations, error recovery loading',
    warning: 'Cautious operations, deletions',
    white: 'Dark backgrounds, primary buttons',
} as const;
