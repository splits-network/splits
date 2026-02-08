'use client';

import { useState, FormEvent } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import CompanyDocumentUpload, { StagedDocument } from '@/components/documents/company-document-upload';

interface ApproveGateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApprove: (notes?: string) => Promise<void>;
    candidateName: string;
    jobTitle: string;
    gateName: string;
    applicationId?: string;
    currentStage?: string;
}

export default function ApproveGateModal({
    isOpen,
    onClose,
    onApprove,
    candidateName,
    jobTitle,
    gateName,
    applicationId,
    currentStage,
}: ApproveGateModalProps) {
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDocumentUpload, setShowDocumentUpload] = useState(false);
    const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);
    const [uploadingDocuments, setUploadingDocuments] = useState(false);

    const { getToken } = useAuth();

    // Check if this is an offer transition (interview → offer)
    const isOfferTransition = currentStage === 'interview';

    // Modal title builder based on transition type
    const getTitleText = () => {
        switch (currentStage) {
            case 'screen':
                return 'Approve & Submit to Company';
            case 'submitted':
                return 'Approve & Move to Company Review';
            case 'company_review':
                return 'Approve & Move Forward';
            case 'recruiter_review':
                return 'Approve & Submit to Company';
            case 'recruiter_proposed':
                return 'Approve Proposal for Company Review';
            case 'company_feedback':
                return 'Approve & Continue';
            case 'interview':
                return 'Extend Offer';
            default:
                return 'Approve';
        }
    };

    const uploadStagedDocuments = async (): Promise<void> => {
        if (stagedDocuments.length === 0) return;

        setUploadingDocuments(true);
        const token = await getToken();
        if (!token) {
            throw new Error('Not authenticated');
        }

        const client = createAuthenticatedClient(token);
        const uploadPromises = stagedDocuments.map(async (doc) => {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('entity_type', 'application');
            formData.append('entity_id', applicationId!);
            formData.append('document_type', doc.document_type);

            return client.post<{ data: any }>('/documents', formData);
        });

        try {
            await Promise.all(uploadPromises);
        } finally {
            setUploadingDocuments(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // Upload documents first if there are any staged
            if (isOfferTransition && stagedDocuments.length > 0) {
                await uploadStagedDocuments();
            }

            await onApprove(notes.trim() || undefined);

            // Reset all state
            setNotes('');
            setStagedDocuments([]);
            onClose();
        } catch (err) {
            console.error('Failed to approve gate:', err);
            setError(err instanceof Error ? err.message : 'Failed to approve application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!submitting) {
            setNotes('');
            setError(null);
            setShowDocumentUpload(false);
            setStagedDocuments([]);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    <i className="fa-duotone fa-regular fa-circle-check text-success mr-2"></i>
                    {getTitleText()}
                </h3>

                <div className="mb-4">
                    <p className="text-sm text-base-content/70 mb-2">
                        You are approving this application at the {gateName} gate:
                    </p>
                    <div className="bg-base-200 p-3 rounded">
                        <p className="font-semibold">{candidateName}</p>
                        <p className="text-sm text-base-content/70">{jobTitle}</p>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Document Upload Section for Offer Transitions */}
                    {isOfferTransition && applicationId && (
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-duotone fa-regular fa-file-contract text-primary"></i>
                                <h4 className="font-semibold">Offer Documents (Optional)</h4>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                                >
                                    {showDocumentUpload ? (
                                        <>
                                            <i className="fa-duotone fa-regular fa-chevron-up"></i>
                                            Hide
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-chevron-down"></i>
                                            Add Documents
                                        </>
                                    )}
                                </button>
                            </div>

                            <p className="text-sm text-base-content/70 mb-3">
                                Upload offer letters, contracts, or other documents to include with your offer.
                            </p>

                            {showDocumentUpload && (
                                <div className="bg-base-100 border border-base-300 rounded-lg p-4">
                                    <CompanyDocumentUpload
                                        entityType="application"
                                        entityId={applicationId}
                                        staged={true}
                                        onFilesStaged={(files) => setStagedDocuments(files)}
                                        onError={(error) => {
                                            console.error('Document staging failed:', error);
                                            setError(error);
                                        }}
                                        compact={true}
                                        maxSizeKB={5120}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <MarkdownEditor
                        className="fieldset mb-4"
                        label="Approval Notes (Optional)"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Add any notes or feedback for the next reviewer..."
                        helperText="These notes will be visible to the next gate reviewer and the candidate."
                        height={160}
                        preview="edit"
                        disabled={submitting}
                    />

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            className="btn"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-success"
                            disabled={submitting || uploadingDocuments}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    {uploadingDocuments ? 'Uploading Documents...' : 'Approving...'}
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    {isOfferTransition && stagedDocuments.length > 0
                                        ? `Extend Offer (${stagedDocuments.length} document${stagedDocuments.length !== 1 ? 's' : ''})`
                                        : 'Approve Application'
                                    }
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={handleClose}></div>
        </div>
    );
}
