interface WaitingIndicatorProps {
    participantName: string;
    isWaiting: boolean;
}

export function WaitingIndicator({ participantName, isWaiting }: WaitingIndicatorProps) {
    return (
        <div className="flex items-center gap-2 py-2">
            <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                    isWaiting ? 'bg-success animate-pulse' : 'bg-base-content/30'
                }`}
            />
            <span className="text-sm text-base-content">
                {isWaiting
                    ? `${participantName} is waiting`
                    : `Waiting for ${participantName}...`}
            </span>
        </div>
    );
}
