/**
 * Retro Memphis DaisyUI Theme
 *
 * Maps the Memphis design palette used across landing/six, articles/six,
 * and lists/six to DaisyUI theme variables.
 *
 * Original Memphis color palette:
 *   coral   = #FF6B6B   (primary actions, CTAs, error states)
 *   teal    = #4ECDC4   (secondary actions, success, open status)
 *   yellow  = #FFE66D   (accents, highlights, featured badges, warnings)
 *   purple  = #A78BFA   (tertiary accent, info states, tags)
 *   dark    = #1A1A2E   (backgrounds, text, neutral base)
 *   cream   = #F5F0EB   (light backgrounds, base-200)
 *   white   = #FFFFFF   (card backgrounds, base-100)
 */

export const memphisTheme = {
    memphis: {
        // ── Core palette ────────────────────────────────────────────────
        // coral -- bold, warm red-pink used for primary CTAs, headlines,
        // and the dominant action color throughout the Memphis pages
        "primary": "#FF6B6B",
        "primary-content": "#FFFFFF",

        // teal -- cool counterpart to coral, used for secondary actions,
        // open/success status badges, and alternate section accents
        "secondary": "#4ECDC4",
        "secondary-content": "#1A1A2E",

        // yellow -- high-energy highlight color for featured badges,
        // overline tags, warning states, and Memphis shape fills
        "accent": "#FFE66D",
        "accent-content": "#1A1A2E",

        // ── Neutral ─────────────────────────────────────────────────────
        // dark navy -- the signature Memphis dark background, used for
        // hero sections, sidebar, table headers, and footer
        "neutral": "#1A1A2E",
        "neutral-content": "#FFFFFF",

        // ── Base surfaces ───────────────────────────────────────────────
        // white -- card backgrounds, table rows (even), detail panels
        "base-100": "#FFFFFF",
        // cream -- section backgrounds, table rows (odd), page canvas
        "base-200": "#F5F0EB",
        // slightly darker cream -- borders, dividers, subtle separation
        "base-300": "#E8E0D8",
        // dark navy -- primary text color on light backgrounds
        "base-content": "#1A1A2E",

        // ── Semantic states ─────────────────────────────────────────────
        // purple -- informational callouts, tags, info badges
        // maps to the purple Memphis accent used for timeline markers,
        // pull quotes, and skill tags
        "info": "#A78BFA",
        "info-content": "#FFFFFF",

        // teal -- success states, "open" status badges, positive actions
        "success": "#4ECDC4",
        "success-content": "#1A1A2E",

        // yellow -- warning states, "pending" status badges, caution
        "warning": "#FFE66D",
        "warning-content": "#1A1A2E",

        // coral -- error states, "filled/closed" status badges,
        // destructive actions
        "error": "#FF6B6B",
        "error-content": "#FFFFFF",

        // ── Component styling ───────────────────────────────────────────
        // Sharp corners to match Memphis geometric aesthetic (no rounding)
        "--rounded-box": "0",
        "--rounded-btn": "0",
        "--rounded-badge": "0",

        // Thick borders matching the border-4 (4px) pattern used
        // throughout Memphis cards, panels, and controls
        "--border-btn": "4px",

        // Button click feedback -- slight downward press
        "--btn-focus-scale": "0.97",

        // No animations on DaisyUI components to let GSAP handle motion
        "--animation-btn": "0",
        "--animation-input": "0",

        // Tab styling -- sharp, no radius
        "--tab-border": "4px",
        "--tab-radius": "0",
    },
};

/**
 * Extended Memphis color tokens
 *
 * Additional color values used in the Memphis pages that fall outside
 * standard DaisyUI theme variables. Use these directly in components
 * via inline styles or Tailwind arbitrary values.
 */
export const memphisTokens = {
    // The four cycling accent colors used for alternating card borders,
    // table row highlights, and tag backgrounds
    accentCycle: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#A78BFA"] as const,

    // Named references matching the COLORS object in page components
    coral: "#FF6B6B",
    teal: "#4ECDC4",
    yellow: "#FFE66D",
    purple: "#A78BFA",
    dark: "#1A1A2E",
    cream: "#F5F0EB",
    white: "#FFFFFF",

    // Derived transparency values used for subtle backgrounds and borders
    coralLight: "#FF6B6B20",
    tealLight: "#4ECDC420",
    yellowLight: "#FFE66D20",
    purpleLight: "#A78BFA20",
    darkOverlay: "rgba(26, 26, 46, 0.5)",
};
