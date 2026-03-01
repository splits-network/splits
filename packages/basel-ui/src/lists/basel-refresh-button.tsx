export interface BaselRefreshButtonProps {
    onClick: () => void;
    loading: boolean;
}

export function BaselRefreshButton({ onClick, loading }: BaselRefreshButtonProps) {
    return (
        <button
            onClick={onClick}
            className="btn btn-ghost rounded-none"
            disabled={loading}
        >
            <i className={`fa-duotone fa-regular fa-arrows-rotate ${loading ? 'animate-spin' : ''}`} />
        </button>
    );
}
