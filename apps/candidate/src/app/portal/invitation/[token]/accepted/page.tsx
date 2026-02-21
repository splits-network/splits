import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Agreement Accepted | Applicant Network',
    description: 'You have successfully accepted the recruiter invitation',
};

const NEXT_STEPS = [
    {
        num: "01",
        title: "Your recruiter reviews your profile",
        description: "They will assess your experience and identify roles that fit.",
    },
    {
        num: "02",
        title: "Opportunities appear in your dashboard",
        description: "Every role you are submitted for will show up with full details and status tracking.",
    },
    {
        num: "03",
        title: "Stay informed at every stage",
        description: "You will receive updates as your applications progress through employer review.",
    },
    {
        num: "04",
        title: "Communicate directly",
        description: "Use the platform to message your recruiter with questions, preferences, or availability changes.",
    },
];

export default function AcceptedPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center p-6">
            <div className="max-w-lg w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                        <i className="fa-duotone fa-regular fa-check text-3xl text-success"></i>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">
                        Agreement accepted
                    </h1>
                    <p className="text-base-content/60">
                        You and your recruiter are now connected. They can begin
                        submitting you for roles that match your background.
                    </p>
                </div>

                <div className="bg-base-200 border-t-4 border-success p-6 mb-6">
                    <h2 className="text-sm font-black uppercase tracking-wider mb-4">
                        What Happens Next
                    </h2>
                    <div className="space-y-4">
                        {NEXT_STEPS.map((step) => (
                            <div key={step.num} className="flex items-start gap-3">
                                <span className="w-6 h-6 bg-success text-success-content flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                                    {step.num}
                                </span>
                                <div>
                                    <p className="text-sm font-bold">{step.title}</p>
                                    <p className="text-sm text-base-content/60">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-l-4 border-info bg-info/5 p-4 mb-6 flex items-start gap-3">
                    <i className="fa-duotone fa-regular fa-info-circle text-info mt-0.5"></i>
                    <p className="text-sm text-base-content/70">
                        You can manage this relationship and all future recruiter
                        connections from your dashboard. If your circumstances
                        change, you can update your preferences at any time.
                    </p>
                </div>

                <div className="text-center">
                    <Link href="/portal/dashboard" className="btn btn-primary">
                        <i className="fa-duotone fa-regular fa-gauge-high"></i>
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
