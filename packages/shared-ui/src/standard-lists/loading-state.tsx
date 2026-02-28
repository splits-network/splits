interface StandardListLoadingStateProps {
    message?: string;
}

/**
 * Loading state for standard list views.
 * Named StandardListLoadingState to avoid collision with shared-ui's generic LoadingState.
 */
export function StandardListLoadingState({ message = 'Loading...' }: StandardListLoadingStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 text-base-content/70">{message}</p>
            </div>
        </div>
    );
}
