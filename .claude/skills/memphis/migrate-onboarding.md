# migrate-onboarding

Migrate an onboarding page to Memphis design.

## Page Type Characteristics
Onboarding pages guide new users through a multi-step setup wizard. They feature:
- **Full-page dark background** with floating Memphis decorative shapes
- A **single centered card** (`max-w-2xl`) containing the entire wizard
- **Step progress indicator** in the card header with numbered/icon nodes + connecting lines
- **Multi-step content** that transitions between steps with animation
- **Role selection** cards (step 1: welcome/choose role)
- **Form fields** (step 2: profile info)
- **Multi-select grids** (step 3: preferences/industries)
- **Email invite inputs** (step 4: team invitations)
- **Completion state** (step 5: success with quick-action cards)
- **Footer navigation** with Back, Skip, and Continue buttons

## Key Components to Transform

### Memphis Background
- `min-h-screen relative overflow-hidden flex items-center` with `backgroundColor: C.dark`
- Floating shapes: circles, squares, triangles, zigzags, crosses at low opacity
- GSAP entrance: `elastic.out` with random stagger + ongoing float yoyo animations

### Step Progress Indicator
- `border-b-4` header section, `borderColor: C.dark`
- Step nodes: `w-8 h-8 border-3` with icon or check (completed steps)
- Connecting lines: `flex-1 h-1` colored when completed, gray when pending
- Step labels: `text-[9px] font-bold uppercase tracking-wider` below nodes
- Active: solid bg, completed: solid bg + check, pending: white bg with colored border

### Welcome Step (Role Selection)
- Centered welcome message with large icon box: `w-20 h-20 border-4` solid bg
- Heading: `text-3xl font-black uppercase tracking-tight`
- Role cards: `border-3 p-5` with icon box (`w-12 h-12 border-2`), label, description
- Selected state: entire card fills with role color, text goes white

### Profile Step (Form Fields)
- Step badge: `px-3 py-1 text-xs font-black uppercase tracking-[0.15em]` solid bg
- `<fieldset>` wrappers (per CLAUDE.md convention)
- Labels: `text-xs font-black uppercase tracking-[0.15em]`
- Inputs: `w-full px-4 py-3 border-3 text-sm font-semibold outline-none`, `borderColor: C.dark, backgroundColor: C.cream`
- Team size selector: `grid grid-cols-4 gap-2` with icon + label button cards

### Preferences Step (Multi-Select Grid)
- Industry chips: `grid grid-cols-2 gap-2` with `border-3 p-3`
- Each chip: checkbox (`w-4 h-4 border-2`) + label
- Selected: fills with Memphis color, text white, checkbox checked
- Notification preferences: `border-3 p-5` container with individual toggle rows

### Team Invite Step
- Email inputs: `border-3` with remove button (`border-3, borderColor: C.coral`)
- "Add Another" link: `text-xs font-black uppercase tracking-wider` in purple
- Tip box: `p-4 border-3, borderColor: C.yellow` with lightbulb icon

### Completion Step
- Large icon box: `w-24 h-24 border-4` with celebration icon
- Quick-action grid: `grid grid-cols-3 gap-4`, each card has icon box + label
- Final CTA: large `px-8 py-4` button with rocket icon

### Footer Navigation
- `border-t-4, borderColor: C.dark`
- Back button: `border-3` outline with left arrow
- Skip button: plain text, `opacity: 0.4`
- Continue button: solid bg in step color, `border-3` with right arrow
- `flex items-center justify-between`

## Memphis Patterns for Onboarding

```tsx
{/* Step progress node */}
<div className="w-8 h-8 flex items-center justify-center text-xs font-black flex-shrink-0 border-3"
    style={{
        backgroundColor: i <= step ? s.color : C.white,
        borderColor: s.color,
        color: i <= step ? (s.color === C.yellow ? C.dark : C.white) : s.color,
    }}>
    {i < step ? <i className="fa-solid fa-check text-xs"></i> : <i className={`${s.icon} text-xs`}></i>}
</div>
{/* Connecting line */}
{i < STEPS.length - 1 && <div className="flex-1 h-1" style={{ backgroundColor: i < step ? s.color : "#E0E0E0" }} />}

{/* Role selection card */}
<button className="flex items-center gap-4 p-5 border-3 text-left transition-all"
    style={{
        borderColor: selected ? r.color : "rgba(26,26,46,0.15)",
        backgroundColor: selected ? r.color : "transparent",
    }}>
    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2"
        style={{ borderColor: selected ? C.white : r.color }}>
        <i className={`${r.icon} text-lg`} style={{ color: selected ? C.white : r.color }}></i>
    </div>
    <div>
        <p className="text-sm font-black uppercase tracking-wide"
            style={{ color: selected ? C.white : C.dark }}>{r.label}</p>
        <p className="text-xs" style={{ color: selected ? "rgba(255,255,255,0.7)" : "rgba(26,26,46,0.5)" }}>
            {r.desc}</p>
    </div>
</button>

{/* Industry multi-select chip */}
<button className="flex items-center gap-2 p-3 border-3 text-left transition-all"
    style={{
        borderColor: selected ? color : "rgba(26,26,46,0.12)",
        backgroundColor: selected ? color : "transparent",
    }}>
    <div className="w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center"
        style={{ borderColor: selected ? C.white : C.dark, backgroundColor: selected ? "rgba(255,255,255,0.2)" : "transparent" }}>
        {selected && <i className="fa-solid fa-check text-[8px]" style={{ color: C.white }}></i>}
    </div>
    <span className="text-xs font-bold" style={{ color: selected ? C.white : C.dark }}>{label}</span>
</button>
```

## Common Violations
- Using DaisyUI `steps`, `form-control`, `radio`, `checkbox` components
- Rounded step indicators (circles) -- Memphis uses square step nodes
- Missing connecting lines between step nodes
- Role cards without full-fill selected state (just using a checkmark)
- Form inputs with default browser styling or DaisyUI classes
- Missing `<fieldset>` wrapper on form groups
- Multi-select chips without the checkbox square
- Footer without border-t-4 separator
- Skip button styled as a prominent button instead of muted text link

## Reference
Showcase: `.claude/memphis/showcase/onboarding-six.tsx`
