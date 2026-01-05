'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface UploadDocumentModalProps {
    entityType: string;
    entityId: string;
    documentType?: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UploadDocumentModal({
    entityType,
    entityId,
    documentType = 'other',
    onClose,
    onSuccess,
}: UploadDocumentModalProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [selectedDocType, setSelectedDocType] = useState(documentType);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/rtf',
            ];
            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Please upload a PDF, DOC, DOCX, TXT, or RTF file');
                return;
            }
            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token available');
            }

            const client = createAuthenticatedClient(token);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('entity_type', entityType);
            formData.append('entity_id', entityId);
            formData.append('document_type', selectedDocType);

            await client.post('/documents', formData);
            onSuccess();
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Upload Document</h3>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="fieldset">
                        <label className="label">Document Type</label>
                        <select
                            className="select w-full"
                            value={selectedDocType}
                            onChange={(e) => setSelectedDocType(e.target.value)}
                            required
                        >
                            <option value="resume">Resume</option>
                            <option value="cover_letter">Cover Letter</option>
                            <option value="job_description">Job Description</option>
                            <option value="contract">Contract</option>
                            <option value="invoice">Invoice</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="fieldset">
                        <label className="label">
                            File *
                            <span className="label-text-alt text-base-content/60">
                                PDF, DOC, DOCX, TXT, or RTF - Max 10MB
                            </span>
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="file-input file-input-bordered w-full"
                            accept=".pdf,.doc,.docx,.txt,.rtf"
                            onChange={handleFileChange}
                            required
                        />
                        {file && (
                            <div className="mt-2 flex items-center gap-2">
                                <i className="fa-solid fa-file text-primary"></i>
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-base-content/60">
                                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs ml-auto"
                                    onClick={() => {
                                        setFile(null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = '';
                                        }
                                    }}
                                >
                                    <i className="fa-solid fa-times"></i>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="modal-action">
                        <button
                            type="button"
                            className="btn"
                            onClick={onClose}
                            disabled={uploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading || !file}
                        >
                            {uploading ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-upload"></i>
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </div>
    );
}
