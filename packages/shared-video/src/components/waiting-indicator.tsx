interface WaitingIndicatorProps {
    participantName: string;
    isWaiting: boolean;
}

export function WaitingIndicator({ participantName, isWaiting }: WaitingIndicatorProps) {
    return (
        <div
            className={`flex items-center gap-3 py-3 px-4 border-l-4 ${
                isWaiting ? 'border-success' : 'border-base-300'
            }`}
        >
            <span
                className={`inline-block w-2.5 h-2.5 rounded-none ${
                    isWaiting ? 'bg-success animate-pulse' : 'bg-base-content/30'
                }`}
            />
            <span className="text-sm font-semibold text-base-content">
                {isWaiting
                    ? `${participantName} is waiting`
                    : `Waiting for ${participantName}...`}
            </span>
        </div>
    );
}
