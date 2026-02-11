import type { Metadata } from "next";
import { HowItWorksContent } from "./how-it-works-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "How It Works - Applicant Network | Simple 3-Step Job Search Process",
    description: "Discover how Applicant Network works. Create your profile, get matched with expert recruiters, and land your dream job in 3 simple steps. Start your career journey today.",
    keywords: "how it works, job search process, recruiter matching, career opportunities, application tracking",
    openGraph: {
        title: "How It Works - Applicant Network | Simple 3-Step Job Search Process",
        description: "Discover how Applicant Network works. Create your profile, get matched with expert recruiters, and land your dream job in 3 simple steps. Start your career journey today.",
        url: "https://applicant.network/public/how-it-works",
        type: "website",
    },
    ...buildCanonical("/public/how-it-works"),
};

export default function HowItWorksPage() {
    return <HowItWorksContent />;
}
