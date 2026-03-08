'use client';

interface RecordingIndicatorProps {
    isRecording: boolean;
    onStopRecording?: () => void;
    canStop: boolean;
}

export function RecordingIndicator({
    isRecording,
    onStopRecording,
    canStop,
}: RecordingIndicatorProps) {
    if (!isRecording) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-error rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-error">Recording</span>

            {canStop && onStopRecording && (
                <button
                    type="button"
                    className="btn btn-ghost btn-sm text-error"
                    onClick={onStopRecording}
                    aria-label="Stop recording"
                >
                    <i className="fa-duotone fa-regular fa-stop" />
                </button>
            )}
        </div>
    );
}
