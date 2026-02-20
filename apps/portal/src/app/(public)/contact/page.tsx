import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
    title: "Contact Support",
    description:
        "Reach the Splits Network support team. Account help, billing questions, technical issues, or feature requests — we respond to most inquiries within 4 hours.",
    openGraph: {
        title: "Contact Support | Splits Network",
        description:
            "Reach the Splits Network support team. Account help, billing questions, technical issues, or feature requests — we respond to most inquiries within 4 hours.",
        url: "https://splits.network/contact",
    },
    ...buildCanonical("/contact"),
};

export default function ContactPage() {
    return <ContactContent />;
}
