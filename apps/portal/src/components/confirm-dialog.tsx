'use client';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'warning' | 'error' | 'info';
    loading?: boolean;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
    loading = false,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'error':
                return 'fa-circle-exclamation';
            case 'info':
                return 'fa-circle-info';
            default:
                return 'fa-triangle-exclamation';
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'error':
                return 'text-error';
            case 'info':
                return 'text-info';
            default:
                return 'text-warning';
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'error':
                return 'btn-error';
            case 'info':
                return 'btn-primary';
            default:
                return 'btn-warning';
        }
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <div className="flex items-start gap-4">
                    <div className={`text-2xl ${getIconColor()}`}>
                        <i className={`fa-duotone fa-regular ${getIcon()}`}></i>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{title}</h3>
                        <p className="text-base-content/80 mb-6">{message}</p>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                className="btn"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                className={`btn ${getConfirmButtonClass()}`}
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onCancel}>
                <button type="button">close</button>
            </form>
        </dialog>
    );
}
