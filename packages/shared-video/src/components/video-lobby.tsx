'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePreviewTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import type { InterviewContext, LocalUserChoices } from '../types';
import { AudioLevelMeter } from './audio-level-meter';
import { CameraOffFallback } from './camera-off-fallback';
import { DeviceSelector } from './device-selector';
import { WaitingIndicator } from './waiting-indicator';

interface VideoLobbyProps {
    interviewContext: InterviewContext;
    onJoin: (choices: LocalUserChoices) => void;
    participantPresence?: {
        name: string;
        isWaiting: boolean;
    };
    /** Name and avatar for local user (shown when camera is off) */
    localUser: {
        name: string;
        avatarUrl?: string;
    };
}

function formatScheduledTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatInterviewType(type: string): string {
    return type.replace(/_/g, ' ').toUpperCase();
}

export function VideoLobby({
    interviewContext,
    onJoin,
    participantPresence,
    localUser,
}: VideoLobbyProps) {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
    const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const videoElRef = useRef<HTMLVideoElement>(null);

    const handlePreviewError = useCallback((err: Error) => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setPermissionError(
                'Camera/microphone access was denied. Click the camera icon in your browser\'s address bar to allow access, then refresh the page.',
            );
        } else {
            setPermissionError(`Device error: ${err.message}`);
        }
    }, []);

    const tracks = usePreviewTracks(
        {
            audio: audioEnabled ? (audioDeviceId ? { deviceId: audioDeviceId } : true) : false,
            video: videoEnabled ? (videoDeviceId ? { deviceId: videoDeviceId } : true) : false,
        },
        handlePreviewError,
    );

    const videoTrack = tracks?.find(
        (t): t is LocalVideoTrack => t.kind === Track.Kind.Video,
    );
    const audioTrack = tracks?.find(
        (t): t is LocalAudioTrack => t.kind === Track.Kind.Audio,
    );

    useEffect(() => {
        const el = videoElRef.current;
        if (videoTrack && el) {
            videoTrack.attach(el);
            return () => {
                videoTrack.detach(el);
            };
        }
    }, [videoTrack]);

    const handleJoin = () => {
        onJoin({
            audioEnabled,
            videoEnabled,
            audioDeviceId,
            videoDeviceId,
        });
    };

    const { job, participants, interview_type, scheduled_at } = interviewContext;

    // Find the other participant (not the local user) for display
    const otherParticipant = participants.find(
        (p) => p.name !== localUser.name,
    ) ?? participants[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left panel: Camera preview */}
            <div className="bg-base-300 flex flex-col items-center justify-center p-6 lg:p-8 gap-4">
                <div className="relative w-full max-w-lg aspect-video bg-neutral overflow-hidden">
                    {videoEnabled && videoTrack ? (
                        <video
                            ref={videoElRef}
                            className="w-full h-full object-cover mirror"
                            autoPlay
                            playsInline
                            muted
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        <CameraOffFallback
                            name={localUser.name}
                            avatarUrl={localUser.avatarUrl}
                        />
                    )}
                </div>

                {/* Audio level meter */}
                <AudioLevelMeter audioTrack={audioEnabled ? audioTrack : undefined} />

                {/* Media toggle buttons */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        className={`btn btn-circle ${audioEnabled ? 'btn-neutral' : 'btn-error'}`}
                        onClick={() => setAudioEnabled((v) => !v)}
                        aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        <i
                            className={`fa-duotone fa-regular ${
                                audioEnabled ? 'fa-microphone' : 'fa-microphone-slash'
                            } text-lg`}
                        />
                    </button>
                    <button
                        type="button"
                        className={`btn btn-circle ${videoEnabled ? 'btn-neutral' : 'btn-error'}`}
                        onClick={() => setVideoEnabled((v) => !v)}
                        aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        <i
                            className={`fa-duotone fa-regular ${
                                videoEnabled ? 'fa-video' : 'fa-video-slash'
                            } text-lg`}
                        />
                    </button>
                </div>

                {/* Permission error */}
                {permissionError && (
                    <div className="alert alert-error max-w-lg">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation" />
                        <span className="text-sm">{permissionError}</span>
                    </div>
                )}
            </div>

            {/* Right panel: Interview info + controls */}
            <div className="bg-base-100 flex flex-col justify-center p-6 lg:p-8">
                <div className="max-w-md mx-auto w-full space-y-6">
                    {/* Interview type kicker */}
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                        {formatInterviewType(interview_type)}
                    </p>

                    {/* Job title */}
                    <h1 className="text-2xl font-black text-base-content">
                        {job.title}
                    </h1>

                    {/* Company */}
                    <p className="text-base-content/70">{job.company_name}</p>

                    {/* Scheduled time */}
                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-calendar-clock" />
                        <span>{formatScheduledTime(scheduled_at)}</span>
                    </div>

                    {/* Other participant info */}
                    {otherParticipant && (
                        <div className="flex items-center gap-3">
                            <div className="avatar">
                                <div className="w-10 rounded-full">
                                    {otherParticipant.avatar_url ? (
                                        <img
                                            src={otherParticipant.avatar_url}
                                            alt={otherParticipant.name}
                                        />
                                    ) : (
                                        <div className="bg-secondary text-secondary-content flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold">
                                            {otherParticipant.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-base-content">
                                    {otherParticipant.name}
                                </p>
                                <p className="text-sm text-base-content/60 capitalize">
                                    {otherParticipant.role}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Participant waiting status */}
                    {participantPresence && (
                        <WaitingIndicator
                            participantName={participantPresence.name}
                            isWaiting={participantPresence.isWaiting}
                        />
                    )}

                    {/* Device selectors */}
                    <div className="space-y-2">
                        <DeviceSelector
                            kind="videoinput"
                            activeDeviceId={videoDeviceId}
                            onDeviceChange={setVideoDeviceId}
                        />
                        <DeviceSelector
                            kind="audioinput"
                            activeDeviceId={audioDeviceId}
                            onDeviceChange={setAudioDeviceId}
                        />
                        <DeviceSelector
                            kind="audiooutput"
                            activeDeviceId={undefined}
                            onDeviceChange={() => {
                                // Speaker output selection — used by the app layer
                            }}
                        />
                    </div>

                    {/* Join button */}
                    <button
                        type="button"
                        className="btn btn-primary btn-lg w-full"
                        onClick={handleJoin}
                    >
                        Join Interview
                    </button>
                </div>
            </div>
        </div>
    );
}
