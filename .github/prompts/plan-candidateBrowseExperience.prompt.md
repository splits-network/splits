# Plan: Gmail-like Candidate Browse Experience

A fresh, split-pane "master-detail" interface for browsing candidates. We will build entirely new, single-purpose domain components to ensure a clean implementation without legacy technical debt. The state will sync to the URL (`?candidateId=...`) for shareability.

## Steps

### 1. Create Page Shell
Create `page.tsx` in `apps/portal/src/app/portal/browse/candidates/` as the server-side entry point.
- **Role:** Server component shell.
- **Action:** Renders the `CandidateBrowseClient` component.
- **Structure:** Wraps content in a layout suitable for full-height browsing.

### 2. Build Browse Client (Orchestrator)
Create `candidate-browse-client.tsx` in `apps/portal/src/app/portal/browse/candidates/components/`.

**LOCATION REQUIREMENT:** All components must be created in the local `apps/portal/src/app/portal/browse/candidates/components/` directory. Do not place them in the shared `src/components/` folder.

- **Role:** Main orchestrator handling layout and state.
- **Features:**
  - Manages split-pane layout (List vs Detail).
  - Syncs selected candidate state with URL (`?candidateId=...`).
  - Handles responsiveness: Shows list-only on mobile, toggles to detail view on selection.
  - manages "Back to List" navigation on mobile.

### 3. Implement List Panel
Create `components/candidate-list-panel.tsx`.
- **Role:** The left-hand sidebar list view.
- **Styling:** `bg-base-200` to create depth behind the list items.
- **Logic:**
  - Uses `useStandardList` hook for fetching, sorting, and pagination.
  - Includes a sticky search header at the top.
  - Renders a scrollable list of candidates.
  - Includes standard pagination controls at the bottom.
  - **Keyboard Navigation:** Support `Up`/`Down` arrows to navigate list and `Enter` to select.
  - **Scroll Preservation:** Ensure scroll position is maintained when navigating or toggling views on mobile.

### 4. Create List Item Component
Create `components/candidate-list-item.tsx`.
- **Role:** Individual row/card for the sidebar list.
- **Styling:**
  - Compact design (Name, Title, Condensed Badges).
  - **Active State:** `bg-base-100` + Border/Shadow (pop out effect).
  - **Inactive State:** Transparent/Subtle hover overlay.
  - **"New" Status:** Bold text or colored dot indicator for new/unread candidates.
- **Features:**
  - **Hover Actions:** Show "Quick Actions" (e.g., Copy Link) button only on hover.
- **Interaction:** Clicks update the parent selected state (and URL).

### 5. Implement Detail Panel
Create `components/candidate-detail-panel.tsx`.
- **Role:** The right-hand main content area.
- **Styling:** `bg-base-100` (main surface color).
- **Logic:**
  - Fetches **only core** candidate data (profile) immediately.
  - Passes `candidateId` to sub-components to allow them to fetch their own related data (Progressive Loading).
  - Handles loading (`skeleton`) for the main profile and empty ("Select a candidate") states.

### 6. Create Granular Detail Components
Create small, focused sub-components in the local folder. **Each component should fetch its own data independently** where possible to allow for fast, non-blocking page loads (Progressive Loading).
- `components/detail-header.tsx`: Name, Avatar, Actions. (Data from parent or fast fetch).
- `components/detail-bio.tsx`: Bio, Skills. (Data from parent or fast fetch).
- `components/detail-applications.tsx`: **Async fetch** of active applications list. Includes own skeleton state.
- `components/detail-timeline.tsx`: **Async fetch** of recent activity history. Includes own skeleton state.
- `components/detail-documents.tsx`: **Async fetch** of resume/document list. Includes own skeleton state.

## Further Considerations

1. **Clean Slate Protocol:** Strictly avoid importing legacy candidate components (e.g., old cards or monolithic detail views). Use direct DaisyUI utility classes for all new UI elements.
2. **Data Fetching Strategy:**
   - **List:** Lighter payload (basic info).
   - **Detail:** On-demand full fetch (enriched data) to keep the initial load fast.
3. **URL Sync:** Ensure that sharing a link with `?candidateId=xyz` automatically opens that candidate in the detail panel.
