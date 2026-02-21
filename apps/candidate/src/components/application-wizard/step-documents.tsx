"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
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
            const newSelected = selected.filter((id) => id !== docId);
            onChange({ selected: newSelected });
        } else {
            if (doc?.document_type === "resume") {
                const newSelected = selected.filter((id) => {
                    const existingDoc = currentDocs.find((d) => d.id === id);
                    return existingDoc?.document_type !== "resume";
                });
                newSelected.push(docId);
                onChange({ selected: newSelected });
            } else {
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
            if (!token) return null;

            const client = createAuthenticatedClient(token);
            const response = await client.get("/candidates", {
                params: { limit: 1 },
            });
            const profile = response.data?.[0];
            if (!profile?.id) return null;

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
                "Unable to find your candidate profile. Please contact support.",
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
            if (!token) throw new Error("Authentication required");

            const client = createAuthenticatedClient(token);
            await client.delete(`/documents/${docId}`);

            const updatedDocs = localDocuments.filter((d) => d.id !== docId);
            setLocalDocuments(updatedDocs);
            if (onDocumentsUpdated) {
                onDocumentsUpdated(updatedDocs);
            }

            if (selected.includes(docId)) {
                const newSelected = selected.filter((id) => id !== docId);
                onChange({ selected: newSelected });
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

        if (selected.length === 0) {
            setError("Select at least one document to continue.");
            return;
        }

        const selectedResumes = selected.filter((id) => {
            const doc = currentDocs.find((d) => d.id === id);
            return doc && doc.document_type === "resume";
        });

        if (selectedResumes.length === 0) {
            setError("A resume is required. Please select one to continue.");
            return;
        }

        if (selectedResumes.length > 1) {
            setError("Only one resume can be attached per application.");
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

    /* ─── Empty State ─────────────────────────────────────────────────── */

    if (currentDocs.length === 0) {
        return (
            <>
                <div className="space-y-6">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            Getting Started
                        </p>
                        <h3 className="text-xl font-black tracking-tight mb-2">
                            Upload your resume
                        </h3>
                        <p className="text-sm text-base-content/60 leading-relaxed">
                            We need at least one resume on file before you can
                            apply. Upload yours now and you can reuse it for
                            future applications too.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-error/5 border-l-4 border-error p-4">
                            <div className="flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="bg-base-200 p-8 text-center">
                        <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <i className="fa-duotone fa-regular fa-cloud-arrow-up text-2xl text-primary" />
                        </div>
                        <button
                            type="button"
                            className="btn btn-primary mb-3"
                            onClick={handleUploadClick}
                        >
                            <i className="fa-duotone fa-regular fa-upload" />
                            Upload Resume
                        </button>
                        <p className="text-xs text-base-content/40">
                            PDF or DOC, up to 10 MB
                        </p>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/portal/documents"
                            className="text-sm text-primary hover:underline"
                        >
                            <i className="fa-duotone fa-regular fa-folder-open mr-1" />
                            Or manage your documents library
                        </Link>
                    </div>
                </div>

                {showUploadModal && candidateId &&
                    createPortal(
                        <UploadDocumentModal
                            entityType="candidate"
                            entityId={candidateId}
                            documentType="resume"
                            onClose={() => setShowUploadModal(false)}
                            onSuccess={handleUploadSuccess}
                        />,
                        document.body,
                    )}
            </>
        );
    }

    /* ─── Document Selection ──────────────────────────────────────────── */

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            Step 1
                        </p>
                        <h3 className="text-xl font-black tracking-tight mb-2">
                            Choose your documents
                        </h3>
                        <p className="text-sm text-base-content/60 leading-relaxed">
                            Select one resume (required) and any supporting
                            files you'd like to include.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={handleUploadClick}
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        Upload
                    </button>
                </div>

                {error && (
                    <div className="bg-error/5 border-l-4 border-error p-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Resumes */}
                {currentResumes.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                            Resumes
                        </h4>
                        <div className="space-y-2">
                            {currentResumes.map((doc) => (
                                <label
                                    key={doc.id}
                                    className={`flex items-center gap-4 p-4 border-l-4 cursor-pointer transition-colors ${
                                        selected.includes(doc.id)
                                            ? "border-primary bg-primary/5"
                                            : "border-base-300 bg-base-200 hover:bg-base-200/80"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={selected.includes(doc.id)}
                                        onChange={() =>
                                            handleToggleDocument(doc.id)
                                        }
                                        disabled={deletingDocId === doc.id}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">
                                            {doc.file_name}
                                        </div>
                                        <div className="text-xs text-base-content/40">
                                            {doc.file_size &&
                                                `${(doc.file_size / 1024).toFixed(0)} KB`}
                                            {doc.created_at &&
                                                ` · Uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-ghost btn-square text-error/60 hover:text-error"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConfirmDelete({
                                                id: doc.id,
                                                name: doc.file_name,
                                            });
                                        }}
                                        disabled={deletingDocId === doc.id}
                                        title="Delete document"
                                    >
                                        {deletingDocId === doc.id ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <i className="fa-duotone fa-regular fa-trash text-xs" />
                                        )}
                                    </button>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Other Documents */}
                {currentOtherDocs.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                            Additional Files
                        </h4>
                        <div className="space-y-2">
                            {currentOtherDocs.map((doc) => (
                                <label
                                    key={doc.id}
                                    className={`flex items-center gap-4 p-4 border-l-4 cursor-pointer transition-colors ${
                                        selected.includes(doc.id)
                                            ? "border-secondary bg-secondary/5"
                                            : "border-base-300 bg-base-200 hover:bg-base-200/80"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-secondary"
                                        checked={selected.includes(doc.id)}
                                        onChange={() =>
                                            handleToggleDocument(doc.id)
                                        }
                                        disabled={deletingDocId === doc.id}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm truncate">
                                            {doc.file_name}
                                        </div>
                                        <div className="text-xs text-base-content/40">
                                            {doc.document_type}
                                            {doc.file_size &&
                                                ` · ${(doc.file_size / 1024).toFixed(0)} KB`}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-ghost btn-square text-error/60 hover:text-error"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setConfirmDelete({
                                                id: doc.id,
                                                name: doc.file_name,
                                            });
                                        }}
                                        disabled={deletingDocId === doc.id}
                                        title="Delete document"
                                    >
                                        {deletingDocId === doc.id ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <i className="fa-duotone fa-regular fa-trash text-xs" />
                                        )}
                                    </button>
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex justify-end border-t border-base-200 pt-6">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                    >
                        Continue
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </button>
                </div>
            </div>

            {showUploadModal && candidateId &&
                createPortal(
                    <UploadDocumentModal
                        entityType="candidate"
                        entityId={candidateId}
                        documentType="resume"
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={handleUploadSuccess}
                    />,
                    document.body,
                )}

            {/* Delete Confirmation */}
            {confirmDelete &&
                createPortal(
                    <div className="modal modal-open" role="dialog" style={{ zIndex: 9999 }}>
                        <div
                            className="modal-backdrop bg-neutral/60"
                            onClick={() => setConfirmDelete(null)}
                        />
                        <div className="modal-box max-w-md bg-base-100 p-0 overflow-hidden">
                            <div className="bg-error/10 px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-error flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error-content" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-error">
                                            Delete Document
                                        </h3>
                                        <p className="text-xs text-error/60 uppercase tracking-wider">
                                            This cannot be undone
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8">
                                <p className="text-sm text-base-content/70 mb-6">
                                    Are you sure you want to permanently delete{" "}
                                    <strong>"{confirmDelete.name}"</strong>?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-ghost flex-1"
                                        onClick={() => setConfirmDelete(null)}
                                        disabled={
                                            deletingDocId === confirmDelete.id
                                        }
                                    >
                                        Keep It
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-error flex-1"
                                        onClick={handleDeleteDocument}
                                        disabled={
                                            deletingDocId === confirmDelete.id
                                        }
                                    >
                                        {deletingDocId === confirmDelete.id ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-duotone fa-regular fa-trash" />
                                                Delete
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </>
    );
}
