'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    useRemoteParticipants,
    useTracks,
    RoomAudioRenderer,
    StartAudio,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { TrackReference } from '@livekit/components-react';
import type { InterviewContext } from '../types';
import { ParticipantTile } from './participant-tile';
import { SelfViewPip } from './self-view-pip';
import { VideoControls } from './video-controls';
import { WaitingIndicator } from './waiting-indicator';
import { ParticipantSidebar } from './participant-sidebar';
import { ScreenShareTile } from './screen-share-tile';

interface VideoRoomProps {
    interviewContext: InterviewContext;
    localName: string;
    localAvatarUrl?: string;
    onDisconnect: () => void;
    isRecording?: boolean;
    onStopRecording?: () => void;
    canStopRecording?: boolean;
}

/** Determine grid classes based on participant count */
function getGridClasses(count: number): string {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 grid-rows-2';
    if (count <= 6) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-3';
}

interface Toast {
    id: string;
    message: string;
    type: 'join' | 'leave';
}

function JoinLeaveToast({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
    useEffect(() => {
        const timeout = setTimeout(onRemove, 3000);
        return () => clearTimeout(timeout);
    }, [onRemove]);

    return (
        <div
            className={`alert ${toast.type === 'join' ? 'alert-success' : 'alert-error'} py-2 px-4 shadow-lg animate-fade-in`}
        >
            <i
                className={`fa-duotone fa-regular ${toast.type === 'join' ? 'fa-user-plus' : 'fa-user-minus'}`}
            />
            <span className="text-sm">{toast.message}</span>
        </div>
    );
}

export function VideoRoom({
    interviewContext,
    localName,
    localAvatarUrl,
    isRecording,
    onStopRecording,
    canStopRecording,
}: VideoRoomProps) {
    const remoteParticipants = useRemoteParticipants();
    const [toasts, setToasts] = useState<Toast[]>([]);
    const prevIdentitiesRef = useRef<Set<string>>(new Set());

    // Detect screen share tracks
    const screenShareTracks = useTracks(
        [{ source: Track.Source.ScreenShare, withPlaceholder: false }],
        { onlySubscribed: true },
    ) as TrackReference[];

    const hasScreenShares = screenShareTracks.length > 0;

    // Track join/leave for toast notifications
    useEffect(() => {
        const currentIdentities = new Set(remoteParticipants.map((p) => p.identity));
        const prevIdentities = prevIdentitiesRef.current;

        const newToasts: Toast[] = [];

        // Detect joins
        for (const identity of currentIdentities) {
            if (!prevIdentities.has(identity)) {
                const info = interviewContext.participants.find((p) => p.id === identity);
                const name = info?.name ?? 'A participant';
                newToasts.push({
                    id: `join-${identity}-${Date.now()}`,
                    message: `${name} joined the call`,
                    type: 'join',
                });
            }
        }

        // Detect leaves
        for (const identity of prevIdentities) {
            if (!currentIdentities.has(identity)) {
                const info = interviewContext.participants.find((p) => p.id === identity);
                const name = info?.name ?? 'A participant';
                newToasts.push({
                    id: `leave-${identity}-${Date.now()}`,
                    message: `${name} left the call`,
                    type: 'leave',
                });
            }
        }

        if (newToasts.length > 0) {
            setToasts((prev) => [...prev, ...newToasts]);
        }

        prevIdentitiesRef.current = currentIdentities;
    }, [remoteParticipants, interviewContext.participants]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Name of the person we're waiting for (first participant that isn't us)
    const waitingForName = interviewContext.participants.find(
        (p) => p.name !== localName,
    )?.name ?? 'other participants';

    return (
        <div className="relative h-screen bg-base-300 flex">
            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Video area */}
                <div className="flex-1 relative">
                    {remoteParticipants.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <WaitingIndicator
                                participantName={waitingForName}
                                isWaiting={false}
                            />
                        </div>
                    ) : hasScreenShares ? (
                        <ScreenShareLayout
                            screenShareTracks={screenShareTracks}
                            remoteParticipants={remoteParticipants}
                            interviewContext={interviewContext}
                        />
                    ) : (
                        <GridLayout
                            remoteParticipants={remoteParticipants}
                            interviewContext={interviewContext}
                        />
                    )}

                    {/* Self-view PiP (corner overlay) */}
                    <SelfViewPip name={localName} avatarUrl={localAvatarUrl} />

                    {/* Toast notifications */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex flex-col gap-2">
                        {toasts.map((toast) => (
                            <JoinLeaveToast
                                key={toast.id}
                                toast={toast}
                                onRemove={() => removeToast(toast.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Controls bar */}
                <VideoControls
                    isRecording={isRecording}
                    onStopRecording={onStopRecording}
                    canStopRecording={canStopRecording}
                />
            </div>

            {/* Participant sidebar */}
            <ParticipantSidebar
                participants={remoteParticipants}
                interviewContext={interviewContext}
                localName={localName}
            />

            {/* Remote audio rendering -- CRITICAL for hearing remote participant */}
            <RoomAudioRenderer />

            {/* Autoplay policy handling for Safari */}
            <StartAudio label="Click to enable audio" />
        </div>
    );
}

/** Grid layout for participants when no screen share is active */
function GridLayout({
    remoteParticipants,
    interviewContext,
}: {
    remoteParticipants: ReturnType<typeof useRemoteParticipants>;
    interviewContext: InterviewContext;
}) {
    const gridClasses = getGridClasses(remoteParticipants.length);

    return (
        <div className={`grid ${gridClasses} gap-1 h-full ${remoteParticipants.length > 6 ? 'overflow-y-auto' : ''}`}>
            {remoteParticipants.map((participant) => {
                const info = interviewContext.participants.find(
                    (p) => p.id === participant.identity,
                );
                const name = info?.name ?? 'Participant';
                const avatarUrl = info?.avatar_url ?? undefined;
                const isCandidate = info?.role === 'candidate';

                return (
                    <ParticipantTile
                        key={participant.identity}
                        participant={participant}
                        name={name}
                        avatarUrl={avatarUrl}
                        isCandidate={isCandidate}
                    />
                );
            })}
        </div>
    );
}

/** Layout when screen share is active: screen dominates, participants in side strip */
function ScreenShareLayout({
    screenShareTracks,
    remoteParticipants,
    interviewContext,
}: {
    screenShareTracks: TrackReference[];
    remoteParticipants: ReturnType<typeof useRemoteParticipants>;
    interviewContext: InterviewContext;
}) {
    return (
        <div className="flex h-full">
            {/* Participant strip (left side) */}
            <div className="w-48 flex flex-col gap-1 overflow-y-auto bg-base-300">
                {remoteParticipants.map((participant) => {
                    const info = interviewContext.participants.find(
                        (p) => p.id === participant.identity,
                    );
                    const name = info?.name ?? 'Participant';
                    const avatarUrl = info?.avatar_url ?? undefined;
                    const isCandidate = info?.role === 'candidate';

                    return (
                        <div key={participant.identity} className="aspect-video">
                            <ParticipantTile
                                participant={participant}
                                name={name}
                                avatarUrl={avatarUrl}
                                isCandidate={isCandidate}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Screen share area (main) */}
            <div className="flex-1 min-w-0">
                {screenShareTracks.length === 1 ? (
                    <ScreenShareTile trackRef={screenShareTracks[0]} />
                ) : (
                    <div className={`grid ${getGridClasses(screenShareTracks.length)} gap-1 h-full`}>
                        {screenShareTracks.map((trackRef) => (
                            <ScreenShareTile
                                key={trackRef.participant.identity}
                                trackRef={trackRef}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
