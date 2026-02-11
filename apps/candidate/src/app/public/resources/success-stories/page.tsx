import type { Metadata } from "next";
import { SuccessStoriesContent } from "./success-stories-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Success Stories",
    description: "Read real stories from candidates who landed roles through Applicant Network.",
    ...buildCanonical("/public/resources/success-stories"),
};

export default function SuccessStoriesPage() {
    return <SuccessStoriesContent />;
}