import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { formatDate } from '@/lib/utils';
import WithdrawButton from '@/components/withdraw-button';
import AIReviewPanel from '@/components/ai-review-panel';
import { ApplicationDetailClient } from './components/application-detail-client';

const getStatusColor = (stage: string) => {
    switch (stage) {
        case 'draft':
            return 'badge-ghost';
        case 'ai_review':
            return 'badge-warning';
        case 'screen':
        case 'submitted':
            return 'badge-info';
        case 'interviewing':
            return 'badge-primary';
        case 'offer':
            return 'badge-success';
        case 'rejected':
        case 'withdrawn':
            return 'badge-error';
        default:
            return 'badge-ghost';
    }
};

const formatStage = (stage: string) => {
    switch (stage) {
        case 'draft':
            return 'Draft';
        case 'ai_review':
            return 'AI Review';
        case 'screen':
            return 'Recruiter Review';
        case 'submitted':
            return 'Submitted to Company';
        case 'interviewing':
            return 'Interviewing';
        case 'offer':
            return 'Offer Received';
        case 'rejected':
            return 'Not Selected';
        case 'withdrawn':
            return 'Withdrawn';
        default:
            return stage;
    }
};

export default async function ApplicationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const token = await getToken();
    if (!token) {
        redirect('/sign-in');
    }

    // Await params in Next.js 15+
    const { id } = await params;
    // Fetch application data server-side
    let application: any = null;
    let job: any = {};
    let recruiter: any = null;

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const response = await fetch(`${apiUrl}/v2/applications/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            if (response.status === 404) {
                notFound();
            }
            throw new Error(`Failed to fetch application: ${response.status}`);
        }

        const payload = await response.json();
        const data = payload.data || payload;
        application = data;
        job = data.job || {};
        recruiter = (data as any).recruiter || null;
    } catch (err) {
        console.error('Error fetching application:', err);
        notFound();
    }

    if (!application) {
        notFound();
    }

    const company = job.company || {};

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <div className="text-sm breadcrumbs mb-6">
                <ul>
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/applications">Applications</Link></li>
                    <li>Application Details</li>
                </ul>
            </div>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{job.title || 'Position'}</h1>
                        <p className="text-xl text-base-content/70">{company.name || 'Company'}</p>
                    </div>
                    <span className={`badge badge-lg ${getStatusColor(application.stage)}`}>
                        {formatStage(application.stage)}
                    </span>
                </div>
            </div>

            {/* Proposal Alert - Shows when recruiter has proposed this job */}
            <ApplicationDetailClient application={application} job={job} token={token || ''} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Details */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-solid fa-briefcase"></i>
                                Job Details
                            </h2>

                            <div className="space-y-6">
                                {/* Quick Facts Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                                    {job.location && (
                                        <div>
                                            <div className="text-sm text-base-content/60 mb-1">Location</div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <i className="fa-solid fa-location-dot text-primary"></i>
                                                {job.location}
                                            </div>
                                        </div>
                                    )}

                                    {job.employment_type && (
                                        <div>
                                            <div className="text-sm text-base-content/60 mb-1">Employment Type</div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <i className="fa-solid fa-clock text-primary"></i>
                                                {job.employment_type === 'full_time' ? 'Full Time' :
                                                    job.employment_type === 'contract' ? 'Contract' :
                                                        job.employment_type === 'temporary' ? 'Temporary' :
                                                            job.employment_type}
                                            </div>
                                        </div>
                                    )}

                                    {(job.salary_min || job.salary_max) && (
                                        <div>
                                            <div className="text-sm text-base-content/60 mb-1">Salary Range</div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <i className="fa-solid fa-dollar-sign text-primary"></i>
                                                {job.salary_min && job.salary_max ? (
                                                    `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                                                ) : job.salary_min ? (
                                                    `From $${job.salary_min.toLocaleString()}`
                                                ) : (
                                                    `Up to $${job.salary_max?.toLocaleString()}`
                                                )}
                                                {job.salary_currency && job.salary_currency !== 'USD' && ` ${job.salary_currency}`}
                                            </div>
                                        </div>
                                    )}

                                    {job.department && (
                                        <div>
                                            <div className="text-sm text-base-content/60 mb-1">Department</div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <i className="fa-solid fa-building text-primary"></i>
                                                {job.department}
                                            </div>
                                        </div>
                                    )}

                                    {typeof job.open_to_relocation !== 'undefined' && (
                                        <div>
                                            <div className="text-sm text-base-content/60 mb-1">Relocation</div>
                                            <div className="flex items-center gap-2 font-medium">
                                                <i className={`fa-solid ${job.open_to_relocation ? 'fa-check-circle text-success' : 'fa-times-circle text-base-content/40'}`}></i>
                                                {job.open_to_relocation ? 'Open to Relocation' : 'No Relocation'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {(job.candidate_description || job.recruiter_description || job.description) && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-align-left text-primary"></i>
                                            About This Role
                                        </h3>
                                        <div className="prose max-w-none">
                                            <div className="whitespace-pre-wrap">
                                                {job.candidate_description || job.recruiter_description || job.description}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                {job.requirements && job.requirements.length > 0 && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-list-check text-primary"></i>
                                            Requirements
                                        </h3>

                                        {/* Mandatory Requirements */}
                                        {job.requirements.filter((r: any) => r.requirement_type === 'mandatory').length > 0 && (
                                            <div className="mb-4">
                                                <div className="text-sm font-medium text-error mb-2">Required</div>
                                                <ul className="space-y-2">
                                                    {job.requirements
                                                        .filter((r: any) => r.requirement_type === 'mandatory')
                                                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                                                        .map((req: any) => (
                                                            <li key={req.id} className="flex items-start gap-2">
                                                                <i className="fa-solid fa-circle-check text-error mt-1 flex-shrink-0"></i>
                                                                <span>{req.description}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Preferred Requirements */}
                                        {job.requirements.filter((r: any) => r.requirement_type === 'preferred').length > 0 && (
                                            <div>
                                                <div className="text-sm font-medium text-info mb-2">Preferred</div>
                                                <ul className="space-y-2">
                                                    {job.requirements
                                                        .filter((r: any) => r.requirement_type === 'preferred')
                                                        .sort((a: any, b: any) => a.sort_order - b.sort_order)
                                                        .map((req: any) => (
                                                            <li key={req.id} className="flex items-start gap-2">
                                                                <i className="fa-solid fa-circle-plus text-info mt-1 flex-shrink-0"></i>
                                                                <span>{req.description}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Company Information */}
                                {company && (company.description || company.industry || company.company_size || company.headquarters_location || company.website) && (
                                    <div>
                                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-building text-primary"></i>
                                            About {company.name}
                                        </h3>

                                        <div className="space-y-3">
                                            {/* Company Quick Facts */}
                                            {(company.industry || company.company_size || company.headquarters_location) && (
                                                <div className="flex flex-wrap gap-4 text-sm">
                                                    {company.industry && (
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-solid fa-industry text-base-content/60"></i>
                                                            <span>{company.industry}</span>
                                                        </div>
                                                    )}
                                                    {company.company_size && (
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-solid fa-users text-base-content/60"></i>
                                                            <span>{company.company_size}</span>
                                                        </div>
                                                    )}
                                                    {company.headquarters_location && (
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-solid fa-map-marker-alt text-base-content/60"></i>
                                                            <span>{company.headquarters_location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {company.description && (
                                                <div className="prose max-w-none">
                                                    <p className="text-base-content/80">{company.description}</p>
                                                </div>
                                            )}

                                            {company.website && (
                                                <div>
                                                    <a
                                                        href={company.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn btn-sm btn-outline"
                                                    >
                                                        <i className="fa-solid fa-external-link-alt"></i>
                                                        Company Website
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {application.documents && application.documents.length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    <i className="fa-solid fa-file"></i>
                                    Documents
                                </h2>

                                <div className="space-y-2">
                                    {application.documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <i className={`fa-solid ${doc.document_type === 'resume' ? 'fa-file-text' :
                                                    doc.document_type === 'cover_letter' ? 'fa-file-lines' :
                                                        'fa-file'
                                                    } text-primary`}></i>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{doc.file_name}</div>
                                                    <div className="text-sm text-base-content/60">
                                                        {doc.document_type.replace('_', ' ').toUpperCase()}
                                                        {doc.file_size && ` • ${(doc.file_size / 1024).toFixed(1)} KB`}
                                                    </div>
                                                </div>
                                            </div>
                                            {doc.metadata?.is_primary && (
                                                <span className="badge badge-primary badge-sm">Primary</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pre-screen Answers */}
                    {application.pre_screen_answers && application.pre_screen_answers.length > 0 && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    <i className="fa-solid fa-clipboard-question"></i>
                                    Pre-screen Answers
                                </h2>

                                <div className="space-y-4">
                                    {application.pre_screen_answers.map((answer: any, index: number) => (
                                        <div key={index}>
                                            <div className="font-medium mb-1">{answer.question}</div>
                                            <div className="text-base-content/70">{answer.answer}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Application Info */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-solid fa-info-circle"></i>
                                Application Info
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm text-base-content/60">Application Date</div>
                                    <div>{formatDate(application.created_at)}</div>
                                </div>

                                {application.updated_at !== application.created_at && (
                                    <div>
                                        <div className="text-sm text-base-content/60">Last Updated</div>
                                        <div>{formatDate(application.updated_at)}</div>
                                    </div>
                                )}

                                <div>
                                    <div className="text-sm text-base-content/60">Status</div>
                                    <div className="mt-1">
                                        <span className={`badge ${getStatusColor(application.stage)}`}>
                                            {formatStage(application.stage)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title mb-4">
                                <i className="fa-solid fa-ellipsis"></i>
                                Actions
                            </h2>

                            <div className="space-y-2">
                                {application.stage !== 'withdrawn' && application.stage !== 'rejected' && (
                                    <WithdrawButton
                                        applicationId={application.id}
                                        jobTitle={job.title || 'this position'}
                                        isJobClosed={['closed', 'filled', 'cancelled'].includes(job.status)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Application Notes */}
                    {(application.notes || application.recruiter_notes) && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    <i className="fa-solid fa-note-sticky"></i>
                                    Notes
                                </h2>

                                {application.notes && (
                                    <div className="mb-4">
                                        <div className="text-sm text-base-content/60 mb-2">Your Notes</div>
                                        <div className="alert">
                                            <i className="fa-solid fa-user"></i>
                                            <span>{application.notes}</span>
                                        </div>
                                    </div>
                                )}

                                {application.recruiter_notes && (
                                    <div>
                                        <div className="text-sm text-base-content/60 mb-2">Recruiter Notes</div>
                                        <div className="alert alert-info">
                                            <i className="fa-solid fa-circle-info"></i>
                                            <span>{application.recruiter_notes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI Review Panel - Show if ai_review stage or later */}
                    {(application.stage === 'ai_review' ||
                        application.stage === 'screen' ||
                        application.stage === 'submitted' ||
                        application.stage === 'interviewing' ||
                        application.stage === 'offer' ||
                        application.ai_reviewed) && (
                            <AIReviewPanel
                                applicationId={application.id}
                                token={token || ''}
                            />
                        )}

                    {/* Recruiter Info */}
                    {recruiter && (
                        <div className="card bg-base-100 shadow">
                            <div className="card-body">
                                <h2 className="card-title mb-4">
                                    <i className="fa-solid fa-user-tie"></i>
                                    Your Recruiter
                                </h2>

                                <div className="space-y-3">
                                    <div>
                                        <div className="text-sm text-base-content/60">Name</div>
                                        <div className="font-medium">
                                            {recruiter.first_name} {recruiter.last_name}
                                        </div>
                                    </div>

                                    {recruiter.email && (
                                        <div>
                                            <div className="text-sm text-base-content/60">Email</div>
                                            <a href={`mailto:${recruiter.email}`} className="link link-primary">
                                                {recruiter.email}
                                            </a>
                                        </div>
                                    )}

                                    {recruiter.phone && (
                                        <div>
                                            <div className="text-sm text-base-content/60">Phone</div>
                                            <a href={`tel:${recruiter.phone}`} className="link link-primary">
                                                {recruiter.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
