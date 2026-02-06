"use client";

interface RecruiterCompanyRelationship {
    id: string;
    recruiter_id: string;
    company_id: string;
    relationship_type: "sourcer" | "recruiter";
    status: "pending" | "active" | "declined" | "terminated";
    can_manage_company_jobs: boolean;
    relationship_start_date?: string;
    relationship_end_date?: string;
    termination_reason?: string;
    invited_by?: string;
    created_at: string;
    updated_at: string;
    recruiter?: {
        id: string;
        user_id: string;
        user?: { name: string; email: string };
    };
    company?: {
        id: string;
        name: string;
        industry?: string;
        headquarters_location?: string;
        logo_url?: string;
    };
}

interface InvitationListItemProps {
    invitation: RecruiterCompanyRelationship;
    isSelected: boolean;
    onSelect: () => void;
}

export function InvitationListItem({
    invitation,
    isSelected,
    onSelect,
}: InvitationListItemProps) {
    const company = invitation.company;
    const isPending = invitation.status === "pending";

    // Status badge configuration
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return "badge-success";
            case "declined":
                return "badge-error";
            case "terminated":
                return "badge-neutral";
            default:
                return "badge-info";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "active":
                return "fa-check-circle";
            case "declined":
                return "fa-times-circle";
            case "terminated":
                return "fa-ban";
            default:
                return "fa-clock";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "active":
                return "Active";
            case "declined":
                return "Declined";
            case "terminated":
                return "Terminated";
            default:
                return "Pending";
        }
    };

    // Get initials for company avatar
    const getInitials = (name: string) => {
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div
            onClick={onSelect}
            className={`
                group relative p-3 sm:p-4 border-b border-base-300 cursor-pointer transition-all duration-200
                hover:bg-base-100
                ${isSelected ? "bg-base-100 border-l-4 border-l-primary shadow-sm z-10" : "border-l-4 border-l-transparent"}
                ${isPending && !isSelected ? "bg-base-100/40" : ""}
            `}
        >
            <div className="flex items-start gap-3">
                {/* Company Avatar */}
                <div className="avaatar avatar-placeholder shrink-0">
                    {company?.logo_url ? (
                        <div className="w-10 h-10 rounded-lg">
                            <img src={company.logo_url} alt={company.name} />
                        </div>
                    ) : (
                        <div className="bg-secondary text-secondary-content rounded-lg w-10 h-10">
                            <span className="text-sm">
                                {getInitials(company?.name || "CO")}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <h3
                            className={`truncate text-sm ${isPending ? "font-bold text-base-content" : "font-medium text-base-content/90"}`}
                        >
                            {company?.name || "Unknown Company"}
                        </h3>

                        {isPending && (
                            <span
                                className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse"
                                title="Pending invitation"
                            ></span>
                        )}
                    </div>

                    <div className="text-xs text-base-content/60 truncate mb-1.5">
                        {company?.industry && <span>{company.industry}</span>}
                        {company?.headquarters_location && (
                            <span className="opacity-70">
                                {company.industry ? " • " : ""}
                                {company.headquarters_location}
                            </span>
                        )}
                    </div>

                    {/* Status Badge */}
                    <div className="flex flex-wrap gap-1.5">
                        <span
                            className={`badge badge-xs ${getStatusBadge(invitation.status)} badge-soft gap-1 border-0`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${getStatusIcon(invitation.status)} text-[10px]`}
                            ></i>
                            {getStatusLabel(invitation.status)}
                        </span>

                        {invitation.can_manage_company_jobs && (
                            <span className="badge badge-xs badge-warning badge-soft gap-1 border-0">
                                <i className="fa-duotone fa-regular fa-briefcase text-[10px]"></i>
                                Can Manage Jobs
                            </span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                        className={`text-[10px] ${isPending ? "font-semibold text-primary" : "text-base-content/40"}`}
                    >
                        {new Date(invitation.created_at).toLocaleDateString(
                            undefined,
                            {
                                month: "short",
                                day: "numeric",
                            },
                        )}
                    </span>
                </div>
            </div>
        </div>
    );
}
