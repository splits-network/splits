# basel-ui

Basel Design System component library — DaisyUI semantic tokens only.

## Structure

```
src/buttons/          # Button variants
src/content/          # Content display components
src/display/          # Display components
src/forms/            # Form inputs and controls
src/layout/           # Layout primitives
src/modals/           # Modal/dialog components
src/navigation/       # Nav components
src/service-status/   # Service status indicators
src/theme/            # Theme configuration
src/utils/            # Shared utilities
```

## Build

Every `src/` edit requires a TypeScript build: `tsc -b`

## Key Rules

- Use CSS vars (`--btn-color`, `--badge-color`) — not direct `background-color`
- Plugin CSS beats Tailwind utilities — use inline `style` to win specificity
- DaisyUI semantic tokens only (e.g., `btn-primary`, `bg-base-100`) — no raw color values
