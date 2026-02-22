import { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import LegalPageAnimations from "../legal-page-animations";
import PrivacyPolicyContent from "./content";

export const metadata: Metadata = {
    title: "Privacy Policy | Splits Network",
    description:
        "Learn how Splits Network collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our commitments.",
    openGraph: {
        title: "Privacy Policy | Splits Network",
        description:
            "Learn how Splits Network collects, uses, and protects your personal information. Our comprehensive privacy policy explains your rights and our commitments.",
        url: "https://splits.network/privacy-policy",
    },
    ...buildCanonical("/privacy-policy"),
};

export default function PrivacyPolicyPage() {
    return (
        <LegalPageAnimations>
            <PrivacyPolicyContent />
        </LegalPageAnimations>
    );
}
