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
        <div className="flex items-center gap-2 bg-error/10 px-3 py-1.5 border-l-4 border-error">
            <span className="inline-block w-2 h-2 bg-error rounded-none animate-pulse" />
            <span className="text-sm font-bold tracking-wide text-error uppercase">Rec</span>

            {canStop && onStopRecording && (
                <button
                    type="button"
                    className="btn btn-ghost btn-xs rounded-none text-error"
                    onClick={onStopRecording}
                    aria-label="Stop recording"
                >
                    <i className="fa-duotone fa-regular fa-stop" />
                </button>
            )}
        </div>
    );
}
