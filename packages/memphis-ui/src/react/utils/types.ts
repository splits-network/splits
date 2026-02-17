/**
 * Memphis UI — Shared React Types
 *
 * Central type definitions for all Memphis React components.
 */

/** Core Memphis palette colors */
export type MemphisCoreColor = 'coral' | 'teal' | 'yellow' | 'purple' | 'dark' | 'cream';

/** Extended palette colors */
export type MemphisExtendedColor =
    | 'pink' | 'rose' | 'orange' | 'amber'
    | 'lime' | 'green' | 'emerald'
    | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'fuchsia'
    | 'slate' | 'gray' | 'zinc' | 'stone';

/** All Memphis palette colors (core + extended) */
export type MemphisColor = MemphisCoreColor | MemphisExtendedColor;

/** DaisyUI semantic colors */
export type SemanticColor = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error';

/** Any valid Memphis color (palette or semantic) */
export type AnyMemphisColor = MemphisColor | SemanticColor;

/** Standard component size variants */
export type MemphisSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Border width variants (xs-2xl system) */
export type BorderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Border tier hierarchy (legacy mapping) */
export type BorderTier = 'container' | 'interactive' | 'detail';

/**
 * Core colors as a constant array (for iteration/validation).
 */
export const MEMPHIS_CORE_COLORS: MemphisCoreColor[] = [
    'coral', 'teal', 'yellow', 'purple', 'dark', 'cream',
];

/**
 * All palette colors as a constant array.
 */
export const MEMPHIS_ALL_COLORS: MemphisColor[] = [
    'coral', 'teal', 'yellow', 'purple', 'dark', 'cream',
    'pink', 'rose', 'orange', 'amber',
    'lime', 'green', 'emerald',
    'cyan', 'sky', 'blue', 'indigo', 'violet', 'fuchsia',
    'slate', 'gray', 'zinc', 'stone',
];
