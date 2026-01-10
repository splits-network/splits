import { ReactNode } from 'react';

interface ActionConfig {
    label: string;
    onClick: () => void;
}

interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
    /** Can be either an action config object or a custom ReactNode */
    action?: ActionConfig | ReactNode;
}

function isActionConfig(action: ActionConfig | ReactNode): action is ActionConfig {
    return action !== null && typeof action === 'object' && 'label' in action && 'onClick' in action;
}

export function EmptyState({ icon = 'fa-inbox', title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center mb-4">
                <i className={`fa-duotone fa-regular ${icon} text-2xl text-base-content/50`}></i>
            </div>
            <h3 className="text-lg font-medium text-base-content mb-2">{title}</h3>
            {description && (
                <p className="text-base-content/70 max-w-md mb-4">{description}</p>
            )}
            {action && (
                isActionConfig(action) ? (
                    <button className="btn btn-primary" onClick={action.onClick}>
                        {action.label}
                    </button>
                ) : (
                    action
                )
            )}
        </div>
    );
}