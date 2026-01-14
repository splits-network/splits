'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { useToast } from '@/lib/toast-context';
import { useUserProfile } from '@/contexts';
import SubmitCandidateWizard from './submit-candidate-wizard';
import AddRoleWizardModal from '../../components/add-role-wizard-modal';
import { getJobStatusBadge } from '@/lib/utils/badge-styles';
import { getRoleBadges } from '@/lib/utils/role-badges';

interface Job {
    id: string;
    title: string;
    company_id: string;
    company: {
        name: string;
    };
    location?: string;
    fee_percentage: number;
    status: string;
    salary_min?: number;
    salary_max?: number;
    department?: string;
    employment_type?: 'full_time' | 'contract' | 'temporary';
    open_to_relocation: boolean;
    show_salary_range: boolean;
    splits_fee_percentage: number;
    job_owner_id?: string;
    created_at: string;
    application_count?: number;
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}


interface RoleHeaderProps {
    roleId: string;
}

export default function RoleHeader({ roleId }: RoleHeaderProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { isAdmin, profile } = useUserProfile();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Check if user is company admin or platform admin
    const canManageRole = isAdmin || profile?.roles?.includes('company_admin');

    useEffect(() => {
        fetchJob();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    const fetchJob = async () => {
        try {
            const token = await getToken();
            if (!token) {
                console.error('No auth token available');
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/jobs/${roleId}`);
            setJob(response.data);
        } catch (error) {
            console.error('Failed to fetch job:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) {
            return;
        }

        setUpdating(true);
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No auth token');
            }

            const client = createAuthenticatedClient(token);
            await client.patch(`/jobs/${roleId}`, { status: newStatus });

            // Refresh the job data
            await fetchJob();
            toast.success('Status updated successfully!');
        } catch (error: any) {
            console.error('Failed to update status:', error);
            toast.error(`Failed to update status: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="flex justify-center py-12">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>Job not found</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-200 shadow">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <div className="flex items-top md:items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold">{job.title}</h1>
                                <div className={`badge ${getJobStatusBadge(job.status)}`}>
                                    {job.status}
                                </div>
                                {getRoleBadges(job, [job]).map((badge: Badge, idx: number) => (
                                    <div
                                        key={idx}
                                        className={`badge ${badge.class} gap-1 ${badge.animated ? 'animate-pulse' : ''} ${badge.tooltip ? 'tooltip tooltip-bottom' : ''}`}
                                        data-tip={badge.tooltip}
                                    >
                                        <i className={`fa-duotone fa-regular ${badge.icon}`}></i>
                                        {badge.text && <span>{badge.text}</span>}
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 mt-3 text-base-content/70">
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-building"></i>
                                    {job.company.name}
                                </span>
                                {job.location && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                                        {job.location}
                                    </span>
                                )}
                                {job.department && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-briefcase"></i>
                                        {job.department}
                                    </span>
                                )}
                                {job.employment_type && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-clock"></i>
                                        {job.employment_type === 'full_time' ? 'Full-Time' :
                                            job.employment_type === 'contract' ? 'Contract' : 'Temporary'}
                                    </span>
                                )}
                                {job.open_to_relocation && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-plane"></i>
                                        Open to Relocation
                                    </span>
                                )}
                                {job.show_salary_range && job.salary_min && job.salary_max && (
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-dollar-sign"></i>
                                        ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-percent"></i>
                                    {job.fee_percentage}% fee
                                </span>
                                <span className="flex items-center gap-2">
                                    <i className="fa-duotone fa-regular fa-handshake"></i>
                                    {job.splits_fee_percentage}% recruiter split
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            <button
                                className="btn btn-primary gap-2"
                                onClick={() => setShowSubmitModal(true)}
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Send Proposal
                            </button>

                            {canManageRole && (
                                <>
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        className="btn btn-ghost gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-pen"></i>
                                        Edit Role
                                    </button>

                                    {/* Status Management Dropdown */}
                                    <div className="dropdown dropdown-end">
                                        <button
                                            tabIndex={0}
                                            className="btn btn-ghost gap-2 w-full"
                                            disabled={updating}
                                        >
                                            {updating ? (
                                                <span className="loading loading-spinner loading-xs"></span>
                                            ) : (
                                                <i className="fa-duotone fa-regular fa-ellipsis-vertical"></i>
                                            )}
                                            Status Actions
                                        </button>
                                        <ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-52">
                                            {job.status !== 'active' && (
                                                <li>
                                                    <button onClick={() => handleStatusChange('active')}>
                                                        <i className="fa-duotone fa-regular fa-play"></i>
                                                        Activate
                                                    </button>
                                                </li>
                                            )}
                                            {job.status === 'active' && (
                                                <li>
                                                    <button onClick={() => handleStatusChange('paused')}>
                                                        <i className="fa-duotone fa-regular fa-pause"></i>
                                                        Pause
                                                    </button>
                                                </li>
                                            )}
                                            {job.status !== 'filled' && (
                                                <li>
                                                    <button onClick={() => handleStatusChange('filled')}>
                                                        <i className="fa-duotone fa-regular fa-check"></i>
                                                        Mark as Filled
                                                    </button>
                                                </li>
                                            )}
                                            {job.status !== 'closed' && (
                                                <li>
                                                    <button onClick={() => handleStatusChange('closed')}>
                                                        <i className="fa-duotone fa-regular fa-xmark"></i>
                                                        Close Role
                                                    </button>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showSubmitModal && job && (
                <SubmitCandidateWizard
                    roleId={job.id}
                    roleTitle={job.title}
                    companyName={job.company_id}
                    onClose={() => setShowSubmitModal(false)}
                />
            )}

            {showEditModal && (
                <AddRoleWizardModal
                    isOpen={showEditModal}
                    jobId={roleId}
                    mode="edit"
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        fetchJob(); // Refresh job data
                    }}
                />
            )}
        </>
    );
}
