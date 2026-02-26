"use client";

import { AddNoteForm, type CreateNoteData } from "@splits-network/shared-ui";
import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
} from "@splits-network/basel-ui";
import type { ApplicationNoteCreatorType } from "@splits-network/shared-types";

interface AddNoteModalProps {
    applicationId: string;
    currentUserId: string;
    creatorType: ApplicationNoteCreatorType;
    onClose: () => void;
    onSave: (data: CreateNoteData) => Promise<void>;
    loading?: boolean;
}

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
        <BaselModal isOpen onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Add Note"
                subtitle="Application Record"
                icon="fa-note-sticky"
                iconColor="primary"
                onClose={onClose}
            />

            <BaselModalBody>
                <AddNoteForm
                    applicationId={applicationId}
                    currentUserId={currentUserId}
                    creatorType={creatorType}
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    showNoteTypeSelector={true}
                    loading={loading}
                />
            </BaselModalBody>
        </BaselModal>
    );
}