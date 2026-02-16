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
1. Opens `packages/memphis-ui/src/theme.config.ts` (single source of truth)
2. Allows modification of:
   - Color palette (`colors`)
   - Border widths (`borders`: container/interactive/detail)
   - Design tokens (`tokens`: letter-spacing, speed, opacity)
   - Button/badge sizes (`sizes`: sm/md/lg with border tiers)
   - Semantic color mapping (`semantic`: primary→coral, etc.)
   - Geometry (`geometry`: border-radius, animation)
3. Validates changes against Memphis principles
4. Regenerates CSS: `tsx scripts/generate.ts` → `node build.js` → `tsc -b`
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

## Theme Architecture

### Single Source of Truth: `packages/memphis-ui/src/theme.config.ts`

The theme is defined in TypeScript, NOT CSS. CSS is **generated** from this config.

```typescript
// packages/memphis-ui/src/theme.config.ts (excerpt)
export const config: ThemeConfig = {
    colors: {
        coral:  { hex: '#FF6B6B', hover: '#e85d5d', light: '#FF6B6B20', text: 'white' },
        teal:   { hex: '#4ECDC4', hover: '#3dbdb4', light: '#4ECDC420', text: 'dark' },
        yellow: { hex: '#FFE66D', hover: '#f5da57', light: '#FFE66D20', text: 'dark' },
        purple: { hex: '#A78BFA', hover: '#9577e8', light: '#A78BFA20', text: 'white' },
        dark:   { hex: '#1A1A2E', hover: '#2a2a44', text: 'white' },
        cream:  { hex: '#F5F0EB', text: 'dark' },
    },
    borders: { container: '4px', interactive: '3px', detail: '2px' },
    sizes: {
        sm: { btnPad: '0.5rem 1rem', btnFs: '0.875rem', border: 'detail', ... },
        md: { btnPad: '0.75rem 1.5rem', btnFs: '1rem', border: 'interactive', ... },
        lg: { btnPad: '1rem 2rem', btnFs: '1.125rem', border: 'container', ... },
    },
    semantic: { primary: 'coral', secondary: 'teal', accent: 'yellow', neutral: 'dark', ... },
    tokens: { ls: '0.05em', speed: '150ms', ... },
    geometry: { 'rounded-box': 0, 'rounded-btn': 0, 'border-btn': '4px', ... },
};
```

### Generated Files (NEVER edit directly)

| Generator | Output | Purpose |
|-----------|--------|---------|
| `theme-css.ts` | `src/themes/memphis.css` | CSS variable declarations |
| `variables-js.ts` | `functions/variables.js` | `theme.extend.colors` (enables `@apply border-coral`) |
| `button-css.ts` | `src/components/button.css` | Memphis button additions (appended to SilicaUI base) |
| `badge-css.ts` | `src/components/badge.css` | Memphis badge additions |
| `table-css.ts` | `src/components/table.css` | Memphis table overrides |
| `controlsbar-css.ts` | `src/components/controlsbar.css` | Memphis controls bar |
| `utilities-css.ts` | `src/utilities/memphis.css` | Border tiers, bg-*-light |

### Build Pipeline

```bash
# Full rebuild after editing theme.config.ts:
pnpm --filter @splits-network/memphis-ui build

# Or step-by-step:
tsx scripts/generate.ts   # Generate CSS from config into src/
node build.js             # Build plugin handlers into dist/
tsc -b                    # Compile React components into dist/react/
```

### Plugin Loading (in app globals.css)

```css
@plugin "@splits-network/memphis-ui/plugin";
```

No `@import` of theme.css. No `tailwind.config.ts` needed.

## Updating Colors

```bash
/memphis:theme update

> What would you like to update?
> 1. Color palette
> 2. Border widths (3-tier hierarchy)
> 3. Design tokens
> 4. Button/badge sizes
> 5. Semantic mapping

User: 1

> Current Memphis Colors (from theme.config.ts):
> - Coral: #FF6B6B (hover: #e85d5d, light: #FF6B6B20)
> - Teal: #4ECDC4 (hover: #3dbdb4, light: #4ECDC420)
> - Yellow: #FFE66D (hover: #f5da57, light: #FFE66D20)
> - Purple: #A78BFA (hover: #9577e8, light: #A78BFA20)
> - Dark: #1A1A2E (hover: #2a2a44)
> - Cream: #F5F0EB

User: coral

> Current Coral: { hex: '#FF6B6B', hover: '#e85d5d', light: '#FF6B6B20', text: 'white' }
> New hex value:

User: #FF5555

> ✅ Valid hex color
> ✅ Contrast ratio: 4.8:1 (WCAG AA compliant)
> Updated theme.config.ts → regenerating CSS...
> ✅ tsx scripts/generate.ts (CSS regenerated)
> ✅ node build.js (plugin rebuilt)

> Apply change? (y/n)
```

## Implementation

When invoked:
1. Reads current `packages/memphis-ui/src/theme.config.ts`
2. Presents interactive menu based on action
3. For updates:
   - Validates new values
   - Checks Memphis compliance
   - Previews changes
   - Updates `theme.config.ts`
   - Runs `pnpm --filter @splits-network/memphis-ui build` (generate → build:plugin → build:react)
4. For preview:
   - Reads `theme.config.ts` and shows all design tokens
   - Shows generated CSS variables from `src/themes/memphis.css`
5. For validation:
   - Runs Memphis compliance checks against `theme.config.ts`
   - Reports any violations
6. For export:
   - Converts theme config to requested format
   - Writes export file
