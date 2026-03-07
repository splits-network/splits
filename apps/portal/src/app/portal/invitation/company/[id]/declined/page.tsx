import Link from "next/link";

export default function InvitationDeclinedPage() {
    return (
        <main className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 bg-base-300 text-base-content/60 flex items-center justify-center mx-auto mb-6">
                    <i className="fa-duotone fa-regular fa-xmark text-3xl" />
                </div>
                <h1 className="text-2xl font-black mb-2">Request Declined</h1>
                <p className="text-sm text-base-content/60 mb-8 leading-relaxed">
                    The representation request has been declined. The recruiter will be
                    notified. They can send a new request in the future if needed.
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
