import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import TermsMemphisClient from "./terms-client";

export const metadata: Metadata = {
    title: "Terms of Service | Applicant Network",
    description:
        "Legal terms and conditions for using Applicant Network for job seekers, recruiters, and companies.",
    openGraph: {
        title: "Terms of Service | Applicant Network",
        description:
            "Legal terms and conditions for using Applicant Network for job seekers, recruiters, and companies.",
        url: "https://applicant.network/public/terms-of-service",
    },
    ...buildCanonical("/public/terms-of-service"),
};

export default function TermsOfServiceMemphisPage() {
    return <TermsMemphisClient />;
}
