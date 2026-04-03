"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useToast } from "@/lib/toast-context";
import { createAuthenticatedClient } from "@/lib/api-client";
import { WizardHelpZone } from "@splits-network/basel-ui";

interface StepDocumentsProps {
    documents: any[];
    selected: string[];
    onChange: (docs: { selected: string[] }) => void;
    onDocumentsUpdated?: (newDocuments: any[]) => void;
    error?: string | null;
}

export default function StepDocuments({
    documents,
    selected,
    onChange,
    onDocumentsUpdated,
    error: externalError,
}: StepDocumentsProps) {
    const { getToken } = useAuth();
    const { success, error: showError } = useToast();
    const [error, setError] = useState<string | null>(null);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [localDocuments, setLocalDocuments] = useState(documents);
    const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);

    // Inline upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadDocType, setUploadDocType] = useState("cover_letter");
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleToggleDocument = (docId: string) => {
        if (selected.includes(docId)) {
            onChange({ selected: selected.filter((id) => id !== docId) });
        } else {
            onChange({ selected: [...selected, docId] });
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

    const validateFile = useCallback((file: File): string | null => {
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];
        if (!allowedTypes.includes(file.type)) {
            return "Please upload a PDF or Word document (.pdf, .doc, .docx)";
        }
        if (file.size > 10 * 1024 * 1024) {
            return "File size must be less than 10 MB";
        }
        return null;
    }, []);

    const handleFileSelect = useCallback((file: File) => {
        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            return;
        }
        setUploadFile(file);
        setUploadError(null);
    }, [validateFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const reloadDocuments = async () => {
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

    const handleUpload = async () => {
        if (!uploadFile) return;

        const id = await getCandidateId();
        if (!id) {
            setUploadError("Unable to find your candidate profile. Please contact support.");
            return;
        }

        setUploading(true);
        setUploadError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token available");

            const formData = new FormData();
            formData.append("file", uploadFile);
            formData.append("entity_type", "candidate");
            formData.append("entity_id", id);
            formData.append("document_type", uploadDocType);

            const client = createAuthenticatedClient(token);
            await client.post("/documents", formData);

            setUploadFile(null);
            setUploadDocType("cover_letter");
            if (fileInputRef.current) fileInputRef.current.value = "";
            success(`"${uploadFile.name}" uploaded successfully`);
            await reloadDocuments();
        } catch (err: any) {
            console.error("Upload error:", err);
            setUploadError(
                err.response?.data?.error?.message ||
                    err.message ||
                    "Upload failed",
            );
        } finally {
            setUploading(false);
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
                onChange({ selected: selected.filter((id) => id !== docId) });
            }

            success(`"${fileName}" has been deleted`);
        } catch (err: any) {
            console.error("Failed to delete document:", err);
            showError(err.message || "Failed to delete document");
        } finally {
            setDeletingDocId(null);
        }
    };

    const currentDocs = localDocuments.length > 0 ? localDocuments : documents;
    // Filter out resumes — Smart Resume handles that now
    const supportingDocs = currentDocs.filter(
        (doc) => doc.document_type !== "resume",
    );

    /* ─── Inline Upload Zone ───────────────────────────────────────────── */

    const uploadZone = (
        <WizardHelpZone
            title="Upload a Document"
            description="Drag and drop a file or click to browse. Uploaded documents are saved to your library for reuse across applications."
            icon="fa-duotone fa-regular fa-cloud-arrow-up"
            tips={[
                "Accepted formats: PDF, DOC, DOCX — up to 10 MB",
                "Choose the document type so it's categorized correctly",
                "Uploaded files are saved to your document library for future applications",
            ]}
        >
        <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                Upload New Document
            </h4>

            {uploadError && (
                <div className="bg-error/5 border-l-4 border-error p-3 mb-3">
                    <div className="flex items-start gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5 text-xs" />
                        <span className="text-xs">{uploadError}</span>
                    </div>
                </div>
            )}

            {!uploadFile ? (
                <div
                    className={`border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-base-300 bg-base-200 hover:border-base-content/20"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                        }}
                    />
                    <i className={`fa-duotone fa-regular fa-cloud-arrow-up text-2xl mb-2 ${
                        isDragging ? "text-primary" : "text-base-content/30"
                    }`} />
                    <p className="text-sm font-semibold text-base-content/60">
                        {isDragging ? "Drop your file here" : "Drag and drop a file here"}
                    </p>
                    <p className="text-xs text-base-content/40 mt-1">
                        or <span className="text-primary font-semibold">browse your computer</span> · PDF, DOC, DOCX up to 10 MB
                    </p>
                </div>
            ) : (
                <div className="border border-base-300 bg-base-200 p-4 space-y-3">
                    {/* Selected file */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <i className="fa-duotone fa-regular fa-file-pdf text-primary text-sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{uploadFile.name}</p>
                            <p className="text-xs text-base-content/40">
                                {(uploadFile.size / 1024).toFixed(0)} KB
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn btn-ghost btn-xs btn-square"
                            onClick={() => {
                                setUploadFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            disabled={uploading}
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-xs" />
                        </button>
                    </div>

                    {/* Type + Upload */}
                    <div className="flex items-end gap-3">
                        <fieldset className="fieldset flex-1">
                            <legend className="fieldset-legend text-xs">Document Type</legend>
                            <select
                                className="select select-sm w-full"
                                value={uploadDocType}
                                onChange={(e) => setUploadDocType(e.target.value)}
                                disabled={uploading}
                            >
                                <option value="cover_letter">Cover Letter</option>
                                <option value="portfolio">Portfolio</option>
                                <option value="certification">Certification</option>
                                <option value="other">Other</option>
                            </select>
                        </fieldset>
                        <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-xs" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-upload" />
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
        </WizardHelpZone>
    );

    /* ─── Main Render ────────────────────────────────────────────────── */

    return (
        <>
            <div className="space-y-6">
                {/* Smart Resume indicator */}
                <div className="bg-primary/5 border-l-4 border-primary p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-file-user text-primary mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">Your Smart Resume will be used</p>
                            <p className="text-xs text-base-content/50 mt-0.5">
                                A tailored version of your Smart Resume is automatically generated for this role.
                                <Link href="/portal/smart-resume" className="text-primary font-semibold ml-1 hover:underline">
                                    Review your Smart Resume
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-black tracking-tight mb-2">
                        Supporting documents
                    </h3>
                    <p className="text-sm text-base-content/60 leading-relaxed">
                        Optionally attach portfolios, certifications, or other files
                        to strengthen your application.
                    </p>
                </div>

                {(error || externalError) && (
                    <div className="bg-error/5 border-l-4 border-error p-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-circle-exclamation text-error mt-0.5" />
                            <span className="text-sm">{error || externalError}</span>
                        </div>
                    </div>
                )}

                {/* Supporting Documents */}
                {supportingDocs.length > 0 && (
                    <WizardHelpZone
                        title="Your Documents"
                        description="Select any supporting documents to include with your application."
                        icon="fa-duotone fa-regular fa-folder-open"
                        tips={[
                            "Only include documents relevant to this specific role",
                            "Cover letters are handled in the next step",
                            "Portfolios and certifications can strengthen your application",
                        ]}
                    >
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-base-content/40 mb-3">
                            Available Documents
                        </h4>
                        <div className="space-y-2">
                            {supportingDocs.map((doc) => (
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
                    </WizardHelpZone>
                )}

                {/* Inline Upload */}
                {uploadZone}

            </div>

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
