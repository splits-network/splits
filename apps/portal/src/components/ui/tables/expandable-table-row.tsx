"use client";

import { ReactNode, useState, useCallback } from "react";
import { useTableAccordion } from "./table-accordion-context";

export interface ExpandableTableRowProps {
    /** Main row cells content */
    cells: ReactNode;
    /** Expanded detail content */
    expandedContent: ReactNode;
    /** Whether the row is currently expanded */
    expanded?: boolean;
    /** Controlled mode: callback when expand state changes */
    onExpandChange?: (expanded: boolean) => void;
    /** Whether to show expand toggle button in first cell */
    showToggle?: boolean;
    /** Row key for accessibility */
    rowId: string;
    /** Additional row classes */
    className?: string;
    /** Whether row is selected (for bulk actions) */
    selected?: boolean;
    /** Click handler for selection */
    onSelect?: () => void;
    /** Whether to load content lazily (show skeleton until expanded) */
    lazyLoad?: boolean;
    /** Loading state for lazy loaded content */
    loading?: boolean;
}

/**
 * ExpandableTableRow - Table row that expands to show more detail
 *
 * Features:
 * - Click to expand/collapse
 * - Chevron indicator rotates on expand
 * - Smooth height animation
 * - Lazy loading support with skeleton
 * - Selection checkbox support
 * - Accessible keyboard navigation
 */
export function ExpandableTableRow({
    cells,
    expandedContent,
    expanded: controlledExpanded,
    onExpandChange,
    showToggle = true,
    rowId,
    className = "",
    selected = false,
    onSelect,
    lazyLoad = false,
    loading = false,
}: ExpandableTableRowProps) {
    // Accordion context: if present, only one row expands at a time
    const accordion = useTableAccordion();

    // Support both controlled and uncontrolled modes
    const [internalExpanded, setInternalExpanded] = useState(false);
    const isExpanded =
        controlledExpanded ??
        (accordion ? accordion.expandedRowId === rowId : internalExpanded);

    const toggleExpanded = useCallback(() => {
        const newState = !isExpanded;
        if (onExpandChange) {
            onExpandChange(newState);
        } else if (accordion) {
            accordion.setExpandedRowId(newState ? rowId : null);
        } else {
            setInternalExpanded(newState);
        }
    }, [isExpanded, onExpandChange, accordion, rowId]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleExpanded();
            }
        },
        [toggleExpanded],
    );

    return (
        <>
            {/* Main row */}
            <tr
                className={`
                    hover:bg-base-200/50 cursor-pointer transition-colors
                    ${isExpanded ? "bg-base-100 expanded-row" : ""}
                    ${selected ? "bg-primary/5" : ""}
                    ${className}
                `}
                onClick={toggleExpanded}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="row"
                aria-expanded={isExpanded}
                aria-controls={`${rowId}-detail`}
            >
                {/* Selection checkbox */}
                {onSelect && (
                    <td className="w-10" onClick={(e) => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            className="checkbox checkbox-sm"
                            checked={selected}
                            onChange={onSelect}
                            aria-label="Select row"
                        />
                    </td>
                )}

                {/* Expand toggle */}
                {showToggle && (
                    <td className="w-10">
                        <button
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded();
                            }}
                            aria-label={
                                isExpanded ? "Collapse row" : "Expand row"
                            }
                        >
                            <i
                                className={`fa-duotone fa-regular fa-chevron-right transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                            ></i>
                        </button>
                    </td>
                )}

                {/* Row cells */}
                {cells}
            </tr>

            {/* Expanded detail row */}
            {isExpanded && (
                <tr id={`${rowId}-detail`} className="expanded-row-detail">
                    <td colSpan={100} className="p-0">
                        <div className="p-4">
                            {loading ? (
                                <ExpandedContentSkeleton />
                            ) : lazyLoad && !expandedContent ? (
                                <ExpandedContentSkeleton />
                            ) : (
                                expandedContent
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

/**
 * Skeleton loader for expanded content
 */
function ExpandedContentSkeleton() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300 rounded w-1/4"></div>
                    <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300 rounded w-1/3"></div>
                    <div className="h-3 bg-base-300 rounded w-2/3"></div>
                </div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-base-300 rounded w-1/4"></div>
                    <div className="h-3 bg-base-300 rounded w-1/2"></div>
                </div>
            </div>
            <div className="flex gap-2 pt-2">
                <div className="h-8 bg-base-300 rounded w-24"></div>
                <div className="h-8 bg-base-300 rounded w-24"></div>
            </div>
        </div>
    );
}

/**
 * ExpandedDetailSection - Helper for organizing expanded content
 */
export interface ExpandedDetailSectionProps {
    /** Section title */
    title?: string;
    /** Section content */
    children: ReactNode;
    /** Additional CSS classes */
    className?: string;
}

export function ExpandedDetailSection({
    title,
    children,
    className = "",
}: ExpandedDetailSectionProps) {
    return (
        <div className={className}>
            {title && (
                <h4 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
                    {title}
                </h4>
            )}
            {children}
        </div>
    );
}

/**
 * ExpandedDetailGrid - Grid layout for expanded content
 */
export interface ExpandedDetailGridProps {
    children: ReactNode;
    cols?: 2 | 3 | 4;
    className?: string;
}

export function ExpandedDetailGrid({
    children,
    cols = 3,
    className = "",
}: ExpandedDetailGridProps) {
    const gridClasses = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid ${gridClasses[cols]} gap-4 ${className}`}>
            {children}
        </div>
    );
}

/**
 * ExpandedDetailItem - Key-value display for expanded content
 */
export interface ExpandedDetailItemProps {
    label: string;
    value: ReactNode;
    icon?: string;
    className?: string;
}

export function ExpandedDetailItem({
    label,
    value,
    icon,
    className = "",
}: ExpandedDetailItemProps) {
    return (
        <div className={`flex items-start gap-2 ${className}`}>
            {icon && (
                <i
                    className={`fa-duotone fa-regular ${icon} text-base-content/40 mt-0.5`}
                ></i>
            )}
            <div>
                <dt className="text-xs text-base-content/50">{label}</dt>
                <dd className="text-sm text-base-content font-medium">
                    {value}
                </dd>
            </div>
        </div>
    );
}
