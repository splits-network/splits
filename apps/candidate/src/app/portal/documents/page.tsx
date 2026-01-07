'use client';

import { useState, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useStandardList } from '@/hooks/use-standard-list';
import { formatDate } from '@/lib/utils';
import UploadDocumentModal from '@/components/upload-document-modal';
import type { Document } from '@/lib/document-utils';
import { createAuthenticatedClient } from '@/lib/api-client';

// ===== TYPES =====

interface DocumentFilters {
    document_type?: string;
}

// ===== LOADING FALLBACK =====

function DocumentsLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-center items-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        </div>
    );
}

// ===== PAGE WRAPPER =====

export default function DocumentsPage() {
    return (
        <Suspense fallback={<DocumentsLoading />}>
            <DocumentsContent />
        </Suspense>
    );
}

// ===== PAGE CONTENT =====

function DocumentsContent() {
    const { getToken } = useAuth();
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const {
        data: documents,
        loading,
        error,
        filters,
        setFilter,
        refresh,
    } = useStandardList<Document, DocumentFilters>({
        endpoint: '/documents',
        defaultFilters: {},
        defaultSortBy: 'created_at',
        defaultSortOrder: 'desc',
        viewModeKey: 'candidateDocumentsViewMode',
    });

    // Helper functions
    const formatFileSize = (bytes?: number): string => {
        if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '-';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (name?: string): string => {
        if (!name) return 'fa-file text-base-content';
        const lower = name.toLowerCase();
        if (lower.endsWith('.pdf')) return 'fa-file-pdf text-error';
        if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'fa-file-word text-info';
        return 'fa-file text-base-content';
    };

    const getDocumentTypeLabel = (type?: string | null): string => {
        return type ? type.replace(/_/g, ' ') : 'unspecified';
    };

    const getCandidateId = async () => {
        if (candidateId) return candidateId;

        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                return null;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get('/candidates', { params: { limit: 1 } });
            const profile = response.data?.[0];
            if (profile?.id) {
                setCandidateId(profile.id);
                return profile.id;
            }

            console.error('No candidate profile found');
            return null;
        } catch (err) {
            console.error('Failed to get candidate ID:', err);
            return null;
        }
    };

    const handleUploadClick = async () => {
        const id = await getCandidateId();
        if (!id) {
            setActionError('Failed to find candidate profile. Please contact support.');
            return;
        }
        setShowUploadModal(true);
    };

    const handleDelete = async (documentId: string) => {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        setDeleting(documentId);
        setActionError(null);

        try {
            const token = await getToken();
            if (!token) {
                setActionError('Please sign in to delete documents');
                return;
            }

            const client = createAuthenticatedClient(token);
            await client.delete(`/documents/${documentId}`);
            refresh();
        } catch (err: any) {
            console.error('Failed to delete document:', err);
            setActionError(err.message || 'Failed to delete document');
        } finally {
            setDeleting(null);
        }
    };

    const handleDownload = async (doc: Document) => {
        setActionError(null);
        try {
            const token = await getToken();
            if (!token) {
                setActionError('Please sign in to download documents');
                return;
            }

            const client = createAuthenticatedClient(token);
            const response = await client.get(`/documents/${doc.id}`);
            if (response.data?.download_url) {
                window.open(response.data.download_url, '_blank');
            } else {
                setActionError('Download URL not available');
            }
        } catch (err: any) {
            console.error('Failed to get download URL:', err);
            setActionError(err.message || 'Failed to download document');
        }
    };

    // Filter documents by type (client-side for tab-based UI)
    const filterType = filters.document_type || 'all';
    const filteredDocuments = filterType === 'all'
        ? documents
        : documents.filter(doc => doc.document_type === filterType);

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">My Documents</h1>
                <p className="text-lg text-base-content/70">
                    Manage your resumes, cover letters, and other application materials
                </p>
            </div>

            {/* Error Display */}
            {(error || actionError) && (
                <div className="alert alert-error mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error || actionError}</span>
                </div>
            )}

            {/* Upload Section */}
            <div className="card bg-linear-to-r from-primary to-secondary text-white shadow mb-8">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">
                        <i className="fa-solid fa-cloud-arrow-up"></i>
                        Upload Documents
                    </h2>
                    <p className="mb-6">
                        Upload your resume, cover letters, portfolio, or other documents.
                        Supported formats: PDF, DOC, DOCX (Max 10MB)
                    </p>
                    <button
                        className="btn bg-white text-primary hover:bg-gray-100 w-fit"
                        onClick={handleUploadClick}
                    >
                        <i className="fa-solid fa-upload"></i>
                        Upload Documents
                    </button>
                </div>
            </div>

            {/* Document Type Filters (Tab-based) */}
            <div className="tabs tabs-boxed mb-6 bg-base-100 shadow">
                <a
                    className={`tab ${filterType === 'all' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('document_type', undefined)}
                >
                    All Documents
                </a>
                <a
                    className={`tab ${filterType === 'resume' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('document_type', 'resume')}
                >
                    Resumes
                </a>
                <a
                    className={`tab ${filterType === 'cover_letter' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('document_type', 'cover_letter')}
                >
                    Cover Letters
                </a>
                <a
                    className={`tab ${filterType === 'portfolio' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('document_type', 'portfolio')}
                >
                    Portfolios
                </a>
                <a
                    className={`tab ${filterType === 'other' ? 'tab-active' : ''}`}
                    onClick={() => setFilter('document_type', 'other')}
                >
                    Other
                </a>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            )}

            {/* Document List */}
            {!loading && filteredDocuments.length > 0 && (
                <div className="space-y-4">
                    {filteredDocuments.map((doc) => (
                        <div key={doc.id} className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
                            <div className="card-body">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-base-200 text-base-content rounded-lg w-16 h-16 flex items-center justify-center">
                                                <i className={`fa-solid ${getFileIcon(doc.file_name)} text-3xl`}></i>
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold mb-1">{doc.file_name}</h3>
                                            <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
                                                <span className="badge badge-sm capitalize">{getDocumentTypeLabel(doc.document_type)}</span>
                                                <span>
                                                    <i className="fa-solid fa-file-arrow-down mr-1"></i>
                                                    {formatFileSize(doc.file_size)}
                                                </span>
                                                <span>
                                                    <i className="fa-solid fa-calendar mr-1"></i>
                                                    Uploaded {doc.created_at ? formatDate(doc.created_at) : 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => handleDownload(doc)}
                                        >
                                            <i className="fa-solid fa-download"></i>
                                            Download
                                        </button>
                                        <button
                                            className="btn btn-sm btn-ghost text-error"
                                            onClick={() => handleDelete(doc.id)}
                                            disabled={deleting === doc.id}
                                        >
                                            {deleting === doc.id ? (
                                                <span className="loading loading-spinner loading-xs"></span>
                                            ) : (
                                                <i className="fa-solid fa-trash"></i>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredDocuments.length === 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body text-center py-16">
                        <i className="fa-solid fa-folder-open text-6xl text-base-content/30 mb-4"></i>
                        <h3 className="text-2xl font-bold mb-2">
                            {filterType === 'all' ? 'No Documents Yet' : 'No Documents in This Category'}
                        </h3>
                        <p className="text-base-content/70 mb-6">
                            {filterType === 'all'
                                ? 'Upload your resume and other documents to apply faster'
                                : 'Try changing the filter or uploading new documents'}
                        </p>
                        {filterType === 'all' && (
                            <button
                                className="btn btn-primary"
                                onClick={handleUploadClick}
                            >
                                <i className="fa-solid fa-upload"></i>
                                Upload Your First Document
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Tips Section */}
            <div className="card bg-info text-info-content shadow mt-8">
                <div className="card-body">
                    <h3 className="card-title">
                        <i className="fa-solid fa-lightbulb"></i>
                        Tips for Better Applications
                    </h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Keep your resume up to date with your latest experience</li>
                        <li>Tailor your cover letter for each application</li>
                        <li>Use clear, professional file names (e.g., "FirstName_LastName_Resume.pdf")</li>
                        <li>Keep file sizes under 2MB for faster uploads</li>
                        <li>PDF format is preferred for better compatibility</li>
                    </ul>
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && candidateId && (
                <UploadDocumentModal
                    entityType="candidate"
                    entityId={candidateId}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        refresh();
                    }}
                />
            )}
        </div>
    );
}
