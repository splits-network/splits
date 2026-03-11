'use client';

import {
    TrackToggle,
    DisconnectButton,
    MediaDeviceSelect,
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

const trackBtn = 'group btn btn-square btn-sm lg:btn-md rounded-none btn-success data-[lk-muted=true]:btn-error';
const screenShareBtn = 'group btn btn-square btn-sm lg:btn-md rounded-none data-[lk-enabled=true]:btn-success';

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

                {/* Microphone toggle */}
                <TrackToggle source={Track.Source.Microphone} className={trackBtn} showIcon={false}>
                    <i className="fa-duotone fa-regular fa-microphone group-data-[lk-muted=true]:hidden" />
                    <i className="fa-duotone fa-regular fa-microphone-slash hidden group-data-[lk-muted=true]:inline" />
                </TrackToggle>

                {/* Camera toggle */}
                <TrackToggle source={Track.Source.Camera} className={trackBtn} showIcon={false}>
                    <i className="fa-duotone fa-regular fa-video group-data-[lk-muted=true]:hidden" />
                    <i className="fa-duotone fa-regular fa-video-slash hidden group-data-[lk-muted=true]:inline" />
                </TrackToggle>

                {/* Screen share toggle */}
                <TrackToggle source={Track.Source.ScreenShare} className={screenShareBtn} showIcon={false}>
                    <i className="fa-duotone fa-regular fa-arrow-up-from-bracket" />
                </TrackToggle>

                <div className="w-px h-6 bg-base-300 mx-1" />

                {/* Notes toggle */}
                {onNotesToggle && (
                    <button
                        className={`btn btn-square btn-sm lg:btn-md rounded-none ${notesOpen ? 'btn-primary' : ''}`}
                        onClick={onNotesToggle}
                        aria-label={notesOpen ? 'Close notes' : 'Open notes'}
                    >
                        <i className="fa-duotone fa-regular fa-note-sticky" />
                    </button>
                )}

                {/* Device settings dropdown */}
                <div className="dropdown dropdown-top">
                    <div tabIndex={0} role="button" className="btn btn-square btn-sm lg:btn-md rounded-none">
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
