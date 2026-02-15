/** Memphis Table — container tier outer, detail tier cells */

export const tableComponents = {
    '.table': {
        'width': '100%',
        'border-collapse': 'collapse',
        'border': 'var(--border-container) solid var(--color-dark)',
        '& th': {
            'background-color': 'var(--color-dark)',
            'color': '#FFFFFF',
            'padding': '0.75rem 1rem',
            'text-align': 'left',
            'font-weight': '700',
            'text-transform': 'uppercase',
            'font-size': '0.75rem',
            'letter-spacing': '0.05em',
        },
        '& td': {
            'padding': '0.75rem 1rem',
            'border-bottom': 'var(--border-detail) solid var(--color-base-300, #E8E0D8)',
        },
        '& tr:nth-child(even)': {
            'background-color': 'var(--color-cream)',
        },
    },
};
