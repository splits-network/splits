import type { Metadata } from "next";
import { BlogContent } from "./blog-content";

export const metadata: Metadata = {
    title: "Blog",
    description: "Recruiting insights, product updates, and split placement strategies.",
};

export default function BlogPage() {
    return <BlogContent />;
}
