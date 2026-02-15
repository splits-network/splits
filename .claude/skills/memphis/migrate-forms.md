# migrate-forms

Migrate a forms page to Memphis design.

## Page Type Characteristics
Form pages are multi-step wizard forms with rich input components, real-time validation, and progress tracking. Key traits:
- Dark page background with Memphis geometric decorations
- Form card container with `border-4` and white background
- Multi-step wizard with numbered step indicator (progress bar with connector lines)
- Rich form controls: text inputs, textareas with character count, select dropdowns, file upload (drag-and-drop), radio button groups, checkbox toggles, specialization tag selector
- Real-time validation with 4 states: idle, success (teal), error (coral), warning (yellow)
- Step badge showing current step label
- Review/confirmation step with bordered summary cards
- Submitting state with animated spinner and progress bar
- Success state with celebration icon and reset option
- `"use client"` with `useState`, `useCallback`, `useRef`, GSAP animations

## Key Components to Transform

| Element | Memphis Treatment |
|---|---|
| Form card | `border-4` dark border, white bg, step indicator in header with `border-b-4` |
| Step indicator | Numbered squares (`w-9 h-9 border-3`), filled when active/completed, check icon when past, connector bar between steps, labels below |
| Text input | `w-full px-4 py-3 border-3`, cream bg, validation state changes border color + adds box-shadow, label with `text-xs font-black uppercase tracking-[0.15em]`, required star in coral, state icon on right |
| Textarea | Same as input + character count below (`value.length/maxLength`), warning when near limit |
| Select dropdown | `border-3`, cream bg, `cursor-pointer`, same label pattern as input |
| File upload | `border-3 border-dashed`, drag-over teal highlight, uploaded state shows file icon + name, click to remove |
| Radio group | Row of `border-3` buttons, filled with teal bg when selected, icon + label |
| Checkbox | `w-6 h-6 border-3` square, filled with accent color when checked, check icon inside |
| Specialization tags | 2-col grid of `border-3` buttons, colored fill when selected, internal checkbox square + label |
| Review cards | `border-3` with section color, section icon + label header, key-value pairs |
| Validation states | Error: coral border + glow, Success: teal border + glow, Warning: yellow border, Disabled: gray bg |
| Footer nav | `border-t-4`, Reset/Back button on left, Next/Submit button on right with step color |

## Memphis Patterns for Forms

### Text Input Pattern
```tsx
<fieldset className="relative">
    <label className="flex items-center gap-1 text-xs font-black uppercase tracking-[0.15em] mb-2"
        style={{ color: "#1A1A2E" }}>
        Label <span style={{ color: "#FF6B6B" }}>*</span>
        {stateIcon && <i className={`${stateIcon} text-xs ml-auto`} style={{ color: stateColor }}></i>}
    </label>
    <input type="text"
        className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none transition-all"
        style={{
            borderColor: stateColor, // coral for error, teal for success, yellow for warning, dark for idle
            backgroundColor: "#F5F0EB",
            color: "#1A1A2E",
            boxShadow: state === "error" ? "0 0 0 1px #FF6B6B" : state === "success" ? "0 0 0 1px #4ECDC4" : "none",
        }} />
    {message && <p className="text-xs font-bold mt-1.5" style={{ color: stateColor }}>{message}</p>}
</fieldset>
```

### File Upload Pattern
```tsx
<div className="border-3 border-dashed p-6 text-center cursor-pointer"
    style={{
        borderColor: dragOver ? "#4ECDC4" : value ? "#4ECDC4" : "#1A1A2E",
        backgroundColor: dragOver ? "rgba(78,205,196,0.05)" : "#F5F0EB",
    }}>
    {value ? (
        <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center" style={{ backgroundColor: "#4ECDC4" }}>
                <i className="fa-duotone fa-regular fa-file-pdf text-lg" style={{ color: "#1A1A2E" }}></i>
            </div>
            <div className="text-left">
                <p className="text-sm font-bold">{value}</p>
                <p className="text-xs" style={{ color: "#4ECDC4" }}>Click to remove</p>
            </div>
        </div>
    ) : (
        <>
            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center border-3"
                style={{ borderColor: "#1A1A2E" }}>
                <i className="fa-duotone fa-regular fa-cloud-arrow-up text-xl"></i>
            </div>
            <p className="text-sm font-bold mb-1">Drop your file here or click to browse</p>
            <p className="text-xs" style={{ color: "rgba(26,26,46,0.5)" }}>PDF, DOC, DOCX up to 10MB</p>
        </>
    )}
</div>
```

### Radio Group Pattern
```tsx
<div className="flex flex-wrap gap-3">
    {options.map((opt) => (
        <button type="button" onClick={() => onChange(opt.value)}
            className="flex items-center gap-2 px-4 py-2.5 border-3 text-sm font-bold uppercase tracking-wider transition-all"
            style={{
                borderColor: selected ? "#4ECDC4" : "#1A1A2E",
                backgroundColor: selected ? "#4ECDC4" : "transparent",
                color: "#1A1A2E",
            }}>
            <i className={`${opt.icon} text-xs`}></i>
            {opt.label}
        </button>
    ))}
</div>
```

### Specialization Tag Grid Pattern
```tsx
<div className="grid grid-cols-2 gap-3">
    {specs.map((spec) => (
        <button className="flex items-center gap-3 p-4 border-3 text-left transition-all"
            style={{
                borderColor: selected ? color : "rgba(26,26,46,0.15)",
                backgroundColor: selected ? color : "transparent",
            }}>
            <div className="w-5 h-5 flex-shrink-0 border-2 flex items-center justify-center"
                style={{ borderColor: selected ? "#FFFFFF" : "#1A1A2E" }}>
                {selected && <i className="fa-solid fa-check text-[10px]" style={{ color: "#FFFFFF" }}></i>}
            </div>
            <span className="text-sm font-bold"
                style={{ color: selected ? "#FFFFFF" : "#1A1A2E" }}>
                {spec}
            </span>
        </button>
    ))}
</div>
```

## Common Violations
- Using DaisyUI `input`, `select`, `textarea`, `checkbox`, or `form-control` classes
- Rounded input borders instead of sharp corners with `border-3`
- Missing real-time validation state indicators (icon + color + message)
- File upload without drag-and-drop visual feedback
- Radio buttons as default HTML circles instead of Memphis bordered buttons
- Checkboxes as default HTML checkmarks instead of square Memphis toggles
- Missing character count on textareas
- Wizard without numbered step indicator and progress bars
- Review step without bordered summary cards
- Missing submitting animation state

## Reference
Showcase: `apps/corporate/src/app/showcase/forms/six/page.tsx`
