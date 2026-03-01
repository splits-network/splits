import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || "https://status.splits.network";

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            },
            {
                userAgent: "ChatGPT-User",
                allow: "/",
            },
            {
                userAgent: "GPTBot",
                allow: "/",
            },
            {
                userAgent: "anthropic-ai",
                allow: "/",
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
