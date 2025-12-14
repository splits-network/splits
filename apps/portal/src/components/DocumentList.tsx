'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import UploadDocumentModal from './UploadDocumentModal';

interface Document {
    id: string;
    entity_type: string;
    entity_id: string;
    document_type: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    storage_path: string;
    processing_status: string;
    uploaded_by_user_id: string;
    created_at: string;
}

interface DocumentListProps {
    entityType: string;
    entityId: string;
    showUpload?: boolean;
    onUpload?: () => void;
}

export default function DocumentList({ entityType, entityId, showUpload = false, onUpload }: DocumentListProps) {
    const { getToken } = useAuth();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        fetchDocuments();
    }, [entityType, entityId]);

    const fetchDocuments = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.getDocumentsByEntity(entityType, entityId);
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (doc: Document) => {
        setDownloading(doc.id);
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const response: any = await client.getDocument(doc.id);
            
            // Open signed URL in new tab
            if (response.data?.signed_url) {
                window.open(response.data.signed_url, '_blank');
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
            await client.deleteDocument(docId);
            await fetchDocuments();
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return 'fa-file-pdf text-error';
        if (mimeType.includes('word')) return 'fa-file-word text-primary';
        if (mimeType.includes('text')) return 'fa-file-lines text-info';
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
                    <button 
                        className="btn btn-sm btn-ghost w-full mb-2" 
                        onClick={() => {
                            if (onUpload) onUpload();
                            setShowUploadModal(true);
                        }}
                    >
                        <i className="fa-solid fa-plus"></i>
                        Add Document
                    </button>
                )}
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <i className={`fa-solid ${getFileIcon(doc.mime_type)} text-xl`}></i>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{doc.original_filename}</div>
                                <div className="text-xs text-base-content/60">
                                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            {doc.processing_status === 'pending' && (
                                <span className="badge badge-warning badge-sm">Processing</span>
                            )}
                            {doc.processing_status === 'failed' && (
                                <span className="badge badge-error badge-sm">Failed</span>
                            )}
                        </div>
                        <div className="flex gap-1 ml-2">
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
                                className="btn btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
                                onClick={() => handleDelete(doc.id)}
                            >
                                <i className="fa-solid fa-trash"></i>
                            </button>
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
