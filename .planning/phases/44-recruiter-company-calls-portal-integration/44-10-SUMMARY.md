---
phase: 44-recruiter-company-calls-portal-integration
plan: 10
subsystem: video-app
tags: [side-panel, tabs, chat, context, history, websocket]
depends_on: ["44-02"]
provides: ["in-call-side-panel", "call-context-tab", "call-chat-tab", "call-history-tab"]
affects: ["44-11", "44-12"]
tech-stack:
  added: []
  patterns: ["tabbed-panel", "localStorage-preference", "websocket-chat"]
key-files:
  created:
    - apps/video/src/components/context-tab.tsx
    - apps/video/src/components/chat-tab.tsx
    - apps/video/src/components/history-tab.tsx
    - apps/video/src/hooks/use-call-context.ts
    - apps/video/src/hooks/use-panel-preference.ts
  modified:
    - apps/video/src/components/call-side-panel.tsx
    - apps/video/src/lib/types.ts
decisions:
  - "Guest detection via accessToken presence (null = guest, Chat tab only)"
  - "Panel preference stored per callId in localStorage"
  - "Chat uses call:{callId} WebSocket channel for real-time messaging"
  - "Entity data fetched via API gateway with fallback to raw entity_link data"
metrics:
  duration: "3min"
  completed: "2026-03-09"
---

# Phase 44 Plan 10: In-Call Side Panel Summary

Three-tab collapsible side panel (Context, Chat, History) in the video app with role-aware visibility and persisted preferences.

## What Was Done

### Task 1: Context and history tab components with data hooks
- **use-call-context.ts**: Fetches enriched entity data and call history for the panel. Handles guest detection (no accessToken = guest). Falls back to basic entity info on API failure.
- **use-panel-preference.ts**: Persists active tab and open/close state per callId in localStorage.
- **context-tab.tsx**: Displays entity cards with logo/name/details, agenda card (border-l-4 border-primary), pre-call notes with lock icon. Falls back to participant profiles when no entities linked.
- **history-tab.tsx**: Shows recent calls (last 10) with same entity as compact cards. Status badges, relative dates, duration. "View all" link to portal.
- Extended CallDetail type with `agenda`, `pre_call_notes`, `created_by` fields plus new types: `EntityData`, `CallHistoryEntry`, `ChatMessage`.

### Task 2: Rebuilt side panel with three tabs and chat
- **call-side-panel.tsx**: Complete rebuild with DaisyUI-style tabs (Context | Chat | History). Collapse toggle with chevron. ~350px desktop width, full-width mobile overlay with backdrop. Guest users see Chat tab only.
- **chat-tab.tsx**: WebSocket-connected real-time chat using `call:{callId}` channel. Optimistic message sends, auto-scroll, connection status indicator. Bubble-style messages with sender name and timestamp.

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Guest detection**: Uses `accessToken` prop presence rather than participant matching. Null accessToken = guest = Chat tab only.
2. **Panel default state**: Open by default on desktop (>= 1024px), closed on mobile. Remembered in localStorage per callId.
3. **Chat channel naming**: Uses `call:{callId}` as WebSocket channel identifier.
4. **Entity API pattern**: Attempts `GET /api/v2/calls/{callId}/entities/{type}/{id}` with fallback to raw entity_link data on failure.

## Verification

- `pnpm --filter @splits-network/video build` passes successfully for both tasks.
