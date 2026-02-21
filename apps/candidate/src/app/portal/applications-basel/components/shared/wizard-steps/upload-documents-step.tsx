"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Document } from "@/lib/document-utils";

interface UploadDocumentsStepProps {
    documents: File[];
    existingDocumentIds: string[];
    primaryResumeIndex: number | null;
    primaryExistingDocId: string | null;
    onUpdate: (
        documents: File[],
        existingDocumentIds: string[],
        primaryResumeIndex: number | null,
        primaryExistingDocId: string | null,
    ) => void;
}

const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadDocumentsStep({
    documents,
    existingDocumentIds,
    primaryResumeIndex,
    primaryExistingDocId,
    onUpdate,
}: UploadDocumentsStepProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [existingDocs, setExistingDocs] = useState<Document[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(true);

    useEffect(() => {
        loadExistingDocuments();
    }, []);

    const loadExistingDocuments = async () => {
        try {
            const token = await getToken();
            if (!token) {
                setLoadingDocs(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get("/documents");
            const docs = response.data || response;
            setExistingDocs(docs);
        } catch (err) {
            console.error("Failed to load existing documents:", err);
        } finally {
            setLoadingDocs(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setError(null);

        // Validate files
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(
                    `${file.name} is not a supported file type. Please upload PDF or Word `,
                );
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(
                    `${file.name} is too large. Maximum file size is 5MB.`,
                );
                return;
            }
        }

        // Add new files to existing documents
        const newDocuments = [...documents, ...files];

        // If this is the first document being added and no primary is set, set it as primary
        let newPrimaryIndex = primaryResumeIndex;
        let newPrimaryExistingDocId = primaryExistingDocId;
        if (
            newPrimaryIndex === null &&
            newPrimaryExistingDocId === null &&
            newDocuments.length > 0
        ) {
            newPrimaryIndex = 0;
        }

        onUpdate(
            newDocuments,
            existingDocumentIds,
            newPrimaryIndex,
            newPrimaryExistingDocId,
        );

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleToggleExistingDoc = (docId: string) => {
        const isSelected = existingDocumentIds.includes(docId);
        const newExistingIds = isSelected
            ? existingDocumentIds.filter((id) => id !== docId)
            : [...existingDocumentIds, docId];

        // If deselecting the primary, clear it
        let newPrimaryExistingDocId = primaryExistingDocId;
        if (isSelected && primaryExistingDocId === docId) {
            newPrimaryExistingDocId = null;
        }

        // If this is the first document and no primary is set, set it as primary
        if (
            !isSelected &&
            primaryResumeIndex === null &&
            primaryExistingDocId === null
        ) {
            newPrimaryExistingDocId = docId;
        }

        onUpdate(
            documents,
            newExistingIds,
            primaryResumeIndex,
            newPrimaryExistingDocId,
        );
    };

    const handleRemoveNewDocument = (index: number) => {
        const newDocuments = documents.filter((_, i) => i !== index);

        // Adjust primary index if needed
        let newPrimaryIndex = primaryResumeIndex;
        if (primaryResumeIndex === index) {
            newPrimaryIndex = newDocuments.length > 0 ? 0 : null;
        } else if (primaryResumeIndex !== null && primaryResumeIndex > index) {
            newPrimaryIndex = primaryResumeIndex - 1;
        }

        onUpdate(
            newDocuments,
            existingDocumentIds,
            newPrimaryIndex,
            primaryExistingDocId,
        );
    };

    const handleSetPrimaryNewDoc = (index: number) => {
        onUpdate(documents, existingDocumentIds, index, null);
    };

    const handleSetPrimaryExistingDoc = (docId: string) => {
        // Make sure it's selected
        const newExistingIds = existingDocumentIds.includes(docId)
            ? existingDocumentIds
            : [...existingDocumentIds, docId];

        onUpdate(documents, newExistingIds, null, docId);
    };

    const totalDocCount = documents.length + existingDocumentIds.length;
    const hasPrimary =
        primaryResumeIndex !== null || primaryExistingDocId !== null;

    return (
        <div className="space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    Step 1
                </p>
                <h4 className="text-sm font-black tracking-tight mb-2">
                    Select or Upload Documents
                </h4>
                <p className="text-base-content/70 text-sm">
                    Select from your existing documents or upload new ones. At
                    least one resume is required.
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

            {/* Existing Documents */}
            {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : existingDocs.length > 0 ? (
                <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        Your Existing Documents
                    </h5>
                    <div className="space-y-2">
                        {existingDocs.map((doc) => {
                            const isSelected = existingDocumentIds.includes(
                                doc.id,
                            );
                            const isPrimary = primaryExistingDocId === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className={`flex items-center justify-between p-4 transition-colors ${
                                        isSelected
                                            ? "bg-primary/10 border-2 border-primary"
                                            : "bg-base-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                handleToggleExistingDoc(doc.id)
                                            }
                                            className="checkbox checkbox-primary"
                                        />
                                        <i className="fa-duotone fa-regular fa-file text-primary"></i>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">
                                                {doc.file_name}
                                            </div>
                                            <div className="text-xs text-base-content/40">
                                                {doc.document_type} •{" "}
                                                {(doc.file_size / 1024).toFixed(
                                                    1,
                                                )}{" "}
                                                KB
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isPrimary ? (
                                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-primary/15 text-primary">
                                                Primary Resume
                                            </span>
                                        ) : isSelected ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetPrimaryExistingDoc(
                                                        doc.id,
                                                    )
                                                }
                                                className="btn btn-xs btn-ghost"
                                            >
                                                Set as Primary
                                            </button>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="bg-info/5 border-l-4 border-info p-4">
                    <div className="flex items-start gap-3">
                        <i className="fa-duotone fa-regular fa-info-circle text-info mt-0.5" />
                        <span className="text-sm">
                            You don't have any existing documents. Upload your first documents
                            below.
                        </span>
                    </div>
                </div>
            )}

            {/* Upload New Documents */}
            <fieldset className="fieldset">
                <legend className="fieldset-legend">
                    Or Upload New Documents
                </legend>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="file-input file-input-primary w-full"
                    style={{ borderRadius: 0 }}
                />
                <p className="fieldset-label">
                    Accepted formats: PDF, DOC, DOCX • Maximum size: 5MB per
                    file
                </p>
            </fieldset>

            {/* Newly Uploaded Documents */}
            {documents.length > 0 && (
                <div className="space-y-3">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
                        Newly Uploaded Documents ({documents.length})
                    </h5>
                    <div className="space-y-2">
                        {documents.map((doc, index) => {
                            const isPrimary = primaryResumeIndex === index;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 ${
                                        isPrimary
                                            ? "bg-primary/10 border-2 border-primary"
                                            : "bg-base-200"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <i className="fa-duotone fa-regular fa-file text-success"></i>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm truncate">
                                                {doc.name}
                                            </div>
                                            <div className="text-xs text-base-content/40">
                                                {(doc.size / 1024).toFixed(1)}{" "}
                                                KB • New upload
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isPrimary ? (
                                            <span className="text-[10px] uppercase tracking-[0.15em] font-bold px-2 py-1 bg-primary/15 text-primary">
                                                Primary Resume
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleSetPrimaryNewDoc(
                                                        index,
                                                    )
                                                }
                                                className="btn btn-xs btn-ghost"
                                            >
                                                Set as Primary
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveNewDocument(index)
                                            }
                                            className="btn btn-xs btn-ghost btn-square text-error"
                                        >
                                            <i className="fa-duotone fa-regular fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {totalDocCount > 0 && hasPrimary && (
                <div className="alert alert-success">
                    <i className="fa-duotone fa-regular fa-check-circle"></i>
                    <div>
                        <div className="font-bold text-sm">Ready to Continue</div>
                        <div className="text-sm">
                            {totalDocCount} document
                            {totalDocCount > 1 ? "s" : ""} selected with primary
                            resume set.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
