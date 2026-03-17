'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { usePreviewTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import type { LocalAudioTrack, LocalVideoTrack } from 'livekit-client';
import type { CallContext, LocalUserChoices } from '../types';
import { AudioLevelMeter } from './audio-level-meter';
import { CameraOffFallback } from './camera-off-fallback';
import { DeviceSelector } from './device-selector';
import { WaitingIndicator } from './waiting-indicator';
import { RecordingConsent } from './recording-consent';

interface VideoLobbyProps {
    callContext: CallContext;
    onJoin: (choices: LocalUserChoices) => void;
    participantPresence?: { name: string; isWaiting: boolean };
    localUser: { name: string; avatarUrl?: string };
    recordingEnabled?: boolean;
    onRecordingConsent?: () => void;
}

function formatScheduledTime(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
}

function formatCallType(type: string): string {
    return type.replace(/_/g, ' ').toUpperCase();
}

export function VideoLobby({
    callContext,
    onJoin,
    participantPresence,
    localUser,
    recordingEnabled,
    onRecordingConsent,
}: VideoLobbyProps) {
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioDeviceId, setAudioDeviceId] = useState<string | undefined>();
    const [videoDeviceId, setVideoDeviceId] = useState<string | undefined>();
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const [consentGiven, setConsentGiven] = useState(!recordingEnabled);

    const videoElRef = useRef<HTMLVideoElement>(null);

    const handlePreviewError = useCallback((err: Error) => {
        const denied = err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError';
        setPermissionError(denied
            ? 'Camera/microphone access was denied. Click the camera icon in your browser\'s address bar to allow access, then refresh.'
            : `Device error: ${err.message}`);
    }, []);

    const tracks = usePreviewTracks(
        {
            audio: audioEnabled ? (audioDeviceId ? { deviceId: audioDeviceId } : true) : false,
            video: videoEnabled ? (videoDeviceId ? { deviceId: videoDeviceId } : true) : false,
        },
        handlePreviewError,
    );

    const videoTrack = tracks?.find((t): t is LocalVideoTrack => t.kind === Track.Kind.Video);
    const audioTrack = tracks?.find((t): t is LocalAudioTrack => t.kind === Track.Kind.Audio);

    useEffect(() => {
        const el = videoElRef.current;
        if (videoTrack && el) {
            videoTrack.attach(el);
            return () => { videoTrack.detach(el); };
        }
    }, [videoTrack]);

    const handleJoin = () => {
        onJoin({ audioEnabled, videoEnabled, audioDeviceId, videoDeviceId });
    };

    const { job, participants, call_type, scheduled_at } = callContext;
    const otherParticipant = participants.find((p) => p.name !== localUser.name) ?? participants[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
            {/* Left panel: Camera preview */}
            <div className="bg-neutral flex flex-col items-center justify-center p-6 lg:p-8 gap-4">
                <div className="relative w-full max-w-lg aspect-video bg-neutral rounded-none overflow-hidden">
                    {videoEnabled && videoTrack ? (
                        <video
                            ref={videoElRef}
                            className="w-full h-full object-cover rounded-none"
                            autoPlay playsInline muted
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    ) : (
                        <CameraOffFallback name={localUser.name} avatarUrl={localUser.avatarUrl} />
                    )}
                </div>

                <AudioLevelMeter audioTrack={audioEnabled ? audioTrack : undefined} />

                <div className="flex gap-3">
                    <button
                        type="button"
                        className={`btn btn-square rounded-none ${audioEnabled ? 'btn-neutral' : 'btn-error'}`}
                        onClick={() => setAudioEnabled((v) => !v)}
                        aria-label={audioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        <i className={`fa-duotone fa-regular ${audioEnabled ? 'fa-microphone' : 'fa-microphone-slash'} text-lg`} />
                    </button>
                    <button
                        type="button"
                        className={`btn btn-square rounded-none ${videoEnabled ? 'btn-neutral' : 'btn-error'}`}
                        onClick={() => setVideoEnabled((v) => !v)}
                        aria-label={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        <i className={`fa-duotone fa-regular ${videoEnabled ? 'fa-video' : 'fa-video-slash'} text-lg`} />
                    </button>
                </div>

                {permissionError && (
                    <div className="border-l-4 border-error bg-error/5 p-4 max-w-lg">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation text-error mt-0.5" />
                            <span className="text-sm text-base-content">{permissionError}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Right panel: Call info + controls */}
            <div className="bg-base-100 flex flex-col justify-center p-6 lg:p-8">
                <div className="max-w-md mx-auto w-full space-y-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                        {formatCallType(call_type)}
                    </p>
                    <h1 className="text-2xl md:text-3xl font-black text-base-content">{job.title}</h1>
                    <p className="text-base-content/70">{job.company_name}</p>

                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                        <i className="fa-duotone fa-regular fa-calendar-clock" />
                        <span>{formatScheduledTime(scheduled_at)}</span>
                    </div>

                    {otherParticipant && (
                        <div className="flex items-center gap-3">
                            <div className="avatar">
                                <div className="w-10 rounded-none">
                                    {otherParticipant.avatar_url ? (
                                        <img src={otherParticipant.avatar_url} alt={otherParticipant.name} className="rounded-none" />
                                    ) : (
                                        <div className="bg-secondary text-secondary-content flex items-center justify-center w-10 h-10 rounded-none text-sm font-bold">
                                            {otherParticipant.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-base-content">{otherParticipant.name}</p>
                                <p className="text-sm text-base-content/60 capitalize">{otherParticipant.role}</p>
                            </div>
                        </div>
                    )}

                    {participantPresence && (
                        <WaitingIndicator participantName={participantPresence.name} isWaiting={participantPresence.isWaiting} />
                    )}

                    {recordingEnabled && (
                        <RecordingConsent
                            consentGiven={consentGiven}
                            onConsent={() => {
                                setConsentGiven((v) => !v);
                                if (!consentGiven && onRecordingConsent) onRecordingConsent();
                            }}
                        />
                    )}

                    <div className="space-y-2">
                        <DeviceSelector kind="videoinput" activeDeviceId={videoDeviceId} onDeviceChange={setVideoDeviceId} />
                        <DeviceSelector kind="audioinput" activeDeviceId={audioDeviceId} onDeviceChange={setAudioDeviceId} />
                        <DeviceSelector kind="audiooutput" activeDeviceId={undefined} onDeviceChange={() => {}} />
                    </div>

                    <button
                        type="button"
                        className="btn btn-primary btn-lg w-full rounded-none"
                        onClick={handleJoin}
                        disabled={recordingEnabled && !consentGiven}
                    >
                        Enter the Room
                        <i className="fa-duotone fa-regular fa-arrow-right ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
}
