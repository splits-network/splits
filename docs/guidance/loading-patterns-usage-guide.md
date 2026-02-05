# Loading Patterns Usage Guide

**Package**: `@splits-network/shared-ui`
**Module**: `/loading`
**Last Updated**: 2026-02-04
**Status**: Active Standard

## Overview

This guide demonstrates how to use the standardized loading components from `@splits-network/shared-ui`. These components enforce consistent loading UX across all apps (portal, candidate, corporate).

**Related Documentation**:
- [loading-states-patterns.md](./loading-states-patterns.md) - Comprehensive audit and analysis
- Package: [packages/shared-ui/src/loading/](../../packages/shared-ui/src/loading/)

---

## Table of Contents

1. [Installation & Import](#installation--import)
2. [LoadingSpinner](#loadingspinner)
3. [LoadingState](#loadingstate)
4. [SkeletonLoader](#skeletonloader)
5. [ButtonLoading](#buttonloading)
6. [ModalLoadingOverlay](#modalloadingoverlay)
7. [ChartLoadingState](#chartloadingstate)
8. [Migration Examples](#migration-examples)
9. [Size Guidelines](#size-guidelines)
10. [Color Guidelines](#color-guidelines)

---

## Installation & Import

The `shared-ui` package is already a dependency in all frontend apps. Import loading components as needed:

```tsx
// Import specific components
import { LoadingSpinner, LoadingState } from '@splits-network/shared-ui';

// Import types
import type { LoadingSpinnerProps, SpinnerSize } from '@splits-network/shared-ui';

// Import multiple at once
import {
    LoadingSpinner,
    LoadingState,
    SkeletonLoader,
    ButtonLoading,
    ModalLoadingOverlay,
    ChartLoadingState,
} from '@splits-network/shared-ui';
```

---

## LoadingSpinner

**Core spinner component** with size, type, color, and message props.

### Basic Usage

```tsx
import { LoadingSpinner } from '@splits-network/shared-ui';

// Default spinner (medium size)
<LoadingSpinner />

// With custom size
<LoadingSpinner size="lg" />

// With message
<LoadingSpinner size="md" message="Loading data..." />

// With semantic color
<LoadingSpinner size="sm" color="success" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Spinner size |
| `type` | `'spinner' \| 'dots' \| 'ring' \| 'ball'` | `'spinner'` | Spinner animation type |
| `color` | `'default' \| 'primary' \| 'success' \| 'error' \| 'warning' \| 'white'` | `'default'` | Color variant |
| `message` | `string` | - | Optional loading message |
| `className` | `string` | `''` | Additional CSS classes |

### Use Cases

```tsx
// Inline action spinner
<LoadingSpinner size="xs" />

// Button spinner
<LoadingSpinner size="sm" />

// Content area spinner
<LoadingSpinner size="md" message="Loading candidates..." />

// Full page spinner
<LoadingSpinner size="lg" message="Loading dashboard..." />

// Stats/metrics (use dots variant)
<LoadingSpinner size="sm" type="dots" />

// Success confirmation
<LoadingSpinner size="sm" color="success" />

// Dark button spinner
<LoadingSpinner size="sm" color="white" />
```

---

## LoadingState

**Full page/section loading** with consistent centered layout.

### Basic Usage

```tsx
import { LoadingState } from '@splits-network/shared-ui';

// Full page loading (default)
if (loading) {
    return <LoadingState />;
}

// With custom message
if (loading) {
    return <LoadingState message="Loading candidates..." />;
}

// Section loading (not full height)
if (loading) {
    return <LoadingState fullHeight={false} />;
}

// Smaller for cards
if (loading) {
    return <LoadingState size="md" fullHeight={false} />;
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | `string` | `'Loading...'` | Loading message |
| `size` | `SpinnerSize` | `'lg'` | Spinner size |
| `color` | `LoadingColor` | `'default'` | Spinner color |
| `fullHeight` | `boolean` | `true` | Use `min-h-screen` for full page |
| `className` | `string` | `''` | Additional CSS classes |

### Migration Example

**Before** (old pattern):
```tsx
if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}
```

**After** (standardized):
```tsx
import { LoadingState } from '@splits-network/shared-ui';

if (loading) {
    return <LoadingState message="Loading dashboard..." />;
}
```

---

## SkeletonLoader

**Content placeholder** for predictable layouts.

### Basic Usage

```tsx
import { SkeletonLoader, SkeletonList } from '@splits-network/shared-ui';

// Single text line
<SkeletonLoader variant="text" />

// Text block (multiple lines)
<SkeletonLoader variant="text-block" lines={3} />

// Avatar
<SkeletonLoader variant="avatar" />
<SkeletonLoader variant="avatar-circle" />

// Image placeholder
<SkeletonLoader variant="image" height="h-48" />

// Card layout
<SkeletonLoader variant="card" />

// Table row
<SkeletonLoader variant="table-row" columns={5} />

// Custom dimensions
<SkeletonLoader variant="custom" height="h-12" width="w-64" />
```

### Skeleton List

```tsx
// List of skeleton items
<SkeletonList
    count={5}
    variant="text-block"
    gap="gap-4"
    itemProps={{ lines: 2 }}
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'text' \| 'text-block' \| 'avatar' \| 'avatar-circle' \| 'image' \| 'card' \| 'table-row' \| 'custom'` | - | Layout variant |
| `lines` | `number` | `3` | Lines for `text-block` |
| `columns` | `number` | `4` | Columns for `table-row` |
| `height` | `string` | varies | Tailwind height class |
| `width` | `string` | varies | Tailwind width class |
| `className` | `string` | `''` | Additional CSS classes |

### Use Cases

```tsx
// Loading user profile
if (loading) {
    return (
        <div className="flex gap-4">
            <SkeletonLoader variant="avatar-circle" />
            <div className="flex-1">
                <SkeletonLoader variant="text" width="w-32" className="mb-2" />
                <SkeletonLoader variant="text-block" lines={2} />
            </div>
        </div>
    );
}

// Loading table
if (loading) {
    return (
        <SkeletonList
            count={10}
            variant="table-row"
            gap="gap-2"
            itemProps={{ columns: 5 }}
        />
    );
}

// Loading list of cards
if (loading) {
    return (
        <div className="grid grid-cols-3 gap-4">
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
            <SkeletonLoader variant="card" />
        </div>
    );
}
```

---

## ButtonLoading

**Button loading state** helper component.

### Basic Usage

```tsx
import { ButtonLoading } from '@splits-network/shared-ui';

// Basic form button
<button disabled={isSubmitting} className="btn btn-primary">
    <ButtonLoading
        loading={isSubmitting}
        text="Save"
        loadingText="Saving..."
    />
</button>

// With icon
<button disabled={isDeleting} className="btn btn-error">
    <ButtonLoading
        loading={isDeleting}
        icon="fa-duotone fa-regular fa-trash"
        text="Delete"
        loadingText="Deleting..."
        spinnerColor="white"
    />
</button>

// Inline action
<button disabled={isProcessing} className="btn btn-sm">
    <ButtonLoading
        loading={isProcessing}
        text="Approve"
        spinnerSize="xs"
    />
</button>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | - | Loading state (required) |
| `text` | `string` | - | Button text (required) |
| `loadingText` | `string` | - | Text during loading |
| `icon` | `string` | - | FontAwesome icon class |
| `spinnerSize` | `SpinnerSize` | `'sm'` | Spinner size |
| `spinnerColor` | `LoadingColor` | `'default'` | Spinner color |
| `inline` | `boolean` | `true` | Show inline with text |

### Migration Example

**Before**:
```tsx
<button disabled={submitting} className="btn btn-primary">
    {submitting ? (
        <>
            <span className="loading loading-spinner loading-sm"></span>
            <span>Saving...</span>
        </>
    ) : (
        'Save'
    )}
</button>
```

**After**:
```tsx
import { ButtonLoading } from '@splits-network/shared-ui';

<button disabled={submitting} className="btn btn-primary">
    <ButtonLoading
        loading={submitting}
        text="Save"
        loadingText="Saving..."
    />
</button>
```

---

## ModalLoadingOverlay

**Modal loading overlay** for initial data loading.

### Basic Usage

```tsx
import { ModalLoadingOverlay } from '@splits-network/shared-ui';

<dialog open={isOpen} className="modal">
    <div className="modal-box">
        <ModalLoadingOverlay loading={isLoading}>
            <ModalContent />
        </ModalLoadingOverlay>
    </div>
</dialog>

// With custom message
<ModalLoadingOverlay loading={isLoading} message="Loading invitation...">
    <InvitationForm />
</ModalLoadingOverlay>

// Custom minimum height
<ModalLoadingOverlay loading={isLoading} minHeight="min-h-[400px]">
    <ComplexForm />
</ModalLoadingOverlay>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | - | Show overlay (required) |
| `message` | `string` | `'Loading...'` | Loading message |
| `minHeight` | `string` | `'min-h-[200px]'` | Minimum height (Tailwind class) |
| `children` | `ReactNode` | - | Content to show when loaded |

### Use Cases

```tsx
// Onboarding wizard
<dialog open={isOpen} className="modal modal-open">
    <div className="modal-box max-w-2xl">
        <ModalLoadingOverlay
            loading={loadingProgress}
            message="Loading your progress..."
        >
            <WizardSteps />
        </ModalLoadingOverlay>
    </div>
</dialog>

// Edit form modal
<ModalLoadingOverlay loading={loadingData} message="Loading candidate...">
    <CandidateEditForm candidate={data} />
</ModalLoadingOverlay>
```

---

## ChartLoadingState

**Chart/analytics loading** with fixed height to prevent layout shift.

### Basic Usage

```tsx
import { ChartLoadingState } from '@splits-network/shared-ui';

function MyChart({ height = 300 }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    return <Chart data={data} />;
}

// With custom message
if (loading) {
    return (
        <ChartLoadingState
            height={400}
            message="Loading analytics..."
        />
    );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `height` | `number` | - | Chart height in pixels (required) |
| `message` | `string` | - | Optional loading message |

### Migration Example

**Before**:
```tsx
if (loading) {
    return (
        <div className="flex items-center justify-center" style={{ height }}>
            <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
    );
}
```

**After**:
```tsx
import { ChartLoadingState } from '@splits-network/shared-ui';

if (loading) {
    return <ChartLoadingState height={height} />;
}
```

### Complete Chart Example

```tsx
import { ChartLoadingState } from '@splits-network/shared-ui';
import { Line } from 'react-chartjs-2';

export function ApplicationsTrendsChart({ height = 300 }) {
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetchChartData().then(setChartData).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <ChartLoadingState height={height} />;
    }

    if (!chartData) {
        return (
            <div
                style={{ height }}
                className="flex items-center justify-center text-base-content/50"
            >
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div style={{ height }}>
            <Line data={chartData} options={{ responsive: true }} />
        </div>
    );
}
```

---

## Migration Examples

### Example 1: Page Loading

**Before**:
```tsx
const [loading, setLoading] = useState(true);

if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <span className="loading-spinner loading-lg"></span>
            <p className="mt-4">Loading candidates...</p>
        </div>
    );
}
```

**After**:
```tsx
import { LoadingState } from '@splits-network/shared-ui';

const [loading, setLoading] = useState(true);

if (loading) {
    return <LoadingState message="Loading candidates..." />;
}
```

---

### Example 2: Form Submission

**Before**:
```tsx
<button disabled={submitting} className="btn btn-primary">
    {submitting ? (
        <>
            <span className="loading loading-spinner loading-sm"></span>
            Saving...
        </>
    ) : (
        'Save Changes'
    )}
</button>
```

**After**:
```tsx
import { ButtonLoading } from '@splits-network/shared-ui';

<button disabled={submitting} className="btn btn-primary">
    <ButtonLoading
        loading={submitting}
        text="Save Changes"
        loadingText="Saving..."
    />
</button>
```

---

### Example 3: List Loading with Skeleton

**Before**:
```tsx
if (loading) {
    return (
        <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}
```

**After** (if predictable layout):
```tsx
import { SkeletonList } from '@splits-network/shared-ui';

if (loading) {
    return (
        <SkeletonList
            count={10}
            variant="text-block"
            gap="gap-4"
            itemProps={{ lines: 3 }}
        />
    );
}
```

---

### Example 4: Modal Loading

**Before**:
```tsx
<dialog open={isOpen} className="modal">
    <div className="modal-box">
        {loading ? (
            <div className="flex justify-center items-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        ) : (
            <InvitationForm />
        )}
    </div>
</dialog>
```

**After**:
```tsx
import { ModalLoadingOverlay } from '@splits-network/shared-ui';

<dialog open={isOpen} className="modal">
    <div className="modal-box">
        <ModalLoadingOverlay loading={loading}>
            <InvitationForm />
        </ModalLoadingOverlay>
    </div>
</dialog>
```

---

### Example 5: Inline Action Button

**Before**:
```tsx
<button
    disabled={actionLoading === 'approve'}
    onClick={() => handleAction('approve')}
    className="btn btn-sm"
>
    {actionLoading === 'approve' && (
        <span className="loading loading-spinner loading-xs"></span>
    )}
    Approve
</button>
```

**After**:
```tsx
import { ButtonLoading } from '@splits-network/shared-ui';

<button
    disabled={actionLoading === 'approve'}
    onClick={() => handleAction('approve')}
    className="btn btn-sm"
>
    <ButtonLoading
        loading={actionLoading === 'approve'}
        text="Approve"
        spinnerSize="xs"
    />
</button>
```

---

## Size Guidelines

Use the appropriate size based on context:

| Size | Context | Example |
|------|---------|---------|
| `xs` | Inline actions, icon buttons, small operations | Table row actions, small buttons |
| `sm` | Form buttons, submit/save actions | "Save", "Submit", "Delete" buttons |
| `md` | Modal/card content, chart areas | Charts, analytics, content sections |
| `lg` | Full page load, major section load | Dashboard loading, page transitions |

```tsx
// Extra small - inline actions
<LoadingSpinner size="xs" />

// Small - form buttons
<ButtonLoading loading={saving} text="Save" spinnerSize="sm" />

// Medium - charts and content areas
<ChartLoadingState height={300} />

// Large - full page loading
<LoadingState size="lg" message="Loading dashboard..." />
```

---

## Color Guidelines

Use semantic colors sparingly and only when meaningful:

| Color | Usage | Example |
|-------|-------|---------|
| `default` | Most loading states | General data fetching, page loads |
| `success` | Success confirmation loading | After successful action, positive operations |
| `error` | Retry operations, error recovery | Retrying failed requests |
| `warning` | Cautious operations | Deletions, irreversible actions |
| `white` | Dark backgrounds, primary buttons | Spinners on colored buttons |

```tsx
// Default (recommended for most cases)
<LoadingSpinner />

// Success (for positive confirmations)
<LoadingSpinner color="success" message="Saving..." />

// Error (for retry operations)
<LoadingSpinner color="error" message="Retrying..." />

// Warning (for destructive actions)
<ButtonLoading
    loading={deleting}
    text="Delete"
    loadingText="Deleting..."
    spinnerColor="warning"
/>

// White (for dark buttons)
<button className="btn btn-primary">
    <ButtonLoading
        loading={submitting}
        text="Submit"
        spinnerColor="white"
    />
</button>
```

---

## Best Practices

### 1. **Choose Skeleton vs Spinner**

Use **skeletons** when content shape is predictable:
```tsx
// Good: List items with known structure
if (loading) {
    return <SkeletonList count={10} variant="text-block" />;
}
```

Use **spinners** when content is dynamic or unknown:
```tsx
// Good: Unknown data structure
if (loading) {
    return <LoadingState />;
}
```

---

### 2. **Prevent Layout Shift**

Always use fixed heights for charts and content areas:
```tsx
// Good: Fixed height prevents layout shift
<ChartLoadingState height={300} />

// Bad: Height changes when loading completes
<LoadingSpinner size="md" />
```

---

### 3. **Consistent Button Loading**

Always use `ButtonLoading` for consistency:
```tsx
// Good: Consistent pattern
<button disabled={loading} className="btn">
    <ButtonLoading loading={loading} text="Save" loadingText="Saving..." />
</button>

// Bad: Manual spinner implementation
<button disabled={loading} className="btn">
    {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}
</button>
```

---

### 4. **Message Guidelines**

| Context | Show Message? | Wording |
|---------|---------------|---------|
| Full page load | Yes | "Loading [Resource Name]..." |
| Modal load | Optional | "Loading..." |
| Form submission | No | Button text changes are sufficient |
| Background operations | Optional | "Processing...", "Saving..." |

```tsx
// Good: Clear message for full page
<LoadingState message="Loading candidates..." />

// Good: No message needed for buttons
<ButtonLoading loading={saving} text="Save" />

// Avoid: Redundant message
<ButtonLoading loading={saving} text="Save" loadingText="Save" />
```

---

### 5. **Don't Mix Patterns**

```tsx
// Bad: Mixing old and new patterns
if (loading) {
    return (
        <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
        </div>
    );
}

// Good: Use standardized component
if (loading) {
    return <LoadingState />;
}
```

---

## Summary

**Key Takeaways**:
1. ✅ **Import from `@splits-network/shared-ui`** for all loading patterns
2. ✅ **Use `LoadingState`** for full page/section loading
3. ✅ **Use `SkeletonLoader`** for predictable layouts
4. ✅ **Use `ButtonLoading`** for all form buttons
5. ✅ **Use `ModalLoadingOverlay`** for modal data loading
6. ✅ **Use `ChartLoadingState`** for charts and analytics
7. ✅ **Follow size guidelines** (xs → sm → md → lg)
8. ✅ **Use default color** unless semantic meaning applies
9. ✅ **Prevent layout shift** with fixed heights
10. ✅ **Be consistent** across the entire platform

**Questions or Issues?**
See [loading-states-patterns.md](./loading-states-patterns.md) for detailed analysis or check the component source code in [packages/shared-ui/src/loading/](../../packages/shared-ui/src/loading/).
