import Link from "next/link";

export default function RolesAndPermissionsIndexPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-3">
                <nav className="text-sm breadcrumbs">
                    <ul>
                        <li>
                            <Link href="/public/documentation">Documentation</Link>
                        </li>
                        <li>Roles &amp; Permissions</li>
                    </ul>
                </nav>
                <h1 className="text-3xl font-semibold">Roles &amp; Permissions</h1>
                <p className="text-base text-base-content/70 max-w-3xl">
                    Understand what each role can see and do in Splits Network, and
                    how permissions affect workflows.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/public/documentation/roles-and-permissions/recruiter"
                    className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                >
                    <div className="card-body">
                        <h2 className="card-title">Recruiter Capabilities</h2>
                        <p className="text-sm text-base-content/70">
                            What recruiters can access across roles, candidates,
                            applications, and placements.
                        </p>
                    </div>
                </Link>
                <Link
                    href="/public/documentation/roles-and-permissions/hiring-manager"
                    className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                >
                    <div className="card-body">
                        <h2 className="card-title">Hiring Manager Capabilities</h2>
                        <p className="text-sm text-base-content/70">
                            Review applications, collaborate with recruiters, and
                            manage company workflows.
                        </p>
                    </div>
                </Link>
                <Link
                    href="/public/documentation/roles-and-permissions/company-admin"
                    className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                >
                    <div className="card-body">
                        <h2 className="card-title">Company Admin Capabilities</h2>
                        <p className="text-sm text-base-content/70">
                            Manage settings, teams, and permissions across the
                            organization.
                        </p>
                    </div>
                </Link>
                <Link
                    href="/public/documentation/roles-and-permissions/role-based-access"
                    className="card bg-base-200 shadow hover:shadow-lg transition-shadow"
                >
                    <div className="card-body">
                        <h2 className="card-title">Role-Based Access</h2>
                        <p className="text-sm text-base-content/70">
                            How access is determined and why navigation changes by
                            role.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
