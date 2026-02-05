"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import UploadDocumentModal from "@/components/upload-document-modal";
import { useToast } from "@/lib/toast-context";
import { createAuthenticatedClient } from "@/lib/api-client";

interface StepDocumentsProps {
    documents: any[];
    selected: string[];
    onChange: (docs: { selected: string[] }) => void;
    onNext: () => void;
    onDocumentsUpdated?: (newDocuments: any[]) => void;
}

export default function StepDocuments({
    documents,
    selected,
    onChange,
    onNext,
    onDocumentsUpdated,
}: StepDocumentsProps) {
    const { getToken } = useAuth();
    const { success, error: showError } = useToast();
    const [error, setError] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [localDocuments, setLocalDocuments] = useState(documents);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    const handleToggleDocument = (docId: string) => {
        const currentDocs =
            localDocuments.length > 0 ? localDocuments : documents;
        const doc = currentDocs.find((d) => d.id === docId);

        if (selected.includes(docId)) {
            // Deselect document
            const newSelected = selected.filter((id) => id !== docId);
            onChange({ selected: newSelected });
        } else {
            // Select document - enforce single resume rule
            if (doc?.document_type === "resume") {
                // Only allow one resume - remove any existing resume selection
                const newSelected = selected.filter((id) => {
                    const existingDoc = currentDocs.find((d) => d.id === id);
                    return existingDoc?.document_type !== "resume";
                });
                newSelected.push(docId);
                onChange({ selected: newSelected });
            } else {
                // Non-resume documents can be selected freely
                const newSelected = [...selected, docId];
                onChange({ selected: newSelected });
            }
        }
        setError(null);
    };

    const getCandidateId = async () => {
        if (candidateId) return candidateId;

        try {
            const token = await getToken();
            if (!token) {
                console.error("No auth token available");
                return null;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get("/candidates", {
                params: { limit: 1 },
            });
            const profile = response.data?.[0];
            if (!profile?.id) {
                console.error("No candidate profile found");
                return null;
            }

            setCandidateId(profile.id);
            return profile.id;
        } catch (err) {
            console.error("Failed to get candidate ID:", err);
            return null;
        }
    };

    const handleUploadClick = async () => {
        const id = await getCandidateId();
        if (!id) {
            setError(
                "Failed to find candidate profile. Please contact support.",
            );
            return;
        }
        setShowUploadModal(true);
    };

    const handleUploadSuccess = async () => {
        setShowUploadModal(false);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get("/documents");
            const updatedDocs = response.data || [];
            setLocalDocuments(updatedDocs);
            if (onDocumentsUpdated) {
                onDocumentsUpdated(updatedDocs);
            }
        } catch (err: any) {
            console.error("Failed to reload documents:", err);
            setError(err.message || "Failed to reload documents");
        }
    };

    const handleDeleteDocument = async () => {
        if (!confirmDelete) return;

        const { id: docId, name: fileName } = confirmDelete;
        setDeletingDocId(docId);
        setError(null);
        setConfirmDelete(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }

            const client = createAuthenticatedClient(token);
            await client.delete(`/documents/${docId}`);

            // Remove from local state
            const updatedDocs = localDocuments.filter((d) => d.id !== docId);
            setLocalDocuments(updatedDocs);
            if (onDocumentsUpdated) {
                onDocumentsUpdated(updatedDocs);
            }

            // Remove from selected if it was selected
            if (selected.includes(docId)) {
                const newSelected = selected.filter((id) => id !== docId);
                onChange({
                    selected: newSelected,
                });
            }

            success(`"${fileName}" has been deleted`);
        } catch (err: any) {
            console.error("Failed to delete document:", err);
            showError(err.message || "Failed to delete document");
        } finally {
            setDeletingDocId(null);
        }
    };

    const handleNext = () => {
        const currentDocs =
            localDocuments.length > 0 ? localDocuments : documents;

        // Validation
        if (selected.length === 0) {
            setError("Please select at least one document");
            return;
        }

        const selectedResumes = selected.filter((id) => {
            const doc = currentDocs.find((d) => d.id === id);
            return doc && doc.document_type === "resume";
        });

        if (selectedResumes.length === 0) {
            setError("Please select exactly one resume");
            return;
        }

        if (selectedResumes.length > 1) {
            setError("Please select only one resume per application");
            return;
        }

        onNext();
    };

    const currentDocs = localDocuments.length > 0 ? localDocuments : documents;
    const currentResumes = currentDocs.filter(
        (doc) => doc.document_type === "resume",
    );
    const currentOtherDocs = currentDocs.filter(
        (doc) => doc.document_type !== "resume",
    );

    if (currentDocs.length === 0) {
        return (
            <>
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">
                            Upload Your Resume
                        </h2>
                        <p className="text-base-content/70">
                            To apply for this position, please upload your
                            resume or CV.
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="card bg-base-200">
                        <div className="card-body">
                            <button
                                type="button"
                                className="btn btn-primary btn-block"
                                onClick={handleUploadClick}
                            >
                                <i className="fa-duotone fa-regular fa-upload"></i>
                                Upload Document
                            </button>

                            <div className="divider">OR</div>

                            <Link
                                href="/documents"
                                className="btn btn-ghost btn-block"
                            >
                                <i className="fa-duotone fa-regular fa-folder-open"></i>
                                Manage Documents
                            </Link>
                        </div>
                    </div>
                </div>

                {showUploadModal && candidateId && (
                    <UploadDocumentModal
                        entityType="candidate"
                        entityId={candidateId}
                        documentType="resume"
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={handleUploadSuccess}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold mb-2">
                            Select Documents
                        </h2>
                        <p className="text-base-content/70">
                            Choose which documents to include with your
                            application. Exactly one resume is required.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={handleUploadClick}
                    >
                        <i className="fa-duotone fa-regular fa-plus"></i>
                        Upload More
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                {/* Resumes */}
                {currentResumes.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Resumes</h3>
                        <div className="space-y-2">
                            {currentResumes.map((doc) => (
                                <div key={doc.id} className="card bg-base-200">
                                    <div className="card-body p-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={selected.includes(
                                                    doc.id,
                                                )}
                                                onChange={() =>
                                                    handleToggleDocument(doc.id)
                                                }
                                                disabled={
                                                    deletingDocId === doc.id
                                                }
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {doc.file_name}
                                                </div>
                                                <div className="text-sm text-base-content/60">
                                                    {doc.file_size &&
                                                        `${(doc.file_size / 1024).toFixed(1)} KB`}
                                                    {doc.created_at &&
                                                        ` • Uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-ghost btn-square text-error"
                                                    onClick={() =>
                                                        setConfirmDelete({
                                                            id: doc.id,
                                                            name: doc.file_name,
                                                        })
                                                    }
                                                    disabled={
                                                        deletingDocId === doc.id
                                                    }
                                                    title="Delete document"
                                                >
                                                    {deletingDocId ===
                                                    doc.id ? (
                                                        <span className="loading loading-spinner loading-xs"></span>
                                                    ) : (
                                                        <i className="fa-duotone fa-regular fa-trash"></i>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Documents */}
                {currentOtherDocs.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3">
                            Additional Documents
                        </h3>
                        <div className="space-y-2">
                            {currentOtherDocs.map((doc) => (
                                <div key={doc.id} className="card bg-base-200">
                                    <div className="card-body p-4">
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary"
                                                checked={selected.includes(
                                                    doc.id,
                                                )}
                                                onChange={() =>
                                                    handleToggleDocument(doc.id)
                                                }
                                                disabled={
                                                    deletingDocId === doc.id
                                                }
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium">
                                                    {doc.file_name}
                                                </div>
                                                <div className="text-sm text-base-content/60">
                                                    {doc.document_type}
                                                    {doc.file_size &&
                                                        ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-ghost btn-square text-error"
                                                onClick={() =>
                                                    setConfirmDelete({
                                                        id: doc.id,
                                                        name: doc.file_name,
                                                    })
                                                }
                                                disabled={
                                                    deletingDocId === doc.id
                                                }
                                                title="Delete document"
                                            >
                                                {deletingDocId === doc.id ? (
                                                    <span className="loading loading-spinner loading-xs"></span>
                                                ) : (
                                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                    >
                        Next: Questions
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                </div>
            </div>

            {showUploadModal && candidateId && (
                <UploadDocumentModal
                    entityType="candidate"
                    entityId={candidateId}
                    documentType="resume"
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <dialog open className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Document</h3>
                        <p className="py-4">
                            Are you sure you want to delete{" "}
                            <strong>"{confirmDelete.name}"</strong>? This action
                            cannot be undone.
                        </p>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn"
                                onClick={() => setConfirmDelete(null)}
                                disabled={deletingDocId === confirmDelete.id}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-error"
                                onClick={handleDeleteDocument}
                                disabled={deletingDocId === confirmDelete.id}
                            >
                                {deletingDocId === confirmDelete.id ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-trash"></i>
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div
                        className="modal-backdrop"
                        onClick={() => setConfirmDelete(null)}
                    >
                        <button type="button">close</button>
                    </div>
                </dialog>
            )}
        </>
    );
}
