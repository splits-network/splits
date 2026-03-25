import type { MetadataRoute } from 'next';
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { getContentPages } from "@/lib/content";

const baseUrl = 'https://employment-networks.com';
const appRoot = join(process.cwd(), "apps", "corporate", "src", "app");

function toDate(value?: string) {
    return value ? new Date(value) : new Date();
}

interface RouteConfig {
    path: string;
    changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}

const routes: RouteConfig[] = [
    // Homepage
    { path: '', changeFrequency: 'weekly', priority: 1.0 },

    // Core product pages
    { path: '/showcase', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.8 },

    // Legal pages (change rarely)
    { path: '/cookie-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const getLastModifiedForPath = (path: string) => {
        const relative = path === '' ? "page.tsx" : `${path.slice(1)}/page.tsx`;
        const filePath = join(appRoot, relative);
        if (existsSync(filePath)) {
            return statSync(filePath).mtime;
        }
        return new Date();
    };

    const entries: MetadataRoute.Sitemap = routes.map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: getLastModifiedForPath(route.path),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }));

    // Fetch dynamic CMS pages from database
    try {
        const cmsPages = await getContentPages(undefined, 100);
        entries.push(
            ...cmsPages.map((page) => ({
                url: `${baseUrl}/cms/${page.page_type}/${page.slug}`,
                lastModified: toDate(page.updated_at ?? page.published_at),
                changeFrequency: (page.page_type === 'blog' || page.page_type === 'press'
                    ? 'weekly'
                    : page.page_type === 'legal'
                        ? 'yearly'
                        : 'monthly') as MetadataRoute.Sitemap[number]["changeFrequency"],
                priority: page.page_type === 'article' || page.page_type === 'blog'
                    ? 0.7
                    : page.page_type === 'press'
                        ? 0.6
                        : page.page_type === 'legal'
                            ? 0.3
                            : 0.5,
            })),
        );
    } catch (error) {
        console.error("Failed to fetch CMS pages for sitemap:", error);
    }

    return entries;
}
