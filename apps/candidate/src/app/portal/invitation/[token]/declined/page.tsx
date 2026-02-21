import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Invitation Declined | Applicant Network',
    description: 'You have declined the recruiter invitation',
};

export default function DeclinedPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-base-200 flex items-center justify-center mx-auto mb-5">
                        <i className="fa-duotone fa-regular fa-circle-xmark text-3xl text-base-content/40"></i>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Invitation declined
                    </h1>
                    <p className="text-base-content/60">
                        You have declined the representation agreement. Your
                        recruiter has been notified.
                    </p>
                </div>

                <div className="bg-base-200 border-t-4 border-base-300 p-6 mb-6">
                    <h2 className="text-sm font-black uppercase tracking-wider mb-3">
                        Changed Your Mind?
                    </h2>
                    <p className="text-sm text-base-content/60 leading-relaxed">
                        If you would like to reconsider, reach out to your
                        recruiter directly and ask them to send a new invitation.
                        Previous invitations cannot be reopened once declined.
                    </p>
                </div>

                <div className="flex gap-3 justify-center">
                    <Link
                        href="/portal/dashboard"
                        className="btn btn-primary"
                    >
                        <i className="fa-duotone fa-regular fa-gauge-high"></i>
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
