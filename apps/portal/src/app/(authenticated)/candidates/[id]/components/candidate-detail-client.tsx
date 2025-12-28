'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { createAuthenticatedClient } from '@/lib/api-client';
import DocumentList from '@/components/document-list';
import SubmitToJobWizard from './submit-to-job-wizard';

interface CandidateDetailClientProps {
    candidateId: string;
}

export default function CandidateDetailClient({ candidateId }: CandidateDetailClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    // Candidate data (loads first - fast)
    const [candidate, setCandidate] = useState<any>(null);
    const [canEdit, setCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Applications (loads async with its own state)
    const [applications, setApplications] = useState<any[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [applicationsError, setApplicationsError] = useState<string | null>(null);

    // Relationship (loads async with its own state)
    const [relationship, setRelationship] = useState<any>(null);
    const [relationshipLoading, setRelationshipLoading] = useState(false);

    // Submit to job wizard
    const [showSubmitWizard, setShowSubmitWizard] = useState(false);

    // Load candidate data first (fast)
    useEffect(() => {
        async function loadCandidate() {
            try {
                setLoading(true);
                setError(null);

                const token = await getToken();
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Fetch candidate details only
                const candidateResponse = await client.get(`/candidates/${candidateId}`);
                setCandidate(candidateResponse.data);

                // Assume can edit if we can view (RBAC handled by backend)
                setCanEdit(true);

            } catch (err: any) {
                console.error('Failed to load candidate:', err);
                setError(err.message || 'Failed to load candidate details');
            } finally {
                setLoading(false);
            }
        }

        loadCandidate();
    }, [candidateId, getToken]);

    // Load applications in parallel (after candidate loads)
    useEffect(() => {
        async function loadApplications() {
            if (!candidate) return; // Wait for candidate first

            try {
                setApplicationsLoading(true);
                setApplicationsError(null);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Fetch applications with enriched job data (single query - no N+1!)
                const applicationsResponse = await client.get(`/candidates/${candidateId}/applications-with-jobs`);
                const apps = applicationsResponse.data || [];

                setApplications(apps);
            } catch (err: any) {
                console.error('Failed to load applications:', err);
                setApplicationsError('Failed to load applications');
            } finally {
                setApplicationsLoading(false);
            }
        }

        loadApplications();
    }, [candidate, candidateId, getToken]);

    // Load relationship info in parallel
    useEffect(() => {
        async function loadRelationship() {
            if (!candidate) return; // Wait for candidate first

            try {
                setRelationshipLoading(true);

                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);

                // Try to get detailed relationship info
                try {
                    const relationshipResponse = await client.get(`/recruiter-candidates/candidate/${candidateId}`);
                    if (relationshipResponse.data && relationshipResponse.data.length > 0) {
                        // Get the most recent active relationship
                        const activeRelationship = relationshipResponse.data.find((r: any) => r.status === 'active');
                        setRelationship(activeRelationship || relationshipResponse.data[0]);
                    }
                } catch (err) {
                    // No relationship info available (might be admin or self-managed candidate)
                    console.log('No relationship info:', err);
                }
            } catch (err: any) {
                console.error('Failed to load relationship:', err);
            } finally {
                setRelationshipLoading(false);
            }
        }

        loadRelationship();
    }, [candidate, candidateId, getToken]);



    const handleSubmitToJob = async (jobId: string, notes: string, documentIds: string[]) => {
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            const client = createAuthenticatedClient(token);

            // Propose job to candidate (creates application in recruiter_proposed stage)
            // Candidate will receive notification and must approve before application proceeds
            const response = await client.post('/applications/propose-to-candidate', {
                candidate_id: candidateId,
                job_id: jobId,
                pitch: notes,  // Renamed from recruiter_notes to pitch
                document_ids: documentIds,
            });

            const applicationId = response.data?.data?.id || response.data?.id;

            // Show success message
            alert(`Job opportunity sent to ${candidate?.full_name || 'candidate'}! They'll receive an email notification and can review and approve the opportunity.`);

            // Redirect to the new application detail page
            if (applicationId) {
                router.push(`/applications/${applicationId}`);
            } else {
                // Refresh the page to show the new application
                window.location.reload();
            }
        } catch (err: any) {
            console.error('Failed to propose job to candidate:', err);
            throw new Error(err.message || 'Failed to send job opportunity to candidate');
        }
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'submitted': return 'badge-info';
            case 'screen': return 'badge-primary';
            case 'interview': return 'badge-warning';
            case 'offer': return 'badge-success';
            case 'hired': return 'badge-success';
            case 'rejected': return 'badge-error';
            default: return 'badge-ghost';
        }
    };

    const getStageIcon = (stage: string) => {
        switch (stage) {
            case 'submitted': return 'fa-file-import';
            case 'screen': return 'fa-phone';
            case 'interview': return 'fa-comments';
            case 'offer': return 'fa-file-contract';
            case 'hired': return 'fa-check-circle';
            case 'rejected': return 'fa-times-circle';
            default: return 'fa-circle';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getRelationshipStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return 'badge-success';
            case 'expired':
                return 'badge-warning';
            case 'terminated':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    };

    const getVerificationStatusBadge = (status: string) => {
        switch (status) {
            case 'verified':
                return 'badge-success';
            case 'pending':
                return 'badge-warning';
            case 'unverified':
                return 'badge-neutral';
            case 'rejected':
                return 'badge-error';
            default:
                return 'badge-ghost';
        }
    };

    const getVerificationStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return 'fa-circle-check';
            case 'pending':
                return 'fa-clock';
            case 'unverified':
                return 'fa-circle-question';
            case 'rejected':
                return 'fa-circle-xmark';
            default:
                return 'fa-circle';
        }
    };

    const isRelationshipExpiringSoon = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const daysUntilExpiration = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiration <= 30 && daysUntilExpiration > 0;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg"></span>
                    <p className="mt-4 text-base-content/70">Loading candidate details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-solid fa-circle-exclamation"></i>
                <span>{error}</span>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="alert alert-warning">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <span>Candidate not found</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm breadcrumbs">
                <ul>
                    <li><Link href="/candidates">Candidates</Link></li>
                    <li>{candidate.full_name}</li>
                </ul>
            </div>

            {/* Candidate Header */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="avatar avatar-placeholder">
                                <div className="bg-primary text-primary-content rounded-full w-20">
                                    <span className="text-2xl">{candidate.full_name[0]}</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">{candidate.full_name}</h1>
                                    {candidate.verification_status && (
                                        <span className={`badge ${getVerificationStatusBadge(candidate.verification_status)} gap-1`}>
                                            <i className={`fa-solid ${getVerificationStatusIcon(candidate.verification_status)}`}></i>
                                            {candidate.verification_status.charAt(0).toUpperCase() + candidate.verification_status.slice(1)}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-base-content/70">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-solid fa-envelope"></i>
                                        <a href={`mailto:${candidate.email}`} className="link link-hover">
                                            {candidate.email}
                                        </a>
                                    </div>
                                    {candidate.phone && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-solid fa-phone"></i>
                                            <span>{candidate.phone}</span>
                                        </div>
                                    )}
                                    {candidate.linkedin_url && (
                                        <div className="flex items-center gap-2">
                                            <i className="fa-brands fa-linkedin"></i>
                                            <a
                                                href={candidate.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="link link-hover"
                                            >
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                </div>
                                {(candidate.current_title || candidate.current_company || candidate.location) && (
                                    <div className="flex items-center gap-4 mt-2 text-sm text-base-content/70">
                                        {candidate.current_title && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-briefcase"></i>
                                                <span>{candidate.current_title}</span>
                                            </div>
                                        )}
                                        {candidate.current_company && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-building"></i>
                                                <span>{candidate.current_company}</span>
                                            </div>
                                        )}
                                        {candidate.location && (
                                            <div className="flex items-center gap-1">
                                                <i className="fa-solid fa-location-dot"></i>
                                                <span>{candidate.location}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                <div className="text-sm text-base-content/60 mt-1">
                                    Added {formatDate(candidate.created_at)}
                                </div>
                            </div>
                        </div>
                        {canEdit && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowSubmitWizard(true)}
                                    className="btn btn-success gap-2"
                                >
                                    <i className="fa-solid fa-paper-plane"></i>
                                    Send Job Opportunity
                                </button>
                                <Link href={`/candidates/${candidateId}/edit`} className="btn btn-primary gap-2">
                                    <i className="fa-solid fa-edit"></i>
                                    Edit
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recruiter Relationship Information */}
            {relationship && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-lg">Recruiter Relationship</h2>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`badge ${getRelationshipStatusBadge(relationship.status)}`}>
                                        {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-base-content/70">
                                    <div>
                                        <i className="fa-solid fa-calendar-plus mr-1"></i>
                                        Started: {formatDate(relationship.relationship_start_date)}
                                    </div>
                                    <div>
                                        <i className="fa-solid fa-calendar-xmark mr-1"></i>
                                        Expires: {formatDate(relationship.relationship_end_date)}
                                    </div>
                                </div>
                                {relationship.status === 'active' && isRelationshipExpiringSoon(relationship.relationship_end_date) && (
                                    <div className="alert alert-warning mt-2">
                                        <i className="fa-solid fa-triangle-exclamation"></i>
                                        <span>Relationship expires in less than 30 days. Consider renewing.</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {candidate.user_id && (
                <div className="alert alert-info">
                    <i className="fa-solid fa-info-circle"></i>
                    <span>This candidate is self-managed and has their own platform account.</span>
                </div>
            )}

            {/* Documents */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title text-lg mb-4">
                        <i className="fa-solid fa-file-lines mr-2"></i>
                        Documents
                    </h2>
                    <DocumentList
                        entityType="candidate"
                        entityId={candidateId}
                        showUpload={canEdit}
                    />
                </div>
            </div>

            {/* Applications */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Applications ({applications.length})</h2>

                {applicationsLoading ? (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body items-center text-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                            <p className="mt-4 text-base-content/70">Loading applications...</p>
                        </div>
                    </div>
                ) : applicationsError ? (
                    <div className="alert alert-error">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{applicationsError}</span>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="card bg-base-100 shadow">
                        <div className="card-body items-center text-center py-12">
                            <i className="fa-solid fa-inbox text-6xl text-base-content/20"></i>
                            <h3 className="text-xl font-semibold mt-4">No Applications</h3>
                            <p className="text-base-content/70 mt-2">
                                This candidate hasn't been submitted to any roles yet.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application) => (
                            <div key={application.id} className="card bg-base-100 shadow hover:shadow transition-shadow">
                                <div className="card-body">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Link
                                                    href={`/roles/${application.job_id}`}
                                                    className="text-lg font-semibold hover:link"
                                                >
                                                    {application.job?.title || 'Unknown Role'}
                                                </Link>
                                                <span className={`badge ${getStageColor(application.stage)}`}>
                                                    <i className={`fa-solid ${getStageIcon(application.stage)} mr-1`}></i>
                                                    {application.stage.charAt(0).toUpperCase() + application.stage.slice(1)}
                                                </span>
                                            </div>
                                            {application.job && (
                                                <div className="flex items-center gap-4 text-sm text-base-content/70 mb-3">
                                                    {application.job.location && (
                                                        <div className="flex items-center gap-1">
                                                            <i className="fa-solid fa-location-dot"></i>
                                                            <span>{application.job.location}</span>
                                                        </div>
                                                    )}
                                                    {application.job.department && (
                                                        <div className="flex items-center gap-1">
                                                            <i className="fa-solid fa-building"></i>
                                                            <span>{application.job.department}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1">
                                                        <i className="fa-solid fa-percent"></i>
                                                        <span>{application.job.fee_percentage}% fee</span>
                                                    </div>
                                                </div>
                                            )}
                                            {application.notes && (
                                                <div className="bg-base-200 rounded-lg p-3 mt-2">
                                                    <div className="text-xs font-semibold text-base-content/60 mb-1">Notes</div>
                                                    <div className="text-sm">{application.notes}</div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-4 text-xs text-base-content/60 mt-3">
                                                <div>
                                                    <i className="fa-solid fa-calendar-plus mr-1"></i>
                                                    Submitted {formatDate(application.created_at)}
                                                </div>
                                                <div>
                                                    <i className="fa-solid fa-clock mr-1"></i>
                                                    Updated {formatDate(application.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <Link
                                                href={`/applications/${application.id}`}
                                                className="btn btn-sm btn-ghost"
                                            >
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Activity Timeline (Phase 1 - Simple version) */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Activity Timeline</h2>
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        {applicationsLoading ? (
                            <div className="text-center py-8">
                                <span className="loading loading-spinner loading-md"></span>
                                <p className="mt-2 text-sm text-base-content/70">Loading timeline...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {applications
                                    .slice()
                                    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                                    .map((app) => (
                                        <div key={app.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${getStageColor(app.stage).replace('badge-', 'bg-')}`}></div>
                                                <div className="w-px h-full bg-base-300"></div>
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="font-semibold">
                                                    Stage updated to {app.stage}
                                                </div>
                                                <div className="text-sm text-base-content/70">
                                                    {app.job?.title || 'Unknown Role'}
                                                </div>
                                                <div className="text-xs text-base-content/60 mt-1">
                                                    {formatDate(app.updated_at)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-base-300"></div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold">Candidate added</div>
                                        <div className="text-xs text-base-content/60 mt-1">
                                            {formatDate(candidate.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit to Job Wizard */}
            {showSubmitWizard && (
                <SubmitToJobWizard
                    candidateId={candidateId}
                    candidateName={candidate.full_name}
                    onClose={() => setShowSubmitWizard(false)}
                    onSubmit={handleSubmitToJob}
                />
            )}
        </div>
    );
}
