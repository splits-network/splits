import type { Metadata } from "next";
import { BlogContent } from "./blog-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Blog",
    description: "Recruiting insights, product updates, and split placement strategies.",
    ...buildCanonical("/public/blog"),
};

export default function BlogPage() {
    return <BlogContent />;
}