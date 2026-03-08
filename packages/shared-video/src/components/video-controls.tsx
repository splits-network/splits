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
}

export function VideoControls({
    isRecording,
    onStopRecording,
    canStopRecording,
}: VideoControlsProps = {}) {
    return (
        <div className="bg-base-300/90 backdrop-blur-md z-20">
            <div className="flex items-center justify-center gap-4 py-4">
                {/* Recording indicator — left side */}
                <RecordingIndicator
                    isRecording={!!isRecording}
                    onStopRecording={onStopRecording}
                    canStop={!!canStopRecording}
                />
                {/* Microphone toggle */}
                <TrackToggle
                    source={Track.Source.Microphone}
                    className="btn btn-circle btn-sm lg:btn-md data-[lk-muted=true]:btn-error"
                    showIcon={false}
                >
                    <i className="fa-duotone fa-regular fa-microphone data-[lk-muted=true]:hidden" />
                    <i className="fa-duotone fa-regular fa-microphone-slash hidden data-[lk-muted=true]:inline" />
                </TrackToggle>

                {/* Camera toggle */}
                <TrackToggle
                    source={Track.Source.Camera}
                    className="btn btn-circle btn-sm lg:btn-md data-[lk-muted=true]:btn-error"
                    showIcon={false}
                >
                    <i className="fa-duotone fa-regular fa-video data-[lk-muted=true]:hidden" />
                    <i className="fa-duotone fa-regular fa-video-slash hidden data-[lk-muted=true]:inline" />
                </TrackToggle>

                {/* Screen share toggle */}
                <TrackToggle
                    source={Track.Source.ScreenShare}
                    className="btn btn-circle btn-sm lg:btn-md data-[lk-enabled=true]:btn-success"
                    showIcon={false}
                >
                    <i className="fa-duotone fa-regular fa-screen-share" />
                </TrackToggle>

                {/* Device settings dropdown */}
                <div className="dropdown dropdown-top">
                    <div tabIndex={0} role="button" className="btn btn-circle btn-sm lg:btn-md">
                        <i className="fa-duotone fa-regular fa-gear" />
                    </div>
                    <div
                        tabIndex={0}
                        className="dropdown-content bg-base-200 shadow-lg p-4 w-72 z-30 mb-2"
                    >
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="label text-sm font-medium">Camera</label>
                                <MediaDeviceSelect
                                    kind="videoinput"
                                    className="select select-sm w-full"
                                />
                            </div>
                            <div>
                                <label className="label text-sm font-medium">Microphone</label>
                                <MediaDeviceSelect
                                    kind="audioinput"
                                    className="select select-sm w-full"
                                />
                            </div>
                            <div>
                                <label className="label text-sm font-medium">Speaker</label>
                                <MediaDeviceSelect
                                    kind="audiooutput"
                                    className="select select-sm w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leave call */}
                <DisconnectButton className="btn btn-circle btn-error btn-sm lg:btn-lg">
                    <i className="fa-duotone fa-regular fa-phone-hangup" />
                </DisconnectButton>
            </div>
        </div>
    );
}
