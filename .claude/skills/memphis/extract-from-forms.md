# extract-from-forms

Extract reusable components from the forms showcase page.

## Available Components

1. **MemphisInput** - Text input with label, validation states, and error messages
2. **MemphisTextarea** - Textarea with label, validation, and character count
3. **MemphisSelect** - Select dropdown with label and validation state
4. **MemphisFileUpload** - Drag-and-drop file upload with preview and remove
5. **MemphisRadioGroup** - Row of toggle buttons for single selection
6. **MemphisCheckbox** - Square checkbox toggle with label
7. **SpecializationGrid** - 2-column grid of selectable tag buttons
8. **FormStepIndicator** - Numbered progress bar with connector lines
9. **FormStepBadge** - "Step N of M" colored badge
10. **ReviewCard** - Bordered summary card for review/confirmation step
11. **FormCard** - Outer form container with step header and footer nav
12. **FormFooterNav** - Bottom action bar with back/reset and next/submit buttons
13. **SubmittingState** - Loading spinner with progress bar
14. **FormSuccessState** - Celebration icon with heading and reset button
15. **ValidationStateShowcase** - Reference display of all 4 validation states

## Component Details

### MemphisInput
```tsx
interface MemphisInputProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string; // "text" | "email" | "tel" etc.
    required?: boolean;
    state?: "idle" | "error" | "success" | "warning";
    message?: string;
    disabled?: boolean;
}
// border-3, cream bg, state-based border color and box-shadow,
// label: text-xs font-black uppercase tracking-[0.15em],
// required star in coral, state icon on right of label,
// error message below in state color
// State colors: error=#FF6B6B, success=#4ECDC4, warning=#FFE66D, idle=#1A1A2E
```

### MemphisTextarea
```tsx
interface MemphisTextareaProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    rows?: number;
    state?: "idle" | "error" | "success" | "warning";
    message?: string;
    maxLength?: number;
}
// Same styling as MemphisInput + resize-none,
// Character count below: value.length/maxLength,
// Count turns coral when > 90% of maxLength
```

### MemphisSelect
```tsx
interface MemphisSelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    state?: "idle" | "error" | "success" | "warning";
}
// border-3, cream bg, cursor-pointer,
// Default option: "Select..."
// Same label pattern as MemphisInput
```

### MemphisFileUpload
```tsx
interface MemphisFileUploadProps {
    label: string;
    value: string; // filename when uploaded
    onChange: (v: string) => void;
}
// border-3 border-dashed, drag-and-drop handlers,
// Empty: cloud-arrow-up icon in bordered box, instructions text
// Uploaded: file-pdf icon in teal square, filename + "Click to remove"
// Drag over: teal border + tinted bg
```

### MemphisRadioGroup
```tsx
interface MemphisRadioGroupProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string; icon: string }[];
}
// Label above, flex row of buttons,
// Selected: teal bg + border, dark text
// Unselected: dark border, transparent bg
// Each: px-4 py-2.5 border-3 text-sm font-bold uppercase
```

### MemphisCheckbox
```tsx
interface MemphisCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    color?: string; // accent color, default teal
}
// Rendered as button for accessibility, flex layout,
// w-6 h-6 border-3 square, filled when checked with check icon,
// text-sm font-semibold label, full-width clickable area
```

### SpecializationGrid
```tsx
interface SpecializationGridProps {
    items: string[];
    selected: string[];
    onToggle: (item: string) => void;
    colors?: string[]; // cycling colors, defaults to [coral, teal, yellow, purple]
}
// grid grid-cols-2 gap-3, each item: border-3 p-4,
// Internal checkbox square (w-5 h-5 border-2),
// Selected: colored fill bg + white text + check icon
// Unselected: transparent bg + dark text
// Count indicator below: "N specialization(s) selected"
```

### FormStepIndicator
```tsx
interface FormStepIndicatorProps {
    steps: { label: string; icon: string; color: string }[];
    currentStep: number;
    completed?: boolean; // all steps show teal check when form submitted
}
// Same as WizardStepIndicator from modals but with icon instead of number,
// w-9 h-9 border-3 squares, filled when active/completed,
// connector bar (h-1) between steps, labels hidden on mobile
```

### ReviewCard
```tsx
interface ReviewCardProps {
    title: string;
    icon: string;
    color: string;
    children: React.ReactNode; // key-value content
}
// border-3 with section color, p-4,
// header: text-xs font-black uppercase with icon,
// content: space-y-1 text-sm with bold labels and muted values
```

### FormFooterNav
```tsx
interface FormFooterNavProps {
    step: number;
    totalSteps: number;
    stepColor: string;
    onBack: () => void;
    onNext: () => void;
    onReset: () => void;
    onSubmit: () => void;
    submitDisabled?: boolean;
}
// border-t-4, flex justify-between,
// Left: Reset (step 0) or Back button (outline, dark border)
// Right: Next button (filled, step color) or Submit button (teal, disabled state)
// Back has left arrow icon, Next has right arrow icon
```

### SubmittingState
```tsx
// Centered: spinning icon in border-4 purple box (animate-pulse),
// "Submitting Application..." heading,
// Animated progress bar: border-2 container with colored fill
```

### FormSuccessState
```tsx
interface FormSuccessStateProps {
    icon?: string;
    title?: string;
    message?: string;
    onReset: () => void;
}
// Centered: party-horn icon in border-4 teal box,
// "Welcome Aboard!" heading, descriptive message,
// "Start Over" button in coral
```

## Dependencies
- `FormCard` composes `FormStepIndicator` in its header and `FormFooterNav` as its footer
- `MemphisInput`, `MemphisTextarea`, `MemphisSelect`, `MemphisFileUpload`, `MemphisRadioGroup`, `MemphisCheckbox` are all used across wizard steps
- `SpecializationGrid` is used in Step 3
- `ReviewCard` is used in Step 4 (confirmation)
- Validation helpers (`getFieldState`, `getEmailState`, `stateColor`, `stateIcon`) should be extracted as shared utilities
- Step transition animation uses GSAP (`gsap.fromTo` with opacity and x translation)
- Form state management: `useState` for form data, `Set<string>` for touched fields

## Reference
Source: `.claude/memphis/showcase/forms-six.tsx`
Target: `packages/memphis-ui/src/components/`
