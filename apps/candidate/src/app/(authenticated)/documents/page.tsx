'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
  url: string;
}

export default function DocumentsPage() {
  const [uploading, setUploading] = useState(false);

  // Mock data - will be replaced with API calls
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'John_Doe_Resume_2025.pdf',
      type: 'Resume',
      size: 245000,
      uploaded_at: '2025-12-15',
      url: '#',
    },
    {
      id: '2',
      name: 'Cover_Letter_TechCorp.pdf',
      type: 'Cover Letter',
      size: 128000,
      uploaded_at: '2025-12-10',
      url: '#',
    },
    {
      id: '3',
      name: 'Portfolio_Presentation.pdf',
      type: 'Portfolio',
      size: 1540000,
      uploaded_at: '2025-12-05',
      url: '#',
    },
  ]);

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

    // TODO: API call to upload files
    await new Promise(resolve => setTimeout(resolve, 2000));

    setUploading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Documents</h1>
        <p className="text-lg text-base-content/70">
          Manage your resumes, cover letters, and other application materials
        </p>
      </div>

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
        <a className="tab tab-active">All Documents</a>
        <a className="tab">Resumes</a>
        <a className="tab">Cover Letters</a>
        <a className="tab">Portfolios</a>
        <a className="tab">Other</a>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="avatar avatar-placeholder">
                    <div className="bg-base-200 text-base-content rounded-lg w-16 h-16">
                      <i className={`fa-solid ${getFileIcon(doc.name)} text-3xl`}></i>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{doc.name}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
                      <span className="badge badge-sm">{doc.type}</span>
                      <span>
                        <i className="fa-solid fa-file-arrow-down"></i> {formatFileSize(doc.size)}
                      </span>
                      <span>
                        <i className="fa-solid fa-calendar"></i> Uploaded {formatDate(doc.uploaded_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-sm btn-ghost">
                    <i className="fa-solid fa-eye"></i>
                    Preview
                  </button>
                  <a
                    href={doc.url}
                    download
                    className="btn btn-sm btn-primary"
                  >
                    <i className="fa-solid fa-download"></i>
                    Download
                  </a>
                  <button className="btn btn-sm btn-ghost text-error">
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {documents.length === 0 && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body text-center py-16">
            <i className="fa-solid fa-folder-open text-6xl text-base-content/30 mb-4"></i>
            <h3 className="text-2xl font-bold mb-2">No Documents Yet</h3>
            <p className="text-base-content/70 mb-6">
              Upload your resume and other documents to apply faster
            </p>
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
