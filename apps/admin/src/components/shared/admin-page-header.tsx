import type { ReactNode } from 'react';

type AdminPageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
};

export function AdminPageHeader({ title, subtitle, actions }: AdminPageHeaderProps) {
    return (
        <div className="flex items-start justify-between gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-black tracking-tight">{title}</h1>
                {subtitle && (
                    <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
        </div>
    );
}
