'use client';

import { ReactNode } from 'react';

export interface InteractiveDataRowProps {
    /** Label text */
    label: string;
    /** Interactive content (links, buttons, etc.) */
    children: ReactNode;
    /** Icon class (FontAwesome) */
    icon?: string;
}

export function InteractiveDataRow({ label, children, icon }: InteractiveDataRowProps) {
    return (
        <div className="flex items-center justify-between gap-3 py-2">
            <span className="text-sm text-base-content/70 flex items-center gap-2 shrink-0">
                {icon && <i className={`fa-duotone fa-regular ${icon} text-xs`}></i>}
                {label}
            </span>
            <div className="flex items-center min-w-0">
                {children}
            </div>
        </div>
    );
}
