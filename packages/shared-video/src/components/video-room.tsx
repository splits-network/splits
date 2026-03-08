'use client';

import {
    useRemoteParticipants,
    RoomAudioRenderer,
    StartAudio,
} from '@livekit/components-react';
import type { InterviewContext } from '../types';
import { ParticipantTile } from './participant-tile';
import { SelfViewPip } from './self-view-pip';
import { VideoControls } from './video-controls';
import { WaitingIndicator } from './waiting-indicator';

interface VideoRoomProps {
    interviewContext: InterviewContext;
    localName: string;
    localAvatarUrl?: string;
    onDisconnect: () => void;
    isRecording?: boolean;
    onStopRecording?: () => void;
    canStopRecording?: boolean;
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
    const remoteParticipant = remoteParticipants[0] ?? null;

    // Resolve remote participant info from interview context
    const remoteInfo = remoteParticipant
        ? interviewContext.participants.find(
            (p) => p.id === remoteParticipant.identity,
        )
        : null;

    const remoteName = remoteInfo?.name ?? 'Participant';
    const remoteAvatarUrl = remoteInfo?.avatar_url ?? undefined;

    // Name of the person we're waiting for (first participant that isn't us)
    const waitingForName = interviewContext.participants.find(
        (p) => p.name !== localName,
    )?.name ?? 'the other participant';

    return (
        <div className="relative h-screen bg-base-300">
            {/* Remote participant (full screen) or waiting state */}
            {remoteParticipant ? (
                <div className="absolute inset-0">
                    <ParticipantTile
                        participant={remoteParticipant}
                        name={remoteName}
                        avatarUrl={remoteAvatarUrl}
                    />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full">
                    <WaitingIndicator
                        participantName={waitingForName}
                        isWaiting={false}
                    />
                </div>
            )}

            {/* Self-view PiP (corner overlay) */}
            <SelfViewPip name={localName} avatarUrl={localAvatarUrl} />

            {/* Controls bar */}
            <VideoControls
                isRecording={isRecording}
                onStopRecording={onStopRecording}
                canStopRecording={canStopRecording}
            />

            {/* Remote audio rendering -- CRITICAL for hearing remote participant */}
            <RoomAudioRenderer />

            {/* Autoplay policy handling for Safari */}
            <StartAudio label="Click to enable audio" />
        </div>
    );
}
