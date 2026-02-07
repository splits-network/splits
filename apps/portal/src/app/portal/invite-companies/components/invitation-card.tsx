"use client";

interface InvitationCardProps {
    invitation: {
        id: string;
        invite_code: string;
        invited_email?: string;
        company_name_hint?: string;
        status: "pending" | "accepted" | "expired" | "revoked";
        expires_at: string;
        created_at: string;
    };
    onCopyCode: () => void;
    onCopyLink: () => void;
    onShare: () => void;
    onResend?: () => void;
    onRevoke?: () => void;
    isResending?: boolean;
    isRevoking?: boolean;
}

export function InvitationCard({
    invitation,
    onCopyCode,
    onCopyLink,
    onShare,
    onResend,
    onRevoke,
    isResending,
    isRevoking,
}: InvitationCardProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return <span className="badge badge-warning badge-sm">Pending</span>;
            case "accepted":
                return <span className="badge badge-success badge-sm">Accepted</span>;
            case "expired":
                return <span className="badge badge-ghost badge-sm">Expired</span>;
            case "revoked":
                return <span className="badge badge-error badge-sm">Revoked</span>;
            default:
                return <span className="badge badge-sm">{status}</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const isExpiringSoon = () => {
        const expiresAt = new Date(invitation.expires_at);
        const now = new Date();
        const daysUntilExpiry = Math.ceil(
            (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    };

    return (
        <div className="card bg-base-100 border border-base-200">
            <div className="card-body p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h3 className="font-semibold text-base">
                            {invitation.company_name_hint || "Company Invitation"}
                        </h3>
                        {invitation.invited_email && (
                            <p className="text-sm text-base-content/70">
                                {invitation.invited_email}
                            </p>
                        )}
                    </div>
                    {getStatusBadge(invitation.status)}
                </div>

                {/* Invite Code */}
                <div className="bg-base-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs text-base-content/60 uppercase tracking-wider">
                                Code
                            </span>
                            <code className="block font-mono font-bold text-lg">
                                {invitation.invite_code}
                            </code>
                        </div>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={onCopyCode}
                            title="Copy code"
                        >
                            <i className="fa-duotone fa-regular fa-copy"></i>
                        </button>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex gap-4 text-xs text-base-content/70 mb-4">
                    <div>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(invitation.created_at)}
                    </div>
                    <div className={isExpiringSoon() ? "text-warning font-medium" : ""}>
                        <span className="font-medium">Expires:</span>{" "}
                        {formatDate(invitation.expires_at)}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                    <button
                        className="btn btn-outline btn-sm flex-1"
                        onClick={onCopyLink}
                    >
                        <i className="fa-duotone fa-regular fa-link mr-1"></i>
                        Link
                    </button>
                    <button
                        className="btn btn-primary btn-sm flex-1"
                        onClick={onShare}
                    >
                        <i className="fa-duotone fa-regular fa-share mr-1"></i>
                        Share
                    </button>
                    {onResend && (
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={onResend}
                            disabled={isResending}
                        >
                            {isResending ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-envelope"></i>
                            )}
                        </button>
                    )}
                    {onRevoke && (
                        <button
                            className="btn btn-ghost btn-sm text-error"
                            onClick={onRevoke}
                            disabled={isRevoking}
                        >
                            {isRevoking ? (
                                <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                                <i className="fa-duotone fa-regular fa-ban"></i>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
