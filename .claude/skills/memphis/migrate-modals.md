# migrate-modals

Migrate a modals page to Memphis design.

## Page Type Characteristics
Modal pages showcase dialog components: standard form modals, multi-step wizard modals, and confirmation/destructive action dialogs. Key traits:
- GSAP-animated modal entrance (scale + rotation + translate) and exit
- Backdrop with `rgba(26, 26, 46, 0.8)` overlay, click-outside-to-close
- Thick `border-4` modal container with sharp corners (no rounding)
- Colored header bars identifying the modal type
- Form inputs use `border-3`, `bg-cream`, `focus:border-[color]` pattern
- Wizard modal with numbered step indicator and progress connector bars
- Success states with icon in bordered box + bold uppercase message
- Trigger cards on a dark background with Memphis decorations

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Modal backdrop | Fixed overlay `rgba(26, 26, 46, 0.8)`, GSAP fade in/out |
| Modal container | `border-4` with `borderColor: dark`, white bg, `max-w-lg` or `max-w-3xl` for wide, `max-h-[90vh]` overflow-y-auto |
| Modal header | Full-width colored bg or dark bg, icon in square box, uppercase title, X close button with `hover:rotate-90` |
| Form inputs | `w-full px-4 py-3 border-3 text-sm font-semibold`, cream bg, focus changes border color |
| Form labels | `text-xs font-black uppercase tracking-[0.15em]`, required indicator in coral |
| Wizard steps | Numbered squares with `border-3`, filled when active/completed, progress bar between steps, step label below |
| Success state | Large icon in `border-4` colored box, bold uppercase heading, muted subtext |
| Confirmation dialog | Destructive header (dark bg + coral border), warning box with exclamation icon, impact list with colored icon squares, preview card |
| Footer actions | `border-t-4`, flex justify-end/between, cancel button (outline) + action button (filled) |
| Trigger cards | `border-4`, corner accent, icon in bordered box, title + description, full-width action button |

## Memphis Patterns for Modals

### Animated Modal Wrapper Pattern
```tsx
function AnimatedModal({ open, onClose, children, wide = false }) {
    // GSAP animation: entrance with scale: 0.8, y: 40, rotation: -2
    // Exit with scale: 0.85, y: 30
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(26, 26, 46, 0.8)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className={`relative border-4 overflow-y-auto ${wide ? "max-w-3xl" : "max-w-lg"} w-full max-h-[90vh]`}
                style={{ backgroundColor: "#FFFFFF", borderColor: "#1A1A2E" }}>
                {children}
            </div>
        </div>
    );
}
```

### Modal Header Pattern
```tsx
<div className="p-6 border-b-4" style={{ borderColor: "#FF6B6B", backgroundColor: "#FF6B6B" }}>
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center"
                style={{ backgroundColor: "#FFFFFF" }}>
                <i className="fa-duotone fa-regular fa-briefcase text-lg" style={{ color: "#FF6B6B" }}></i>
            </div>
            <h2 className="text-xl font-black uppercase tracking-wider" style={{ color: "#FFFFFF" }}>
                Modal Title
            </h2>
        </div>
        <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center font-black text-lg border-2 transition-transform hover:rotate-90"
            style={{ backgroundColor: "#FFFFFF", color: "#FF6B6B" }}>
            <i className="fa-solid fa-xmark"></i>
        </button>
    </div>
</div>
```

### Wizard Step Indicator Pattern
```tsx
<div className="flex items-center gap-2">
    {steps.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-center w-full gap-2">
                <div className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 border-3"
                    style={{
                        backgroundColor: i <= currentStep ? s.color : "#FFFFFF",
                        borderColor: s.color,
                        color: i <= currentStep ? "#FFFFFF" : s.color,
                    }}>
                    {i < currentStep ? <i className="fa-solid fa-check"></i> : i + 1}
                </div>
                {i < steps.length - 1 && (
                    <div className="flex-1 h-1" style={{ backgroundColor: i < currentStep ? s.color : "#E0E0E0" }} />
                )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: i <= currentStep ? "#1A1A2E" : "#999" }}>
                {s.label}
            </span>
        </div>
    ))}
</div>
```

### Form Input Pattern
```tsx
<fieldset>
    <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2"
        style={{ color: "#1A1A2E" }}>
        Label <span style={{ color: "#FF6B6B" }}>*</span>
    </label>
    <input type="text"
        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-colors focus:border-[#FF6B6B]"
        style={{ borderColor: "#1A1A2E", backgroundColor: "#F5F0EB", color: "#1A1A2E" }} />
</fieldset>
```

## Common Violations
- Using DaisyUI `modal`, `modal-box` classes
- Rounded corners on modal container
- Missing GSAP animation on open/close
- Thin borders on modal and inputs
- Missing colored header bar
- X close button without `hover:rotate-90` transition
- Wizard without step progress indicator
- Confirmation dialogs without impact list and warning box

## Reference
Showcase: `apps/corporate/src/app/showcase/modals/six/page.tsx`
