'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface SubmitForReviewButtonProps {
    applicationId: string;
    jobTitle: string;
}

export default function SubmitForReviewButton({ applicationId, jobTitle }: SubmitForReviewButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { getToken } = useAuth();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token not available');
            }

            const client = createAuthenticatedClient(token);
            await client.updateApplication(applicationId, {
                stage: 'ai_review',
                notes: 'Candidate submitted application for review',
            });

            // Success - refresh page to show updated state
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit application');
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            <button
                className="btn btn-primary w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                    </>
                ) : (
                    <>
                        <i className="fa-solid fa-paper-plane"></i>
                        Submit for Review
                    </>
                )}
            </button>
        </>
    );
}
