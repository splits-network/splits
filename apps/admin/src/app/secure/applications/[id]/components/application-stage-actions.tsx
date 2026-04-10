'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { AdminConfirmModal } from '@/components/shared';
import { useAdminToast } from '@/hooks/use-admin-toast';

const STAGES = [
    { value: 'draft', label: 'Draft', group: 'Initial' },
    { value: 'ai_review', label: 'AI Review', group: 'AI' },
    { value: 'screen', label: 'Screen', group: 'Screening' },
    { value: 'submitted', label: 'Submitted', group: 'Screening' },
    { value: 'company_review', label: 'Company Review', group: 'Company' },
    { value: 'company_feedback', label: 'Company Feedback', group: 'Company' },
    { value: 'interview', label: 'Interview', group: 'Company' },
    { value: 'offer', label: 'Offer', group: 'Final' },
    { value: 'hired', label: 'Hired', group: 'Final' },
    { value: 'rejected', label: 'Rejected', group: 'Closed' },
    { value: 'withdrawn', label: 'Withdrawn', group: 'Closed' },
];

type Props = {
    applicationId: string;
    currentStage: string;
    onSuccess: () => void;
};

export function ApplicationStageActions({ applicationId, currentStage, onSuccess }: Props) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [selectedStage, setSelectedStage] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [loading, setLoading] = useState(false);

    const availableStages = STAGES.filter(s => s.value !== currentStage);

    async function handleConfirm() {
        if (!selectedStage) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/ats/admin/applications/${applicationId}/stage`, {
                stage: selectedStage,
            });
            toast.success(`Stage changed to "${selectedStage.replace(/_/g, ' ')}"`);
            setSelectedStage('');
            setConfirming(false);
            onSuccess();
        } catch {
            toast.error('Failed to change stage');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                    <i className="fa-duotone fa-regular fa-arrows-rotate mr-1" />
                    Change Stage
                </div>
                <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-56 border border-base-200 max-h-72 overflow-y-auto">
                    {availableStages.map((stage) => (
                        <li key={stage.value}>
                            <button
                                type="button"
                                onClick={() => { setSelectedStage(stage.value); setConfirming(true); }}
                                className="capitalize"
                            >
                                {stage.label}
                                <span className="text-xs text-base-content/40 ml-auto">{stage.group}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {confirming && selectedStage && (
                <AdminConfirmModal
                    isOpen={confirming}
                    onClose={() => { setConfirming(false); setSelectedStage(''); }}
                    onConfirm={handleConfirm}
                    title="Change Application Stage"
                    message={`Move this application from "${currentStage.replace(/_/g, ' ')}" to "${selectedStage.replace(/_/g, ' ')}"? This is an admin override and bypasses normal stage transition rules.`}
                    confirmLabel="Change Stage"
                    confirmVariant="warning"
                    loading={loading}
                />
            )}
        </>
    );
}
