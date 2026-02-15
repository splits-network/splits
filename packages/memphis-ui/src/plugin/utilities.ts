/** Shared Memphis utilities — backgrounds and semantic borders */

export const sharedUtilities = {
    // Background light variants
    '.bg-coral-light': {
        'background-color': 'var(--color-coral-light)',
    },
    '.bg-teal-light': {
        'background-color': 'var(--color-teal-light)',
    },
    '.bg-yellow-light': {
        'background-color': 'var(--color-yellow-light)',
    },
    '.bg-purple-light': {
        'background-color': 'var(--color-purple-light)',
    },
    // Semantic border utilities (3-tier hierarchy)
    '.border-container': {
        'border': 'var(--border-container) solid var(--color-dark)',
    },
    '.border-interactive': {
        'border': 'var(--border-interactive) solid var(--color-dark)',
    },
    '.border-detail': {
        'border': 'var(--border-detail) solid var(--color-dark)',
    },
    // Backward compat alias
    '.border-detail-compat': {
        'border': 'var(--border-detail) solid var(--color-dark)',
    },
};
