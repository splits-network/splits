import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Help Center | Applicant Network",
    description:
        "Find answers to common questions about accounts, applications, and job searches on Applicant Network.",
    ...buildCanonical("/public/help"),
};

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
