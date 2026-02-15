# migrate-page

Migrate a single page to Memphis design system.

## Usage

This skill is invoked by memphis-orchestrator or memphis-designer to migrate individual pages.

## Process

1. **Analyze Target**
   - Read target page file
   - Identify current design patterns
   - Count violations (shadows, rounded corners, gradients)

2. **Find Reference**
   - Match to similar Designer Six showcase page
   - Use as visual/code reference

3. **Apply Transformations**
   - Remove all shadows
   - Remove all rounded corners (except circles)
   - Remove all gradients
   - Replace colors with Memphis palette
   - Add 4px borders to interactive elements
   - Add geometric decorations

4. **Validate**
   - Check for remaining violations
   - Ensure functionality preserved
   - Verify accessibility maintained

5. **Save**
   - Write migrated file
   - Update build progress
   - Save checkpoint

## Memphis Transformations

### Buttons
```tsx
// Before
<button className="btn btn-primary shadow-lg rounded-lg">
  Click Me
</button>

// After
<button className="btn bg-coral text-dark border-4 border-dark font-bold uppercase">
  Click Me
</button>
```

### Cards
```tsx
// Before
<div className="card shadow-xl rounded-2xl bg-white">
  <div className="card-body">Content</div>
</div>

// After
<div className="card border-4 border-dark bg-cream relative">
  <div className="card-body">Content</div>
  <div className="absolute top-4 right-4 w-8 h-8 bg-teal rotate-45" />
</div>
```

### Forms
```tsx
// Before
<input className="input input-bordered rounded-md" />

// After
<input className="input border-4 border-dark bg-cream text-dark" />
```

## Quality Checklist

- [ ] No shadows (shadow, drop-shadow, box-shadow)
- [ ] No rounded corners (rounded-*, except rounded-full for circles)
- [ ] No gradients (bg-gradient-*, linear-gradient, etc.)
- [ ] Memphis colors only (coral, teal, yellow, purple, dark, cream)
- [ ] 4px borders on interactive elements
- [ ] Geometric decorations added (1-3 shapes)
- [ ] Functionality preserved
- [ ] Accessibility maintained
- [ ] Build progress updated

## Output

Report migration result:
```
✅ Page migrated: apps/portal/src/app/dashboard/page.tsx
- Removed 5 shadows
- Removed 8 rounded corners
- Replaced 12 colors
- Added 4px borders to 15 elements
- Added 2 geometric shapes
Memphis compliance: 100%
```
