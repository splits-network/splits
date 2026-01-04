// Type definition from my-recruiters-section (extended with additional fields)
interface RecruiterRelationship {
    id: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_bio?: string;
    recruiter_status: string;
    relationship_status: string;
    status: string;  // Overall status: 'active' | 'expired' | 'terminated'
    valid_until?: string;
    created_at: string;
    days_until_expiry?: number;
    relationship_start_date: string;
    relationship_end_date: string;
    consent_given?: boolean;
}

interface RecruiterCardProps {
    relationship: RecruiterRelationship;
    showActions?: boolean;
}

export function RecruiterCard({ relationship, showActions = true }: RecruiterCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusBadge = () => {
        if (relationship.status === 'active') {
            if (relationship.days_until_expiry !== undefined && relationship.days_until_expiry <= 30) {
                return <span className="badge badge-warning">Expires Soon</span>;
            }
            return <span className="badge badge-success">Active</span>;
        }
        if (relationship.status === 'expired') {
            return <span className="badge badge-ghost">Expired</span>;
        }
        return <span className="badge badge-error badge-outline">Terminated</span>;
    };

    const showExpiryWarning = relationship.status === 'active' &&
        relationship.days_until_expiry !== undefined &&
        relationship.days_until_expiry <= 30;

    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
                {/* Header with name and status */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="avatar avatar-placeholder">
                            <div className="bg-primary text-primary-content rounded-full w-12">
                                <span className="text-lg">
                                    {relationship.recruiter_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                                {relationship.recruiter_name}
                            </h3>
                            <p className="text-sm text-base-content/70 truncate">
                                {relationship.recruiter_email}
                            </p>
                        </div>
                    </div>
                    <div>
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Relationship dates */}
                <div className="text-sm text-base-content/70 mt-2">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar"></i>
                        <span>
                            {formatDate(relationship.relationship_start_date)} - {formatDate(relationship.relationship_end_date)}
                        </span>
                    </div>
                </div>

                {/* Expiry warning */}
                {showExpiryWarning && (
                    <div className="alert alert-warning mt-3">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <span>Expiring in {relationship.days_until_expiry} days</span>
                    </div>
                )}

                {/* Bio */}
                {relationship.recruiter_bio && (
                    <div className="mt-3">
                        <p className="text-sm text-base-content/80 line-clamp-2">
                            {relationship.recruiter_bio}
                        </p>
                    </div>
                )}

                {/* Consent status */}
                {relationship.status === 'active' && !relationship.consent_given && (
                    <div className="alert alert-info mt-3">
                        <i className="fa-solid fa-info-circle"></i>
                        <span className="text-sm">
                            Pending consent confirmation
                        </span>
                    </div>
                )}

                {/* Actions */}
                {showActions && relationship.status === 'active' && (
                    <div className="card-actions justify-end mt-4">
                        <a
                            href={`mailto:${relationship.recruiter_email}`}
                            className="btn btn-sm btn-ghost"
                        >
                            <i className="fa-solid fa-envelope"></i>
                            Contact
                        </a>
                        {showExpiryWarning && (
                            <button className="btn btn-sm btn-primary">
                                <i className="fa-solid fa-rotate"></i>
                                Request Renewal
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
