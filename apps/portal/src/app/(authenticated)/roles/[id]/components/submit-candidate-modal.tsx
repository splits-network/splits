'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface SubmitCandidateModalProps {
    roleId: string;
    onClose: () => void;
}

export default function SubmitCandidateModal({ roleId, onClose }: SubmitCandidateModalProps) {
    const { getToken } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        linkedin_url: '',
        notes: '',
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF, DOC, DOCX, or TXT file');
                return;
            }
            // Validate file size (10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setResumeFile(file);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token available');
            }

            const client = createAuthenticatedClient(token);
            
            // Step 1: Submit candidate and create application
            const response: any = await client.submitCandidate({
                job_id: roleId,
                ...formData,
            });

            // Step 2: Upload resume if provided
            if (resumeFile && response.data?.candidate?.id) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', resumeFile);
                uploadFormData.append('entity_type', 'candidate');
                uploadFormData.append('entity_id', response.data.candidate.id);
                uploadFormData.append('document_type', 'resume');

                await client.uploadDocument(uploadFormData);
            }

            // Success - close modal and refresh
            onClose();
            window.location.reload();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">Submit Candidate</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="alert alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="fieldset">
                        <label className="label">Full Name *</label>
                        <input
                            type="text"
                            className="input w-full"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="fieldset">
                        <label className="label">Email *</label>
                        <input
                            type="email"
                            className="input w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="fieldset">
                        <label className="label">LinkedIn URL</label>
                        <input
                            type="url"
                            className="input w-full"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                        />
                    </div>

                    <div className="fieldset">
                        <label className="label">Notes</label>
                        <textarea
                            className="textarea w-full h-24"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Why is this candidate a great fit?"
                        />
                    </div>

                    <div className="fieldset">
                        <label className="label">
                            Resume (Optional)
                            <span className="label-text-alt text-base-content/60">PDF, DOC, DOCX, or TXT - Max 10MB</span>
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="file-input file-input-bordered w-full"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileChange}
                        />
                        {resumeFile && (
                            <div className="mt-2 flex items-center gap-2">
                                <i className="fa-solid fa-file text-primary"></i>
                                <span className="text-sm">{resumeFile.name}</span>
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs"
                                    onClick={() => {
                                        setResumeFile(null);
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
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Candidate'
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
