import type { Metadata } from "next";
import { ForRecruitersContent } from "./for-recruiters-content";

export const metadata: Metadata = {
    title: "For Recruiters - Applicant Network | Build Your Recruiting Practice",
    description: "Join Applicant Network as a recruiter and build a thriving practice. Access top talent, manage placements, and earn competitive fees. Sign up to become a verified recruiter today.",
    keywords: "recruiter platform, recruiting opportunities, placement fees, talent acquisition, recruiting network",
    openGraph: {
        title: "For Recruiters - Applicant Network",
        description: "Build your recruiting practice with access to top talent and powerful tools.",
        type: "website",
    },
};

export default function ForRecruitersPage() {
    return <ForRecruitersContent />;
}
