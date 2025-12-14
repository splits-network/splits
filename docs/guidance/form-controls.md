# Form Controls Guidance

This document outlines the standard patterns for implementing form controls in the Splits Network portal frontend.

## Technology Stack

- **UI Framework**: DaisyUI 5.5.8 + TailwindCSS
- **Component Library**: React with Next.js 16 App Router
- **Form Validation**: Native HTML5 validation + controlled components

---

## Standard Form Pattern

### ✅ Correct Implementation (DaisyUI Fieldset Pattern)

Use the `fieldset` class wrapper with simple label elements:

```tsx
<div className="fieldset">
    <label className="label">Field Label</label>
    <input 
        type="text"
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Placeholder text"
        required
    />
</div>
```

### ❌ Incorrect (Legacy form-control Pattern)

Do NOT use the `form-control` pattern with verbose label markup:

```tsx
{/* WRONG - Do not use this pattern */}
<div className="form-control">
    <label className="label">
        <span className="label-text">Field Label</span>
    </label>
    <input 
        type="text"
        className="input input-bordered"
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
</div>
```

---

## Key Differences

| Aspect | ✅ Correct (Fieldset) | ❌ Incorrect (form-control) |
|--------|---------------------|---------------------------|
| Wrapper class | `fieldset` | `form-control` |
| Label markup | `<label className="label">Text</label>` | `<label className="label"><span className="label-text">Text</span></label>` |
| Input classes | `input` | `input input-bordered` |
| Select classes | `select` | `select select-bordered` |
| Textarea classes | `textarea` | `textarea textarea-bordered` |

**Key Rule**: Never use `-bordered` suffixes on form elements. DaisyUI applies borders automatically.

---

## Component-Specific Examples

### Text Input

```tsx
<div className="fieldset">
    <label className="label">Company Name *</label>
    <input 
        type="text"
        className="input"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Enter company name"
        required
    />
</div>
```

### Email Input

```tsx
<div className="fieldset">
    <label className="label">Email *</label>
    <input 
        type="email"
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
    />
</div>
```

### Select Dropdown

```tsx
<div className="fieldset">
    <label className="label">Status</label>
    <select 
        className="select"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
    >
        <option value="">Select status...</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="closed">Closed</option>
    </select>
</div>
```

### Textarea

```tsx
<div className="fieldset">
    <label className="label">Description</label>
    <textarea
        className="textarea h-24"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter details..."
    />
</div>
```

### Number Input

```tsx
<div className="fieldset">
    <label className="label">Salary (USD) *</label>
    <input 
        type="number"
        className="input"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        placeholder="150000"
        min="0"
        step="1000"
        required
    />
</div>
```

### Date Input

```tsx
<div className="fieldset">
    <label className="label">Start Date</label>
    <input 
        type="date"
        className="input"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
    />
</div>
```

---

## Additional Help Text

Use `label-text-alt` for helper text below inputs:

```tsx
<div className="fieldset">
    <label className="label">Annual Salary (USD) *</label>
    <input 
        type="number"
        className="input"
        value={salary}
        onChange={(e) => setSalary(e.target.value)}
        required
    />
    <label className="label">
        <span className="label-text-alt">The candidate's agreed annual salary</span>
    </label>
</div>
```

---

## Full Width Modifiers

For inputs that should fill their container (common in forms):

```tsx
<div className="fieldset">
    <label className="label">Email</label>
    <input 
        type="email"
        className="input w-full"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
    />
</div>
```

For selects with max width:

```tsx
<div className="fieldset">
    <label className="label">Status</label>
    <select 
        className="select w-full max-w-xs"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
    >
        <option>Select...</option>
    </select>
</div>
```

---

## Grid Layouts

For side-by-side fields:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="fieldset">
        <label className="label">First Name</label>
        <input 
            type="text"
            className="input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
        />
    </div>
    <div className="fieldset">
        <label className="label">Last Name</label>
        <input 
            type="text"
            className="input"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
        />
    </div>
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
            <div className="fieldset">
                <label className="label">Name *</label>
                <input 
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="fieldset">
                <label className="label">Email *</label>
                <input 
                    type="email"
                    className="input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />
            </div>

            <div className="fieldset">
                <label className="label">Role</label>
                <select 
                    className="select"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                    <option value="">Select...</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            <div className="fieldset">
                <label className="label">Notes</label>
                <textarea
                    className="textarea h-24"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional information..."
                />
            </div>

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

For error states, wrap fieldset with error alert:

```tsx
{error && (
    <div className="alert alert-error mb-4">
        <i className="fa-solid fa-circle-exclamation"></i>
        <span>{error}</span>
    </div>
)}

<div className="fieldset">
    <label className="label">Field Label</label>
    <input 
        type="text"
        className="input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
    />
</div>
```

---

## Special Cases

### Disabled Fields

Use `disabled` prop, not special classes:

```tsx
<input 
    type="text"
    className="input"
    value={companyId}
    disabled
/>
```

### Large Text Inputs (Code Entry)

For verification codes or special inputs:

```tsx
<div className="fieldset">
    <label className="label">Verification Code</label>
    <input 
        type="text"
        className="input w-full text-center text-2xl tracking-widest"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
    />
</div>
```

---

## Migration Checklist

When updating legacy forms:

- [ ] Replace `form-control` with `fieldset`
- [ ] Simplify labels: remove `<span className="label-text">` wrapper
- [ ] Remove `-bordered` suffixes from all inputs/selects/textareas
- [ ] Verify `w-full` is applied where needed
- [ ] Test form submission and validation
- [ ] Check responsive behavior on mobile

---

## References

- DaisyUI Documentation: https://daisyui.com/components/
- DaisyUI Fieldset: https://daisyui.com/components/fieldset/
- TailwindCSS: https://tailwindcss.com/docs

---

**Last Updated**: December 14, 2025  
**Version**: 1.0
