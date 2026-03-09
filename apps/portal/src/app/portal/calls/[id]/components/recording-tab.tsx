"use client";

import { useRef, useEffect, useState } from "react";
import type { CallRecording } from "../../hooks/use-call-detail";

interface RecordingTabProps {
    recordings?: CallRecording[];
    currentTimestamp: number;
    onTimestampChange: (ts: number) => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function RecordingTab({
    recordings,
    currentTimestamp,
    onTimestampChange,
}: RecordingTabProps) {
    const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Find the first ready recording
    const readyRecording = recordings?.find(
        (r) => r.recording_status === "ready" && r.blob_url
    );
    const processingRecording = recordings?.find(
        (r) =>
            r.recording_status === "pending" ||
            r.recording_status === "processing" ||
            r.recording_status === "recording"
    );
    const failedRecording = recordings?.find(
        (r) => r.recording_status === "failed"
    );

    // Sync external timestamp changes to the player
    useEffect(() => {
        const el = mediaRef.current;
        if (!el) return;
        if (Math.abs(el.currentTime - currentTimestamp) > 1) {
            el.currentTime = currentTimestamp;
        }
    }, [currentTimestamp]);

    // Emit timestamp changes from the player
    const handleTimeUpdate = () => {
        const el = mediaRef.current;
        if (el) onTimestampChange(el.currentTime);
    };

    // Speed control
    useEffect(() => {
        const el = mediaRef.current;
        if (el) el.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    // No recordings at all
    if (!recordings || recordings.length === 0) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-microphone-slash text-4xl text-base-content/15 mb-4 block" />
                <p className="text-sm text-base-content/50">
                    No recording available for this call.
                </p>
            </div>
        );
    }

    // Processing state
    if (!readyRecording && processingRecording) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <span className="loading loading-spinner loading-md text-primary mb-4 block" />
                <p className="font-bold mb-1">Recording Processing</p>
                <p className="text-sm text-base-content/50">
                    The recording is being processed and will be available
                    shortly.
                </p>
            </div>
        );
    }

    // Failed state
    if (!readyRecording && failedRecording) {
        return (
            <div className="border-2 border-base-300 p-8 text-center">
                <i className="fa-duotone fa-regular fa-triangle-exclamation text-4xl text-error/30 mb-4 block" />
                <p className="font-bold mb-1">Recording Failed</p>
                <p className="text-sm text-base-content/50">
                    The recording could not be processed.
                </p>
            </div>
        );
    }

    if (!readyRecording) return null;

    const isVideo = readyRecording.blob_url?.includes("video") ?? false;
    const durationLabel = readyRecording.duration_seconds
        ? formatSeconds(readyRecording.duration_seconds)
        : null;

    return (
        <div className="space-y-4">
            {/* Player */}
            <div className="border-2 border-base-300 bg-base-200 overflow-hidden">
                {isVideo ? (
                    <video
                        ref={mediaRef as React.RefObject<HTMLVideoElement>}
                        src={readyRecording.blob_url!}
                        controls
                        className="w-full max-h-[480px]"
                        onTimeUpdate={handleTimeUpdate}
                    />
                ) : (
                    <div className="p-6">
                        <audio
                            ref={mediaRef as React.RefObject<HTMLAudioElement>}
                            src={readyRecording.blob_url!}
                            controls
                            className="w-full"
                            onTimeUpdate={handleTimeUpdate}
                        />
                    </div>
                )}
            </div>

            {/* Controls bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                {/* Playback speed */}
                <div className="flex items-center gap-2">
                    <span className="text-base-content/50">Speed:</span>
                    <div className="flex gap-1">
                        {PLAYBACK_SPEEDS.map((speed) => (
                            <button
                                key={speed}
                                className={`btn btn-sm ${playbackSpeed === speed ? "btn-primary" : "btn-ghost"}`}
                                style={{ borderRadius: 0 }}
                                onClick={() => setPlaybackSpeed(speed)}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration & file info */}
                <div className="flex items-center gap-4 text-base-content/50">
                    {durationLabel && <span>{durationLabel}</span>}
                    {readyRecording.file_size_bytes && (
                        <span>
                            {formatBytes(readyRecording.file_size_bytes)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatSeconds(s: number): string {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${m}:${String(sec).padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
}
