import { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import TermsOfServiceContent from "./content";

export const metadata: Metadata = {
    title: "Terms of Service | Splits Network",
    description:
        "Read our comprehensive terms of service for using the Splits Network platform. Understand your rights and obligations as a user.",
    openGraph: {
        title: "Terms of Service | Splits Network",
        description:
            "Read our comprehensive terms of service for using the Splits Network platform. Understand your rights and obligations as a user.",
        url: "https://splits.network/terms-of-service",
    },
    ...buildCanonical("/terms-of-service"),
};

export default function TermsOfServicePage() {
    return <TermsOfServiceContent />;
}
