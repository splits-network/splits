'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { getMyDocuments } from '@/lib/api-client';
import type { Document } from '@/lib/document-utils';

interface UploadDocumentsStepProps {
    documents: File[];
    existingDocumentIds: string[];
    primaryResumeIndex: number | null;
    primaryExistingDocId: string | null;
    onUpdate: (
        documents: File[],
        existingDocumentIds: string[],
        primaryResumeIndex: number | null,
        primaryExistingDocId: string | null
    ) => void;
    onNext: () => void;
}

const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function UploadDocumentsStep({
    documents,
    existingDocumentIds,
    primaryResumeIndex,
    primaryExistingDocId,
    onUpdate,
    onNext,
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

            const docs = await getMyDocuments(token);
            setExistingDocs(docs);
        } catch (err) {
            console.error('Failed to load existing documents:', err);
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
                setError(`${file.name} is not a supported file type. Please upload PDF or Word documents.`);
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(`${file.name} is too large. Maximum file size is 5MB.`);
                return;
            }
        }

        // Add new files to existing documents
        const newDocuments = [...documents, ...files];

        // If this is the first document being added and no primary is set, set it as primary
        let newPrimaryIndex = primaryResumeIndex;
        let newPrimaryExistingDocId = primaryExistingDocId;
        if (newPrimaryIndex === null && newPrimaryExistingDocId === null && newDocuments.length > 0) {
            newPrimaryIndex = 0;
        }

        onUpdate(newDocuments, existingDocumentIds, newPrimaryIndex, newPrimaryExistingDocId);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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
        if (!isSelected && primaryResumeIndex === null && primaryExistingDocId === null) {
            newPrimaryExistingDocId = docId;
        }

        onUpdate(documents, newExistingIds, primaryResumeIndex, newPrimaryExistingDocId);
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

        onUpdate(newDocuments, existingDocumentIds, newPrimaryIndex, primaryExistingDocId);
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

    const handleNext = () => {
        const totalDocCount = documents.length + existingDocumentIds.length;
        if (totalDocCount === 0) {
            setError('Please upload at least one document or select from your existing documents.');
            return;
        }
        if (primaryResumeIndex === null && primaryExistingDocId === null) {
            setError('Please select a primary resume.');
            return;
        }
        setError(null);
        onNext();
    };

    const totalDocCount = documents.length + existingDocumentIds.length;
    const hasPrimary = primaryResumeIndex !== null || primaryExistingDocId !== null;

    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold mb-2">
                    <i className="fa-solid fa-file-upload"></i>
                    {' '}Select or Upload Documents
                </h4>
                <p className="text-base-content/70 text-sm">
                    Select from your existing documents or upload new ones. At least one resume is required.
                </p>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Existing Documents */}
            {loadingDocs ? (
                <div className="flex items-center justify-center py-8">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : existingDocs.length > 0 ? (
                <div className="space-y-3">
                    <h5 className="font-semibold">Your Existing Documents</h5>
                    <div className="space-y-2">
                        {existingDocs.map((doc) => {
                            const isSelected = existingDocumentIds.includes(doc.id);
                            const isPrimary = primaryExistingDocId === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${isSelected ? 'bg-primary/10 border-2 border-primary' : 'bg-base-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleExistingDoc(doc.id)}
                                            className="checkbox checkbox-primary"
                                        />
                                        <i className="fa-solid fa-file text-primary"></i>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{doc.file_name}</div>
                                            <div className="text-sm text-base-content/60">
                                                {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isPrimary ? (
                                            <span className="badge badge-primary">Primary Resume</span>
                                        ) : isSelected ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimaryExistingDoc(doc.id)}
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
                <div className="alert">
                    <i className="fa-solid fa-info-circle"></i>
                    <span>You don't have any existing documents. Upload your first documents below.</span>
                </div>
            )}

            {/* Upload New Documents */}
            <div className="fieldset">
                <label className="label">Or Upload New Documents</label>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="file-input file-input-primary w-full"
                />
                <label className="label">
                    <span className="label-text-alt">
                        Accepted formats: PDF, DOC, DOCX • Maximum size: 5MB per file
                    </span>
                </label>
            </div>

            {/* Newly Uploaded Documents */}
            {documents.length > 0 && (
                <div className="space-y-3">
                    <h5 className="font-semibold">Newly Uploaded Documents ({documents.length})</h5>
                    <div className="space-y-2">
                        {documents.map((doc, index) => {
                            const isPrimary = primaryResumeIndex === index;

                            return (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-lg ${isPrimary ? 'bg-primary/10 border-2 border-primary' : 'bg-base-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <i className="fa-solid fa-file text-success"></i>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{doc.name}</div>
                                            <div className="text-sm text-base-content/60">
                                                {(doc.size / 1024).toFixed(1)} KB • New upload
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {isPrimary ? (
                                            <span className="badge badge-primary">Primary Resume</span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSetPrimaryNewDoc(index)}
                                                className="btn btn-xs btn-ghost"
                                            >
                                                Set as Primary
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewDocument(index)}
                                            className="btn btn-xs btn-ghost btn-circle text-error"
                                        >
                                            <i className="fa-solid fa-times"></i>
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
                    <i className="fa-solid fa-check-circle"></i>
                    <div>
                        <div className="font-semibold">Ready to Continue</div>
                        <div className="text-sm">
                            {totalDocCount} document{totalDocCount > 1 ? 's' : ''} selected with primary resume set.
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    disabled={totalDocCount === 0 || !hasPrimary}
                >
                    Next: Answer Questions
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    );
}
