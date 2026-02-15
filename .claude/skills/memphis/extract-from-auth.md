# extract-from-auth

Extract reusable components from the auth showcase page.

## Available Components

1. **MemphisColorBar** - 4-color horizontal accent bar
2. **MemphisInput** - Styled form input with label
3. **MemphisPasswordInput** - Input with show/hide toggle
4. **PasswordStrengthMeter** - Visual password strength indicator
5. **MemphisCheckbox** - Custom square checkbox toggle
6. **MemphisAuthButton** - Full-width primary action button
7. **MemphisSocialButton** - Social login button with icon
8. **MemphisDivider** - Horizontal divider with centered text
9. **MemphisErrorAlert** - Inline error message banner
10. **MemphisSuccessState** - Centered success icon + message
11. **MemphisAuthCard** - Card container with color bar and border
12. **MemphisAuthTabs** - Tabbed navigation with underline indicator
13. **MemphisBackgroundShapes** - Floating decorative shapes layer

## Component Details

### MemphisColorBar
Horizontal bar with 4 equal colored segments.
```tsx
// Props: none (uses fixed Memphis palette)
<div className="flex h-1.5">
  <div className="flex-1" style={{ backgroundColor: "#FF6B6B" }} />
  <div className="flex-1" style={{ backgroundColor: "#4ECDC4" }} />
  <div className="flex-1" style={{ backgroundColor: "#FFE66D" }} />
  <div className="flex-1" style={{ backgroundColor: "#A78BFA" }} />
</div>
```

### MemphisInput
```tsx
// Props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; error?: string }
<fieldset>
  <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>{label}</label>
  <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type}
    className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none"
    style={{ borderColor: error ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
  {error && <p className="text-xs font-bold mt-1" style={{ color: C.coral }}>{error}</p>}
</fieldset>
```

### MemphisPasswordInput
```tsx
// Props: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; error?: string }
// Internal state: showPassword toggle
<fieldset>
  <label className="block text-xs font-black uppercase tracking-[0.15em] mb-2" style={{ color: C.dark }}>{label}</label>
  <div className="relative">
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      type={showPassword ? "text" : "password"}
      className="w-full px-4 py-3 border-3 text-sm font-semibold outline-none pr-12"
      style={{ borderColor: error ? C.coral : C.dark, backgroundColor: C.cream, color: C.dark }} />
    <button onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.dark, opacity: 0.4 }}>
      <i className={`fa-duotone fa-regular ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}></i>
    </button>
  </div>
</fieldset>
```

### PasswordStrengthMeter
```tsx
// Props: { password: string }
// Uses internal passwordStrength() helper to compute level (0-4) and label
<div className="mt-2 flex items-center gap-2">
  <div className="flex-1 flex gap-1">
    {[1, 2, 3, 4].map((l) => (
      <div key={l} className="flex-1 h-1.5" style={{ backgroundColor: l <= level ? color : "rgba(26,26,46,0.1)" }} />
    ))}
  </div>
  <span className="text-[10px] font-bold uppercase" style={{ color }}>{label}</span>
</div>
```

### MemphisCheckbox
```tsx
// Props: { checked: boolean; onChange: (checked: boolean) => void; label: React.ReactNode; error?: string }
<button onClick={() => onChange(!checked)} className="flex items-center gap-2">
  <div className="w-5 h-5 border-2 flex items-center justify-center"
    style={{ borderColor: error ? C.coral : (checked ? C.teal : "rgba(26,26,46,0.2)"), backgroundColor: checked ? C.teal : "transparent" }}>
    {checked && <i className="fa-solid fa-check text-[8px]" style={{ color: C.dark }}></i>}
  </div>
  <span className="text-xs font-semibold" style={{ color: C.dark }}>{label}</span>
</button>
```

### MemphisAuthButton
```tsx
// Props: { label: string; color: string; textColor?: string; onClick: () => void }
<button onClick={onClick}
  className="w-full py-3 text-sm font-black uppercase tracking-wider border-3 transition-transform hover:-translate-y-0.5"
  style={{ borderColor: color, backgroundColor: color, color: textColor || C.white }}>
  {label}
</button>
```

### MemphisSocialButton
```tsx
// Props: { label: string; icon: string; color: string }
<button className="py-3 border-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
  style={{ borderColor: color, color }}>
  <i className={`${icon} text-sm`}></i>{label}
</button>
```

### MemphisDivider
```tsx
// Props: { text?: string } (defaults to "or")
<div className="flex items-center gap-3 my-4">
  <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.dark, opacity: 0.3 }}>{text || "or"}</span>
  <div className="flex-1 h-0.5" style={{ backgroundColor: C.cream }} />
</div>
```

### MemphisErrorAlert
```tsx
// Props: { message: string }
<div className="p-3 border-3 flex items-center gap-2" style={{ borderColor: C.coral }}>
  <i className="fa-solid fa-circle-xmark text-sm" style={{ color: C.coral }}></i>
  <span className="text-xs font-bold" style={{ color: C.coral }}>{message}</span>
</div>
```

### MemphisSuccessState
```tsx
// Props: { icon: string; title: string; subtitle: string; color: string }
<div className="py-8 text-center">
  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-4"
    style={{ borderColor: color, backgroundColor: color }}>
    <i className={`fa-duotone fa-regular ${icon} text-2xl`} style={{ color: C.white }}></i>
  </div>
  <h3 className="text-xl font-black uppercase tracking-wide mb-2" style={{ color: C.dark }}>{title}</h3>
  <p className="text-xs" style={{ color: C.dark, opacity: 0.5 }}>{subtitle}</p>
</div>
```

### MemphisAuthCard
```tsx
// Props: { children: React.ReactNode }
// Wraps content in bordered card with color bar
<div className="border-4" style={{ borderColor: C.dark, backgroundColor: C.white }}>
  <MemphisColorBar />
  {children}
</div>
```

### MemphisAuthTabs
```tsx
// Props: { tabs: { key: string; label: string; color: string }[]; activeTab: string; onTabChange: (key: string) => void }
<div className="px-6 pt-4 flex border-b-3" style={{ borderColor: C.cream }}>
  {tabs.map((t) => (
    <button key={t.key} onClick={() => onTabChange(t.key)}
      className="flex-1 py-3 text-xs font-black uppercase tracking-wider border-b-3 -mb-[3px] transition-colors"
      style={{ borderColor: activeTab === t.key ? t.color : "transparent", color: activeTab === t.key ? C.dark : "rgba(26,26,46,0.4)" }}>
      {t.label}
    </button>
  ))}
</div>
```

## Dependencies
- `MemphisAuthCard` composes `MemphisColorBar`
- `MemphisPasswordInput` uses internal `showPassword` state
- `PasswordStrengthMeter` uses internal `passwordStrength()` helper function
- All components rely on the Memphis color palette constant `C`

## Reference
Source: `apps/corporate/src/app/showcase/auth/six/page.tsx`
Target: `packages/memphis-ui/src/components/`
