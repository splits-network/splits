'use client';

import type { Job } from '@splits-network/shared-types';

interface JobDetailModalProps {
    job: Job | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    if (!isOpen || !job) return null;

    return (
        <dialog className="modal modal-open">
            <div className="modal-box max-w-4xl">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-base-content/70">
                            <span className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-building"></i>
                                {job.company_name}
                            </span>
                            {job.location && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-location-dot"></i>
                                        {job.location}
                                    </span>
                                </>
                            )}
                            {job.employment_type && (
                                <>
                                    <span>•</span>
                                    <span className="capitalize">{job.employment_type}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
                        <i className="fa-duotone fa-regular fa-xmark text-xl"></i>
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {/* Salary Range */}
                    {(job.salary_min || job.salary_max) && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-dollar-sign text-success"></i>
                                Salary Range
                            </h4>
                            <div className="p-4 bg-base-200/50 rounded-lg">
                                {job.salary_min && job.salary_max ? (
                                    <span className="text-xl font-semibold">
                                        ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                                    </span>
                                ) : job.salary_min ? (
                                    <span className="text-xl font-semibold">
                                        ${job.salary_min.toLocaleString()}+
                                    </span>
                                ) : (
                                    <span className="text-xl font-semibold">
                                        Up to ${job.salary_max?.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Fee Structure */}
                    <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-percent text-primary"></i>
                            Fee Structure
                        </h4>
                        <div className="p-4 bg-base-200/50 rounded-lg space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Company Fee</span>
                                <span className="font-semibold">{job.fee_percentage}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-base-content/70">Guarantee Period</span>
                                <span className="font-semibold">{(job as any).guarantee_days ?? 90} days</span>
                            </div>
                        </div>
                    </div>

                    {/* Recruiter Description */}
                    {job.recruiter_description && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-user-tie text-info"></i>
                                For Recruiters
                            </h4>
                            <div className="p-4 bg-base-200/50 rounded-lg whitespace-pre-wrap">
                                {job.recruiter_description}
                            </div>
                        </div>
                    )}

                    {/* Candidate Description */}
                    {job.candidate_description && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-users text-accent"></i>
                                For Candidates
                            </h4>
                            <div className="p-4 bg-base-200/50 rounded-lg whitespace-pre-wrap">
                                {job.candidate_description}
                            </div>
                        </div>
                    )}

                    {/* Requirements */}
                    {(job as any).requirements && (job as any).requirements.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-clipboard-check text-warning"></i>
                                Requirements
                            </h4>
                            <div className="space-y-2">
                                {(job as any).requirements.map((requirement: any, index: number) => (
                                    <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-base-200/50 rounded-lg"
                                    >
                                        <span className={`badge badge-sm ${requirement.requirement_type === 'mandatory'
                                            ? 'badge-error'
                                            : 'badge-warning'
                                            }`}>
                                            {requirement.requirement_type}
                                        </span>
                                        <span className="flex-1">{requirement.description}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Additional Details */}
                    <div>
                        <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-circle-info text-secondary"></i>
                            Additional Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {job.department && (
                                <div className="p-3 bg-base-200/50 rounded-lg">
                                    <div className="text-sm text-base-content/70 mb-1">Department</div>
                                    <div className="font-medium">{job.department}</div>
                                </div>
                            )}
                            {typeof job.open_to_relocation !== 'undefined' && (
                                <div className="p-3 bg-base-200/50 rounded-lg">
                                    <div className="text-sm text-base-content/70 mb-1">Relocation</div>
                                    <div className="font-medium">
                                        {job.open_to_relocation ? 'Open to relocation' : 'No relocation'}
                                    </div>
                                </div>
                            )}
                            {job.status && (
                                <div className="p-3 bg-base-200/50 rounded-lg">
                                    <div className="text-sm text-base-content/70 mb-1">Status</div>
                                    <div>
                                        <span className={`badge ${job.status === 'active' ? 'badge-success' :
                                            job.status === 'paused' ? 'badge-warning' :
                                                'badge-ghost'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-action">
                    <button onClick={onClose} className="btn btn-primary">
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop" onClick={onClose}>
                <button>close</button>
            </form>
        </dialog>
    );
}
