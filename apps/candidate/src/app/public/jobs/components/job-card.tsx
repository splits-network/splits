import { useRouter } from 'next/navigation';
import { EntityCard, DataRow, VerticalDataRow, DataList } from '@/components/ui/cards';
import { formatSalary, formatRelativeTime } from '@/lib/utils';

interface JobRequirement {
    id: string;
    requirement_type: 'mandatory' | 'preferred';
    description: string;
    sort_order: number;
}

interface Job {
    id: string;
    title: string;
    company?: {
        name: string;
        description?: string | null;
        industry?: string | null;
        headquarters_location?: string | null;
        logo_url?: string | null;
    };
    department?: string | null;
    location?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    employment_type?: string | null;
    open_to_relocation?: boolean;
    updated_at?: string;
    created_at?: string | Date;
    status?: string;
    description?: string | null;
    candidate_description?: string | null;
    requirements?: JobRequirement[];
}

// Compute job freshness badge
function getJobFreshnessBadge(postedAt?: string | Date, createdAt?: string | Date) {
    const date = postedAt || createdAt;
    if (!date) return null;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const daysOld = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));

    if (daysOld <= 3) {
        return { label: 'New', color: 'badge-success', icon: 'fa-sparkles' };
    } else if (daysOld <= 7) {
        return { label: 'Recent', color: 'badge-secondary', icon: 'fa-clock' };
    }
    return null; // Don't show badge for older jobs
}

interface JobCardProps {
    job: Job;
}

export default function JobCard({ job }: JobCardProps) {
    const router = useRouter();
    const freshnessBadge = getJobFreshnessBadge(job.updated_at, job.created_at);

    // Compute company initials for avatar fallback
    const companyInitials = (() => {
        const name = job.company?.name || 'Company';
        const words = name.split(' ');
        const firstInitial = words[0]?.[0]?.toUpperCase() || '';
        const lastInitial = words[words.length - 1]?.[0]?.toUpperCase() || '';
        return words.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    const viewJob = () => {
        router.push(`/public/jobs/${job.id}`);
    };

    // Format employment type for display
    const formatEmploymentType = (type?: string) => {
        if (!type) return 'Not specified';
        return type.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Get truncated description
    const getDescription = () => {
        const desc = job.candidate_description || job.description;
        if (!desc) return 'No description provided';
        return desc.length > 150 ? desc.substring(0, 150) + '...' : desc;
    };

    return (
        <EntityCard className='group hover:shadow-lg transition-all duration-200'>
            <EntityCard.Header>
                <div className='flex items-center justify-between gap-3 min-w-0'>
                    <div className='flex items-center gap-3 min-w-0'>
                        {/* Company Logo/Avatar */}
                        <div className="avatar avatar-placeholder">
                            <div className="bg-base-200 text-base-content rounded-lg w-10 h-10">
                                {job.company?.logo_url ? (
                                    <img src={job.company.logo_url} alt={job.company.name} className='object-contain w-full h-full' />
                                ) : (
                                    <span className="text-lg">
                                        {companyInitials}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className='flex flex-col min-w-0'>
                            <h3 className="font-semibold text-md truncate flex items-center gap-2">
                                {job.title}
                            </h3>
                            <div className="text-sm text-base-content/70 truncate">
                                {job.company?.name || 'Company'}
                            </div>
                        </div>
                    </div>
                    {freshnessBadge && (
                        <span className={`badge ${freshnessBadge.color} badge-sm gap-1 whitespace-nowrap`}>
                            <i className={`fa-duotone fa-regular ${freshnessBadge.icon} text-xs`}></i>
                            <span className="hidden sm:inline">{freshnessBadge.label}</span>
                        </span>
                    )}
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList>
                    <VerticalDataRow label="Description" icon='fa-file-lines'>
                        <span className="w-full text-sm text-base-content/80 line-clamp-3">
                            {getDescription()}
                        </span>
                    </VerticalDataRow>
                    <DataRow
                        label="Location"
                        icon='fa-location-dot'
                        value={job.location || 'Not specified'}
                    />
                    <DataRow
                        label="Employment Type"
                        icon='fa-briefcase'
                        value={formatEmploymentType(job.employment_type ?? undefined)}
                    />
                    {(job.salary_min || job.salary_max) && (
                        <DataRow
                            label="Salary Range"
                            icon='fa-dollar-sign'
                            value={formatSalary(job.salary_min ?? 0, job.salary_max ?? 0)}
                        />
                    )}
                    {job.department && (
                        <DataRow
                            label="Department"
                            icon='fa-building'
                            value={job.department}
                        />
                    )}
                    {job.company?.industry && (
                        <VerticalDataRow label="Industry" icon='fa-industry'>
                            <div className='w-full'>
                                <span className="badge badge-sm">
                                    {job.company.industry}
                                </span>
                            </div>
                        </VerticalDataRow>
                    )}
                </DataList>
            </EntityCard.Body>
            <EntityCard.Footer>
                <div className='flex justify-between items-center'>
                    <div>
                        {job.open_to_relocation && (
                            <span className="badge badge-outline badge-sm gap-1 mb-1">
                                <i className="fa-duotone fa-regular fa-location-arrow text-xs"></i>
                                Open to Relocation
                            </span>
                        )}
                        <div className="text-xs text-base-content/50">
                            Posted: {formatRelativeTime(job.updated_at || job.created_at || new Date().toISOString())}
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={viewJob}
                    >
                        View Job
                        <i className="fa-duotone fa-regular fa-arrow-right"></i>
                    </button>
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}
