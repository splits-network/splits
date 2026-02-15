/** Memphis Button — interactive tier */

export const buttonUtilities = {
    '.btn-coral': {
        'background-color': 'var(--color-coral)',
        'color': '#FFFFFF',
        'border': 'var(--border-interactive) solid var(--color-dark)',
        '&:hover': {
            'background-color': '#e85d5d',
        },
    },
    '.btn-teal': {
        'background-color': 'var(--color-teal)',
        'color': 'var(--color-dark)',
        'border': 'var(--border-interactive) solid var(--color-dark)',
        '&:hover': {
            'background-color': '#3dbdb4',
        },
    },
    '.btn-yellow': {
        'background-color': 'var(--color-yellow)',
        'color': 'var(--color-dark)',
        'border': 'var(--border-interactive) solid var(--color-dark)',
        '&:hover': {
            'background-color': '#f5da57',
        },
    },
    '.btn-purple': {
        'background-color': 'var(--color-purple)',
        'color': '#FFFFFF',
        'border': 'var(--border-interactive) solid var(--color-dark)',
        '&:hover': {
            'background-color': '#9577e8',
        },
    },
    '.btn-dark': {
        'background-color': 'var(--color-dark)',
        'color': '#FFFFFF',
        'border': 'var(--border-interactive) solid var(--color-dark)',
        '&:hover': {
            'background-color': '#2a2a44',
        },
    },
};

export const buttonComponents = {
    // Base (no color — layer .btn-{color} on top)
    '.btn': {
        'display': 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'gap': '0.5rem',
        'border-width': 'var(--border-interactive)',
        'border-style': 'solid',
        'border-color': 'var(--color-dark)',
        'border-radius': '0',
        'font-weight': '700',
        'text-transform': 'uppercase',
        'letter-spacing': '0.05em',
        'cursor': 'pointer',
        'transition': 'background-color 150ms, color 150ms, transform 150ms',
        '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
        },
        '&:active:not(:disabled)': {
            'transform': 'scale(0.97)',
        },
    },
    // Sizes (border-width scales automatically: sm=2px, md=3px, lg=4px)
    '.btn-sm': {
        'padding': '0.5rem 1rem',
        'font-size': '0.875rem',
        'border-width': 'var(--border-detail)',
    },
    '.btn-md': {
        'padding': '0.75rem 1.5rem',
        'font-size': '1rem',
        'border-width': 'var(--border-interactive)',
    },
    '.btn-lg': {
        'padding': '1rem 2rem',
        'font-size': '1.125rem',
        'border-width': 'var(--border-container)',
    },
    // Border-width overrides (use to force a specific border regardless of size)
    '.btn-border-thin': {
        'border-width': 'var(--border-detail)',
    },
    '.btn-border-default': {
        'border-width': 'var(--border-interactive)',
    },
    '.btn-border-thick': {
        'border-width': 'var(--border-container)',
    },
    // Outline modifier
    '.btn-outline': {
        'background-color': 'transparent',
    },
    '.btn-outline.btn-coral': {
        'background-color': 'transparent',
        'color': 'var(--color-coral)',
        '&:hover': {
            'background-color': 'var(--color-coral)',
            'color': '#FFFFFF',
        },
    },
    '.btn-outline.btn-teal': {
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        '&:hover': {
            'background-color': 'var(--color-teal)',
            'color': 'var(--color-dark)',
        },
    },
    '.btn-outline.btn-yellow': {
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        '&:hover': {
            'background-color': 'var(--color-yellow)',
            'color': 'var(--color-dark)',
        },
    },
    '.btn-outline.btn-purple': {
        'background-color': 'transparent',
        'color': 'var(--color-purple)',
        '&:hover': {
            'background-color': 'var(--color-purple)',
            'color': '#FFFFFF',
        },
    },
    '.btn-outline.btn-dark': {
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        '&:hover': {
            'background-color': 'var(--color-dark)',
            'color': '#FFFFFF',
        },
    },
};
