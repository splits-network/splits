import type { Metadata } from "next";
import { ResumeTipsContent } from "./resume-tips-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Resume Tips",
    description: "Craft a standout resume with proven tips and examples.",
    ...buildCanonical("/public/resources/resume-tips"),
};

export default function ResumeTipsPage() {
    return <ResumeTipsContent />;
}