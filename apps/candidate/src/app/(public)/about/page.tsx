import type { Metadata } from "next";
import { buildCanonical } from "@/lib/seo";
import AboutMemphisClient from "./about-memphis-client";

export const metadata: Metadata = {
    title: "About Us | Applicant Network",
    description:
        "Applicant Network connects talented candidates with vetted recruiters who actually care about your career. Transparent process, zero cost to candidates, better opportunities.",
    openGraph: {
        title: "About Us | Applicant Network",
        description:
            "Applicant Network connects talented candidates with vetted recruiters who actually care about your career. Transparent process, zero cost to candidates, better opportunities.",
        url: "https://applicant.network/about-memphis",
    },
    ...buildCanonical("/about-memphis"),
};

export default function AboutMemphisPage() {
    return <AboutMemphisClient />;
}
