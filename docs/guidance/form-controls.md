# Form Controls Guidance

This document outlines the standard patterns for implementing form controls in the Splits Network portal frontend.

## Technology Stack

- **UI Framework**: DaisyUI 5.5.8 + TailwindCSS
- **Component Library**: React with Next.js 16 App Router
- **Form Validation**: Native HTML5 validation + controlled components

---

## Standard Form Pattern

### ✅ Correct Implementation (DaisyUI v5 Semantic Fieldset Pattern)

Use semantic HTML `<fieldset>` and `<legend>` elements with DaisyUI classes:

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Field Label</legend>
    <input 
        type="text"
        className="input w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Placeholder text"
        required
    />
</fieldset>
```

### With Helper Text

Use `<p className="fieldset-label">` for helper text:

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Annual Salary (USD) *</legend>
    <input 
        type="number"
        className="input w-full"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        required
    />
    <p className="fieldset-label">The candidate's agreed annual salary</p>
</fieldset>
```

### ❌ Incorrect (Legacy v4 Pattern - Causes Mobile Cursor Issues)

Do NOT use `<div>` with `<label className="label">` - this causes cursor misalignment on mobile:

```tsx
{/* WRONG - Do not use this pattern - causes mobile issues */}
<div className="fieldset">
    <label className="label">Field Label</label>
    <input 
        type="text"
        className="input w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
    <label className="label">
        <span className="label-text-alt">Helper text</span>
    </label>
</div>
```

---

## Key Differences (v4 → v5 Migration)

| Aspect | ❌ Old v4 Pattern | ✅ New v5 Pattern |
|--------|-------------------|-------------------|
| Wrapper element | `<div className="fieldset">` | `<fieldset className="fieldset">` |
| Label element | `<label className="label">Text</label>` | `<legend className="fieldset-legend">Text</legend>` |
| Helper text | `<label className="label"><span className="label-text-alt">...</span></label>` | `<p className="fieldset-label">...</p>` |
| Input classes | `input` or `input w-full` | `input w-full` (unchanged) |

**Why This Matters**: The v4 `<label className="label">` pattern causes cursor misalignment on mobile devices. The v5 semantic pattern with `<fieldset>` and `<legend>` is both more accessible and works correctly on all devices.

---

## Component-Specific Examples

### Text Input

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Company Name *</legend>
    <input 
        type="text"
        className="input w-full"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Enter company name"
        required
    />
</fieldset>
```

### Email Input

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Email *</legend>
    <input 
        type="email"
        className="input w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
    />
</fieldset>
```

### Select Dropdown

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Status</legend>
    <select 
        className="select w-full"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
    >
        <option value="">Select status...</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="closed">Closed</option>
    </select>
</fieldset>
```

### Textarea

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Description</legend>
    <textarea
        className="textarea w-full h-24"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter details..."
    />
</fieldset>
```

### Number Input with Helper Text

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Salary (USD) *</legend>
    <input 
        type="number"
        className="input w-full"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        placeholder="150000"
        min="0"
        step="1000"
        required
    />
    <p className="fieldset-label">Percentage of annual salary</p>
</fieldset>
```

### Date Input

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Start Date</legend>
    <input 
        type="date"
        className="input w-full"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
    />
</fieldset>
```

### Password with Forgot Link

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Password</legend>
    <input
        type="password"
        placeholder="••••••••"
        className="input w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
    />
    <p className="fieldset-label">
        <Link href="/forgot-password" className="link link-hover">
            Forgot password?
        </Link>
    </p>
</fieldset>
```

---

## Grid Layouts

For side-by-side fields:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <fieldset className="fieldset">
        <legend className="fieldset-legend">First Name</legend>
        <input 
            type="text"
            className="input w-full"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
        />
    </fieldset>
    <fieldset className="fieldset">
        <legend className="fieldset-legend">Last Name</legend>
        <input 
            type="text"
            className="input w-full"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
        />
    </fieldset>
</div>
```

---

## Complete Form Example

```tsx
'use client';

import { useState, FormEvent } from 'react';

export default function ExampleForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        notes: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Submit logic here
        
        setSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Name *</legend>
                <input 
                    type="text"
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email *</legend>
                <input 
                    type="email"
                    className="input w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Role</legend>
                <select 
                    className="select w-full"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="">Select...</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                </select>
            </fieldset>

            <fieldset className="fieldset">
                <legend className="fieldset-legend">Notes</legend>
                <textarea
                    className="textarea w-full h-24"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information..."
                />
            </fieldset>

            <div className="flex gap-2 justify-end">
                <button type="button" className="btn">
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </button>
            </div>
        </form>
    );
}
```

---

## Validation & Error States

For error states, use alerts above the form:

```tsx
{error && (
    <div className="alert alert-error mb-4">
        <i className="fa-solid fa-circle-exclamation"></i>
        <span>{error}</span>
    </div>
)}

<fieldset className="fieldset">
    <legend className="fieldset-legend">Field Label</legend>
    <input 
        type="text"
        className="input w-full"
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
</fieldset>
```

---

## Special Cases

### Disabled Fields

Use `disabled` prop:

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Company ID</legend>
    <input 
        type="text"
        className="input w-full"
        value={companyId}
        disabled
    />
    <p className="fieldset-label">Company cannot be changed</p>
</fieldset>
```

### Large Text Inputs (Verification Codes)

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">Verification Code</legend>
    <input 
        type="text"
        className="input w-full text-center text-2xl tracking-widest"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
    />
</fieldset>
```

### Legend with Inline Helper

For file uploads or fields needing inline context:

```tsx
<fieldset className="fieldset">
    <legend className="fieldset-legend">
        Resume (Optional)
        <span className="text-base-content/60 font-normal text-sm ml-2">
            PDF, DOC, DOCX, or TXT - Max 10MB
        </span>
    </legend>
    <input
        type="file"
        className="file-input w-full"
        accept=".pdf,.doc,.docx,.txt"
    />
</fieldset>
```

---

## Migration Checklist

When updating legacy forms from v4 to v5:

- [ ] Replace `<div className="fieldset">` with `<fieldset className="fieldset">`
- [ ] Replace `<label className="label">Label Text</label>` with `<legend className="fieldset-legend">Label Text</legend>`
- [ ] Replace helper text `<label className="label"><span className="label-text-alt">...</span></label>` with `<p className="fieldset-label">...</p>`
- [ ] Ensure `w-full` is applied to inputs where needed
- [ ] Test on mobile devices to verify cursor placement
- [ ] Check accessibility with screen reader

---

## References

- DaisyUI v5 Fieldset: https://daisyui.com/components/fieldset/
- TailwindCSS: https://tailwindcss.com/docs

---

**Last Updated**: January 8, 2026  
**Version**: 2.0 (DaisyUI v5 Migration)
