'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface AIReviewedActionsProps {
    applicationId: string;
    jobTitle: string;
}

export function AIReviewedActions({ applicationId, jobTitle }: AIReviewedActionsProps) {
    const router = useRouter();
    const { getToken } = useAuth();
    const [actionLoading, setActionLoading] = useState<'draft' | 'submit' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleReturnToDraft = async () => {
        setActionLoading('draft');
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }
            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/return-to-draft`, {});
            // Refresh page to show updated state
            router.refresh();
        } catch (err) {
            console.error('Error returning to draft:', err);
            setError(err instanceof Error ? err.message : 'Failed to return to draft');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubmitApplication = async () => {
        setActionLoading('submit');
        setError(null);
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication required');
                return;
            }
            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/submit`, {});
            // Refresh page to show updated state
            router.refresh();
        } catch (err) {
            console.error('Error submitting application:', err);
            setError(err instanceof Error ? err.message : 'Failed to submit application');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <>
            {error && (
                <div className="alert alert-error text-sm">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}
            <button
                onClick={handleSubmitApplication}
                disabled={actionLoading !== null}
                className="btn btn-success btn-block"
            >
                {actionLoading === 'submit' ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Submitting...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-paper-plane mr-2"></i>
                        Submit Application
                    </>
                )}
            </button>
            <button
                onClick={handleReturnToDraft}
                disabled={actionLoading !== null}
                className="btn btn-accent btn-outline btn-block"
            >
                {actionLoading === 'draft' ? (
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Returning to Draft...
                    </>
                ) : (
                    <>
                        <i className="fa-duotone fa-regular fa-pen-to-square mr-2"></i>
                        Edit Application
                    </>
                )}
            </button>
        </>
    );
}
