import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://status.splits.network";

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "always",
            priority: 1,
        },
    ];
}
