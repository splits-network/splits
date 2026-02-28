type AdminErrorStateProps = {
    message?: string;
    onRetry?: () => void;
};

export function AdminErrorState({
    message = 'Something went wrong. Please try again.',
    onRetry,
}: AdminErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <i className="fa-duotone fa-regular fa-circle-exclamation text-4xl text-error/60" />
            <p className="text-sm text-base-content/60 text-center max-w-xs">{message}</p>
            {onRetry && (
                <button type="button" onClick={onRetry} className="btn btn-sm btn-outline">
                    <i className="fa-duotone fa-regular fa-rotate-right" />
                    Try again
                </button>
            )}
        </div>
    );
}
