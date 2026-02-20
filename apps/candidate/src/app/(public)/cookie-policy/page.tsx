import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import CookieMemphisClient from "./cookie-client";

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

export default function CookiePolicyMemphisPage() {
    return <CookieMemphisClient />;
}
