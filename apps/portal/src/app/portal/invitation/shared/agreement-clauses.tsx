"use client";

interface AgreementClauseProps {
    num: number;
    title: string;
    children: React.ReactNode;
}

export function AgreementClause({ num, title, children }: AgreementClauseProps) {
    return (
        <div className="flex gap-4">
            <span className="w-7 h-7 bg-base-300 text-base-content/60 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                {num}
            </span>
            <div>
                <p className="font-bold text-sm mb-1">{title}</p>
                <p className="text-sm text-base-content/70 leading-relaxed">
                    {children}
                </p>
            </div>
        </div>
    );
}

interface RecruiterCompanyAgreementProps {
    recruiterName: string;
    companyName: string;
    direction: "recruiter-to-company" | "company-to-recruiter";
}

export function RecruiterCompanyAgreement({
    recruiterName,
    companyName,
    direction,
}: RecruiterCompanyAgreementProps) {
    const isCompanyAccepting = direction === "recruiter-to-company";

    return (
        <div className="bg-base-200 p-6 space-y-4 text-sm">
            <AgreementClause num={1} title="Scope of Relationship">
                {isCompanyAccepting ? (
                    <>
                        By accepting this request, <strong>{companyName}</strong>{" "}
                        agrees to establish a recruiter representation relationship with{" "}
                        <strong>{recruiterName}</strong> on the Splits Network platform.
                        This grants the recruiter specific permissions to interact with
                        your company&apos;s job listings and candidate pipeline, as
                        configured in the next step.
                    </>
                ) : (
                    <>
                        By accepting this invitation, <strong>{recruiterName}</strong>{" "}
                        agrees to establish a recruiter relationship with{" "}
                        <strong>{companyName}</strong> on the Splits Network platform.
                        The company will configure the specific permissions granted to you.
                    </>
                )}
            </AgreementClause>

            <AgreementClause num={2} title="Candidate Submissions">
                The recruiter may submit candidates to the company&apos;s open
                positions through the platform. Each submission creates a tracked
                application with full audit trail, ensuring transparency for both
                parties.
            </AgreementClause>

            <AgreementClause num={3} title="Attribution and Commission">
                When the recruiter submits a candidate who is subsequently hired,
                the recruiter is entitled to placement fees as defined by the
                company&apos;s billing terms and the platform&apos;s fee structure.
                Attribution is tracked automatically from the point of submission.
            </AgreementClause>

            <AgreementClause num={4} title="Permissions Are Configurable">
                {isCompanyAccepting ? (
                    <>
                        You control what the recruiter can do.  In the next step, you
                        will choose which permissions to grant (e.g., viewing jobs,
                        submitting candidates, advancing applications). You can modify
                        these permissions at any time from your network dashboard.
                    </>
                ) : (
                    <>
                        The company controls what permissions you are granted. These
                        may include viewing jobs, submitting candidates, and advancing
                        applications. The company can modify your permissions at any
                        time.
                    </>
                )}
            </AgreementClause>

            <AgreementClause num={5} title="Confidentiality">
                Both parties agree to treat candidate information, job details,
                and business terms shared through the platform as confidential.
                Information shall only be used for the purpose of the recruiting
                relationship.
            </AgreementClause>

            <AgreementClause num={6} title="Communication">
                Both parties agree to maintain professional communication through
                the platform&apos;s messaging system. All communications are logged
                and accessible to both parties for the duration of the relationship.
            </AgreementClause>

            <AgreementClause num={7} title="Termination">
                Either party may terminate this relationship at any time through
                the platform. Termination does not affect the recruiter&apos;s
                attribution rights for candidates submitted prior to termination.
                Active applications will continue through completion.
            </AgreementClause>

            <AgreementClause num={8} title="Platform Terms">
                This relationship is governed by the Splits Network Terms of
                Service. Both parties acknowledge that they have read and agree to
                the platform&apos;s terms and conditions.
            </AgreementClause>

            <div className="bg-base-100 p-4 border-l-4 border-primary mt-4">
                <p className="text-xs text-base-content/70">
                    <strong>Effective Date:</strong> This agreement takes effect
                    immediately upon acceptance and remains in effect until
                    terminated by either party.
                </p>
            </div>
        </div>
    );
}
