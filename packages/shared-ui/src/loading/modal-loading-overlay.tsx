/**
 * Modal loading overlay component
 *
 * Use for initial modal data loading (full overlay)
 * For button-level loading in modals, use ButtonLoading instead
 *
 * @example
 * // Basic modal loading
 * <dialog open={isOpen}>
 *   <div className="modal-box">
 *     <ModalLoadingOverlay loading={isLoading}>
 *       <ModalContent />
 *     </ModalLoadingOverlay>
 *   </div>
 * </dialog>
 *
 * @example
 * // With custom message
 * <ModalLoadingOverlay loading={isLoading} message="Loading invitation...">
 *   <InvitationForm />
 * </ModalLoadingOverlay>
 */

import { LoadingSpinner } from './loading-spinner';

export interface ModalLoadingOverlayProps {
    /** Whether to show loading overlay */
    loading: boolean;
    /** Loading message */
    message?: string;
    /** Minimum height for loading area */
    minHeight?: string;
    /** Child content to show when not loading */
    children: React.ReactNode;
}

export function ModalLoadingOverlay({
    loading,
    message = 'Loading...',
    minHeight = 'min-h-[200px]',
    children,
}: ModalLoadingOverlayProps) {
    if (loading) {
        return (
            <div
                className={`flex flex-col items-center justify-center ${minHeight}`}
            >
                <LoadingSpinner size="lg" message={message} />
            </div>
        );
    }

    return <>{children}</>;
}
