import { getContentPages } from "@/lib/content";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://employment-networks.com";

function escapeXml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

export async function GET() {
    const pages = await getContentPages("blog", 50);

    const now = new Date().toUTCString();

    const items = pages
        .map((page) => {
            const title = escapeXml(page.title || "Untitled");
            const link = escapeXml(`${baseUrl}/cms/blog/${page.slug}`);
            const pubDate = page.published_at
                ? new Date(page.published_at).toUTCString()
                : new Date().toUTCString();
            const description = escapeXml(page.description || "");

            return [
                "<item>",
                `  <title>${title}</title>`,
                `  <link>${link}</link>`,
                `  <guid>${link}</guid>`,
                `  <pubDate>${pubDate}</pubDate>`,
                `  <description>${description}</description>`,
                ...(page.author ? [`  <author>${escapeXml(page.author)}</author>`] : []),
                "</item>",
            ].join("\n");
        })
        .join("\n");

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0">',
        "<channel>",
        "<title>Employment Networks Blog</title>",
        `<link>${baseUrl}/cms/blog</link>`,
        "<description>Latest blog posts from Employment Networks.</description>",
        "<language>en-us</language>",
        `<lastBuildDate>${now}</lastBuildDate>`,
        items || "",
        "</channel>",
        "</rss>",
    ].join("\n");

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=600",
        },
    });
}
