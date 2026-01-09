'use client';

import { ReactNode } from 'react';

export interface DataListProps {
    /** List of data rows */
    children: ReactNode;
    /** Show dividers between rows */
    dividers?: boolean;
    /** Compact mode (less padding) */
    compact?: boolean;
}

export function DataList({ children, dividers = false, compact = false }: DataListProps) {
    return (
        <div className={`${dividers ? 'divide-y divide-base-200' : ''} ${compact ? '-my-1' : ''}`}>
            {children}
        </div>
    );
}
