'use client';

import { useState, useRef, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';

interface StagedDocument {
    file: File;
    document_type: string;
    id: string; // temporary ID for UI
}

interface CompanyDocumentUploadProps {
    entityType: 'application' | 'job' | 'company';
    entityId: string;
    onUploadSuccess?: () => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    className?: string;
    compact?: boolean;
    allowedTypes?: string[];
    maxSizeKB?: number;
    staged?: boolean;
    onFilesStaged?: (files: StagedDocument[]) => void;
}

const COMPANY_DOCUMENT_TYPES = [
    { value: 'offer_letter', label: 'Offer Letter' },
    { value: 'employment_contract', label: 'Employment Contract' },
    { value: 'benefits_summary', label: 'Benefits Summary' },
    { value: 'company_handbook', label: 'Employee Handbook' },
    { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
    { value: 'company_document', label: 'Other Business Document' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];

interface UploadedDocument {
    id?: string;
    filename: string;
    document_type: string;
    size: number;
    uploaded_at?: string;
}

export type { StagedDocument };

export default function CompanyDocumentUpload({
    entityType,
    entityId,
    onUploadSuccess,
    onError,
    disabled = false,
    className = '',
    compact = false,
    allowedTypes,
    maxSizeKB,
    staged = false,
    onFilesStaged,
}: CompanyDocumentUploadProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
    const [stagedDocuments, setStagedDocuments] = useState<StagedDocument[]>([]);

    // Filter document types based on allowedTypes prop
    const availableDocumentTypes = allowedTypes
        ? COMPANY_DOCUMENT_TYPES.filter(type => allowedTypes.includes(type.value))
        : COMPANY_DOCUMENT_TYPES;

    const [documentType, setDocumentType] = useState<string>(availableDocumentTypes[0]?.value || 'offer_letter');

    // Use custom max size if provided, otherwise use default
    const maxFileSize = maxSizeKB ? maxSizeKB * 1024 : MAX_FILE_SIZE;

    const validateFile = (file: File): string | null => {
        if (file.size > maxFileSize) {
            const sizeLimitMB = Math.round(maxFileSize / (1024 * 1024));
            return `File size must be less than ${sizeLimitMB}MB`;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Only PDF, DOC, DOCX, and TXT files are allowed';
        }

        return null;
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            setSelectedFile(null);
            return;
        }

        const error = validateFile(file);
        if (error) {
            toast.error(error);
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setSelectedFile(file);

        // In staged mode, automatically add to queue
        if (staged && documentType) {
            const stagedDoc: StagedDocument = {
                file: file,
                document_type: documentType,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            };

            const newStagedDocs = [...stagedDocuments, stagedDoc];
            setStagedDocuments(newStagedDocs);

            // Notify parent of staged files
            if (onFilesStaged) {
                onFilesStaged(newStagedDocs);
            }

            toast.success(`${getDocumentTypeLabel(documentType)} added to upload queue`);

            // Reset form for next selection
            setSelectedFile(null);
            setDocumentType(availableDocumentTypes[0]?.value || 'offer_letter');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUpload = async (event: FormEvent) => {
        event.preventDefault();

        if (!selectedFile || !documentType) {
            toast.error('Please select a file and document type');
            return;
        }

        // This is only used for immediate upload mode now
        // Staged mode is handled in handleFileSelect
        setIsUploading(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);

            // Create form data for upload
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('entity_type', entityType);
            formData.append('entity_id', entityId);
            formData.append('document_type', documentType);

            // Send request - FormData is handled automatically by the client
            const response = await client.post<{ data: any }>('/documents', formData);

            // Add to uploaded documents list
            const newDocument: UploadedDocument = {
                id: response.data?.id,
                filename: selectedFile.name,
                document_type: documentType,
                size: selectedFile.size,
                uploaded_at: new Date().toISOString(),
            };
            setUploadedDocuments(prev => [...prev, newDocument]);

            toast.success('Document uploaded successfully');

            // Reset form for next upload
            setSelectedFile(null);
            setDocumentType(availableDocumentTypes[0]?.value || 'offer_letter');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Notify parent component
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error: any) {
            console.error('Upload failed:', error);
            const message = error.response?.data?.error?.message || error.message || 'Failed to upload document';

            // Show error in toast and notify parent
            toast.error(message);
            if (onError) {
                onError(message);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getDocumentTypeLabel = (typeValue: string): string => {
        const type = COMPANY_DOCUMENT_TYPES.find(t => t.value === typeValue);
        return type?.label || typeValue;
    };

    const removeDocument = (index: number) => {
        setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
        toast.success('Document removed from list');
    };

    const removeStagedDocument = (index: number) => {
        const newStagedDocs = stagedDocuments.filter((_, i) => i !== index);
        setStagedDocuments(newStagedDocs);

        // Notify parent of updated staged files
        if (onFilesStaged) {
            onFilesStaged(newStagedDocs);
        }

        toast.success('Document removed from upload queue');
    };

    return (
        <div className={className}>
            {/* Uploaded Documents List (immediate upload mode) */}
            {!staged && uploadedDocuments.length > 0 && (
                <div className={`mb-4 ${compact ? 'mb-3' : 'mb-4'}`}>
                    <h5 className={`font-medium mb-2 ${compact ? 'text-sm' : ''}`}>
                        <i className="fa-duotone fa-regular fa-files mr-2 text-success"></i>
                        Uploaded Documents ({uploadedDocuments.length})
                    </h5>
                    <div className="space-y-2">
                        {uploadedDocuments.map((doc, index) => (
                            <div key={index} className={`flex items-center justify-between bg-success/10 border border-success/20 rounded p-3 ${compact ? 'p-2' : 'p-3'}`}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-file-check text-success"></i>
                                    <div>
                                        <div className={`font-medium ${compact ? 'text-sm' : ''}`}>{doc.filename}</div>
                                        <div className={`text-success ${compact ? 'text-xs' : 'text-sm'}`}>
                                            {getDocumentTypeLabel(doc.document_type)} • {formatFileSize(doc.size)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDocument(index)}
                                    className={`btn btn-ghost btn-circle ${compact ? 'btn-xs' : 'btn-sm'} text-error hover:bg-error/20`}
                                    disabled={disabled || isUploading}
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Staged Documents List (staged upload mode) */}
            {staged && stagedDocuments.length > 0 && (
                <div className={`mb-4 ${compact ? 'mb-3' : 'mb-4'}`}>
                    <h5 className={`font-medium mb-2 ${compact ? 'text-sm' : ''}`}>
                        <i className="fa-duotone fa-regular fa-clock mr-2 text-warning"></i>
                        Ready to Upload ({stagedDocuments.length})
                    </h5>
                    <div className="space-y-2">
                        {stagedDocuments.map((doc, index) => (
                            <div key={doc.id} className={`flex items-center justify-between bg-warning/10 border border-warning/20 rounded p-3 ${compact ? 'p-2' : 'p-3'}`}>
                                <div className="flex items-center gap-3">
                                    <i className="fa-duotone fa-regular fa-file-plus text-warning"></i>
                                    <div>
                                        <div className={`font-medium ${compact ? 'text-sm' : ''}`}>{doc.file.name}</div>
                                        <div className={`text-warning ${compact ? 'text-xs' : 'text-sm'}`}>
                                            {getDocumentTypeLabel(doc.document_type)} • {formatFileSize(doc.file.size)}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeStagedDocument(index)}
                                    className={`btn btn-ghost btn-circle ${compact ? 'btn-xs' : 'btn-sm'} text-error hover:bg-error/20`}
                                    disabled={disabled}
                                >
                                    <i className="fa-duotone fa-regular fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Interface */}
            {staged ? (
                /* Staged mode: No form, just file picker interface */
                <div className={compact ? 'space-y-3' : 'space-y-4'}>
                    {/* Document Type Selection */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Document Type *</legend>
                        <select
                            className={`select w-full ${compact ? 'select-sm' : ''}`}
                            value={documentType}
                            onChange={(e) => setDocumentType(e.target.value)}
                            disabled={disabled}
                        >
                            {availableDocumentTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    {/* File Selection */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Choose File *
                            <span className="text-base-content/60 font-normal text-sm ml-2">
                                PDF, DOC, DOCX, or TXT - Max {Math.round(maxFileSize / (1024 * 1024))}MB
                            </span>
                        </legend>
                        <input
                            ref={fileInputRef}
                            type="file"
                            className={`file-input w-full ${compact ? 'file-input-sm' : ''}`}
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileSelect}
                            disabled={disabled}
                        />
                    </fieldset>

                    {/* Helper Text */}
                    <div className="text-sm text-base-content/70">
                        <i className="fa-duotone fa-regular fa-info-circle mr-2"></i>
                        Files will be automatically added to the upload queue when selected.
                    </div>
                </div>
            ) : (
                /* Regular mode: Full form for immediate upload */
                <form onSubmit={handleUpload}>
                    <div className={compact ? 'space-y-3' : 'space-y-4'}>
                        {/* Document Type Selection */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Document Type *</legend>
                            <select
                                className={`select w-full ${compact ? 'select-sm' : ''}`}
                                value={documentType}
                                onChange={(e) => setDocumentType(e.target.value)}
                                disabled={disabled || isUploading}
                                required
                            >
                                {availableDocumentTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </fieldset>

                        {/* File Selection */}
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Choose File *
                                <span className="text-base-content/60 font-normal text-sm ml-2">
                                    PDF, DOC, DOCX, or TXT - Max {Math.round(maxFileSize / (1024 * 1024))}MB
                                </span>
                            </legend>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className={`file-input w-full ${compact ? 'file-input-sm' : ''}`}
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={handleFileSelect}
                                disabled={disabled || isUploading}
                                required
                            />
                        </fieldset>

                        {/* Selected File Info */}
                        {selectedFile && (
                            <div className={`alert alert-info ${compact ? 'alert-sm' : ''}`}>
                                <i className="fa-duotone fa-regular fa-file-lines"></i>
                                <div>
                                    <div className="font-medium">{selectedFile.name}</div>
                                    <div className="text-sm opacity-70">
                                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex justify-end gap-2">
                            <button
                                type="submit"
                                className={`btn btn-primary ${compact ? 'btn-sm' : ''}`}
                                disabled={disabled || isUploading || !selectedFile}
                            >
                                {isUploading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-upload"></i>
                                        Upload Document
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}