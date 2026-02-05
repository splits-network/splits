/**
 * Button loading state helper component
 *
 * Wraps button content with optional loading state
 *
 * @example
 * // Basic form button
 * <button disabled={isSubmitting}>
 *   <ButtonLoading loading={isSubmitting} text="Save" loadingText="Saving..." />
 * </button>
 *
 * @example
 * // With icon
 * <button disabled={isDeleting}>
 *   <ButtonLoading
 *     loading={isDeleting}
 *     icon="fa-trash"
 *     text="Delete"
 *     loadingText="Deleting..."
 *     spinnerColor="error"
 *   />
 * </button>
 *
 * @example
 * // Inline action button
 * <button disabled={isProcessing}>
 *   <ButtonLoading
 *     loading={isProcessing}
 *     text="Process"
 *     spinnerSize="xs"
 *   />
 * </button>
 */

import { LoadingSpinner, type LoadingSpinnerProps } from './loading-spinner';

export interface ButtonLoadingProps {
    /** Whether the button is in loading state */
    loading: boolean;
    /** Text to show when not loading */
    text: string;
    /** Text to show when loading (optional, defaults to text) */
    loadingText?: string;
    /** FontAwesome icon class (shown when not loading) */
    icon?: string;
    /** Spinner size - defaults to 'sm' */
    spinnerSize?: LoadingSpinnerProps['size'];
    /** Spinner color */
    spinnerColor?: LoadingSpinnerProps['color'];
    /** Show spinner inline with text (default: true) */
    inline?: boolean;
}

export function ButtonLoading({
    loading,
    text,
    loadingText,
    icon,
    spinnerSize = 'sm',
    spinnerColor = 'default',
    inline = true,
}: ButtonLoadingProps) {
    if (loading) {
        return (
            <span className={inline ? 'flex items-center gap-2' : ''}>
                <LoadingSpinner size={spinnerSize} color={spinnerColor} />
                {loadingText && <span>{loadingText}</span>}
            </span>
        );
    }

    return (
        <span className={icon ? 'flex items-center gap-2' : ''}>
            {icon && <i className={icon}></i>}
            <span>{text}</span>
        </span>
    );
}
