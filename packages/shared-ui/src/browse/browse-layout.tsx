/**
 * BrowseLayout - Container wrapper for browse components
 * Provides the standard split view layout with responsive behavior
 */

import { ReactNode } from "react";

interface BrowseLayoutProps {
    children: ReactNode;
    className?: string;
}

export function BrowseLayout({ children, className = "" }: BrowseLayoutProps) {
    return (
        <div
            className={`
                h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-base-200 rounded-xl 
                overflow-hidden shadow-sm border border-base-300 ${className}
            `.trim()}
        >
            {children}
        </div>
    );
}
