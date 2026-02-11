import type { Metadata } from "next";
import { BlogContent } from "./blog-content";
import { buildCanonical, buildArticleJsonLd } from "@/lib/seo";
import { JsonLd } from "@splits-network/shared-ui";

export const metadata: Metadata = {
    title: "Blog",
    description: "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
    openGraph: {
        title: "Blog",
        description: "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
        url: "https://splits.network/public/blog",
    },
    ...buildCanonical("/public/blog"),
};

export default function BlogPage() {
    const articleJsonLd = buildArticleJsonLd({
        title: "Splits Network Blog",
        description:
            "Recruiting insights, product updates, and split placement strategies from Splits Network to help you grow placements and collaborate more effectively.",
        path: "/public/blog",
    });

    return (
        <>
            <JsonLd data={articleJsonLd} id="portal-blog-article-jsonld" />
            <BlogContent />
        </>
    );
}
