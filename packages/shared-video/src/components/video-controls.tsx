'use client';

import {
    DisconnectButton,
    MediaDeviceSelect,
    useTrackToggle,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { RecordingIndicator } from './recording-indicator';

interface VideoControlsProps {
    isRecording?: boolean;
    onStopRecording?: () => void;
    canStopRecording?: boolean;
    onNotesToggle?: () => void;
    notesOpen?: boolean;
}

const baseBtn = 'btn btn-square btn-sm lg:btn-md rounded-none';

function MicToggle() {
    const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Microphone });
    return (
        <button
            {...buttonProps}
            className={`${baseBtn} ${enabled ? 'btn-success' : 'btn-error'}`}
        >
            <i className={`fa-duotone fa-regular ${enabled ? 'fa-microphone' : 'fa-microphone-slash'}`} />
        </button>
    );
}

function CameraToggle() {
    const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.Camera });
    return (
        <button
            {...buttonProps}
            className={`${baseBtn} ${enabled ? 'btn-success' : 'btn-error'}`}
        >
            <i className={`fa-duotone fa-regular ${enabled ? 'fa-video' : 'fa-video-slash'}`} />
        </button>
    );
}

function ScreenShareToggle() {
    const { buttonProps, enabled } = useTrackToggle({ source: Track.Source.ScreenShare });
    return (
        <button
            {...buttonProps}
            className={`${baseBtn} ${enabled ? 'btn-success' : ''}`}
        >
            <i className="fa-duotone fa-regular fa-arrow-up-from-bracket" />
        </button>
    );
}

export function VideoControls({
    isRecording,
    onStopRecording,
    canStopRecording,
    onNotesToggle,
    notesOpen,
}: VideoControlsProps = {}) {
    return (
        <div className="bg-base-200 border-t-2 border-base-300 z-20">
            <div className="flex items-center justify-center gap-2 lg:gap-3 py-2.5 px-4">
                {/* Recording indicator */}
                <RecordingIndicator
                    isRecording={!!isRecording}
                    onStopRecording={onStopRecording}
                    canStop={!!canStopRecording}
                />

                <MicToggle />
                <CameraToggle />
                <ScreenShareToggle />

                <div className="w-px h-6 bg-base-300 mx-1" />

                {/* Notes toggle */}
                {onNotesToggle && (
                    <button
                        className={`${baseBtn} ${notesOpen ? 'btn-primary' : ''}`}
                        onClick={onNotesToggle}
                        aria-label={notesOpen ? 'Close notes' : 'Open notes'}
                    >
                        <i className="fa-duotone fa-regular fa-note-sticky" />
                    </button>
                )}

                {/* Device settings dropdown */}
                <div className="dropdown dropdown-top">
                    <div tabIndex={0} role="button" className={baseBtn}>
                        <i className="fa-duotone fa-regular fa-gear" />
                    </div>
                    <div
                        tabIndex={0}
                        className="dropdown-content bg-base-100 border-l-4 border-primary shadow-lg p-5 w-72 z-30 mb-2 rounded-none"
                    >
                        <div className="flex flex-col gap-4">
                            <p className="tracking-[0.15em] text-sm uppercase font-semibold text-base-content/50">
                                Device Settings
                            </p>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Camera</legend>
                                <MediaDeviceSelect kind="videoinput" className="select select-sm w-full rounded-none" />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Microphone</legend>
                                <MediaDeviceSelect kind="audioinput" className="select select-sm w-full rounded-none" />
                            </fieldset>
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">Speaker</legend>
                                <MediaDeviceSelect kind="audiooutput" className="select select-sm w-full rounded-none" />
                            </fieldset>
                        </div>
                    </div>
                </div>

                <div className="w-px h-6 bg-base-300 mx-1" />

                {/* Leave call */}
                <DisconnectButton className="btn btn-error btn-sm lg:btn-md rounded-none px-5">
                    <i className="fa-duotone fa-regular fa-phone-hangup" />
                    <span className="hidden lg:inline">Leave</span>
                </DisconnectButton>
            </div>
        </div>
    );
}
