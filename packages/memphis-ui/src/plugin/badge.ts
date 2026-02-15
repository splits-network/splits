/** Memphis Badge — interactive tier */

export const badgeUtilities = {
    '.badge-coral': {
        'background-color': 'var(--color-coral)',
        'color': '#FFFFFF',
        'border-color': 'var(--color-dark)',
    },
    '.badge-teal': {
        'background-color': 'var(--color-teal)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-yellow': {
        'background-color': 'var(--color-yellow)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-purple': {
        'background-color': 'var(--color-purple)',
        'color': '#FFFFFF',
        'border-color': 'var(--color-dark)',
    },
    '.badge-dark': {
        'background-color': 'var(--color-dark)',
        'color': '#FFFFFF',
        'border-color': 'var(--color-dark)',
    },
    '.badge-cream': {
        'background-color': 'var(--color-cream)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
};

export const badgeComponents = {
    // Base (layer .badge-{color} on top)
    '.badge': {
        'display': 'inline-flex',
        'align-items': 'center',
        'gap': '0.375rem',
        'padding': '0.25rem 0.75rem',
        'border-width': 'var(--border-interactive)',
        'border-style': 'solid',
        'border-color': 'var(--color-dark)',
        'border-radius': '0',
        'font-weight': '700',
        'font-size': '0.75rem',
        'text-transform': 'uppercase',
        'letter-spacing': '0.05em',
        'line-height': '1.2',
        'white-space': 'nowrap',
    },
    // Sizes (border-width scales automatically: sm=2px, md=3px, lg=4px)
    '.badge-sm': {
        'padding': '0.125rem 0.5rem',
        'font-size': '0.625rem',
        'letter-spacing': '0.08em',
        'gap': '0.25rem',
        'border-width': 'var(--border-detail)',
    },
    '.badge-md': {
        'padding': '0.25rem 0.75rem',
        'font-size': '0.75rem',
        'border-width': 'var(--border-interactive)',
    },
    '.badge-lg': {
        'padding': '0.375rem 1rem',
        'font-size': '0.875rem',
        'border-width': 'var(--border-container)',
    },
    // Border-width overrides (use to force a specific border regardless of size)
    '.badge-border-thin': {
        'border-width': 'var(--border-detail)',
    },
    '.badge-border-default': {
        'border-width': 'var(--border-interactive)',
    },
    '.badge-border-thick': {
        'border-width': 'var(--border-container)',
    },
    // Outline variant
    '.badge-outline': {
        'background-color': 'transparent',
    },
    '.badge-outline.badge-coral': {
        'background-color': 'transparent',
        'color': 'var(--color-coral)',
        'border-color': 'var(--color-coral)',
    },
    '.badge-outline.badge-teal': {
        'background-color': 'transparent',
        'color': 'var(--color-teal)',
        'border-color': 'var(--color-teal)',
    },
    '.badge-outline.badge-yellow': {
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-yellow)',
    },
    '.badge-outline.badge-purple': {
        'background-color': 'transparent',
        'color': 'var(--color-purple)',
        'border-color': 'var(--color-purple)',
    },
    '.badge-outline.badge-dark': {
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    // Soft variant
    '.badge-soft': {
        'border-color': 'var(--color-dark)',
    },
    '.badge-soft.badge-coral': {
        'background-color': 'var(--color-coral-light, #FFE8E8)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-soft.badge-teal': {
        'background-color': 'var(--color-teal-light, #E0F7F5)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-soft.badge-yellow': {
        'background-color': 'var(--color-yellow-light, #FFF9E0)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-soft.badge-purple': {
        'background-color': 'var(--color-purple-light, #EDE8FF)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    '.badge-soft.badge-dark': {
        'background-color': 'var(--color-cream)',
        'color': 'var(--color-dark)',
        'border-color': 'var(--color-dark)',
    },
    // Dot variant
    '.badge-dot': {
        'border': 'none',
        'padding': '0',
        'gap': '0.375rem',
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
    },
};
