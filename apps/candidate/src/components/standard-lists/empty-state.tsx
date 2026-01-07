
interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon = 'fa-inbox', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                <i className={`fa-solid ${icon} text-2xl text-base-content/50`}></i>
            </div>
            <h3 className="text-lg font-medium text-base-content mb-2">{title}</h3>
            {description && (
                <p className="text-base-content/70 max-w-md mb-4">{description}</p>
            )}
            {action && (
                <button className="btn btn-primary" onClick={action.onClick}>
                    {action.label}
                </button>
            )}
        </div>
    );
}