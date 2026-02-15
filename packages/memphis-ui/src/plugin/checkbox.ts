/** Memphis Checkbox — detail tier */

export const checkboxComponents = {
    '.checkbox': {
        'width': '1.25rem',
        'height': '1.25rem',
        'border': 'var(--border-detail) solid var(--color-dark)',
        'border-radius': '0',
        'appearance': 'none',
        'cursor': 'pointer',
        'display': 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'flex-shrink': '0',
        '&:checked': {
            'background-color': 'var(--color-coral)',
            'border-color': 'var(--color-dark)',
        },
    },
};
