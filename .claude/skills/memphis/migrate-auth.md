# migrate-auth

Migrate an auth page to Memphis design.

## Page Type Characteristics
Auth pages are centered, single-card layouts with tabbed navigation between Login, Sign Up, and Forgot Password flows. They sit on a dark background with floating Memphis shapes, and the card itself is a white container with a multi-color top bar, logo area, and form content that transitions with GSAP on tab change.

## Key Components to Transform

- **Auth Card Container**: White card with `border-4` in dark, no border-radius. Includes a 4-color bar at the top (`coral | teal | yellow | purple`, each `flex-1`, `h-1.5`).
- **Logo Block**: Centered icon in a square colored background + bold uppercase brand text.
- **Tab Bar**: Horizontal tabs with `border-b-3` underline indicator. Each tab is `flex-1`, `text-xs font-black uppercase tracking-wider`. Active tab gets its own accent color on the underline.
- **Form Inputs**: `border-3` borders on dark, `backgroundColor: cream`, `font-semibold`, no border-radius, no outline. Error state swaps border to coral.
- **Labels**: `text-xs font-black uppercase tracking-[0.15em]`, dark color.
- **Password Toggle**: Eye/eye-slash icon absolutely positioned inside the input field.
- **Password Strength Meter**: 4 horizontal bars (`flex-1 h-1.5`) that fill with color based on score, plus a `text-[10px] font-bold uppercase` label.
- **Checkbox (Remember Me / Terms)**: Custom square `w-5 h-5 border-2`, filled with teal + check icon when active. No native checkbox.
- **Primary Button**: `w-full py-3 border-3`, background matches accent color, `font-black uppercase tracking-wider`, `hover:-translate-y-0.5`.
- **Social Login Buttons**: `grid grid-cols-2 gap-3`, each `border-3` outline style with icon + label, accent color border and text.
- **Divider**: Horizontal line with centered "or" text in `text-[10px] font-bold uppercase tracking-wider`.
- **Error Alert**: `border-3` coral box with `fa-circle-xmark` icon and bold error text.
- **Success State**: Centered icon in a colored square + bold uppercase heading + subtitle.
- **Memphis Background Shapes**: Circles, squares, triangles, zigzag SVG lines positioned absolutely with `opacity: 0.15`, animated with GSAP elastic/floating.

## Memphis Patterns for Auth

```tsx
// Color palette constant
const C = { coral: "#FF6B6B", teal: "#4ECDC4", yellow: "#FFE66D", purple: "#A78BFA", dark: "#1A1A2E", cream: "#F5F0EB", white: "#FFFFFF" };

// Auth card with color bar
<div className="border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
  <div className="flex h-1.5">
    <div className="flex-1" style={{ backgroundColor: C.coral }} />
    <div className="flex-1" style={{ backgroundColor: C.teal }} />
    <div className="flex-1" style={{ backgroundColor: C.yellow }} />
    <div className="flex-1" style={{ backgroundColor: C.purple }} />
  </div>
  {/* content */}
</div>

// Memphis input field
<fieldset>
  <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>Email</label>
  <input className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
    style={{ borderColor: hasError ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
</fieldset>

// Memphis primary button
<button className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
  style={{ borderColor: C.coral, backgroundColor: C.coral, color: C.white }}>
  Sign In
</button>

// Custom checkbox
<button onClick={() => setChecked(!checked)} className="flex items-center gap-2">
  <div className="w-5 h-5 border-2 flex items-center justify-center"
    style={{ borderColor: checked ? C.teal : "rgba(26,26,46,0.2)", backgroundColor: checked ? C.teal : "transparent" }}>
    {checked && <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>}
  </div>
  <span className="text-xs font-semibold" style={{ color: C.dark }}>Remember me</span>
</button>
```

## Common Violations
- Using DaisyUI `input`, `btn`, `checkbox`, or `card` classes instead of raw Memphis styling
- Rounded corners (`rounded-*`) on cards, inputs, or buttons -- Memphis uses `borderRadius: 0` or no radius
- Using `border` or `border-2` instead of `border-3` or `border-4` (Memphis requires thick borders)
- Native HTML checkboxes instead of custom square toggle buttons
- Missing the 4-color top bar on the auth card
- Gradient backgrounds instead of solid dark background with floating geometric shapes
- Not wrapping the auth card in a centered `max-w-md` container with dark page background
- Missing GSAP entrance animations for the card and background shapes

## Reference
Showcase: `.claude/memphis/showcase/auth-six.tsx`
