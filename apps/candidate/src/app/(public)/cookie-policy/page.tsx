import { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import LegalPageAnimations from "../legal-page-animations";
import CookiePolicyContent from "./content";

export const metadata: Metadata = {
    title: "Cookie Policy | Applicant Network",
    description:
        "Learn about how Applicant Network uses cookies and similar tracking technologies to improve your experience and analyze platform usage.",
    openGraph: {
        title: "Cookie Policy | Applicant Network",
        description:
            "Learn about how Applicant Network uses cookies and similar tracking technologies to improve your experience and analyze platform usage.",
        url: "https://applicant.network/cookie-policy",
    },
    ...buildCanonical("/cookie-policy"),
};

export default function CookiePolicyPage() {
    return (
        <LegalPageAnimations>
            <CookiePolicyContent />
        </LegalPageAnimations>
    );
}
