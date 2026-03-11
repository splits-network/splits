'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveKitRoom, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import type { CallState, LocalUserChoices } from '@splits-network/shared-video';
import {
    VideoLobby,
    VideoRoom,
    useCallDuration,
    getLiveKitUrl,
    defaultRoomOptions,
} from '@splits-network/shared-video';
import type { CallDetail } from '@/lib/types';
import { adaptCallToCallContext } from '@/lib/call-adapter';
import { ReconnectingOverlay } from './reconnecting-overlay';
import { CallEnded } from './call-ended';
import { CallSidePanel } from './call-side-panel';

interface CallExperienceProps {
    livekitToken: string;
    call: CallDetail;
}

/**
 * Main call experience orchestrator.
 * Manages the 5-state call flow: prep -> lobby -> connecting -> in-call -> post-call
 */
export function CallExperience({ livekitToken, call }: CallExperienceProps) {
    const [callState, setCallState] = useState<CallState>('prep');
    const [localChoices, setLocalChoices] = useState<LocalUserChoices | null>(null);
    const wasConnected = useRef(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const callContext = adaptCallToCallContext(call);
    const { duration, start: startTimer, stop: stopTimer } = useCallDuration();

    // Skip prep -- identity confirmation already happened in join flow
    useEffect(() => {
        if (callState === 'prep') {
            setCallState('lobby');
        }
    }, [callState]);

    const handleJoin = useCallback((choices: LocalUserChoices) => {
        setLocalChoices(choices);
        setConnectionError(null);
        setCallState('connecting');
    }, []);

    const handleDisconnected = useCallback(() => {
        if (wasConnected.current) {
            // Genuine disconnect after being in-call → show post-call summary
            stopTimer();
            setCallState('post-call');
        } else {
            // Connection failed before ever joining → return to lobby with error
            setConnectionError('Unable to connect to the call server. Please try again.');
            setCallState('lobby');
        }
    }, [stopTimer]);

    // Derive local user name from first participant (the current user joined via magic link)
    const localParticipant = call.participants[0];
    const localName = localParticipant
        ? localParticipant.user.name || 'You'
        : 'You';
    const localAvatarUrl = localParticipant?.user.avatar_url ?? undefined;

    let livekitUrl: string;
    try {
        livekitUrl = getLiveKitUrl();
    } catch {
        livekitUrl = 'wss://video.splits.network';
    }

    const shouldConnect = callState === 'connecting' || callState === 'in-call';

    return (
        <LiveKitRoom
            serverUrl={livekitUrl}
            token={livekitToken}
            connect={shouldConnect}
            options={defaultRoomOptions}
            onDisconnected={handleDisconnected}
        >
            <CallStateRouter
                callState={callState}
                setCallState={setCallState}
                callContext={callContext}
                call={call}
                localName={localName}
                localAvatarUrl={localAvatarUrl}
                duration={duration}
                startTimer={startTimer}
                onJoin={handleJoin}
                wasConnected={wasConnected}
                connectionError={connectionError}
            />
        </LiveKitRoom>
    );
}

/**
 * Inner component that can use LiveKit hooks (must be inside LiveKitRoom).
 */
function CallStateRouter({
    callState,
    setCallState,
    callContext,
    call,
    localName,
    localAvatarUrl,
    duration,
    startTimer,
    onJoin,
    wasConnected,
    connectionError,
}: {
    callState: CallState;
    setCallState: (s: CallState) => void;
    callContext: ReturnType<typeof adaptCallToCallContext>;
    call: CallDetail;
    localName: string;
    localAvatarUrl?: string;
    duration: number;
    startTimer: () => void;
    onJoin: (choices: LocalUserChoices) => void;
    wasConnected: React.RefObject<boolean>;
    connectionError: string | null;
}) {
    const connectionState = useConnectionState();
    const hasTransitioned = useRef(false);

    // Transition from connecting -> in-call when LiveKit connects
    useEffect(() => {
        if (callState === 'connecting' && connectionState === ConnectionState.Connected && !hasTransitioned.current) {
            hasTransitioned.current = true;
            wasConnected.current = true;
            startTimer();
            setCallState('in-call');
        }
    }, [callState, connectionState, setCallState, startTimer, wasConnected]);

    // Reset transition ref when going back to lobby
    useEffect(() => {
        if (callState === 'lobby') {
            hasTransitioned.current = false;
        }
    }, [callState]);

    // Connection timeout: if still connecting after 10s, go back to lobby
    useEffect(() => {
        if (callState !== 'connecting') return;

        const timeout = setTimeout(() => {
            if (callState === 'connecting') {
                setCallState('lobby');
            }
        }, 10_000);

        return () => clearTimeout(timeout);
    }, [callState, setCallState]);

    switch (callState) {
        case 'prep':
        case 'lobby':
            return (
                <div className="min-h-screen">
                    {connectionError && (
                        <div className="border-l-4 border-error bg-base-200 px-4 py-3 mx-4 mt-4 flex items-center gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                            <span className="text-sm font-medium text-base-content">{connectionError}</span>
                        </div>
                    )}
                    <VideoLobby
                        callContext={callContext}
                        onJoin={onJoin}
                        localUser={{ name: localName, avatarUrl: localAvatarUrl }}
                        recordingEnabled={callContext.recording_enabled}
                    />
                </div>
            );

        case 'connecting':
            return (
                <div className="min-h-screen relative">
                    <VideoLobby
                        callContext={callContext}
                        onJoin={onJoin}
                        localUser={{ name: localName, avatarUrl: localAvatarUrl }}
                        recordingEnabled={callContext.recording_enabled}
                    />
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-base-300/60 backdrop-blur-md">
                        <div className="flex flex-col items-center gap-4">
                            <i className="fa-duotone fa-regular fa-signal-stream text-4xl text-primary animate-pulse" />
                            <div className="text-center">
                                <h3 className="text-xl font-black text-base-content">Entering the Room</h3>
                                <p className="text-sm text-base-content/60 mt-1">Establishing a secure connection</p>
                            </div>
                            <span className="loading loading-spinner loading-sm text-base-content/40" />
                        </div>
                    </div>
                </div>
            );

        case 'in-call':
            // Guard: wait for Room context to be fully available
            if (connectionState !== ConnectionState.Connected) {
                return (
                    <div className="min-h-screen flex items-center justify-center bg-base-100">
                        <span className="loading loading-spinner loading-lg text-primary" />
                    </div>
                );
            }
            return (
                <div className="h-dvh relative bg-base-100 overflow-hidden flex">
                    <div className="flex-1 min-w-0 relative">
                        <VideoRoom
                            callContext={callContext}
                            localName={localName}
                            localAvatarUrl={localAvatarUrl}
                            onDisconnect={() => setCallState('post-call')}
                        />
                        <ReconnectingOverlay />
                    </div>
                    <CallSidePanel call={call} localName={localName} />
                </div>
            );

        case 'post-call':
            return <CallEnded call={call} duration={duration} />;

        default:
            return null;
    }
}
