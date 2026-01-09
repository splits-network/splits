'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';

interface WithdrawButtonProps {
    applicationId: string;
    jobTitle: string;
    isJobClosed?: boolean;
}

export default function WithdrawButton({ applicationId, jobTitle, isJobClosed = false }: WithdrawButtonProps) {
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { getToken } = useAuth();

    // Prevent withdrawal if job is closed
    if (isJobClosed) {
        return (
            <button
                className="btn btn-error btn-outline w-full"
                disabled
                title="Cannot withdraw - position is no longer available"
            >
                <i className="fa-duotone fa-regular fa-xmark"></i>
                Withdraw Application
            </button>
        );
    }

    const handleWithdraw = async () => {
        setIsWithdrawing(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication token not available');
            }

            const client = createAuthenticatedClient(token);

            // Use standard V2 PATCH endpoint to update application status
            await client.patch(`/applications/${applicationId}`, {
                stage: 'withdrawn',
                notes: 'Candidate withdrew application'
            });

            // Success - redirect to applications list with success message
            router.push('/portal/applications?withdrawn=true');
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to withdraw application');
            setIsWithdrawing(false);
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
                    className="btn btn-error btn-outline w-full"
                    onClick={() => setShowConfirm(true)}
                    disabled={isWithdrawing}
                >
                    <i className="fa-duotone fa-regular fa-xmark"></i>
                    Withdraw Application
                </button>
            ) : (
                <div className="space-y-2">
                    <div className="alert alert-warning">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                        <div className="flex-1">
                            <div className="font-semibold">Are you sure?</div>
                            <div className="text-sm">
                                This will withdraw your application for {jobTitle}. This action cannot be undone.
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-error flex-1"
                            onClick={handleWithdraw}
                            disabled={isWithdrawing}
                        >
                            {isWithdrawing ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Withdrawing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Yes, Withdraw
                                </>
                            )}
                        </button>
                        <button
                            className="btn btn-outline flex-1"
                            onClick={() => setShowConfirm(false)}
                            disabled={isWithdrawing}
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
