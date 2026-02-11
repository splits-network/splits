import type { MetadataRoute } from 'next';
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

const baseUrl = 'https://employment-networks.com';
const appRoot = join(process.cwd(), "apps", "corporate", "src", "app");

const routes = [
    '',
    '/cookie-policy',
    '/privacy-policy',
    '/status',
    '/terms-of-service',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const getLastModifiedForPath = (path: string) => {
        const relative = path === '' ? "page.tsx" : `${path.slice(1)}/page.tsx`;
        const filePath = join(appRoot, relative);
        if (existsSync(filePath)) {
            return statSync(filePath).mtime;
        }
        return new Date();
    };

    return routes.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: getLastModifiedForPath(path),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority:
            path === ''
                ? 1
                : path === "/status"
                  ? 0.4
                  : 0.3,
    }));
}
