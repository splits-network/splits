'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface AddCandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (candidate: any) => void;
}

export default function AddCandidateModal({
    isOpen,
    onClose,
    onSuccess
}: AddCandidateModalProps) {
    const { getToken } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            const client = createAuthenticatedClient(token);

            const payload = {
                email: formData.email.trim(),
                full_name: formData.full_name.trim(),
            };

            const response = await client.post('/candidates', payload);

            // Reset form
            setFormData({ full_name: '', email: '' });

            // Call success handler
            onSuccess(response.data);

            // Close modal
            onClose();
        } catch (error: any) {
            console.error('Failed to create candidate:', error);
            
            // Handle specific error cases with user-friendly messages
            const errorMessage = error.message || error.response?.data?.error?.message || '';
            
            if (errorMessage.includes('candidates_email_key') || 
                errorMessage.includes('duplicate key') ||
                errorMessage.includes('already exists')) {
                setError('A candidate with this email address already exists. Please use a different email or search for the existing candidate.');
            } else if (errorMessage.includes('Not authenticated')) {
                setError('Your session has expired. Please refresh the page and try again.');
            } else {
                setError(errorMessage || 'Failed to create candidate. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        if (submitting) return;
        setFormData({ full_name: '', email: '' });
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Add New Candidate</h2>
                        <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-circle"
                            onClick={handleClose}
                            disabled={submitting}
                        >
                            <i className="fa-duotone fa-regular fa-times"></i>
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-base-content/70 mb-6">
                        Send a candidate an invitation to join your
                    </p>

                    {/* Error Alert */}
                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <div className="flex-1">
                                <span>{error}</span>
                                {error.includes('already exists') && (
                                    <p className="text-sm mt-1 opacity-80">
                                        You can search for existing candidates from the candidates list.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Full Name *</legend>
                            <input
                                type="text"
                                className="input w-full"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                placeholder="John Doe"
                                required
                                disabled={submitting}
                                autoFocus
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Email *</legend>
                            <input
                                type="email"
                                className="input w-full"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@example.com"
                                required
                                disabled={submitting}
                            />
                            <p className="fieldset-label">They'll receive an invitation to join and accept your representation</p>
                        </fieldset>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end pt-4">
                            <button
                                type="button"
                                className="btn"
                                onClick={handleClose}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !formData.full_name.trim() || !formData.email.trim()}
                            >
                                {submitting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Info */}
                    <div className="alert alert-info mt-4">
                        <i className="fa-duotone fa-regular fa-handshake"></i>
                        <div className="text-sm">
                            <p><strong>What happens next:</strong></p>
                            <p>The candidate will receive an invitation email to join Splits Network and accept your "right to represent" agreement. Once accepted, they can complete their profile and you can submit them to relevant job roles.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}