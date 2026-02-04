export type DocsNavItem = {
    title: string;
    href: string;
    description?: string;
    comingSoon?: boolean;
};

export type DocsNavSection = {
    title: string;
    items: DocsNavItem[];
};

export const docsNavSections: DocsNavSection[] = [
    {
        title: "Getting Started",
        items: [
            {
                title: "Documentation Home",
                href: "/public/documentation",
                description: "Start here",
            },
            {
                title: "What Is Splits Network",
                href: "/public/documentation/getting-started/what-is-splits-network",
            },
            {
                title: "First-Time Setup",
                href: "/public/documentation/getting-started/first-time-setup",
            },
            {
                title: "Navigation Overview",
                href: "/public/documentation/getting-started/navigation-overview",
            },
        ],
    },
    {
        title: "Roles & Permissions",
        items: [
            {
                title: "Overview",
                href: "/public/documentation/roles-and-permissions",
            },
            {
                title: "Recruiter Capabilities",
                href: "/public/documentation/roles-and-permissions/recruiter",
            },
            {
                title: "Hiring Manager Capabilities",
                href: "/public/documentation/roles-and-permissions/hiring-manager",
            },
            {
                title: "Company Admin Capabilities",
                href: "/public/documentation/roles-and-permissions/company-admin",
            },
            {
                title: "Role-Based Access",
                href: "/public/documentation/roles-and-permissions/role-based-access",
            },
        ],
    },
    {
        title: "Core Workflows",
        items: [
            {
                title: "Overview",
                href: "/public/documentation/core-workflows",
            },
            {
                title: "Create And Publish A Role",
                href: "/public/documentation/core-workflows/create-and-publish-a-role",
            },
            {
                title: "Invite Recruiters Or Teammates",
                href: "/public/documentation/core-workflows/invite-recruiters-or-teammates",
            },
            {
                title: "Add Or Import Candidates",
                href: "/public/documentation/core-workflows/add-or-import-candidates",
            },
            {
                title: "Submit A Candidate",
                href: "/public/documentation/core-workflows/submit-a-candidate",
            },
            {
                title: "Review Applications And Move Stages",
                href: "/public/documentation/core-workflows/review-applications-and-move-stages",
            },
            {
                title: "Mark A Hire And Track Placements",
                href: "/public/documentation/core-workflows/mark-a-hire-and-track-placements",
            },
            {
                title: "Communicate With Recruiters And Candidates",
                href: "/public/documentation/core-workflows/communicate-with-recruiters-and-candidates",
            },
        ],
    },
    {
        title: "Feature Guides",
        items: [
            {
                title: "Overview",
                href: "/public/documentation/feature-guides",
            },
            {
                title: "Dashboard",
                href: "/public/documentation/feature-guides/dashboard",
            },
            {
                title: "Roles",
                href: "/public/documentation/feature-guides/roles",
            },
            {
                title: "Candidates",
                href: "/public/documentation/feature-guides/candidates",
            },
            {
                title: "Applications",
                href: "/public/documentation/feature-guides/applications",
            },
            {
                title: "Invitations",
                href: "/public/documentation/feature-guides/invitations",
            },
            {
                title: "Messages",
                href: "/public/documentation/feature-guides/messages",
            },
            {
                title: "Placements",
                href: "/public/documentation/feature-guides/placements",
            },
            {
                title: "Profile",
                href: "/public/documentation/feature-guides/profile",
            },
            {
                title: "Billing",
                href: "/public/documentation/feature-guides/billing",
            },
            {
                title: "Company Settings",
                href: "/public/documentation/feature-guides/company-settings",
            },
            {
                title: "Team Management",
                href: "/public/documentation/feature-guides/team-management",
            },
            {
                title: "Notifications",
                href: "/public/documentation/feature-guides/notifications",
            },
            {
                title: "Integrations",
                href: "/public/documentation/integrations",
                comingSoon: true,
            },
        ],
    },
];

