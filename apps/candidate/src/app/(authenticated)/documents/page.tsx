'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { formatDate } from '@/lib/utils';
import { getMyDocuments, uploadDocument, deleteDocument, getDocumentUrl, Document as ApiDocument } from '@/lib/api';

export default function DocumentsPage() {
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        setError('Please sign in to view documents');
        return;
      }

      const docs = await getMyDocuments(token);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (name: string): string => {
    if (name.endsWith('.pdf')) return 'fa-file-pdf text-error';
    if (name.endsWith('.doc') || name.endsWith('.docx')) return 'fa-file-word text-info';
    return 'fa-file text-base-content';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Please sign in to upload documents');
        return;
      }

      // Get user email to find candidate
      const candidatesResponse = await fetch('/api/candidates?email=' + encodeURIComponent(token), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!candidatesResponse.ok) {
        throw new Error('Failed to find candidate profile');
      }

      const candidatesData = await candidatesResponse.json();
      const candidates = candidatesData.data || [];
      
      if (candidates.length === 0) {
        throw new Error('Candidate profile not found. Please contact support.');
      }

      const candidateId = candidates[0].id;

      // Upload each file
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('entity_type', 'candidate');
        formData.append('entity_id', candidateId);
        
        // Determine document type from file
        const filename = file.name.toLowerCase();
        let documentType = 'other';
        if (filename.includes('resume') || filename.includes('cv')) {
          documentType = 'resume';
        } else if (filename.includes('cover')) {
          documentType = 'cover_letter';
        } else if (filename.includes('portfolio')) {
          documentType = 'other';
        }
        formData.append('document_type', documentType);

        await uploadDocument(formData, token);
      }

      // Reload documents
      await loadDocuments();
    } catch (err: any) {
      console.error('Failed to upload documents:', err);
      setError(err.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    setDeleting(documentId);
    setError(null);

    try {
      const token = await getToken();
      if (!token) {
        setError('Please sign in to delete documents');
        return;
      }

      await deleteDocument(documentId, token);
      await loadDocuments();
    } catch (err: any) {
      console.error('Failed to delete document:', err);
      setError(err.message || 'Failed to delete document');
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (doc: ApiDocument) => {
    try {
      const token = await getToken();
      if (!token) {
        setError('Please sign in to download documents');
        return;
      }

      const url = await getDocumentUrl(doc.id, token);
      window.open(url, '_blank');
    } catch (err: any) {
      console.error('Failed to get download URL:', err);
      setError(err.message || 'Failed to download document');
    }
  };

  const filteredDocuments = filterType === 'all' 
    ? documents 
    : documents.filter(doc => {
        if (filterType === 'resumes') return doc.document_type === 'resume';
        if (filterType === 'cover-letters') return doc.document_type === 'cover_letter';
        if (filterType === 'portfolios') return doc.document_type === 'portfolio';
        if (filterType === 'other') return doc.document_type === 'other';
        return true;
      });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Documents</h1>
        <p className="text-lg text-base-content/70">
          Manage your resumes, cover letters, and other application materials
        </p>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="card bg-gradient-to-r from-primary to-secondary text-white shadow-lg mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">
            <i className="fa-solid fa-cloud-arrow-up"></i>
            Upload Documents
          </h2>
          <p className="mb-6">
            Upload your resume, cover letters, portfolio, or other documents.
            Supported formats: PDF, DOC, DOCX (Max 10MB)
          </p>
          
          <label className="btn bg-white text-primary hover:bg-gray-100 w-fit">
            {uploading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Uploading...
              </>
            ) : (
              <>
                <i className="fa-solid fa-upload"></i>
                Choose Files
              </>
            )}
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Document Type Filters */}
      <div className="tabs tabs-boxed mb-6 bg-base-100 shadow-sm">
        <a className={`tab ${filterType === 'all' ? 'tab-active' : ''}`} onClick={() => setFilterType('all')}>
          All Documents
        </a>
        <a className={`tab ${filterType === 'resumes' ? 'tab-active' : ''}`} onClick={() => setFilterType('resumes')}>
          Resumes
        </a>
        <a className={`tab ${filterType === 'cover-letters' ? 'tab-active' : ''}`} onClick={() => setFilterType('cover-letters')}>
          Cover Letters
        </a>
        <a className={`tab ${filterType === 'portfolios' ? 'tab-active' : ''}`} onClick={() => setFilterType('portfolios')}>
          Portfolios
        </a>
        <a className={`tab ${filterType === 'other' ? 'tab-active' : ''}`} onClick={() => setFilterType('other')}>
          Other
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filteredDocuments.length > 0 ? (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="avatar avatar-placeholder">
                      <div className="bg-base-200 text-base-content rounded-lg w-16 h-16">
                        <i className={`fa-solid ${getFileIcon(doc.filename)} text-3xl`}></i>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">{doc.filename}</h3>
                      <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
                        <span className="badge badge-sm capitalize">{doc.document_type.replace('_', ' ')}</span>
                        <span>
                          <i className="fa-solid fa-file-arrow-down"></i> {formatFileSize(doc.file_size)}
                        </span>
                        <span>
                          <i className="fa-solid fa-calendar"></i> Uploaded {formatDate(doc.created_at)}
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
      ) : (
        /* Empty State */
        <div className="card bg-base-100 shadow-lg">
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
              <label className="btn btn-primary">
                <i className="fa-solid fa-upload"></i>
                Upload Your First Document
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="card bg-info text-info-content shadow-lg mt-8">
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
    </div>
  );
}
