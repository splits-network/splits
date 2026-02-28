import type { ReactNode } from 'react';

type AdminEmptyStateProps = {
    icon?: string;
    title: string;
    description?: string;
    action?: ReactNode;
};

export function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            {icon && (
                <i className={`fa-duotone fa-regular ${icon} text-4xl text-base-content/20`} />
            )}
            <p className="font-semibold text-base-content/60">{title}</p>
            {description && (
                <p className="text-sm text-base-content/40 max-w-xs">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
