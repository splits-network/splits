'use client';

import { useState } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface AddNoteModalProps {
    applicationId: string;
    onClose: () => void;
    onSave: (note: string) => Promise<void>;
    loading: boolean;
}

/**
 * Modal for adding recruiter notes to an application.
 * Allows recruiters to add context, observations, or follow-up actions.
 */
export default function AddNoteModal({
    applicationId,
    onClose,
    onSave,
    loading,
}: AddNoteModalProps) {
    const [note, setNote] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;
        await onSave(note);
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-note-sticky mr-2"></i>
                    Add Recruiter Note
                </h3>

                <form onSubmit={handleSubmit}>
                    <MarkdownEditor
                        className="fieldset"
                        label="Note"
                        value={note}
                        onChange={setNote}
                        placeholder="Add context, observations, or follow-up actions..."
                        helperText="This note will be visible to other recruiters and company users"
                        height={180}
                        preview="edit"
                        disabled={loading}
                    />

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading || !note.trim()}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Save Note
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
