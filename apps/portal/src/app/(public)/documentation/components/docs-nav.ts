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
                href: "/documentation",
                description: "Start here",
            },
            {
                title: "What Is Splits Network",
                href: "/documentation/getting-started/what-is-splits-network",
            },
            {
                title: "First-Time Setup",
                href: "/documentation/getting-started/first-time-setup",
            },
            {
                title: "Navigation Overview",
                href: "/documentation/getting-started/navigation-overview",
            },
        ],
    },
    {
        title: "Roles & Permissions",
        items: [
            {
                title: "Overview",
                href: "/documentation/roles-and-permissions",
            },
            {
                title: "Recruiter Capabilities",
                href: "/documentation/roles-and-permissions/recruiter",
            },
            {
                title: "Hiring Manager Capabilities",
                href: "/documentation/roles-and-permissions/hiring-manager",
            },
            {
                title: "Company Admin Capabilities",
                href: "/documentation/roles-and-permissions/company-admin",
            },
            {
                title: "Role-Based Access",
                href: "/documentation/roles-and-permissions/role-based-access",
            },
        ],
    },
    {
        title: "Core Workflows",
        items: [
            {
                title: "Overview",
                href: "/documentation/core-workflows",
            },
            {
                title: "Create And Publish A Role",
                href: "/documentation/core-workflows/create-and-publish-a-role",
            },
            {
                title: "Invite Recruiters Or Teammates",
                href: "/documentation/core-workflows/invite-recruiters-or-teammates",
            },
            {
                title: "Add Or Import Candidates",
                href: "/documentation/core-workflows/add-or-import-candidates",
            },
            {
                title: "Submit A Candidate",
                href: "/documentation/core-workflows/submit-a-candidate",
            },
            {
                title: "Review Applications And Move Stages",
                href: "/documentation/core-workflows/review-applications-and-move-stages",
            },
            {
                title: "Mark A Hire And Track Placements",
                href: "/documentation/core-workflows/mark-a-hire-and-track-placements",
            },
            {
                title: "Communicate With Recruiters And Candidates",
                href: "/documentation/core-workflows/communicate-with-recruiters-and-candidates",
            },
        ],
    },
    {
        title: "Feature Guides",
        items: [
            {
                title: "Overview",
                href: "/documentation/feature-guides",
            },
            {
                title: "Dashboard",
                href: "/documentation/feature-guides/dashboard",
            },
            {
                title: "Roles",
                href: "/documentation/feature-guides/roles",
            },
            {
                title: "Candidates",
                href: "/documentation/feature-guides/candidates",
            },
            {
                title: "Applications",
                href: "/documentation/feature-guides/applications",
            },
            {
                title: "Invitations",
                href: "/documentation/feature-guides/invitations",
            },
            {
                title: "Messages",
                href: "/documentation/feature-guides/messages",
            },
            {
                title: "Placements",
                href: "/documentation/feature-guides/placements",
            },
            {
                title: "Profile",
                href: "/documentation/feature-guides/profile",
            },
            {
                title: "Billing",
                href: "/documentation/feature-guides/billing",
            },
            {
                title: "Company Settings",
                href: "/documentation/feature-guides/company-settings",
            },
            {
                title: "Team Management",
                href: "/documentation/feature-guides/team-management",
            },
            {
                title: "Notifications",
                href: "/documentation/feature-guides/notifications",
            },
            {
                title: "Integrations",
                href: "/documentation/integrations",
                comingSoon: true,
            },
        ],
    },
];

