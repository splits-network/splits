'use client';

import { useState, useEffect } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface SubmitToJobModalProps {
    candidateId: string;
    candidateName: string;
    jobs: Array<{ id: string; title: string; company_name?: string }>;
    documents: Array<{ id: string; filename: string; file_type: string }>;
    onClose: () => void;
    onSubmit: (jobId: string, notes: string, documentIds: string[]) => Promise<void>;
}

export default function SubmitToJobModal({
    candidateId,
    candidateName,
    jobs,
    documents,
    onClose,
    onSubmit,
}: SubmitToJobModalProps) {
    const [selectedJobId, setSelectedJobId] = useState('');
    const [notes, setNotes] = useState('');
    const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleDocument = (docId: string) => {
        const newSet = new Set(selectedDocIds);
        if (newSet.has(docId)) {
            newSet.delete(docId);
        } else {
            newSet.add(docId);
        }
        setSelectedDocIds(newSet);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedJobId) {
            setError('Please select a job');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await onSubmit(selectedJobId, notes, Array.from(selectedDocIds));
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit candidate');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <h3 className="font-bold text-lg mb-4">
                    Submit {candidateName} to Job
                </h3>

                {error && (
                    <div className="alert alert-error mb-4">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Job Selection */}
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Select Job *</legend>
                        <select
                            className="select w-full"
                            value={selectedJobId}
                            onChange={(e) => setSelectedJobId(e.target.value)}
                            required
                        >
                            <option value="">Select a job...</option>
                            {jobs.map((job) => (
                                <option key={job.id} value={job.id}>
                                    {job.title}
                                    {job.company_name ? ` - ${job.company_name}` : ''}
                                </option>
                            ))}
                        </select>
                        {jobs.length === 0 && (
                            <p className="fieldset-label text-warning">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation mr-1"></i>
                                No active jobs found. Create a job first.
                            </p>
                        )}
                    </fieldset>

                    {/* Notes */}
                    <MarkdownEditor
                        className="fieldset"
                        label="Submission Notes"
                        value={notes}
                        onChange={setNotes}
                        placeholder="Add any notes about this submission..."
                        helperText="These notes will be visible to the hiring company"
                        height={160}
                        preview="edit"
                    />

                    {/* Document Selection */}
                    {length > 0 && (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Attach Documents</legend>
                            <div className="space-y-2 max-h-48 overflow-y-auto border border-base-300 rounded-lg p-3">
                                {documents.map((doc) => (
                                    <label key={doc.id} className="flex items-center gap-2 cursor-pointer hover:bg-base-200 p-2 rounded">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm"
                                            checked={selectedDocIds.has(doc.id)}
                                            onChange={() => toggleDocument(doc.id)}
                                        />
                                        <i className={`fa-duotone fa-regular ${doc.file_type === 'application/pdf' ? 'fa-file-pdf text-error' :
                                            doc.file_type?.startsWith('image/') ? 'fa-file-image text-info' :
                                                'fa-file text-base-content/70'
                                            }`}></i>
                                        <span className="text-sm">{doc.filename}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="fieldset-label">
                                {selectedDocIds.size} document(s) selected
                            </p>
                        </fieldset>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
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
                            disabled={submitting || !selectedJobId}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                    Submit to Job
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}
