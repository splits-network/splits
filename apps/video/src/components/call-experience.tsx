'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LiveKitRoom, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import type { CallState, LocalUserChoices } from '@splits-network/shared-video';
import {
    VideoLobby,
    VideoRoom,
    useCallDuration,
    getLiveKitUrl,
    defaultRoomOptions,
} from '@splits-network/shared-video';
import type { CallDetail } from '@/lib/types';
import { adaptCallToInterviewContext } from '@/lib/call-adapter';
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
    const interviewContext = adaptCallToInterviewContext(call);
    const { duration, start: startTimer, stop: stopTimer } = useCallDuration();

    // Skip prep -- identity confirmation already happened in join flow
    useEffect(() => {
        if (callState === 'prep') {
            setCallState('lobby');
        }
    }, [callState]);

    const handleJoin = useCallback((choices: LocalUserChoices) => {
        setLocalChoices(choices);
        setCallState('connecting');
    }, []);

    const handleDisconnected = useCallback(() => {
        stopTimer();
        setCallState('post-call');
    }, [stopTimer]);

    // Derive local user name from first participant (the current user joined via magic link)
    const localParticipant = call.participants[0];
    const localName = localParticipant
        ? `${localParticipant.user.first_name} ${localParticipant.user.last_name}`
        : 'You';
    const localAvatarUrl = localParticipant?.user.avatar_url ?? undefined;

    let livekitUrl: string;
    try {
        livekitUrl = getLiveKitUrl();
    } catch {
        livekitUrl = 'wss://livekit.splitsnetwork.com';
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
                interviewContext={interviewContext}
                call={call}
                localName={localName}
                localAvatarUrl={localAvatarUrl}
                duration={duration}
                startTimer={startTimer}
                onJoin={handleJoin}
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
    interviewContext,
    call,
    localName,
    localAvatarUrl,
    duration,
    startTimer,
    onJoin,
}: {
    callState: CallState;
    setCallState: (s: CallState) => void;
    interviewContext: ReturnType<typeof adaptCallToInterviewContext>;
    call: CallDetail;
    localName: string;
    localAvatarUrl?: string;
    duration: number;
    startTimer: () => void;
    onJoin: (choices: LocalUserChoices) => void;
}) {
    const connectionState = useConnectionState();
    const hasTransitioned = useRef(false);

    // Transition from connecting -> in-call when LiveKit connects
    useEffect(() => {
        if (callState === 'connecting' && connectionState === ConnectionState.Connected && !hasTransitioned.current) {
            hasTransitioned.current = true;
            startTimer();
            setCallState('in-call');
        }
    }, [callState, connectionState, setCallState, startTimer]);

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
                    <VideoLobby
                        interviewContext={interviewContext}
                        onJoin={onJoin}
                        localUser={{ name: localName, avatarUrl: localAvatarUrl }}
                    />
                </div>
            );

        case 'connecting':
            return (
                <div className="min-h-screen relative">
                    <VideoLobby
                        interviewContext={interviewContext}
                        onJoin={onJoin}
                        localUser={{ name: localName, avatarUrl: localAvatarUrl }}
                    />
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-base-300/60 backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-3">
                            <span className="loading loading-spinner loading-lg text-primary" />
                            <p className="text-lg font-semibold text-base-content">Connecting...</p>
                        </div>
                    </div>
                </div>
            );

        case 'in-call':
            return (
                <div className="h-screen relative">
                    <VideoRoom
                        interviewContext={interviewContext}
                        localName={localName}
                        localAvatarUrl={localAvatarUrl}
                        onDisconnect={() => setCallState('post-call')}
                    />
                    <ReconnectingOverlay />
                    <CallSidePanel call={call} />
                </div>
            );

        case 'post-call':
            return <CallEnded call={call} duration={duration} />;

        default:
            return null;
    }
}
