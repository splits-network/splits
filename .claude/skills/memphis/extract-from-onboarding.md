# extract-from-onboarding

Extract reusable components from the onboarding showcase page.

## Available Components

1. **OnboardingWizard** - Full wizard container with progress, content, and footer nav
2. **StepProgressBar** - Multi-step progress indicator with nodes, lines, and labels
3. **StepNode** - Individual step icon/check node
4. **RoleSelectionCard** - Selectable role card with icon, label, description
5. **RoleSelectionGrid** - Grid of RoleSelectionCards
6. **OnboardingFormField** - Fieldset-wrapped labeled input for onboarding forms
7. **TeamSizeSelector** - Grid of selectable team-size options with icons
8. **TeamSizeOption** - Individual team size button with icon + label
9. **IndustryMultiSelect** - Grid of selectable industry chips with checkboxes
10. **IndustryChip** - Individual selectable chip with checkbox and label
11. **NotificationPreferenceList** - Bordered container with toggle rows for notification preferences
12. **NotificationPreferenceRow** - Single notification preference with checkbox, label, description
13. **TeamInviteForm** - Dynamic list of email inputs with add/remove
14. **EmailInviteRow** - Single email input with remove button
15. **TipBox** - Info/tip callout box with lightbulb icon
16. **CompletionScreen** - Success state with icon, heading, quick-action grid, and CTA
17. **QuickActionCard** - Small action card with icon box and label
18. **QuickActionGrid** - Grid of QuickActionCards
19. **WizardFooter** - Back/Skip/Continue navigation footer
20. **StepBadge** - "Step N" colored badge label

## Component Details

### StepProgressBar
```tsx
interface Step { label: string; icon: string; color: string; }
interface StepProgressBarProps {
    steps: Step[];
    currentStep: number;
}
// border-b-4 header
// Nodes: w-8 h-8 border-3, filled when active/completed, check icon when completed
// Lines: flex-1 h-1, colored when completed, gray when pending
// Labels: text-[9px] font-bold uppercase, hidden on mobile (hidden sm:block)
```

### RoleSelectionCard
```tsx
interface RoleSelectionCardProps {
    value: string;
    label: string;
    description: string;
    icon: string;
    color: string;
    selected: boolean;
    onSelect: () => void;
}
// border-3 p-5, full-fill when selected (bg becomes color, text becomes white)
// Icon box: w-12 h-12 border-2, changes border/icon color when selected
// Label: text-sm font-black uppercase tracking-wide
// Description: text-xs with conditional opacity
```

### IndustryChip
```tsx
interface IndustryChipProps {
    label: string;
    selected: boolean;
    color: string;
    onToggle: () => void;
}
// border-3 p-3, fills with color when selected
// Checkbox: w-4 h-4 border-2 square with check icon
// Label: text-xs font-bold, white when selected
```

### TeamSizeSelector
```tsx
interface TeamSizeOption { value: string; label: string; icon: string; }
interface TeamSizeSelectorProps {
    options: TeamSizeOption[];
    selected: string;
    onChange: (value: string) => void;
    color?: string;   // default C.teal
}
// grid grid-cols-4 gap-2
// Each option: p-3 border-3 text-center, filled when selected
```

### TeamInviteForm
```tsx
interface TeamInviteFormProps {
    emails: string[];
    onChange: (emails: string[]) => void;
}
// Dynamic list of email inputs
// Each row: flex gap-2 with input + remove button
// Add button: text link "Add Another" in C.purple
// Minimum 1 email (remove button hidden when only 1)
```

### TipBox
```tsx
interface TipBoxProps {
    text: string;
    color?: string;   // default C.yellow
}
// p-4 border-3, borderColor: color
// Lightbulb icon in color + text in muted dark
```

### CompletionScreen
```tsx
interface QuickAction { label: string; icon: string; color: string; }
interface CompletionScreenProps {
    title: string;
    highlightWord: string;
    highlightColor: string;
    description: string;
    icon: string;
    iconColor: string;
    actions: QuickAction[];
    ctaLabel: string;
    ctaIcon: string;
    ctaColor: string;
    onCta: () => void;
}
// Centered: large icon box (w-24 h-24), heading with colored word, description
// Quick action grid: grid-cols-3 gap-4, each with icon box + label
// Final CTA: px-8 py-4 border-3 solid bg, centered
```

### WizardFooter
```tsx
interface WizardFooterProps {
    step: number;
    totalSteps: number;
    stepColor: string;
    onBack: () => void;
    onNext: () => void;
    onSkip?: () => void;
    nextLabel?: string;   // default "Continue"
    showSkip?: boolean;   // default true for steps > 0
}
// border-t-4 p-6 flex justify-between
// Back: border-3 outline with left arrow (hidden on step 0)
// Skip: plain text muted (hidden on step 0 and final)
// Continue: border-3 solid bg in stepColor with right arrow
```

### StepBadge
```tsx
interface StepBadgeProps {
    stepNumber: number;
    label: string;
    color: string;
}
// px-3 py-1 text-xs font-black uppercase tracking-[0.15em], solid bg
// Used at top of each step's content to label "Step N"
```

## Dependencies
- **OnboardingWizard** composes: StepProgressBar, WizardFooter, and step-specific content
- **RoleSelectionGrid** composes: RoleSelectionCard
- **IndustryMultiSelect** composes: IndustryChip
- **TeamSizeSelector** composes: TeamSizeOption
- **TeamInviteForm** composes: EmailInviteRow
- **CompletionScreen** composes: QuickActionGrid (which composes QuickActionCard)
- **NotificationPreferenceList** composes: NotificationPreferenceRow (uses checkbox pattern from IndustryChip)

## Reference
Source: `apps/corporate/src/app/showcase/onboarding/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
