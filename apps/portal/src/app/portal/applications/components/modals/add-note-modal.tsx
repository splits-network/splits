'use client';

import { AddNoteForm, type CreateNoteData } from '@splits-network/shared-ui';
import type { ApplicationNoteCreatorType } from '@splits-network/shared-types';

interface AddNoteModalProps {
    applicationId: string;
    currentUserId: string;
    creatorType: ApplicationNoteCreatorType;
    onClose: () => void;
    onSave: (data: CreateNoteData) => Promise<void>;
    loading?: boolean;
}

/**
 * Modal for adding notes to an application.
 * Supports note type and visibility selection based on user role.
 */
export default function AddNoteModal({
    applicationId,
    currentUserId,
    creatorType,
    onClose,
    onSave,
    loading = false,
}: AddNoteModalProps) {
    const handleSubmit = async (data: CreateNoteData) => {
        await onSave(data);
        onClose();
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-note-sticky mr-2"></i>
                    Add Note
                </h3>

                <AddNoteForm
                    applicationId={applicationId}
                    currentUserId={currentUserId}
                    creatorType={creatorType}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    showNoteTypeSelector={true}
                    loading={loading}
                />
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button type="button">close</button>
            </form>
        </dialog>
    );
}
