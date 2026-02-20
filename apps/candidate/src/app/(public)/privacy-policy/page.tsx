import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import PrivacyMemphisClient from "./privacy-client";

export const metadata: Metadata = {
    title: "Privacy Policy | Applicant Network",
    description:
        "Learn how Applicant Network collects, uses, and protects your personal information. GDPR and CCPA compliant.",
    openGraph: {
        title: "Privacy Policy | Applicant Network",
        description:
            "Learn how Applicant Network collects, uses, and protects your personal information. GDPR and CCPA compliant.",
        url: "https://applicant.network/privacy-policy",
    },
    ...buildCanonical("/privacy-policy"),
};

export default function PrivacyPolicyMemphisPage() {
    return <PrivacyMemphisClient />;
}
