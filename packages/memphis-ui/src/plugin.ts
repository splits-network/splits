import plugin from 'tailwindcss/plugin';

/**
 * Memphis UI TailwindCSS Plugin
 *
 * Registers Memphis-specific utility classes and component base styles.
 * All styles follow Memphis principles: NO shadows, sharp corners, thick borders.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const memphisPlugin: any = plugin(function ({ addUtilities, addComponents }: { addUtilities: any; addComponents: any }) {
    // ── Button color utilities ────────────────────────────────────────
    addUtilities({
        '.btn-coral': {
            'background-color': '#FF6B6B',
            'color': '#FFFFFF',
            'border': '4px solid #1A1A2E',
            '&:hover': {
                'background-color': '#e85d5d',
            },
        },
        '.btn-teal': {
            'background-color': '#4ECDC4',
            'color': '#1A1A2E',
            'border': '4px solid #1A1A2E',
            '&:hover': {
                'background-color': '#3dbdb4',
            },
        },
        '.btn-yellow': {
            'background-color': '#FFE66D',
            'color': '#1A1A2E',
            'border': '4px solid #1A1A2E',
            '&:hover': {
                'background-color': '#f5da57',
            },
        },
        '.btn-purple': {
            'background-color': '#A78BFA',
            'color': '#FFFFFF',
            'border': '4px solid #1A1A2E',
            '&:hover': {
                'background-color': '#9577e8',
            },
        },
        '.btn-dark': {
            'background-color': '#1A1A2E',
            'color': '#FFFFFF',
            'border': '4px solid #1A1A2E',
            '&:hover': {
                'background-color': '#2a2a44',
            },
        },
        // Background utilities
        '.bg-coral-light': {
            'background-color': '#FF6B6B20',
        },
        '.bg-teal-light': {
            'background-color': '#4ECDC420',
        },
        '.bg-yellow-light': {
            'background-color': '#FFE66D20',
        },
        '.bg-purple-light': {
            'background-color': '#A78BFA20',
        },
        // Border utilities
        '.border-memphis': {
            'border': '4px solid #1A1A2E',
        },
        '.border-memphis-2': {
            'border': '2px solid #1A1A2E',
        },
    });

    // ── Component base styles ─────────────────────────────────────────
    addComponents({
        '.memphis-card': {
            'background-color': '#FFFFFF',
            'border': '4px solid #1A1A2E',
            'border-radius': '0',
            'padding': '1.5rem',
        },
        '.memphis-card-dark': {
            'background-color': '#1A1A2E',
            'border': '4px solid #1A1A2E',
            'border-radius': '0',
            'padding': '1.5rem',
            'color': '#FFFFFF',
        },
        '.memphis-badge': {
            'display': 'inline-flex',
            'align-items': 'center',
            'padding': '0.25rem 0.75rem',
            'border': '2px solid #1A1A2E',
            'border-radius': '0',
            'font-weight': '700',
            'font-size': '0.75rem',
            'text-transform': 'uppercase',
            'letter-spacing': '0.05em',
        },
        '.memphis-input': {
            'border': '4px solid #1A1A2E',
            'border-radius': '0',
            'padding': '0.5rem 1rem',
            'background-color': '#FFFFFF',
            'font-size': '1rem',
            '&:focus': {
                'outline': 'none',
                'border-color': '#FF6B6B',
            },
        },
        '.memphis-select': {
            'border': '4px solid #1A1A2E',
            'border-radius': '0',
            'padding': '0.5rem 1rem',
            'background-color': '#FFFFFF',
            'font-size': '1rem',
            'appearance': 'none',
            '&:focus': {
                'outline': 'none',
                'border-color': '#FF6B6B',
            },
        },
        '.memphis-table': {
            'width': '100%',
            'border-collapse': 'collapse',
            'border': '4px solid #1A1A2E',
            '& th': {
                'background-color': '#1A1A2E',
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
                'border-bottom': '2px solid #E8E0D8',
            },
            '& tr:nth-child(even)': {
                'background-color': '#F5F0EB',
            },
        },
        '.memphis-tabs': {
            'display': 'flex',
            'border-bottom': '4px solid #1A1A2E',
            'gap': '0',
        },
        '.memphis-tab': {
            'padding': '0.75rem 1.5rem',
            'font-weight': '700',
            'text-transform': 'uppercase',
            'font-size': '0.875rem',
            'letter-spacing': '0.05em',
            'border': '4px solid transparent',
            'border-bottom': 'none',
            'cursor': 'pointer',
            'background-color': 'transparent',
            'color': '#1A1A2E',
            'margin-bottom': '-4px',
            '&:hover': {
                'background-color': '#F5F0EB',
            },
        },
        '.memphis-tab-active': {
            'border-color': '#1A1A2E',
            'background-color': '#FFFFFF',
        },
        '.memphis-modal': {
            'border': '4px solid #1A1A2E',
            'border-radius': '0',
            'background-color': '#FFFFFF',
            'padding': '2rem',
        },
        '.memphis-modal-overlay': {
            'background-color': 'rgba(26, 26, 46, 0.5)',
        },
    });
});
