/**
 * Standardized LoadingState component
 *
 * Use for full page/section loading with consistent centered layout
 * Replaces the existing LoadingState in portal/src/components/standard-lists
 *
 * @example
 * // Basic page loading
 * <LoadingState />
 *
 * @example
 * // With custom message
 * <LoadingState message="Loading candidates..." />
 *
 * @example
 * // Smaller for cards/sections
 * <LoadingState size="md" fullHeight={false} />
 */

import { LoadingSpinner, type LoadingSpinnerProps } from './loading-spinner';

export interface LoadingStateProps {
    /** Loading message */
    message?: string;
    /** Spinner size - defaults to 'lg' for full page */
    size?: LoadingSpinnerProps['size'];
    /** Spinner color */
    color?: LoadingSpinnerProps['color'];
    /** Use min-h-screen for full page (default: true) */
    fullHeight?: boolean;
    /** Additional CSS classes */
    className?: string;
}

export function LoadingState({
    message = 'Loading...',
    size = 'lg',
    color = 'default',
    fullHeight = true,
    className = '',
}: LoadingStateProps) {
    const containerClasses = [
        'flex flex-col items-center justify-center',
        fullHeight ? 'min-h-screen' : 'py-12',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={containerClasses}>
            <LoadingSpinner size={size} color={color} message={message} />
        </div>
    );
}
