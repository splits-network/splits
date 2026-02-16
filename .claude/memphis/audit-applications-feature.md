# Memphis Compliance Audit: Applications Feature

**Date**: 2026-02-16
**Feature**: `apps/portal/src/app/portal/applications-memphis/`
**Status**: 🟡 Partial Compliance - Multiple violations found

---

## 📊 Audit Summary

- **Total Files**: 24 TypeScript/TSX files
- **Files with Violations**: 8
- **Critical Issues**: 3
- **Minor Issues**: 15

---

## 🚨 Critical Issues

### 1. AIReviewPanel Component (External Shared Component)
**Location**: `apps/portal/src/components/ai-review-panel.tsx`
**Impact**: HIGH - Used across Memphis pages but not Memphis-compliant

**Violations**:
- ❌ Uses `card`, `card-body`, `card-title` (DaisyUI v3)
- ❌ Uses `badge-success`, `badge-info`, `badge-warning`, `badge-error`
- ❌ Uses `progress progress-success` without Memphis styling
- ❌ Uses `bg-base-100`, `bg-base-200`
- ❌ Missing 4px borders
- ❌ Uses non-Memphis `StatCard` component

**Fix Required**: Create Memphis-compliant version using `retro-metrics`, Memphis accent colors, and 4px borders.

---

### 2. Details Component - Multiple `card` Usage
**Location**: `applications-memphis/components/shared/details.tsx`
**Lines**: 335, 437, 524, 538, 548, 574, 605, 654

**Violations**:
```tsx
// ❌ NOT Memphis-compliant
<div className="card bg-base-200 p-6">
```

**Fix Required**: Replace with Memphis Card component from `@splits-network/memphis-ui` or use proper Memphis container patterns.

---

### 3. Universal Submit Candidate Wizard
**Location**: `applications-memphis/components/wizards/universal-submit-candidate-wizard.tsx`

**Violations**:
- Lines 659, 662: Uses `badge-success`, `badge-warning` instead of Memphis accent colors
- Lines 512-513, 754-755, 1131-1132, 1148-1149, 1283-1284, 1308-1309, 1346-1347, 1360-1361: Multiple `card bg-base-200` and `card-body` usage
- Lines 597, 813, 1402: Uses `border` without width (should be `border-4`)

**Fix Required**:
- Replace badge colors with Memphis accents (`bg-coral`, `bg-teal`, `bg-yellow`)
- Replace cards with Memphis Card component
- Add 4px border widths

---

## ⚠️ Minor Issues

### 4. Grid Card Component
**Location**: `applications-memphis/components/grid/grid-card.tsx`

**Violations**:
- Line 48: Uses `card-body` (but Card component from Memphis is used, so this might be intentional)
- Line 87: Uses `border-t-2` → should be `border-t-4`
- Line 91: Uses `border-2` → should be `border-4`

---

### 5. Table Row Component
**Location**: `applications-memphis/components/table/table-row.tsx`

**Violations**:
- Line 27: Uses `border-b-2` → should be `border-b-4`

---

### 6. Split Item Component
**Location**: `applications-memphis/components/split/split-item.tsx`

**Violations**:
- Line 27: Uses `border-b-2` → should be `border-b-4`

---

### 7. View Mode Toggle
**Location**: `applications-memphis/components/shared/view-mode-toggle.tsx`

**Violations**:
- Line 16: Uses `border-2` → should be `border-4`

---

### 8. Document Viewer Modal
**Location**: `applications-memphis/components/modals/document-viewer-modal.tsx`

**Violations**:
- Lines 105, 212: Uses `border` without width → should be `border-4`

---

### 9. Approve Gate Modal
**Location**: `applications-memphis/components/modals/approve-gate-modal.tsx`

**Violations**:
- Line 184: Uses `border border-base-300` → should be `border-4`

---

## ✅ Good Practices Found

1. **Memphis UI Imports**: Already using components from `@splits-network/memphis-ui`:
   - `Badge` (split-item, table-row, grid-card)
   - `Card` (grid-card)
   - `SearchInput` (controls-bar)

2. **Accent Color System**: Using proper accent cycling pattern (coral/teal/yellow/purple)

3. **Retro Metrics**: Details component uses proper `retro-metrics` pattern for overview stats

---

## 📋 Action Plan

### Phase 1: Critical Fixes (High Priority)
1. ✅ Create Memphis-compliant `AIReviewPanel` component
2. ✅ Update details component to use Memphis containers
3. ✅ Fix universal wizard badge colors and card usage

### Phase 2: Border Fixes (Medium Priority)
4. ✅ Fix all `border-2` → `border-4`
5. ✅ Fix all bare `border` → `border-4`

### Phase 3: Verification
6. ✅ Verify all components use Memphis UI library
7. ✅ Test visual consistency across all views

---

## 🎨 Memphis Design Patterns Reference

### ✅ Correct Patterns

```tsx
// Memphis accent colors
<Badge className="bg-coral" />
<Badge className="bg-teal" />
<Badge className="bg-yellow" />

// Memphis borders (always 4px)
<div className="border-4 border-dark" />
<div className="border-l-4 border-coral" />

// Memphis metrics
<div className="retro-metrics grid grid-cols-3">
  <div className="metric-block metric-block-sm bg-coral text-coral-content">
    <div className="retro-metric-value">42</div>
    <div className="retro-metric-label">Status</div>
  </div>
</div>

// Memphis Card component
import { Card } from "@splits-network/memphis-ui";
<Card variant="default" />
```

### ❌ Anti-Patterns (Do NOT Use)

```tsx
// Generic badge colors
<span className="badge-success" />  // ❌
<span className="badge-info" />     // ❌

// DaisyUI v3 cards
<div className="card bg-base-200">  // ❌
  <div className="card-body" />     // ❌
</div>

// Non-4px borders
<div className="border-2" />        // ❌
<div className="border-t-3" />      // ❌
<div className="border" />          // ❌ (no width specified)
```

---

## 📝 Notes

- Memphis UI package location: `packages/memphis-ui/`
- Available Memphis components: 101 React components
- Memphis CSS utilities: `src/components/*.css` (57 files)
- Always rebuild Memphis UI after changes: `pnpm --filter @splits-network/memphis-ui build`

---

**Next Steps**: Proceed with Phase 1 fixes starting with AIReviewPanel component.
