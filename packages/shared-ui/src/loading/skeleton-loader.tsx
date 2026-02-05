/**
 * Standardized SkeletonLoader component
 *
 * Use skeletons for predictable content layouts (lists, cards, profiles)
 * Use spinners for unknown/dynamic content
 *
 * @example
 * // Single line of text
 * <SkeletonLoader variant="text" />
 *
 * @example
 * // Multiple lines of text
 * <SkeletonLoader variant="text-block" lines={3} />
 *
 * @example
 * // User avatar
 * <SkeletonLoader variant="avatar" />
 *
 * @example
 * // Card layout
 * <SkeletonLoader variant="card" />
 *
 * @example
 * // Table row
 * <SkeletonLoader variant="table-row" columns={4} />
 */

export type SkeletonVariant =
    | 'text'
    | 'text-block'
    | 'avatar'
    | 'avatar-circle'
    | 'image'
    | 'card'
    | 'table-row'
    | 'custom';

export interface SkeletonLoaderProps {
    /** Skeleton variant - determines the layout */
    variant: SkeletonVariant;
    /** Number of lines (for text-block variant) */
    lines?: number;
    /** Number of columns (for table-row variant) */
    columns?: number;
    /** Custom height (Tailwind class like 'h-4', 'h-48') */
    height?: string;
    /** Custom width (Tailwind class like 'w-full', 'w-1/2', 'w-32') */
    width?: string;
    /** Additional CSS classes */
    className?: string;
}

export function SkeletonLoader({
    variant,
    lines = 3,
    columns = 4,
    height,
    width,
    className = '',
}: SkeletonLoaderProps) {
    const baseClass = 'skeleton';

    switch (variant) {
        case 'text':
            return (
                <div
                    className={`${baseClass} ${height || 'h-4'} ${width || 'w-full'} ${className}`}
                ></div>
            );

        case 'text-block':
            return (
                <div className={`flex flex-col gap-2 ${className}`}>
                    {Array.from({ length: lines }).map((_, i) => {
                        // Vary widths for more natural text appearance
                        const lineWidth =
                            i === lines - 1 ? 'w-3/4' : 'w-full';
                        return (
                            <div
                                key={i}
                                className={`${baseClass} h-4 ${lineWidth}`}
                            ></div>
                        );
                    })}
                </div>
            );

        case 'avatar':
            return (
                <div
                    className={`${baseClass} ${height || 'h-16'} ${width || 'w-16'} ${className}`}
                ></div>
            );

        case 'avatar-circle':
            return (
                <div
                    className={`${baseClass} ${height || 'h-16'} ${width || 'w-16'} rounded-full ${className}`}
                ></div>
            );

        case 'image':
            return (
                <div
                    className={`${baseClass} ${height || 'h-48'} ${width || 'w-full'} ${className}`}
                ></div>
            );

        case 'card':
            return (
                <div className={`flex flex-col gap-4 ${className}`}>
                    <div className={`${baseClass} h-48 w-full`}></div>
                    <div className={`${baseClass} h-6 w-3/4`}></div>
                    <div className={`${baseClass} h-4 w-full`}></div>
                    <div className={`${baseClass} h-4 w-5/6`}></div>
                </div>
            );

        case 'table-row':
            return (
                <div className={`flex gap-4 ${className}`}>
                    {Array.from({ length: columns }).map((_, i) => (
                        <div
                            key={i}
                            className={`${baseClass} h-8 flex-1`}
                        ></div>
                    ))}
                </div>
            );

        case 'custom':
            return (
                <div
                    className={`${baseClass} ${height || 'h-4'} ${width || 'w-full'} ${className}`}
                ></div>
            );

        default:
            return null;
    }
}

/**
 * Convenience component for loading a list of skeleton items
 */
export interface SkeletonListProps {
    /** Number of items to show */
    count: number;
    /** Variant for each item */
    variant: SkeletonVariant;
    /** Gap between items (Tailwind class) */
    gap?: string;
    /** Props to pass to each skeleton */
    itemProps?: Partial<SkeletonLoaderProps>;
}

export function SkeletonList({
    count,
    variant,
    gap = 'gap-4',
    itemProps = {},
}: SkeletonListProps) {
    return (
        <div className={`flex flex-col ${gap}`}>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonLoader key={i} variant={variant} {...itemProps} />
            ))}
        </div>
    );
}
