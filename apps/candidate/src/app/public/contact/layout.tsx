import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Contact Applicant Network",
    description:
        "Have a question or need help? Contact Applicant Network and our team will respond as soon as possible.",
    ...buildCanonical("/public/contact"),
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
