# extract-from-modals

Extract reusable components from the modals showcase page.

## Available Components

1. **AnimatedModal** - GSAP-animated modal wrapper with backdrop
2. **ModalHeader** - Colored header bar with icon, title, and close button
3. **ModalFooter** - Bottom action bar with cancel and primary buttons
4. **MemphisFormInput** - Styled text input with label and validation
5. **MemphisFormTextarea** - Styled textarea with label and validation
6. **MemphisFormSelect** - Styled select dropdown with label
7. **WizardStepIndicator** - Numbered step progress bar with connector lines
8. **WizardStepBadge** - "Step N" colored badge for each wizard step
9. **SuccessState** - Success confirmation with icon box, heading, and message
10. **DeleteConfirmation** - Destructive action dialog with warning, impact list, and preview
11. **WarningBox** - Bordered warning message with exclamation icon
12. **ImpactListItem** - Single impact item with colored icon square
13. **MemphisDecorations** - Background geometric shapes for page decoration
14. **TriggerCard** - Card that opens a modal, with icon, description, and action button

## Component Details

### AnimatedModal
```tsx
interface AnimatedModalProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    wide?: boolean; // max-w-3xl instead of max-w-lg
}
// GSAP entrance: scale 0.8, y 40, rotation -2 -> normal with back.out(1.7)
// GSAP exit: scale 0.85, y 30 -> fade out
// Backdrop: rgba(26,26,46,0.8), click outside to close
// Container: border-4, sharp corners, max-h-[90vh] overflow-y-auto
```

### ModalHeader
```tsx
interface ModalHeaderProps {
    title: string;
    icon: string;
    color: string;
    onClose: () => void;
    variant?: "colored" | "dark"; // colored fills header bg, dark uses navy bg
}
// Colored: p-6 border-b-4, colored bg, icon in white square, white title
// Dark: dark bg, icon in colored bordered square, white title, coral subtitle
// Close: w-8 h-8 border-2, hover:rotate-90 transition
```

### ModalFooter
```tsx
interface ModalFooterProps {
    onCancel: () => void;
    onConfirm: () => void;
    cancelLabel?: string;
    confirmLabel?: string;
    confirmIcon?: string;
    confirmColor: string;
    alignment?: "end" | "between"; // justify-end or justify-between
}
// p-6 border-t-4 with dark border, flex layout
// Cancel: border-3 outline button, dark border, white bg
// Confirm: border-3 filled button, colored bg, white text
// Both: font-black uppercase tracking-wider, hover:-translate-y-0.5
```

### WizardStepIndicator
```tsx
interface WizardStepIndicatorProps {
    steps: { label: string; icon: string; color: string }[];
    currentStep: number;
}
// Numbered squares (w-8 h-8 border-3), filled when active,
// check icon when completed, connector bar between steps,
// hidden label text on mobile (hidden sm:block)
```

### SuccessState
```tsx
interface SuccessStateProps {
    icon: string;
    title: string;
    message: string;
    color: string;
}
// Centered layout: w-20 h-20 border-4 icon box with colored fill,
// text-2xl font-black uppercase title, text-sm muted message
```

### DeleteConfirmation
```tsx
interface DeleteConfirmationProps {
    title: string;
    warningMessage: string;
    impacts: { icon: string; text: string; color: string }[];
    preview?: React.ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    deleting?: boolean;
}
// Dark header with coral border, warning box (border-4, bg #FFF5F5),
// impact list with colored icon squares (w-8 h-8),
// preview card with border-3 on cream bg,
// deleting state: pulsing icon box
```

### TriggerCard
```tsx
interface TriggerCardProps {
    icon: string;
    title: string;
    description: string;
    buttonLabel: string;
    buttonIcon?: string;
    color: string;
    onClick: () => void;
}
// border-4, corner accent (absolute top-0 right-0 w-16 h-16),
// icon in bordered box (w-20 h-20 border-4), centered layout,
// full-width action button (border-4, filled)
```

### WarningBox
```tsx
interface WarningBoxProps {
    title: string;
    message: string;
    color?: string; // defaults to coral
}
// p-5 border-4, colored border, light tinted bg,
// exclamation icon + bold title + descriptive text
```

## Dependencies
- `AnimatedModal` is the wrapper for all modal types (CreateJob, Wizard, Delete)
- `ModalHeader` and `ModalFooter` are shared across all modal types
- `MemphisFormInput`, `MemphisFormTextarea`, `MemphisFormSelect` are used in both CreateJob and Wizard modals
- `WizardStepIndicator` and `WizardStepBadge` are specific to the Wizard modal
- `SuccessState` is used in both CreateJob and Wizard post-submission
- `WarningBox` and `ImpactListItem` are specific to `DeleteConfirmation`
- `MemphisDecorations` provides the page background (not inside modals)
- All animations require GSAP library

## Reference
Source: `.claude/memphis/showcase/modals-six.tsx`
Target: `packages/memphis-ui/src/components/`
