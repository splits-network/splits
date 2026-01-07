
interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
                <span className="loading loading-spinner loading-lg"></span>
                <p className="mt-4 text-base-content/70">{message}</p>
            </div>
        </div>
    );
}