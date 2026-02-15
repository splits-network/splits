/**
 * Memphis UI TailwindCSS v4 Plugin
 *
 * Registers Memphis-specific utility classes and component base styles.
 * All styles follow Memphis principles: NO shadows, sharp corners, thick borders.
 *
 * Border Hierarchy (3 tiers):
 *   --memphis-border-container:   4px  (cards, modals, tables outer, tab bars)
 *   --memphis-border-interactive: 3px  (buttons, inputs, selects, badges, CTAs)
 *   --memphis-border-detail:      2px  (checkboxes, toggle internals, table cells, tiny indicators)
 *
 * Usage in CSS:
 *   @plugin "@splits-network/memphis-ui/plugin";
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function memphisPlugin({ addBase, addUtilities, addComponents }: any) {
    // ── CSS Custom Properties (single source of truth) ──────────────
    addBase({
        ':root': {
            '--memphis-border-container': '4px',
            '--memphis-border-interactive': '3px',
            '--memphis-border-detail': '2px',
        },
    });

    // ── Utility classes ─────────────────────────────────────────────
    addUtilities({
        // Button color utilities (interactive tier)
        '.btn-coral': {
            'background-color': 'var(--color-coral)',
            'color': '#FFFFFF',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            '&:hover': {
                'background-color': '#e85d5d',
            },
        },
        '.btn-teal': {
            'background-color': 'var(--color-teal)',
            'color': 'var(--color-dark)',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            '&:hover': {
                'background-color': '#3dbdb4',
            },
        },
        '.btn-yellow': {
            'background-color': 'var(--color-yellow)',
            'color': 'var(--color-dark)',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            '&:hover': {
                'background-color': '#f5da57',
            },
        },
        '.btn-purple': {
            'background-color': 'var(--color-purple)',
            'color': '#FFFFFF',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            '&:hover': {
                'background-color': '#9577e8',
            },
        },
        '.btn-dark': {
            'background-color': 'var(--color-dark)',
            'color': '#FFFFFF',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            '&:hover': {
                'background-color': '#2a2a44',
            },
        },
        // Background utilities
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
        '.border-memphis': {
            'border': 'var(--memphis-border-container) solid var(--color-dark)',
        },
        '.border-memphis-interactive': {
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
        },
        '.border-memphis-detail': {
            'border': 'var(--memphis-border-detail) solid var(--color-dark)',
        },
        // Keep backward compat alias
        '.border-memphis-2': {
            'border': 'var(--memphis-border-detail) solid var(--color-dark)',
        },
    });

    // ── Component base styles ─────────────────────────────────────────
    addComponents({
        // ── Button base (no color — layer .btn-{color} on top) ──────
        '.memphis-btn': {
            'display': 'inline-flex',
            'align-items': 'center',
            'justify-content': 'center',
            'gap': '0.5rem',
            'border-width': 'var(--memphis-border-interactive)',
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
        // Button sizes
        '.memphis-btn-sm': {
            'padding': '0.5rem 1rem',
            'font-size': '0.875rem',
        },
        '.memphis-btn-md': {
            'padding': '0.75rem 1.5rem',
            'font-size': '1rem',
        },
        '.memphis-btn-lg': {
            'padding': '1rem 2rem',
            'font-size': '1.125rem',
        },
        // Button outline modifier (transparent bg, text matches border color)
        '.memphis-btn-outline': {
            'background-color': 'transparent',
        },
        '.memphis-btn-outline.btn-coral': {
            'background-color': 'transparent',
            'color': 'var(--color-coral)',
            '&:hover': {
                'background-color': 'var(--color-coral)',
                'color': '#FFFFFF',
            },
        },
        '.memphis-btn-outline.btn-teal': {
            'background-color': 'transparent',
            'color': 'var(--color-dark)',
            '&:hover': {
                'background-color': 'var(--color-teal)',
                'color': 'var(--color-dark)',
            },
        },
        '.memphis-btn-outline.btn-yellow': {
            'background-color': 'transparent',
            'color': 'var(--color-dark)',
            '&:hover': {
                'background-color': 'var(--color-yellow)',
                'color': 'var(--color-dark)',
            },
        },
        '.memphis-btn-outline.btn-purple': {
            'background-color': 'transparent',
            'color': 'var(--color-purple)',
            '&:hover': {
                'background-color': 'var(--color-purple)',
                'color': '#FFFFFF',
            },
        },
        '.memphis-btn-outline.btn-dark': {
            'background-color': 'transparent',
            'color': 'var(--color-dark)',
            '&:hover': {
                'background-color': 'var(--color-dark)',
                'color': '#FFFFFF',
            },
        },

        // ── Card (container tier) ───────────────────────────────────
        '.memphis-card': {
            'background-color': 'var(--color-white, #FFFFFF)',
            'border': 'var(--memphis-border-container) solid var(--color-dark)',
            'border-radius': '0',
            'padding': '1.5rem',
        },
        '.memphis-card-dark': {
            'background-color': 'var(--color-dark)',
            'border': 'var(--memphis-border-container) solid var(--color-dark)',
            'border-radius': '0',
            'padding': '1.5rem',
            'color': '#FFFFFF',
        },

        // ── Badge (interactive tier) ────────────────────────────────
        '.memphis-badge': {
            'display': 'inline-flex',
            'align-items': 'center',
            'padding': '0.25rem 0.75rem',
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            'border-radius': '0',
            'font-weight': '700',
            'font-size': '0.75rem',
            'text-transform': 'uppercase',
            'letter-spacing': '0.05em',
        },

        // ── Input (interactive tier) ────────────────────────────────
        '.memphis-input': {
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            'border-radius': '0',
            'padding': '0.5rem 1rem',
            'background-color': 'var(--color-white, #FFFFFF)',
            'font-size': '1rem',
            '&:focus': {
                'outline': 'none',
                'border-color': 'var(--color-coral)',
            },
        },

        // ── Select (interactive tier) ───────────────────────────────
        '.memphis-select': {
            'border': 'var(--memphis-border-interactive) solid var(--color-dark)',
            'border-radius': '0',
            'padding': '0.5rem 1rem',
            'background-color': 'var(--color-white, #FFFFFF)',
            'font-size': '1rem',
            'appearance': 'none',
            '&:focus': {
                'outline': 'none',
                'border-color': 'var(--color-coral)',
            },
        },

        // ── Table (container tier outer, detail tier cells) ─────────
        '.memphis-table': {
            'width': '100%',
            'border-collapse': 'collapse',
            'border': 'var(--memphis-border-container) solid var(--color-dark)',
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
                'border-bottom': 'var(--memphis-border-detail) solid var(--color-base-300, #E8E0D8)',
            },
            '& tr:nth-child(even)': {
                'background-color': 'var(--color-cream)',
            },
        },

        // ── Tabs (container tier) ───────────────────────────────────
        '.memphis-tabs': {
            'display': 'flex',
            'border-bottom': 'var(--memphis-border-container) solid var(--color-dark)',
            'gap': '0',
        },
        '.memphis-tab': {
            'padding': '0.75rem 1.5rem',
            'font-weight': '700',
            'text-transform': 'uppercase',
            'font-size': '0.875rem',
            'letter-spacing': '0.05em',
            'border': 'var(--memphis-border-container) solid transparent',
            'border-bottom': 'none',
            'cursor': 'pointer',
            'background-color': 'transparent',
            'color': 'var(--color-dark)',
            'margin-bottom': 'calc(var(--memphis-border-container) * -1)',
            '&:hover': {
                'background-color': 'var(--color-cream)',
            },
        },
        '.memphis-tab-active': {
            'border-color': 'var(--color-dark)',
            'background-color': 'var(--color-white, #FFFFFF)',
        },

        // ── Modal (container tier) ──────────────────────────────────
        '.memphis-modal': {
            'border': 'var(--memphis-border-container) solid var(--color-dark)',
            'border-radius': '0',
            'background-color': 'var(--color-white, #FFFFFF)',
            'padding': '2rem',
        },
        '.memphis-modal-overlay': {
            'background-color': 'var(--color-dark-overlay, rgba(26, 26, 46, 0.5))',
        },

        // ── Checkbox (detail tier) ──────────────────────────────────
        '.memphis-checkbox': {
            'width': '1.25rem',
            'height': '1.25rem',
            'border': 'var(--memphis-border-detail) solid var(--color-dark)',
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

        // ── Toggle (detail tier internals) ──────────────────────────
        '.memphis-toggle': {
            'width': '2.75rem',
            'height': '1.5rem',
            'border': 'var(--memphis-border-detail) solid var(--color-dark)',
            'border-radius': '0',
            'background-color': 'var(--color-base-300, #E8E0D8)',
            'cursor': 'pointer',
            'position': 'relative',
            'transition': 'background-color 150ms',
        },
    });
}
