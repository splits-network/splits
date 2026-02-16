import React from 'react';
import type { MemphisCoreColor } from '../utils/types';

export interface StatusDotProps {
    /** Status label */
    label: string;
    /** Memphis color for the dot */
    color?: MemphisCoreColor | 'muted';
    /** Additional className */
    className?: string;
}

/**
 * StatusDot - Memphis-styled status indicator with label
 *
 * Uses CSS classes from the Memphis status component:
 * - `.status` base
 * - `.status-{color}` for Memphis palette colors
 */
export function StatusDot({
    label,
    color = 'teal',
    className = '',
}: StatusDotProps) {
    const statusClass = color === 'muted'
        ? 'status-neutral'
        : `status-${color}`;

    return (
        <span
            className={['flex items-center gap-2 font-bold text-sm', className].filter(Boolean).join(' ')}
        >
            <span className={`status ${statusClass}`} />
            {label}
        </span>
    );
}
