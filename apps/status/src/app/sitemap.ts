import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://status.splits.network";

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "hourly",
            priority: 1,
        },
        {
            url: `${baseUrl}/history`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/incidents`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/uptime`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.7,
        },
    ];
}
