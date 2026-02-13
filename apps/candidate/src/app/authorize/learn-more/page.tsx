import Link from "next/link";

export default function LearnMorePage() {
    return (
        <div className="min-h-screen bg-base-200 py-12 px-4">
            <div className="container mx-auto max-w-2xl">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="text-2xl font-bold text-primary mb-2">
                                Applicant.Network
                            </div>
                            <h1 className="text-3xl font-bold">
                                About AI Job Copilot
                            </h1>
                        </div>

                        {/* Overview */}
                        <section className="mb-8">
                            <p className="text-lg text-base-content/80">
                                AI Job Copilot is a Custom GPT in ChatGPT that
                                helps you search for jobs, analyze your resume
                                against job postings, check application statuses,
                                and submit applications -- all through natural
                                language conversation.
                            </p>
                        </section>

                        <div className="divider"></div>

                        {/* What Data is Shared */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-shield-halved text-primary"></i>{" "}
                                What Data is Shared
                            </h2>
                            <p className="text-base-content/70 mb-4">
                                Your data is only accessed when you interact with
                                the GPT. There is no background data collection.
                            </p>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <i className="fa-duotone fa-regular fa-magnifying-glass text-primary text-2xl mt-1"></i>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Search Jobs
                                        </h3>
                                        <p className="text-base-content/70">
                                            Access public job listings to help you
                                            find relevant opportunities. No
                                            personal data is required for this
                                            action.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <i className="fa-duotone fa-regular fa-list-check text-primary text-2xl mt-1"></i>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Check Your Applications
                                        </h3>
                                        <p className="text-base-content/70">
                                            View the status of your submitted job
                                            applications, including dates,
                                            statuses, and related notes.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <i className="fa-duotone fa-regular fa-paper-plane text-primary text-2xl mt-1"></i>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Submit Applications
                                        </h3>
                                        <p className="text-base-content/70">
                                            Submit job applications on your behalf
                                            when you explicitly request it in the
                                            conversation. This permission is only
                                            requested when needed.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <i className="fa-duotone fa-regular fa-file-lines text-primary text-2xl mt-1"></i>
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            Analyze Resume Fit
                                        </h3>
                                        <p className="text-base-content/70">
                                            Access your resume to analyze how well
                                            you match with specific job postings
                                            and provide tailored recommendations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="divider"></div>

                        {/* Managing Your Connection */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-sliders text-primary"></i>{" "}
                                Managing Your Connection
                            </h2>
                            <p className="text-base-content/70 mb-4">
                                You are in full control of your connection to the
                                AI Job Copilot GPT.
                            </p>
                            <ul className="space-y-2 text-base-content/70">
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                    <span>
                                        Revoke access at any time from your{" "}
                                        <Link
                                            href="/portal/profile"
                                            className="link link-primary"
                                        >
                                            Profile → Connected Apps
                                        </Link>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                    <span>
                                        View active sessions and their last usage
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-check text-success mt-1"></i>
                                    <span>
                                        Revoke individual sessions if needed
                                    </span>
                                </li>
                            </ul>
                        </section>

                        <div className="divider"></div>

                        {/* Security */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold mb-4">
                                <i className="fa-duotone fa-regular fa-lock text-primary"></i>{" "}
                                Security
                            </h2>
                            <ul className="space-y-2 text-base-content/70">
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-shield-check text-primary mt-1"></i>
                                    <span>
                                        Access tokens expire every{" "}
                                        <strong>15 minutes</strong> for enhanced
                                        security
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-shield-check text-primary mt-1"></i>
                                    <span>
                                        You can have up to{" "}
                                        <strong>5 active sessions</strong> at a
                                        time
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-shield-check text-primary mt-1"></i>
                                    <span>
                                        Revoking a session{" "}
                                        <strong>immediately stops all access</strong>
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <i className="fa-duotone fa-regular fa-shield-check text-primary mt-1"></i>
                                    <span>
                                        All authorization events are logged and
                                        audited
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {/* Back Link */}
                        <div className="text-center mt-8">
                            <button
                                onClick={() => window.history.back()}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                Back to Authorization
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
