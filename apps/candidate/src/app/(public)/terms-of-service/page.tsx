import { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import LegalPageAnimations from "../legal-page-animations";
import TermsOfServiceContent from "./content";

export const metadata: Metadata = {
    title: "Terms of Service | Applicant Network",
    description:
        "Read our comprehensive terms of service for using the Applicant Network platform. Understand your rights and obligations as a user.",
    openGraph: {
        title: "Terms of Service | Applicant Network",
        description:
            "Read our comprehensive terms of service for using the Applicant Network platform. Understand your rights and obligations as a user.",
        url: "https://applicant.network/terms-of-service",
    },
    ...buildCanonical("/terms-of-service"),
};

export default function TermsOfServicePage() {
    return (
        <LegalPageAnimations>
            <TermsOfServiceContent />
        </LegalPageAnimations>
    );
}
