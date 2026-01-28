# Implementation Plan - Browse Filters

This plan outlines the steps to implement the "popup" (dropdown) filter mechanism for the Browse Roles page, following the UI standardization work.

## 1. Objectives

- Add advanced filtering capabilities to the "Browse Roles" list view without cluttering the main UI.
- Use a DaisyUI `dropdown` component triggered by a button next to the search bar.
- Ensure the design is consistent with the standard form patterns (DaisyUI v5).
- Prepare the component for reuse in the "Browse Candidates" page later.

## 2. Technical Scope

### 2.1 New Component: `FilterDropdown`

- **Location**: `apps/portal/src/app/portal/browse/roles/components/filter-dropdown.tsx`
- **Props**:
    - `filters`: Current filter state object.
    - `onChange`: Callback `(newFilters: Record<string, any>) => void`.
- **UI Structure**:
    - Trigger: Button with `fa-filter` icon (Ghost or Outline style).
    - Body: DaisyUI dropdown content (`dropdown-content menu p-4 shadow bg-base-100 rounded-box w-80`).
    - Form Controls (using v5 pattern):
        - **Remote Policy**: Select/Radio (On-site, Remote, Hybrid).
        - **Job Type**: Select (Full-time, Contract, etc.).
        - **Status**: Checkboxes or Multi-select (Open, Closed, Draft) - _if applicable_.
    - Actions: "Reset" and "Apply" buttons (though purely reactive changes are often better).

### 2.2 Integration: `ListPanel`

- **Location**: `apps/portal/src/app/portal/browse/roles/components/list-panel.tsx`
- **Changes**:
    - Import `FilterDropdown`.
    - Locate the Search Input row (Toolbar).
    - Insert `FilterDropdown` between the Search Input and the "Add Role" button.
    - Pass the `filters` and `setFilters` from the `useStandardList` hook.

### 2.3 Type Updates

- **Location**: `apps/portal/src/app/portal/browse/roles/types.ts`
- **Changes**:
    - Ensure `JobFilters` interface supports the fields we are adding (e.g., `remote_policy`, `employment_type`).

## 3. Implementation Steps

1.  **Verify Types**: Check `types.ts` in `roles` domain to ensure filter fields exist.
2.  **Create Component**: Implement `FilterDropdown` with hardcoded options first to verify UI layout and responsiveness.
3.  **Integrate Component**: Add to `ListPanel` and verify the dropdown opens/closes correctly and doesn't conflict with z-index of other elements.
4.  **Connect Logic**: Wire up the `onChange` to update the list filters.
5.  **Refine UI**: Ensure standardized spacing and icon usage (`fa-duotone`).

## 4. Future Considerations

- Extract `FilterDropdown` to a shared location if the logic is generic enough (though options are usually domain-specific).
- Apply the same pattern to `candidate-list-panel.tsx`.
