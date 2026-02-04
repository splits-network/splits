import Link from "next/link";

const workflows = [
    {
        title: "Create And Publish A Role",
        href: "/public/documentation/core-workflows/create-and-publish-a-role",
        description: "Define compensation, requirements, and publish the role.",
    },
    {
        title: "Invite Recruiters Or Teammates",
        href: "/public/documentation/core-workflows/invite-recruiters-or-teammates",
        description: "Add collaborators and control access from the Team or Invitations pages.",
    },
    {
        title: "Add Or Import Candidates",
        href: "/public/documentation/core-workflows/add-or-import-candidates",
        description: "Create candidate profiles and manage sourcing details.",
    },
    {
        title: "Submit A Candidate",
        href: "/public/documentation/core-workflows/submit-a-candidate",
        description: "Submit candidates to roles and track submissions.",
    },
    {
        title: "Review Applications And Move Stages",
        href: "/public/documentation/core-workflows/review-applications-and-move-stages",
        description: "Review applications, add notes, and move stages forward.",
    },
    {
        title: "Mark A Hire And Track Placements",
        href: "/public/documentation/core-workflows/mark-a-hire-and-track-placements",
        description: "Finalize hires and confirm placement tracking.",
    },
    {
        title: "Communicate With Recruiters And Candidates",
        href: "/public/documentation/core-workflows/communicate-with-recruiters-and-candidates",
        description: "Use Messages and Notifications for collaboration.",
    },
];

export default function CoreWorkflowsIndexPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <nav className="text-sm breadcrumbs">
                    <ul>
                        <li>
                            <Link href="/public/documentation">Documentation</Link>
                        </li>
                        <li>Core Workflows</li>
                    </ul>
                </nav>
                <h1 className="text-3xl font-semibold">Core Workflows</h1>
                <p className="text-base text-base-content/70 max-w-3xl">
                    Step-by-step guides for the most common tasks across Splits
                    Network.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {workflows.map((workflow) => (
                    <Link
                        key={workflow.href}
                        href={workflow.href}
                        className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                    >
                        <div className="card-body">
                            <h2 className="card-title">{workflow.title}</h2>
                            <p className="text-sm text-base-content/70">
                                {workflow.description}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
