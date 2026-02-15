/** Memphis Tabs — container tier */

export const tabsComponents = {
    '.tabs': {
        'display': 'flex',
        'border-bottom': 'var(--border-container) solid var(--color-dark)',
        'gap': '0',
    },
    '.tab': {
        'padding': '0.75rem 1.5rem',
        'font-weight': '700',
        'text-transform': 'uppercase',
        'font-size': '0.875rem',
        'letter-spacing': '0.05em',
        'border': 'var(--border-container) solid transparent',
        'border-bottom': 'none',
        'cursor': 'pointer',
        'background-color': 'transparent',
        'color': 'var(--color-dark)',
        'margin-bottom': 'calc(var(--border-container) * -1)',
        '&:hover': {
            'background-color': 'var(--color-cream)',
        },
    },
    '.tab-active': {
        'border-color': 'var(--color-dark)',
        'background-color': 'var(--color-white, #FFFFFF)',
    },
};
