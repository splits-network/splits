/**
 * Standardized chart loading state component
 *
 * Use for chart/analytics components with loading data
 * Maintains fixed height to prevent layout shift
 *
 * @example
 * // Basic usage with pixels
 * if (loading) {
 *   return <ChartLoadingState height={300} />;
 * }
 *
 * @example
 * // With CSS units (rem, px, %, etc.)
 * <ChartLoadingState height="10rem" message="Loading analytics..." />
 *
 * @example
 * // With custom message
 * <ChartLoadingState height={400} message="Loading analytics..." />
 */

import { LoadingSpinner } from "./loading-spinner";

export interface ChartLoadingStateProps {
    /** Chart height in pixels or CSS units (to prevent layout shift) */
    height: number | string;
    /** Optional loading message */
    message?: string;
}

export function ChartLoadingState({ height, message }: ChartLoadingStateProps) {
    const heightStyle = typeof height === "number" ? `${height}px` : height;
    return (
        <div
            className="flex items-center justify-center"
            style={{ height: heightStyle }}
        >
            <LoadingSpinner size="md" message={message} />
        </div>
    );
}
