import type { MetadataRoute } from 'next';
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllArticleSlugs } from "@/lib/press";

const baseUrl = 'https://splits.network';
const appRoot = join(process.cwd(), "apps", "portal", "src", "app");

const publicRoutes = [
    '',
    '/about',
    '/blog',
    '/brand',
    '/careers',
    '/cookie-policy',
    '/documentation',
    '/features',
    '/for-companies',
    '/for-recruiters',
    '/how-it-works',
    '/integration-partners',
    '/partners',
    '/press',
    '/pricing',
    '/privacy-policy',
    '/status',
    '/terms-of-service',
    '/transparency',
    '/updates',
];

const documentationRoutes = [
    '/documentation/getting-started',
    '/documentation/getting-started/what-is-splits-network',
    '/documentation/getting-started/first-time-setup',
    '/documentation/getting-started/navigation-overview',
    '/documentation/roles-and-permissions',
    '/documentation/roles-and-permissions/recruiter',
    '/documentation/roles-and-permissions/hiring-manager',
    '/documentation/roles-and-permissions/company-admin',
    '/documentation/roles-and-permissions/role-based-access',
    '/documentation/core-workflows',
    '/documentation/core-workflows/create-and-publish-a-role',
    '/documentation/core-workflows/invite-recruiters-or-teammates',
    '/documentation/core-workflows/add-or-import-candidates',
    '/documentation/core-workflows/submit-a-candidate',
    '/documentation/core-workflows/review-applications-and-move-stages',
    '/documentation/core-workflows/mark-a-hire-and-track-placements',
    '/documentation/core-workflows/communicate-with-recruiters-and-candidates',
    '/documentation/feature-guides',
    '/documentation/feature-guides/dashboard',
    '/documentation/feature-guides/roles',
    '/documentation/feature-guides/candidates',
    '/documentation/feature-guides/applications',
    '/documentation/feature-guides/invitations',
    '/documentation/feature-guides/messages',
    '/documentation/feature-guides/placements',
    '/documentation/feature-guides/profile',
    '/documentation/feature-guides/billing',
    '/documentation/feature-guides/company-settings',
    '/documentation/feature-guides/team-management',
    '/documentation/feature-guides/notifications',
    '/documentation/integrations',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const pressArticleRoutes = getAllArticleSlugs().map(
        (slug) => `/press/${slug}`,
    );
    const routes = [...publicRoutes, ...documentationRoutes, ...pressArticleRoutes];
    const corePages = new Set([
        "/features",
        "/pricing",
        "/how-it-works",
        "/for-recruiters",
        "/for-companies",
        "/about",
    ]);
    const legalPages = new Set([
        "/cookie-policy",
        "/privacy-policy",
        "/terms-of-service",
    ]);
    const weeklyPages = new Set([
        "/blog",
        "/updates",
        "/press",
    ]);
    const yearlyPages = new Set([
        "/cookie-policy",
        "/privacy-policy",
        "/terms-of-service",
    ]);

    const getLastModifiedForPath = (path: string) => {
        const relative = path === "" ? "page.tsx" : `${path.slice(1)}/page.tsx`;
        const filePath = join(appRoot, relative);
        if (existsSync(filePath)) {
            return statSync(filePath).mtime;
        }
        return new Date();
    };

    return routes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: getLastModifiedForPath(path),
        changeFrequency:
            path === ""
                ? "weekly"
                : yearlyPages.has(path)
                    ? "yearly"
                    : weeklyPages.has(path)
                        ? "weekly"
                        : "monthly",
        priority:
            path === ''
                ? 1
                : legalPages.has(path)
                    ? 0.3
                    : path === "/status"
                        ? 0.4
                        : corePages.has(path)
                            ? 0.9
                            : path.startsWith("/press/")
                                ? 0.6
                                : path.startsWith("/documentation")
                                    ? 0.7
                                    : 0.7,
    }));
}
