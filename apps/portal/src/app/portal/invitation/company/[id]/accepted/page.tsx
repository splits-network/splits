import Link from "next/link";

export default function InvitationAcceptedPage() {
    return (
        <main className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 bg-success text-success-content flex items-center justify-center mx-auto mb-6">
                    <i className="fa-duotone fa-regular fa-check text-3xl" />
                </div>
                <h1 className="text-2xl font-black mb-2">Representation Approved</h1>
                <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
                    The recruiter is now authorized to represent your company with the
                    permissions you configured. You can change these at any time from
                    your network dashboard.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/portal/company-invitations"
                        className="btn btn-primary gap-2"
                    >
                        <i className="fa-duotone fa-regular fa-network-wired" />
                        View Network
                    </Link>
                    <Link
                        href="/portal/dashboard"
                        className="btn btn-ghost gap-2"
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
