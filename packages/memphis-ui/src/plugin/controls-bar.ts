/** Memphis Controls Bar — container tier toolbar for search, filters, view toggles */

export const controlsBarComponents = {
    '.controls-bar': {
        'display': 'flex',
        'flex-direction': 'column',
        'align-items': 'stretch',
        'gap': '1rem',
        'padding': '1rem',
        'background-color': 'var(--color-white, #FFFFFF)',
        'border': 'var(--border-container) solid var(--color-dark)',
        'border-radius': '0',
        '@media (min-width: 768px)': {
            'flex-direction': 'row',
            'align-items': 'center',
        },
    },
};
