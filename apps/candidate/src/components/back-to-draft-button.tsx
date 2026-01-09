'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface BackToDraftButtonProps {
    applicationId: string;
    jobTitle: string;
}

export default function BackToDraftButton({ applicationId, jobTitle }: BackToDraftButtonProps) {
    const [isMoving, setIsMoving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { getToken } = useAuth();

    const handleBackToDraft = async () => {
        setIsMoving(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token not available');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/applications/${applicationId}`, {
                stage: 'draft',
                notes: 'Candidate moved application back to draft for edits',
            });

            // Success - refresh page to show updated state
            router.refresh();
            setShowConfirm(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to move application to draft');
            setIsMoving(false);
        }
    };

    return (
        <>
            {error && (
                <div className="alert alert-error mb-4">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {!showConfirm ? (
                <button
                    className="btn btn-outline w-full"
                    onClick={() => setShowConfirm(true)}
                    disabled={isMoving}
                >
                    <i className="fa-duotone fa-regular fa-pen-to-square"></i>
                    Move to Draft
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="alert alert-info">
                        <i className="fa-duotone fa-regular fa-info-circle"></i>
                        <div className="flex-1">
                            <div className="font-semibold">Move back to draft?</div>
                            <div className="text-sm">
                                This will move your application for {jobTitle} back to draft status so you can make changes before resubmitting.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-primary flex-1"
                            onClick={handleBackToDraft}
                            disabled={isMoving}
                        >
                            {isMoving ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Moving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Yes, Move to Draft
                                </>
                            )}
                        </button>
                        <button
                            className="btn btn-outline flex-1"
                            onClick={() => setShowConfirm(false)}
                            disabled={isMoving}
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
