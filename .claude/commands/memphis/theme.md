# /memphis:theme - Update Memphis Theme Configuration

**Category:** Design System
**Description:** Update Memphis theme colors, spacing, and design tokens

## Usage

```bash
/memphis:theme [action]
```

## Actions

- `update` - Update theme configuration
- `preview` - Preview current theme
- `validate` - Validate theme configuration
- `export` - Export theme for design tools

## Examples

```bash
/memphis:theme update
/memphis:theme preview
/memphis:theme validate
/memphis:theme export
```

## What It Does

### Update Theme
1. Opens `packages/memphis-ui/src/theme.css`
2. Allows modification of:
   - Color palette
   - Border widths
   - Spacing scale
   - Typography scale
   - Animation timings
3. Validates changes against Memphis principles
4. Rebuilds package
5. Shows preview

### Preview Theme
Generates visual preview of:
- All Memphis colors with hex values
- Border widths on sample elements
- Spacing scale visualization
- Typography samples
- Interactive component examples

### Validate Theme
Checks that theme adheres to Memphis principles:
- ✅ No border-radius values > 0
- ✅ No shadow/blur values
- ✅ Border widths >= 4px for interactive elements
- ✅ High contrast ratios (WCAG AA)
- ✅ Color palette consistency

### Export Theme
Exports theme configuration for:
- Figma (JSON)
- Adobe XD (JSON)
- Sketch (JSON)
- CSS variables
- SCSS variables

## Theme Structure

### packages/memphis-ui/src/theme.css
```css
@import "tailwindcss";

@theme {
  /* Memphis Color Palette */
  --color-coral: #FF6B6B;
  --color-teal: #4ECDC4;
  --color-yellow: #FFE66D;
  --color-purple: #A78BFA;
  --color-dark: #1A1A2E;
  --color-cream: #F5F0EB;

  /* Memphis Borders */
  --border-width-thick: 4px;
  --border-width-medium: 3px;
  --border-width-thin: 2px;

  /* Memphis Spacing (8px base) */
  --spacing-xs: 0.5rem;  /* 8px */
  --spacing-sm: 1rem;    /* 16px */
  --spacing-md: 1.5rem;  /* 24px */
  --spacing-lg: 2rem;    /* 32px */
  --spacing-xl: 3rem;    /* 48px */

  /* Memphis Typography */
  --font-size-xs: 0.75rem;   /* 12px */
  --font-size-sm: 0.875rem;  /* 14px */
  --font-size-base: 1rem;    /* 16px */
  --font-size-lg: 1.25rem;   /* 20px */
  --font-size-xl: 1.5rem;    /* 24px */
  --font-size-2xl: 2rem;     /* 32px */
  --font-size-3xl: 3rem;     /* 48px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-weight-black: 900;

  /* Memphis Animations */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 500ms cubic-bezier(0.4, 0, 0.2, 1);

  /* Border Radius (Memphis uses 0) */
  --radius-none: 0;
  --radius-full: 9999px; /* Only for circles */
}

/* Memphis Component Defaults */
@layer base {
  * {
    border-radius: 0; /* Enforce sharp corners globally */
  }
}

@layer components {
  .btn-memphis {
    @apply border-4 border-dark font-bold uppercase tracking-wider;
    @apply transition-transform hover:scale-105 active:scale-95;
    box-shadow: none !important;
  }

  .card-memphis {
    @apply border-4 border-dark bg-cream;
    box-shadow: none !important;
    border-radius: 0 !important;
  }
}
```

## Updating Colors

```bash
/memphis:theme update

> What would you like to update?
> 1. Color palette
> 2. Border widths
> 3. Spacing scale
> 4. Typography
> 5. Animations

User: 1

> Current Memphis Colors:
> - Coral: #FF6B6B
> - Teal: #4ECDC4
> - Yellow: #FFE66D
> - Purple: #A78BFA
> - Dark: #1A1A2E
> - Cream: #F5F0EB

> Which color would you like to update?
> (Enter color name or 'cancel')

User: coral

> Current Coral: #FF6B6B
> New hex value:

User: #FF5555

> ✅ Valid hex color
> Checking contrast ratio with dark (#1A1A2E)...
> ✅ Contrast ratio: 4.8:1 (WCAG AA compliant)

> Preview:
> [Shows button samples with new coral]

> Apply change? (y/n)
```

## Implementation

When invoked:
1. Reads current theme.css
2. Presents interactive menu based on action
3. For updates:
   - Validates new values
   - Checks Memphis compliance
   - Previews changes
   - Updates theme.css
   - Rebuilds package
4. For preview:
   - Generates HTML preview
   - Shows all design tokens
5. For validation:
   - Runs Memphis compliance checks
   - Reports any violations
6. For export:
   - Converts theme to requested format
   - Writes export file
