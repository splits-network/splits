interface ErrorStateProps {
    message: string;
    onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="alert alert-error">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{message}</span>
            {onRetry && (
                <button className="btn btn-sm btn-ghost" onClick={onRetry}>
                    <i className="fa-solid fa-rotate-right mr-1"></i>
                    Retry
                </button>
            )}
        </div>
    );
}