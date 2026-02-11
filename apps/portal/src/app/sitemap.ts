import type { MetadataRoute } from 'next';

const baseUrl = 'https://splits.network';

const publicRoutes = [
    '',
    '/public/about',
    '/public/blog',
    '/public/careers',
    '/public/cookie-policy',
    '/public/documentation',
    '/public/features',
    '/public/for-companies',
    '/public/for-recruiters',
    '/public/how-it-works',
    '/public/integration-partners',
    '/public/partners',
    '/public/press',
    '/public/pricing',
    '/public/privacy-policy',
    '/public/status',
    '/public/terms-of-service',
    '/public/transparency',
    '/public/updates',
];

const documentationRoutes = [
    '/public/documentation/getting-started',
    '/public/documentation/getting-started/what-is-splits-network',
    '/public/documentation/getting-started/first-time-setup',
    '/public/documentation/getting-started/navigation-overview',
    '/public/documentation/roles-and-permissions',
    '/public/documentation/roles-and-permissions/recruiter',
    '/public/documentation/roles-and-permissions/hiring-manager',
    '/public/documentation/roles-and-permissions/company-admin',
    '/public/documentation/roles-and-permissions/role-based-access',
    '/public/documentation/core-workflows',
    '/public/documentation/core-workflows/create-and-publish-a-role',
    '/public/documentation/core-workflows/invite-recruiters-or-teammates',
    '/public/documentation/core-workflows/add-or-import-candidates',
    '/public/documentation/core-workflows/submit-a-candidate',
    '/public/documentation/core-workflows/review-applications-and-move-stages',
    '/public/documentation/core-workflows/mark-a-hire-and-track-placements',
    '/public/documentation/core-workflows/communicate-with-recruiters-and-candidates',
    '/public/documentation/feature-guides',
    '/public/documentation/feature-guides/dashboard',
    '/public/documentation/feature-guides/roles',
    '/public/documentation/feature-guides/candidates',
    '/public/documentation/feature-guides/applications',
    '/public/documentation/feature-guides/invitations',
    '/public/documentation/feature-guides/messages',
    '/public/documentation/feature-guides/placements',
    '/public/documentation/feature-guides/profile',
    '/public/documentation/feature-guides/billing',
    '/public/documentation/feature-guides/company-settings',
    '/public/documentation/feature-guides/team-management',
    '/public/documentation/feature-guides/notifications',
    '/public/documentation/integrations',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();
    const routes = [...publicRoutes, ...documentationRoutes];
    const corePages = new Set([
        "/public/features",
        "/public/pricing",
        "/public/how-it-works",
        "/public/for-recruiters",
        "/public/for-companies",
        "/public/about",
    ]);
    const legalPages = new Set([
        "/public/cookie-policy",
        "/public/privacy-policy",
        "/public/terms-of-service",
    ]);

    return routes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority:
            path === ''
                ? 1
                : legalPages.has(path)
                  ? 0.3
                  : path === "/public/status"
                    ? 0.4
                    : corePages.has(path)
                      ? 0.9
                      : path.startsWith("/public/documentation")
                        ? 0.7
                        : 0.7,
    }));
}
