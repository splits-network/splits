'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { Document as ApiDocument } from '@/lib/document-utils';
import UploadDocumentModal from './upload-document-modal';

interface DocumentListProps {
    entityType: string;
    entityId: string;
    showUpload?: boolean;
    onUpload?: () => void;
    initialDocuments?: ApiDocument[];
}

export default function DocumentList({
    entityType,
    entityId,
    showUpload = false,
    onUpload,
    initialDocuments
}: DocumentListProps) {
    const { getToken } = useAuth();
    const [documents, setDocuments] = useState<ApiDocument[]>(initialDocuments || []);
    const [loading, setLoading] = useState(!initialDocuments);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        if (!initialDocuments) {
            fetchDocuments();
        }
    }, [entityType, entityId, initialDocuments]);

    const fetchDocuments = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get('/v2/documents');
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc: ApiDocument) => {
        setDownloading(doc.id);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/v2/documents/${doc.id}`);
            const url = response.data?.url;

            // Open signed URL in new tab
            if (url) {
                window.open(url, '_blank');
            }
        } catch (error) {
            console.error('Failed to download document:', error);
            alert('Failed to download document');
        } finally {
            setDownloading(null);
        }
    };

    const handleDelete = async (docId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.delete(`/v2/documents/${docId}`);
            await fetchDocuments();
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Failed to delete document');
        }
    };

    const formatFileSize = (bytes?: number) => {
        if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (fileName?: string) => {
        if (!fileName) return 'fa-file text-base-content/60';
        const lower = fileName.toLowerCase();
        if (lower.endsWith('.pdf')) return 'fa-file-pdf text-error';
        if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'fa-file-word text-primary';
        if (lower.endsWith('.txt')) return 'fa-file-lines text-info';
        return 'fa-file text-base-content/60';
    };

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <span className="loading loading-spinner loading-sm"></span>
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <>
                <div className="text-center py-6 text-base-content/60">
                    <i className="fa-solid fa-folder-open text-3xl mb-2"></i>
                    <p className="text-sm">No documents uploaded</p>
                    {showUpload && (
                        <button
                            className="btn btn-sm btn-ghost mt-2"
                            onClick={() => {
                                if (onUpload) onUpload();
                                setShowUploadModal(true);
                            }}
                        >
                            <i className="fa-solid fa-upload"></i>
                            Upload Document
                        </button>
                    )}
                </div>
                {showUploadModal && (
                    <UploadDocumentModal
                        entityType={entityType}
                        entityId={entityId}
                        onClose={() => setShowUploadModal(false)}
                        onSuccess={() => {
                            setShowUploadModal(false);
                            fetchDocuments();
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div className="space-y-2">
                {showUpload && (
                    <div className="flex justify-end mb-3">
                        <button
                            className="btn btn-sm btn-ghost"
                            onClick={() => {
                                if (onUpload) onUpload();
                                setShowUploadModal(true);
                            }}
                        >
                            <i className="fa-solid fa-upload"></i>
                            Upload Document
                        </button>
                    </div>
                )}

                {documents.map((doc) => (
                    <div key={doc.id} className="card bg-base-200">
                        <div className="card-body p-4">
                            <div className="flex items-center gap-4">
                                <i className={`fa-solid ${getFileIcon(doc.file_name)} text-2xl`}></i>
                                <div className="flex-1">
                                    <div className="font-medium">{doc.file_name}</div>
                                    <div className="text-sm text-base-content/60">
                                        {doc.document_type}
                                        {doc.file_size && ` • ${formatFileSize(doc.file_size)}`}
                                        {doc.created_at && ` • Uploaded ${new Date(doc.created_at).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => handleDownload(doc)}
                                        disabled={downloading === doc.id}
                                    >
                                        {downloading === doc.id ? (
                                            <span className="loading loading-spinner loading-xs"></span>
                                        ) : (
                                            <i className="fa-solid fa-download"></i>
                                        )}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm text-error"
                                        onClick={() => handleDelete(doc.id)}
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showUploadModal && (
                <UploadDocumentModal
                    entityType={entityType}
                    entityId={entityId}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchDocuments();
                    }}
                />
            )}
        </>
    );
}
