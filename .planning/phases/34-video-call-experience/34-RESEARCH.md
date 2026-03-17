# Phase 34: Video Call Experience - Research

**Researched:** 2026-03-07
**Domain:** LiveKit React Components for 1:1 video interview experience
**Confidence:** HIGH

## Summary

This phase builds the frontend video call experience on top of the Phase 33 backend infrastructure (video-service with LiveKit server SDK, interview CRUD, token generation, magic link auth bypass). The primary technology is `@livekit/components-react` (v2.9.x), LiveKit's official React component library that provides pre-built components, hooks, and prefabs for video conferencing.

The library provides a `PreJoin` prefab component for device setup, `LiveKitRoom` as the room context provider, and individual components like `ConnectionQualityIndicator`, `TrackToggle`, `DisconnectButton`, `MediaDeviceSelect`, and `BarVisualizer` for building custom UIs. The `VideoConference` prefab exists as a drop-in but is too opinionated for the custom layout decisions made in CONTEXT.md -- the recommended approach is to compose individual components and hooks.

**Primary recommendation:** Use `@livekit/components-react` hooks (`usePreviewTracks`, `useLocalParticipant`, `useRemoteParticipants`, `useTracks`, `useConnectionState`) to build a custom pre-join lobby and in-call interface. Do NOT use the `PreJoin` or `VideoConference` prefabs directly -- they don't match the decided split-layout lobby or active-speaker PiP layout. Instead, use the underlying hooks and low-level components those prefabs are built from.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@livekit/components-react` | ^2.9.20 | React components and hooks for LiveKit rooms | Official LiveKit React SDK, extensively tested, provides hooks for every room operation |
| `@livekit/components-styles` | ^1.2.0 | Base CSS styles and CSS variables for LiveKit components | Official styling package, provides data attributes and CSS custom properties for theming |
| `livekit-client` | ^2.17.2 | Core LiveKit JS client SDK (peer dependency) | Required peer dependency of components-react, handles WebRTC connections |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `livekit-server-sdk` | ^2.9.1 | Server-side token generation | Already installed in video-service (Phase 33) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom components | `VideoConference` prefab | Prefab is faster but doesn't support custom split-layout lobby or PiP self-view. Custom is correct for this phase's requirements |
| Custom PreJoin | `PreJoin` prefab | Prefab has username field and simple layout; doesn't support split-layout with interview context panel. Build custom using same hooks |

**Installation (in portal and candidate apps):**
```bash
pnpm --filter @splits-network/portal add @livekit/components-react @livekit/components-styles livekit-client
pnpm --filter @splits-network/candidate add @livekit/components-react @livekit/components-styles livekit-client
```

## Architecture Patterns

### Recommended Project Structure

The video call experience spans two apps (portal for authenticated users, candidate for magic link users). Since the call interface itself is identical for both, shared video components should live in a shared package.

```
packages/shared-video/              # NEW shared package for video components
  src/
    components/
      video-lobby.tsx               # Pre-join lobby (split layout)
      video-room.tsx                # In-call room wrapper
      video-controls.tsx            # Custom control bar
      participant-tile.tsx          # Remote participant (large view)
      self-view-pip.tsx             # Self-view picture-in-picture
      connection-quality.tsx        # Signal bars indicator
      device-selector.tsx           # Camera/mic/speaker selection
      audio-level-meter.tsx         # Bouncing bars mic test
      waiting-indicator.tsx         # "Waiting for [name]" status
      post-call-summary.tsx         # Duration + redirect screen
    hooks/
      use-interview-token.ts        # Fetch LiveKit token from API
      use-participant-presence.ts   # Track who's in the room
    lib/
      livekit-config.ts             # LiveKit connection config
    index.ts                        # Public exports

apps/portal/src/app/portal/interview/
  [id]/
    page.tsx                        # Interview page (opens in new tab)
    interview-client.tsx            # Client component orchestrating lobby -> call -> post-call

apps/candidate/src/app/(public)/interview/
  [token]/
    page.tsx                        # Magic link entry point
    prep-page.tsx                   # Candidate prep page with countdown
    interview-client.tsx            # Client component for candidate flow
```

### Pattern 1: State Machine for Call Lifecycle
**What:** The interview page progresses through distinct states: `prep` (candidate only) -> `lobby` -> `connecting` -> `in-call` -> `post-call`
**When to use:** Always -- the call lifecycle is linear and each state has different UI

```typescript
type CallState = 'prep' | 'lobby' | 'connecting' | 'in-call' | 'post-call';

function InterviewPage({ interviewId, token }: Props) {
  const [callState, setCallState] = useState<CallState>('lobby');
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null);

  switch (callState) {
    case 'prep':
      return <PrepPage onReady={() => setCallState('lobby')} />;
    case 'lobby':
      return (
        <VideoLobby
          onJoin={(choices, token) => {
            setUserChoices(choices);
            setLivekitToken(token);
            setCallState('connecting');
          }}
        />
      );
    case 'connecting':
    case 'in-call':
      return (
        <LiveKitRoom
          token={livekitToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          connect={true}
          audio={userChoices?.audioEnabled}
          video={userChoices?.videoEnabled}
          onConnected={() => setCallState('in-call')}
          onDisconnected={() => setCallState('post-call')}
        >
          <VideoRoom />
        </LiveKitRoom>
      );
    case 'post-call':
      return <PostCallSummary />;
  }
}
```

### Pattern 2: PreJoin Lobby with usePreviewTracks (Custom)
**What:** Build a custom split-layout lobby using `usePreviewTracks` for local camera/mic preview without connecting to the server
**When to use:** For the pre-join lobby screen

```typescript
// Source: LiveKit docs - usePreviewTracks + MediaDeviceSelect
import { usePreviewTracks, MediaDeviceSelect } from '@livekit/components-react';
import { Track } from 'livekit-client';

function VideoLobby({ onJoin }: { onJoin: (choices: LocalUserChoices) => void }) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const tracks = usePreviewTracks(
    {
      audio: audioEnabled,
      video: videoEnabled,
    },
    { onError: (err) => console.error('Preview error:', err) },
  );

  const videoTrack = tracks?.find((t) => t.kind === Track.Kind.Video);
  const audioTrack = tracks?.find((t) => t.kind === Track.Kind.Audio);
  const videoEl = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoTrack && videoEl.current) {
      videoTrack.attach(videoEl.current);
      return () => { videoTrack.detach(videoEl.current!); };
    }
  }, [videoTrack]);

  return (
    <div className="grid grid-cols-2 h-screen">
      {/* Left: Camera preview */}
      <div className="bg-base-300 flex items-center justify-center">
        <video ref={videoEl} className="rounded-xl" />
        {/* Audio level meter using audioTrack */}
      </div>
      {/* Right: Meeting info + controls */}
      <div className="p-8">
        <InterviewInfo />
        <DeviceControls audioTrack={audioTrack} />
        <button onClick={() => onJoin({ audioEnabled, videoEnabled })}>
          Join Interview
        </button>
      </div>
    </div>
  );
}
```

### Pattern 3: Custom Active Speaker Layout
**What:** Large remote participant view with small self-view PiP
**When to use:** For the in-call interface (1:1 layout)

```typescript
// Source: LiveKit docs - useTracks, useLocalParticipant, useRemoteParticipants
import {
  useTracks,
  useLocalParticipant,
  useRemoteParticipants,
  VideoTrack,
  AudioTrack,
  RoomAudioRenderer,
  ConnectionQualityIndicator,
  TrackToggle,
  DisconnectButton,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

function VideoRoom() {
  const remoteParticipants = useRemoteParticipants();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks([Track.Source.Camera, Track.Source.Microphone]);

  const remoteTracks = tracks.filter(t => t.participant !== localParticipant);
  const localVideoTrack = tracks.find(
    t => t.participant === localParticipant && t.source === Track.Source.Camera
  );

  return (
    <div className="relative h-screen bg-base-300">
      {/* Remote participant (large) */}
      <div className="absolute inset-0">
        {remoteTracks.length > 0 ? (
          <VideoTrack trackRef={remoteTracks[0]} className="w-full h-full object-cover" />
        ) : (
          <WaitingForParticipant />
        )}
        <ConnectionQualityIndicator participant={remoteParticipants[0]} />
      </div>

      {/* Self-view PiP (small corner) */}
      <div className="absolute bottom-4 right-4 w-48 rounded-xl overflow-hidden shadow-lg">
        {localVideoTrack ? (
          <VideoTrack trackRef={localVideoTrack} className="w-full" />
        ) : (
          <CameraOffAvatar />
        )}
        <ConnectionQualityIndicator participant={localParticipant} />
      </div>

      {/* Controls bar */}
      <VideoControls />

      {/* Required for remote audio */}
      <RoomAudioRenderer />
    </div>
  );
}
```

### Pattern 4: New Tab for Call
**What:** Interview opens in `window.open()` from application detail page
**When to use:** For the "Join Interview" button on application detail page

```typescript
// In application detail page
function JoinInterviewButton({ interviewId }: { interviewId: string }) {
  const handleJoin = () => {
    window.open(
      `/portal/interview/${interviewId}`,
      `interview-${interviewId}`,
      'noopener'
    );
  };

  return <button onClick={handleJoin}>Join Interview</button>;
}
```

### Anti-Patterns to Avoid
- **Nesting PreJoin inside LiveKitRoom:** The PreJoin component (and custom lobby using usePreviewTracks) must NOT be inside a LiveKitRoom. It works independently without server connection.
- **Remounting LiveKitRoom:** Changing props on LiveKitRoom must NOT cause unmount/remount -- this causes "Client initiated disconnect" errors. Use stable state, avoid putting token in a dependency that causes re-render.
- **Using deprecated AudioVisualizer:** Use `BarVisualizer` instead (AudioVisualizer is deprecated).
- **Using deprecated usePreviewDevice:** Use `usePreviewTracks` instead.
- **Calling getUserMedia multiple times:** Multiple calls trigger multiple browser permission prompts. Acquire preview tracks once in lobby, reuse.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Device enumeration/selection | Custom getUserMedia + enumerateDevices | `MediaDeviceSelect` component or `useMediaDeviceSelect` hook | Browser compatibility, permission handling, device change events |
| Audio level visualization | Custom AudioContext + AnalyserNode | `BarVisualizer` component with `useMultibandTrackVolume` hook | Frequency band splitting, animation, cleanup |
| Connection quality display | Custom RTCStatsReport parsing | `ConnectionQualityIndicator` component | LiveKit aggregates quality from multiple signals |
| Track mute/unmute | Custom track.enabled toggling | `TrackToggle` component | Handles publishing/unpublishing, state sync, UI |
| Room audio rendering | Custom audio element attachment | `RoomAudioRenderer` component | Handles all remote audio tracks, autoplay policies |
| WebRTC connection management | Custom RTCPeerConnection handling | `LiveKitRoom` + `livekit-client` | Reconnection, ICE handling, codec negotiation |

**Key insight:** LiveKit React components handle dozens of WebRTC edge cases (autoplay policies, device disconnection, ICE restart, codec fallback) that would take weeks to build correctly. Every component has a corresponding hook for custom UI while keeping the logic.

## Common Pitfalls

### Pitfall 1: Browser Permission Denied Without Recovery
**What goes wrong:** User denies camera/mic permission and the app shows a blank screen with no way forward
**Why it happens:** `getUserMedia` rejection not handled, no fallback UI
**How to avoid:** Use `onError` callback in `usePreviewTracks` and `onMediaDeviceFailure` on `LiveKitRoom`. Show clear instructions: "Camera access was denied. Click the camera icon in your browser's address bar to allow access, then refresh."
**Warning signs:** No error handling in preview track setup

### Pitfall 2: LiveKitRoom Remounting Causes Disconnect
**What goes wrong:** Users get disconnected and reconnected repeatedly during the call
**Why it happens:** Token or serverUrl prop changes cause React to unmount/remount LiveKitRoom
**How to avoid:** Stabilize LiveKitRoom props. Generate token ONCE before entering call state. Use refs or state that doesn't change. Never put token generation in a useEffect that re-runs.
**Warning signs:** "Client initiated disconnect" in console logs

### Pitfall 3: Missing RoomAudioRenderer
**What goes wrong:** Users can see remote video but hear no audio
**Why it happens:** Video tracks auto-attach to video elements, but audio needs explicit rendering
**How to avoid:** Always include `<RoomAudioRenderer />` inside `<LiveKitRoom>`. It handles all remote participant audio.
**Warning signs:** Video works but no audio during testing

### Pitfall 4: Autoplay Policy Blocks Audio
**What goes wrong:** Audio doesn't play in some browsers (especially Safari) due to autoplay restrictions
**Why it happens:** Browsers require user interaction before playing audio
**How to avoid:** Include `<StartAudio />` component (or `StartMediaButton`) inside LiveKitRoom. It shows a button when autoplay is blocked and handles the user interaction.
**Warning signs:** Works in Chrome, fails in Safari

### Pitfall 5: Preview Tracks Not Cleaned Up
**What goes wrong:** Camera LED stays on after leaving lobby, or getUserMedia fails in the call
**Why it happens:** Preview tracks from lobby aren't stopped before creating new tracks for the room
**How to avoid:** The `usePreviewTracks` hook handles cleanup on unmount. Ensure the lobby component unmounts before LiveKitRoom mounts (state machine pattern handles this naturally).
**Warning signs:** Camera indicator stays lit after transitioning to call

### Pitfall 6: LIVEKIT_URL Not Accessible from Browser
**What goes wrong:** `LiveKitRoom` fails to connect from the browser
**Why it happens:** `LIVEKIT_URL` is configured for server-side (video-service), but the browser needs a public WebSocket URL
**How to avoid:** Set `NEXT_PUBLIC_LIVEKIT_URL` as a separate env var pointing to the externally accessible LiveKit WebSocket endpoint (e.g., `wss://livekit.yourdomain.com`). The server-side `LIVEKIT_URL` may be an internal cluster address.
**Warning signs:** Connection timeout or WebSocket errors in browser console

### Pitfall 7: Candidate Magic Link Token Used as LiveKit Token
**What goes wrong:** Candidate can't join the room, gets authentication errors
**Why it happens:** Confusing the magic link access token (random string for auth bypass) with the LiveKit JWT token (generated by server for room access)
**How to avoid:** Two-step flow: (1) Exchange magic link token via `POST /api/v2/interviews/join` to get LiveKit JWT, (2) Use returned JWT as the `token` prop for `LiveKitRoom`. These are different tokens.
**Warning signs:** LiveKit connection error with "invalid token" message

## Code Examples

### Token Fetching Hook (Authenticated User)
```typescript
// packages/shared-video/src/hooks/use-interview-token.ts
import { useState, useCallback } from 'react';

interface TokenResult {
  jwt: string;
  room_name: string;
  interview: {
    id: string;
    status: string;
    interview_type: string;
    scheduled_at: string;
  };
  participant: {
    id: string;
    role: string;
  };
}

export function useInterviewToken(apiBaseUrl: string) {
  const [tokenData, setTokenData] = useState<TokenResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAuthenticatedToken = useCallback(async (interviewId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v2/interviews/${interviewId}/token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to get token');
      const { data } = await res.json();
      setTokenData(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  const exchangeMagicLink = useCallback(async (magicToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/v2/interviews/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: magicToken }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Invalid or expired link');
      const { data } = await res.json();
      setTokenData(data);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  return { tokenData, error, loading, fetchAuthenticatedToken, exchangeMagicLink };
}
```

### Audio Level Meter (Bouncing Bars)
```typescript
// Custom mic level visualization for lobby (without being connected to a room)
// Uses the Web Audio API on the local preview track
import { useEffect, useState, useRef } from 'react';
import { LocalAudioTrack } from 'livekit-client';

export function AudioLevelMeter({ audioTrack }: { audioTrack?: LocalAudioTrack }) {
  const [levels, setLevels] = useState<number[]>(new Array(5).fill(0));
  const animFrameRef = useRef<number>();

  useEffect(() => {
    if (!audioTrack) return;

    const mediaStream = audioTrack.mediaStream;
    if (!mediaStream) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 32;
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const update = () => {
      analyser.getByteFrequencyData(dataArray);
      const bands = 5;
      const bandSize = Math.floor(dataArray.length / bands);
      const newLevels = [];
      for (let i = 0; i < bands; i++) {
        let sum = 0;
        for (let j = 0; j < bandSize; j++) {
          sum += dataArray[i * bandSize + j];
        }
        newLevels.push(sum / bandSize / 255);
      }
      setLevels(newLevels);
      animFrameRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      source.disconnect();
      audioContext.close();
    };
  }, [audioTrack]);

  return (
    <div className="flex items-end gap-1 h-8">
      {levels.map((level, i) => (
        <div
          key={i}
          className="w-1.5 bg-success rounded-full transition-all duration-75"
          style={{ height: `${Math.max(4, level * 32)}px` }}
        />
      ))}
    </div>
  );
}
```

### Connection Quality Signal Bars
```typescript
// Custom signal bars using LiveKit's ConnectionQualityIndicator data attribute
// Source: LiveKit docs - data-lk-quality attribute
import { ConnectionQualityIndicator } from '@livekit/components-react';

// The built-in component uses data-lk-quality="excellent|good|poor|unknown"
// Style with Tailwind:
function SignalBars() {
  return (
    <ConnectionQualityIndicator
      className="[&[data-lk-quality='excellent']]:text-success
                 [&[data-lk-quality='good']]:text-warning
                 [&[data-lk-quality='poor']]:text-error"
    />
  );
}

// Or use the hook for fully custom rendering:
import { useConnectionQualityIndicator } from '@livekit/components-react';

function CustomSignalBars({ participant }: { participant: Participant }) {
  const { quality } = useConnectionQualityIndicator({ participant });
  // quality: ConnectionQuality.Excellent | Good | Poor | Unknown
  const bars = quality === 'excellent' ? 3 : quality === 'good' ? 2 : 1;

  return (
    <div className="flex items-end gap-0.5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`w-1 rounded-sm ${n <= bars ? 'bg-success' : 'bg-base-content/20'}`}
          style={{ height: `${n * 4 + 4}px` }}
        />
      ))}
    </div>
  );
}
```

### Camera-Off Avatar State
```typescript
// When camera is off, show profile avatar + name on dark background
import { useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';

function CameraOffFallback({ name, avatarUrl }: { name: string; avatarUrl?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-base-300">
      <div className="avatar">
        <div className="w-24 rounded-full">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} />
          ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center text-3xl font-bold w-24 h-24 rounded-full">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-base-content">{name}</p>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `AudioVisualizer` | `BarVisualizer` | 2024 | AudioVisualizer is deprecated, BarVisualizer uses multiband frequency analysis |
| `usePreviewDevice` | `usePreviewTracks` | 2024 | usePreviewDevice deprecated, usePreviewTracks handles both audio and video in one call |
| `livekit-react` package | `@livekit/components-react` | 2023 | Old package fully superseded, components-react is the official SDK |
| Manual track management | Hook-based (`useTracks`, `useLocalParticipant`) | 2023+ | Hooks handle all track lifecycle, subscription, and state management |

**Deprecated/outdated:**
- `AudioVisualizer`: Deprecated, use `BarVisualizer` instead
- `usePreviewDevice`: Deprecated, use `usePreviewTracks` instead
- `livekit-react` npm package: Superseded by `@livekit/components-react`
- `@livekit/react-components`: Old package, use `@livekit/components-react`

## Discretion Recommendations

### Controls Bar: Always Visible
**Recommendation:** Keep controls always visible (not auto-hide). Rationale:
- This is a professional interview context, not a casual video chat
- Users need instant access to mute/unmute without hunting for controls
- Reduces anxiety for candidates who may be less tech-savvy
- The bar is small and doesn't significantly reduce video real estate
- Implementation is simpler (no timer/hover logic)

### Self-View PiP Size and Position
**Recommendation:** Bottom-right corner, approximately 200px wide (w-48 in Tailwind), with rounded corners and subtle shadow. Draggable is not needed for Phase 34 (1:1 calls only).

### Loading/Transition States
**Recommendation:**
- Lobby -> Call: Show a "Connecting..." overlay with spinner on the lobby screen while LiveKitRoom connects (use `useConnectionState` hook)
- Connection established: Fade transition to in-call view
- Keep it simple -- no elaborate animations

### Error States
**Recommendation:** Four error screens to build:
1. **Permission denied**: Instructions to enable camera/mic in browser settings with browser-specific guidance
2. **Network failure**: "Connection lost. Attempting to reconnect..." with retry (LiveKit handles reconnection automatically, show status)
3. **Unsupported browser**: Check for `navigator.mediaDevices.getUserMedia` support at page load, show message with supported browser list
4. **Interview expired/cancelled**: Show status from API response (410 status code from token endpoint)

### Mobile Responsiveness
**Recommendation:** Stack layout vertically on mobile:
- Lobby: Camera preview on top, controls below (instead of side-by-side)
- In-call: Full-screen remote video, smaller self-view PiP (w-24 on mobile)
- Controls bar at bottom, always visible
- Use `md:` Tailwind breakpoint for responsive split

### Post-Call Summary
**Recommendation:** Simple card showing:
- "Interview ended" heading
- Call duration (calculated from join to disconnect)
- "Close tab" button (for new-tab flow)
- Auto-redirect to application detail page after 10 seconds (for portal users)
- For candidates: "Thank you" message, no redirect

## Open Questions

1. **LiveKit WebSocket URL for browser**
   - What we know: video-service connects to LiveKit server internally. Browser needs a publicly accessible WSS endpoint.
   - What's unclear: Whether the K8s LiveKit deployment (hostNetwork mode from Phase 33) exposes a public WebSocket endpoint, and what URL to configure as `NEXT_PUBLIC_LIVEKIT_URL`
   - Recommendation: This is an infrastructure concern. The planner should include a task to verify/configure the public LiveKit WSS endpoint and set the env var in portal and candidate apps.

2. **Interview context data for lobby display**
   - What we know: The token endpoint returns interview ID, status, type, and scheduled_at. The lobby needs job title, company name, interviewer name + avatar, candidate name.
   - What's unclear: Whether the token response should be extended to include this data, or if a separate API call fetches interview details with participant info.
   - Recommendation: Extend the token endpoint response OR add a `GET /api/v2/interviews/:id` call that includes participant details with names/avatars. The latter already exists but may need enrichment with user profile data.

3. **Participant presence in lobby (before room join)**
   - What we know: CONTEXT.md requires showing "John is waiting" in the lobby. But participants only appear in the LiveKit room after they join.
   - What's unclear: How to detect another participant's presence before both have joined the LiveKit room.
   - Recommendation: Two approaches: (a) Connect to the LiveKit room from the lobby in "observer" mode (connect but don't publish), using `connect={true}` with `audio={false} video={false}`. Use `useRemoteParticipants` to detect others. (b) Use a separate polling mechanism via the video-service API. Approach (a) is simpler and uses LiveKit's built-in presence.

## Sources

### Primary (HIGH confidence)
- [LiveKit React Components docs](https://docs.livekit.io/reference/components/react/) - Component reference, hooks, prefabs
- [PreJoin component docs](https://docs.livekit.io/reference/components/react/component/prejoin/) - PreJoin props and usage
- [LiveKitRoom component docs](https://docs.livekit.io/reference/components/react/component/livekitroom/) - Room component props, callbacks
- [Best practices guide](https://docs.livekit.io/reference/components/react/guide/) - Component lifecycle, remounting warnings
- [Styling guide](https://docs.livekit.io/reference/components/react/concepts/style-components/) - CSS variables, data attributes, theming
- [MediaDeviceSelect docs](https://docs.livekit.io/reference/components/react/component/mediadeviceselect/) - Device selection component
- [ControlBar docs](https://docs.livekit.io/reference/components/react/component/controlbar/) - Control bar prefab
- [ConnectionQualityIndicator docs](https://docs.livekit.io/reference/components/react/component/connectionqualityindicator/) - Quality indicator
- [usePreviewTracks docs](https://docs.livekit.io/reference/components/react/hook/usepreviewtracks/) - Preview tracks hook

### Secondary (MEDIUM confidence)
- [npm @livekit/components-react](https://www.npmjs.com/package/@livekit/components-react) - Version 2.9.20 confirmed
- [npm livekit-client](https://www.npmjs.com/package/livekit-client) - Version 2.17.2 confirmed
- [LiveKit Meet example](https://github.com/livekit-examples/meet) - Reference Next.js implementation
- [DeepWiki audio visualization](https://deepwiki.com/livekit/components-js/5.4-audio-visualization) - BarVisualizer internals

### Tertiary (LOW confidence)
- Audio level meter custom implementation pattern - based on standard Web Audio API, not from LiveKit docs. The BarVisualizer component handles this when connected to a room, but for pre-join lobby without room connection, a custom AudioContext approach may be needed. Needs validation during implementation.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Versions confirmed via npm, APIs verified via official docs
- Architecture: HIGH - Patterns derived from official docs, components-js examples, and existing codebase structure
- Pitfalls: HIGH - Multiple pitfalls documented in official best practices guide, verified across sources
- Audio level meter in lobby: MEDIUM - BarVisualizer is for in-room use; custom Web Audio API approach for pre-join is standard practice but not officially documented by LiveKit
- Participant presence in lobby: MEDIUM - Two viable approaches identified, needs architectural decision during planning

**Research date:** 2026-03-07
**Valid until:** 2026-04-07 (LiveKit components are actively developed but API is stable)
