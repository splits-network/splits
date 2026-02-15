# apply-theme

Apply Memphis theme to an existing component.

## Usage

This skill applies Memphis design tokens and patterns to a component while preserving its structure.

## Process

1. **Read Component**
   - Load component file
   - Identify current styling

2. **Apply Memphis Tokens**
   - Replace colors with Memphis palette
   - Update borders to 4px
   - Remove shadows and rounded corners
   - Add geometric decorations

3. **Update Utilities**
   - Use Memphis color classes (bg-coral, text-dark, etc.)
   - Use Memphis border utilities (border-4)
   - Use Memphis spacing (consistent 8px scale)

4. **Preserve Structure**
   - Keep component logic unchanged
   - Maintain props interface
   - Preserve event handlers
   - Keep accessibility features

5. **Validate**
   - Check Memphis compliance
   - Verify functionality
   - Test appearance

## Memphis Theme Application

### Color Replacement
```tsx
// Before
<button className="bg-blue-500 hover:bg-blue-600 text-white">

// After
<button className="bg-coral hover:bg-teal text-dark">
```

### Border Updates
```tsx
// Before
<div className="border border-gray-300 rounded-lg">

// After
<div className="border-4 border-dark">
```

### Shadow Removal
```tsx
// Before
<div className="shadow-xl">

// After
<div className="border-4 border-dark bg-cream">
```

### Adding Decorations
```tsx
// Before
<div className="card bg-white">
  <div className="card-body">Content</div>
</div>

// After
<div className="card border-4 border-dark bg-cream relative">
  <div className="card-body">Content</div>
  {/* Memphis decoration */}
  <div className="absolute top-4 right-4 w-8 h-8 bg-yellow rotate-45" />
</div>
```

## Memphis Color Mapping

| Generic | Memphis |
|---------|---------|
| bg-blue-* | bg-coral or bg-teal |
| bg-green-* | bg-teal |
| bg-red-* | bg-coral |
| bg-orange-* | bg-yellow |
| bg-indigo-*, bg-violet-* | bg-purple |
| bg-white | bg-cream |
| bg-gray-* | bg-cream or bg-dark |
| text-white | text-dark or text-cream |
| text-gray-* | text-dark with opacity |
| border-gray-* | border-dark |

## Memphis Spacing

Use 8px-based spacing:
- gap-2 (8px)
- gap-4 (16px)
- gap-6 (24px)
- p-4 (16px)
- p-6 (24px)
- p-8 (32px)

## Memphis Typography

```tsx
// Headlines
<h1 className="text-3xl font-bold uppercase text-dark">

// Body text
<p className="text-base text-dark opacity-70">

// Buttons
<button className="font-bold uppercase tracking-wider">
```

## Quality Checklist

- [ ] All colors mapped to Memphis palette
- [ ] All borders are 4px (border-4)
- [ ] No shadows remaining
- [ ] No rounded corners (except circles)
- [ ] Geometric decorations added
- [ ] Spacing uses 8px scale
- [ ] Typography follows Memphis style
- [ ] Component logic preserved
- [ ] Accessibility maintained

## Output

Report theme application:
```
✅ Theme applied: JobCard component
- Colors updated: 8 instances
- Borders updated: 4 instances
- Shadows removed: 2 instances
- Decorations added: 1 shape
- Component logic: Preserved
- Memphis compliance: 100%
```
