"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { BaselEmptyState, BaselConfirmModal } from "@splits-network/basel-ui";
import BaselUploadDocumentModal from "@/components/basel/upload-document-modal";
import { useToast } from "@/lib/toast-context";
import { createAuthenticatedClient } from "@/lib/api-client";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface StepDocumentsProps {
    documents: any[];
    selected: string[];
    onChange: (docs: { selected: string[] }) => void;
    onNext: () => void;
    onDocumentsUpdated?: (newDocuments: any[]) => void;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function BaselStepDocuments({
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

    /* ─── Handlers ───────────────────────────────────────────────────────── */

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
            setError("Select at least one document to continue");
            return;
        }

        const selectedResumes = selected.filter((id) => {
            const doc = currentDocs.find((d) => d.id === id);
            return doc && doc.document_type === "resume";
        });

        if (selectedResumes.length === 0) {
            setError("A resume is required. Select one to continue");
            return;
        }

        if (selectedResumes.length > 1) {
            setError("Only one resume per application. Deselect one to continue");
            return;
        }

        onNext();
    };

    /* ─── Derived ────────────────────────────────────────────────────────── */

    const currentDocs = localDocuments.length > 0 ? localDocuments : documents;
    const currentResumes = currentDocs.filter(
        (doc) => doc.document_type === "resume",
    );
    const currentOtherDocs = currentDocs.filter(
        (doc) => doc.document_type !== "resume",
    );

    /* ─── Upload Modal (shared across both states) ───────────────────────── */

    const uploadPortal =
        showUploadModal && candidateId
            ? createPortal(
                  <BaselUploadDocumentModal
                      entityType="candidate"
                      entityId={candidateId}
                      documentType="resume"
                      onClose={() => setShowUploadModal(false)}
                      onSuccess={handleUploadSuccess}
                  />,
                  document.body,
              )
            : null;

    /* ─── Delete Confirm Modal ───────────────────────────────────────────── */

    const deletePortal = confirmDelete
        ? createPortal(
              <BaselConfirmModal
                  isOpen={!!confirmDelete}
                  onClose={() => setConfirmDelete(null)}
                  onConfirm={handleDeleteDocument}
                  title={/* COPY: delete modal title */ "Delete this document?"}
                  subtitle={/* COPY: delete modal subtitle */ "Permanent Action"}
                  confirmLabel={/* COPY: delete confirm button */ "Delete Document"}
                  cancelLabel={/* COPY: delete cancel button */ "Keep Document"}
                  confirming={!!deletingDocId}
                  confirmingLabel={/* COPY: delete confirming label */ "Deleting..."}
              >
                  <p className="text-sm text-base-content/70">
                      {/* COPY: delete confirmation message */}
                      Deleting{" "}
                      <strong>&quot;{confirmDelete.name}&quot;</strong>{" "}
                      will remove it permanently. Previously submitted applications are not affected.
                  </p>
              </BaselConfirmModal>,
              document.body,
          )
        : null;

    /* ─── Empty State ────────────────────────────────────────────────────── */

    if (currentDocs.length === 0) {
        return (
            <>
                <div className="space-y-6">
                    <BaselEmptyState
                        icon="fa-duotone fa-regular fa-cloud-arrow-up"
                        title={/* COPY: empty state title */ "No documents on file"}
                        description={
                            /* COPY: empty state description */
                            "A resume is required to apply. Upload one now and it will be available for all future applications."
                        }
                        actions={[
                            {
                                label: /* COPY: upload button label */ "Upload Resume",
                                style: "btn-primary",
                                icon: "fa-duotone fa-regular fa-upload",
                                onClick: handleUploadClick,
                            },
                            {
                                label: /* COPY: manage docs link label */ "View All Documents",
                                style: "btn-ghost",
                                icon: "fa-duotone fa-regular fa-folder-open",
                                href: "/portal/documents",
                            },
                        ]}
                    />

                    {error && (
                        <div className="border-l-4 border-error bg-error/5 p-4">
                            <div className="flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                                <span className="text-sm">{error}</span>
                            </div>
                        </div>
                    )}
                </div>

                {uploadPortal}
            </>
        );
    }

    /* ─── Document Selection ─────────────────────────────────────────────── */

    return (
        <>
            <div className="space-y-6">
                {/* Section header */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            {/* COPY: section kicker */}
                            Documents
                        </p>
                        <h3 className="text-xl font-black tracking-tight mb-2">
                            {/* COPY: section heading */}
                            Select your files
                        </h3>
                        <p className="text-sm text-base-content/60 leading-relaxed">
                            {/* COPY: section description */}
                            One resume is required. Add cover letters or
                            other supporting files if relevant.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="btn btn-sm btn-ghost"
                        onClick={handleUploadClick}
                    >
                        <i className="fa-duotone fa-regular fa-plus" />
                        {/* COPY: upload action label */}
                        Add File
                    </button>
                </div>

                {/* Error display */}
                {error && (
                    <div className="border-l-4 border-error bg-error/5 p-4">
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
                            {/* COPY: resumes section header */}
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

                {/* Additional Files */}
                {currentOtherDocs.length > 0 && (
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                            {/* COPY: additional files section header */}
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

                {/* Navigation footer */}
                <div className="flex justify-end border-t border-base-200 pt-6">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleNext}
                    >
                        {/* COPY: continue button label */}
                        Continue
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </button>
                </div>
            </div>

            {uploadPortal}
            {deletePortal}
        </>
    );
}
