/**
 * Memphis UI Design System — Single Source of Truth
 *
 * Edit this file, then run `pnpm generate` to rebuild the plugin.
 * Apps use: @plugin "@splits-network/memphis-ui/plugin";
 * Override any variable in globals.css via :root { --color-coral: red; }
 */

// ── Types ────────────────────────────────────────────────────────────

export interface ColorDef {
    hex: string;
    hover: string;
    light: string;
    focus: string;
    content: string;
    text: 'white' | 'dark';
    /** Override soft-variant bg (defaults to var(--color-{name}-light)) */
    softBg?: string;
}

export interface SizeDef {
    btnPad: string;
    btnFs: string;
    badgePad: string;
    badgeFs: string;
    badgeLs?: string;
    badgeGap?: string;
    border: 'container' | 'interactive' | 'detail';
}

export interface ThemeConfig {
    colors: Record<string, ColorDef>;
    buttonColors: string[];
    badgeColors: string[];
    badgeOutlineColors: string[];
    badgeSoftColors: string[];
    alertColors: string[];
    stepColors: string[];
    progressColors: string[];
    tooltipColors: string[];
    indicatorColors: string[];
    statusColors: string[];
    semantic: Record<string, string>;
    base: { 100: string; 200: string; 300: string; content: string };
    darkGray: string;
    darkOverlay: string;
    borders: Record<string, string>;
    tokens: Record<string, string>;
    sizes: Record<string, SizeDef>;
    geometry: Record<string, string | number>;
    accentCycle: string[];
}

// ── Config ───────────────────────────────────────────────────────────

export const config: ThemeConfig = {
    colors: {
        // ── Core Memphis Palette ────────────────────────────────────
        coral:   { hex: '#FF6B6B', hover: '#E85D5D', light: '#FF6B6B20', focus: '#FF6B6B40', content: '#FFFFFF', text: 'white' },
        teal:    { hex: '#4ECDC4', hover: '#3DBDB4', light: '#4ECDC420', focus: '#4ECDC440', content: '#1A1A2E', text: 'dark' },
        yellow:  { hex: '#FFE66D', hover: '#F5DA57', light: '#FFE66D20', focus: '#FFE66D40', content: '#1A1A2E', text: 'dark' },
        purple:  { hex: '#A78BFA', hover: '#9577E8', light: '#A78BFA20', focus: '#A78BFA40', content: '#FFFFFF', text: 'white' },
        dark:    { hex: '#1A1A2E', hover: '#2A2A44', light: '#1A1A2E15', focus: '#1A1A2E30', content: '#FFFFFF', text: 'white', softBg: 'var(--color-cream)' },
        cream:   { hex: '#F5F0EB', hover: '#EDE5DC', light: '#F5F0EB60', focus: '#F5F0EB80', content: '#1A1A2E', text: 'dark' },

        // ── Extended Palette ────────────────────────────────────────
        pink:    { hex: '#F472B6', hover: '#E05AA0', light: '#F472B620', focus: '#F472B640', content: '#FFFFFF', text: 'white' },
        rose:    { hex: '#FB7185', hover: '#E5606F', light: '#FB718520', focus: '#FB718540', content: '#FFFFFF', text: 'white' },
        orange:  { hex: '#FB923C', hover: '#E57E2E', light: '#FB923C20', focus: '#FB923C40', content: '#1A1A2E', text: 'dark' },
        amber:   { hex: '#FBBF24', hover: '#E5AD1A', light: '#FBBF2420', focus: '#FBBF2440', content: '#1A1A2E', text: 'dark' },
        lime:    { hex: '#A3E635', hover: '#8FCC28', light: '#A3E63520', focus: '#A3E63540', content: '#1A1A2E', text: 'dark' },
        green:   { hex: '#34D399', hover: '#28BF88', light: '#34D39920', focus: '#34D39940', content: '#1A1A2E', text: 'dark' },
        emerald: { hex: '#10B981', hover: '#0DA672', light: '#10B98120', focus: '#10B98140', content: '#FFFFFF', text: 'white' },
        cyan:    { hex: '#22D3EE', hover: '#1ABDD6', light: '#22D3EE20', focus: '#22D3EE40', content: '#1A1A2E', text: 'dark' },
        sky:     { hex: '#38BDF8', hover: '#2AABE5', light: '#38BDF820', focus: '#38BDF840', content: '#1A1A2E', text: 'dark' },
        blue:    { hex: '#60A5FA', hover: '#4F93E8', light: '#60A5FA20', focus: '#60A5FA40', content: '#FFFFFF', text: 'white' },
        indigo:  { hex: '#818CF8', hover: '#6E7AE5', light: '#818CF820', focus: '#818CF840', content: '#FFFFFF', text: 'white' },
        violet:  { hex: '#8B5CF6', hover: '#7A4DE3', light: '#8B5CF620', focus: '#8B5CF640', content: '#FFFFFF', text: 'white' },
        fuchsia: { hex: '#D946EF', hover: '#C438DB', light: '#D946EF20', focus: '#D946EF40', content: '#FFFFFF', text: 'white' },
        slate:   { hex: '#64748B', hover: '#56657A', light: '#64748B20', focus: '#64748B40', content: '#FFFFFF', text: 'white' },
        gray:    { hex: '#9CA3AF', hover: '#8B929D', light: '#9CA3AF20', focus: '#9CA3AF40', content: '#1A1A2E', text: 'dark' },
        zinc:    { hex: '#71717A', hover: '#62626B', light: '#71717A20', focus: '#71717A40', content: '#FFFFFF', text: 'white' },
        stone:   { hex: '#A8A29E', hover: '#98928E', light: '#A8A29E20', focus: '#A8A29E40', content: '#1A1A2E', text: 'dark' },
    },

    /** Colors that get .btn-{name} classes */
    buttonColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .badge-{name} classes */
    badgeColors: ['coral', 'teal', 'yellow', 'purple', 'dark', 'cream'],

    /** Colors that get .badge-outline.badge-{name} classes */
    badgeOutlineColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .badge-soft.badge-{name} classes */
    badgeSoftColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .alert-{name} Memphis variants */
    alertColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .step-{name} Memphis variants */
    stepColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .progress-{name} Memphis variants */
    progressColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .tooltip-{name} Memphis variants */
    tooltipColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .indicator-item-{name} Memphis variants */
    indicatorColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Colors that get .status-{name} Memphis variants */
    statusColors: ['coral', 'teal', 'yellow', 'purple', 'dark'],

    /** Semantic color mapping — maps DaisyUI names to palette colors */
    semantic: {
        primary: 'coral',
        secondary: 'teal',
        accent: 'yellow',
        neutral: 'dark',
        info: 'purple',
        success: 'teal',
        warning: 'yellow',
        error: 'coral',
    },

    /** Base / neutral scale */
    base: { 100: '#FFFFFF', 200: '#F5F0EB', 300: '#E8E0D8', content: '#1A1A2E' },

    darkGray: '#2D2D44',
    darkOverlay: '#1A1A2E50',

    /** 3-tier border hierarchy */
    borders: {
        container: '4px',
        interactive: '3px',
        detail: '2px',
    },

    /** Design tokens — all referenced via var() in component styles */
    tokens: {
        ls: '0.05em',
        'ls-wide': '0.08em',
        speed: '150ms',
        'btn-active-scale': '0.97',
        'disabled-opacity': '0.5',
        'toggle-w': '2.75rem',
        'toggle-h': '1.5rem',
        'cell-px': '1rem',
        'cell-py': '0.75rem',
        'tab-px': '1.5rem',
    },

    /** Button & badge size variants (sm, md, lg) */
    sizes: {
        sm: {
            btnPad: '0.5rem 1rem',
            btnFs: '0.875rem',
            badgePad: '0.125rem 0.5rem',
            badgeFs: '0.625rem',
            badgeLs: 'var(--ls-wide)',
            badgeGap: '0.25rem',
            border: 'detail',
        },
        md: {
            btnPad: '0.75rem 1.5rem',
            btnFs: '1rem',
            badgePad: '0.25rem 0.75rem',
            badgeFs: '0.75rem',
            border: 'interactive',
        },
        lg: {
            btnPad: '1rem 2rem',
            btnFs: '1.125rem',
            badgePad: '0.375rem 1rem',
            badgeFs: '0.875rem',
            border: 'container',
        },
    },

    /** Component geometry tokens (legacy DaisyUI compat) */
    geometry: {
        'rounded-box': 0,
        'rounded-btn': 0,
        'rounded-badge': 0,
        'border-btn': '4px',
        'btn-focus-scale': 0.97,
        'animation-btn': 0,
        'animation-input': 0,
        'tab-border': '4px',
        'tab-radius': 0,
    },

    accentCycle: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA'],
};
