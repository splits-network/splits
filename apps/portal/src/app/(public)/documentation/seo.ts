import type { Metadata } from "next";
import { buildCanonical, PORTAL_BASE_URL } from "@/lib/seo";

type DocMeta = {
    title: string;
    description: string;
    canonicalPath: string;
};

export const DOCS_METADATA: Record<string, DocMeta> = {
    index: {
        title: "Documentation",
        description:
            "Practical guidance for recruiters, hiring managers, and company admins using Splits Network. Start with Getting Started or jump straight to a feature guide.",
        canonicalPath: "/documentation",
    },
    "getting-started": {
        title: "Getting Started",
        description:
            "Start here if you are new to Splits Network or want a fast refresher on how the platform works.",
        canonicalPath: "/documentation/getting-started",
    },
    "getting-started/what-is-splits-network": {
        title: "What Is Splits Network",
        description:
            "A collaborative recruiting platform that keeps recruiters, hiring managers, and company admins aligned on roles, candidates, and placements.",
        canonicalPath:
            "/documentation/getting-started/what-is-splits-network",
    },
    "getting-started/first-time-setup": {
        title: "First-Time Setup",
        description:
            "Get access, connect to your organization, and complete onboarding so you can start working on roles and candidates.",
        canonicalPath:
            "/documentation/getting-started/first-time-setup",
    },
    "getting-started/navigation-overview": {
        title: "Navigation Overview",
        description:
            "Learn how the sidebar and mobile dock map to your daily tasks so you can move between roles, candidates, and applications quickly.",
        canonicalPath:
            "/documentation/getting-started/navigation-overview",
    },
    "roles-and-permissions": {
        title: "Roles & Permissions",
        description:
            "Understand what each role can see and do in Splits Network, and how permissions affect workflows.",
        canonicalPath: "/documentation/roles-and-permissions",
    },
    "roles-and-permissions/recruiter": {
        title: "Recruiter Capabilities",
        description:
            "What recruiters can see and do across roles, candidates, applications, and placements.",
        canonicalPath:
            "/documentation/roles-and-permissions/recruiter",
    },
    "roles-and-permissions/hiring-manager": {
        title: "Hiring Manager Capabilities",
        description:
            "What hiring managers can see and do while reviewing applications and collaborating with recruiters.",
        canonicalPath:
            "/documentation/roles-and-permissions/hiring-manager",
    },
    "roles-and-permissions/company-admin": {
        title: "Company Admin Capabilities",
        description:
            "What company admins can see and manage across organization settings, team access, and billing.",
        canonicalPath:
            "/documentation/roles-and-permissions/company-admin",
    },
    "roles-and-permissions/role-based-access": {
        title: "Role-Based Access",
        description:
            "How permissions are determined and why navigation changes based on your role.",
        canonicalPath:
            "/documentation/roles-and-permissions/role-based-access",
    },
    "core-workflows": {
        title: "Core Workflows",
        description:
            "Step-by-step guides for the most common tasks across Splits Network.",
        canonicalPath: "/documentation/core-workflows",
    },
    "core-workflows/create-and-publish-a-role": {
        title: "Create And Publish A Role",
        description:
            "Set up a role with compensation, requirements, and visibility so recruiters can submit candidates.",
        canonicalPath:
            "/documentation/core-workflows/create-and-publish-a-role",
    },
    "core-workflows/invite-recruiters-or-teammates": {
        title: "Invite Recruiters Or Teammates",
        description:
            "Invite collaborators to your organization and assign the correct permissions.",
        canonicalPath:
            "/documentation/core-workflows/invite-recruiters-or-teammates",
    },
    "core-workflows/add-or-import-candidates": {
        title: "Add Or Import Candidates",
        description:
            "Create candidate profiles and capture sourcing details so submissions stay organized.",
        canonicalPath:
            "/documentation/core-workflows/add-or-import-candidates",
    },
    "core-workflows/submit-a-candidate": {
        title: "Submit A Candidate",
        description:
            "Submit a candidate to a role and track the application through review stages.",
        canonicalPath:
            "/documentation/core-workflows/submit-a-candidate",
    },
    "core-workflows/review-applications-and-move-stages": {
        title: "Review Applications And Move Stages",
        description:
            "Review applications, add notes, and move candidates through the hiring stages.",
        canonicalPath:
            "/documentation/core-workflows/review-applications-and-move-stages",
    },
    "core-workflows/mark-a-hire-and-track-placements": {
        title: "Mark A Hire And Track Placements",
        description:
            "Finalize a hire and ensure placements capture fee and earnings details.",
        canonicalPath:
            "/documentation/core-workflows/mark-a-hire-and-track-placements",
    },
    "core-workflows/communicate-with-recruiters-and-candidates": {
        title: "Communicate With Recruiters And Candidates",
        description:
            "Use Messages and Notifications to coordinate feedback, updates, and next steps.",
        canonicalPath:
            "/documentation/core-workflows/communicate-with-recruiters-and-candidates",
    },
    "feature-guides": {
        title: "Feature Guides",
        description:
            "Feature-specific documentation for every major area of the platform.",
        canonicalPath: "/documentation/feature-guides",
    },
    "feature-guides/dashboard": {
        title: "Dashboard",
        description:
            "Quick view of roles, invitations, and activity based on your role.",
        canonicalPath: "/documentation/feature-guides/dashboard",
    },
    "feature-guides/roles": {
        title: "Roles",
        description: "Create, manage, and track role status and ownership.",
        canonicalPath: "/documentation/feature-guides/roles",
    },
    "feature-guides/candidates": {
        title: "Candidates",
        description:
            "Manage candidate profiles, verification status, and sourcing data.",
        canonicalPath: "/documentation/feature-guides/candidates",
    },
    "feature-guides/applications": {
        title: "Applications",
        description:
            "Track candidate submissions, review stages, and decision history.",
        canonicalPath: "/documentation/feature-guides/applications",
    },
    "feature-guides/invitations": {
        title: "Invitations",
        description: "Invite teammates and track invitation status.",
        canonicalPath: "/documentation/feature-guides/invitations",
    },
    "feature-guides/messages": {
        title: "Messages",
        description:
            "Centralized conversations with recruiters and company collaborators.",
        canonicalPath: "/documentation/feature-guides/messages",
    },
    "feature-guides/placements": {
        title: "Placements",
        description: "Track hires, fees, and recruiter earnings.",
        canonicalPath: "/documentation/feature-guides/placements",
    },
    "feature-guides/profile": {
        title: "Profile",
        description: "Update your profile details, preferences, and visibility.",
        canonicalPath: "/documentation/feature-guides/profile",
    },
    "feature-guides/billing": {
        title: "Billing",
        description: "Manage subscription details and payment methods.",
        canonicalPath: "/documentation/feature-guides/billing",
    },
    "feature-guides/company-settings": {
        title: "Company Settings",
        description:
            "Manage organization profile, settings, and shared preferences.",
        canonicalPath: "/documentation/feature-guides/company-settings",
    },
    "feature-guides/team-management": {
        title: "Team Management",
        description: "Manage team members, roles, and access levels.",
        canonicalPath: "/documentation/feature-guides/team-management",
    },
    "feature-guides/notifications": {
        title: "Notifications",
        description: "Track updates, action items, and system alerts.",
        canonicalPath: "/documentation/feature-guides/notifications",
    },
    integrations: {
        title: "Integrations",
        description:
            "Integration documentation is coming soon. Check back for setup guides and troubleshooting.",
        canonicalPath: "/documentation/integrations",
    },
};

export function getDocMetadata(slug: string): Metadata {
    const entry = DOCS_METADATA[slug];

    if (!entry) {
        return {
            title: "Splits Network Documentation",
            description:
                "Guides and troubleshooting for recruiters, hiring managers, and company admins.",
            ...buildCanonical("/documentation"),
        };
    }

    return {
        title: `${entry.title} | Splits Network Documentation`,
        description: entry.description,
        ...buildCanonical(entry.canonicalPath),
    };
}

function buildBreadcrumbJsonLd(slug: string) {
    const crumbs: { label: string; path: string }[] = [
        { label: "Documentation", path: "/documentation" },
    ];

    if (slug !== "index") {
        const [section, page] = slug.split("/");
        const sectionMeta = DOCS_METADATA[section];
        if (sectionMeta) {
            crumbs.push({ label: sectionMeta.title, path: sectionMeta.canonicalPath });
        }
        if (page) {
            const pageMeta = DOCS_METADATA[slug];
            if (pageMeta) {
                crumbs.push({ label: pageMeta.title, path: pageMeta.canonicalPath });
            }
        }
    }

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: `${PORTAL_BASE_URL}${crumb.path}`,
        })),
    };
}

function buildDocArticleJsonLd(slug: string) {
    if (!slug.includes("/")) {
        return null;
    }

    const entry = DOCS_METADATA[slug];
    if (!entry) {
        return null;
    }

    const url = `${PORTAL_BASE_URL}${entry.canonicalPath}`;
    const isHowTo = slug.startsWith("core-workflows/");

    if (isHowTo) {
        return {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: entry.title,
            description: entry.description,
            url,
            publisher: {
                "@type": "Organization",
                name: "Splits Network",
                url: "https://splits.network",
            },
        };
    }

    return {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: entry.title,
        description: entry.description,
        url,
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": url,
        },
        publisher: {
            "@type": "Organization",
            name: "Splits Network",
            url: "https://splits.network",
        },
    };
}

export function getDocJsonLd(slug: string) {
    const breadcrumbJsonLd = buildBreadcrumbJsonLd(slug);
    const articleJsonLd = buildDocArticleJsonLd(slug);

    return articleJsonLd ? [breadcrumbJsonLd, articleJsonLd] : breadcrumbJsonLd;
}
