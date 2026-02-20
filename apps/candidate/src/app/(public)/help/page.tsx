import type { Metadata } from "next";
import HelpMemphisClient from "./help-memphis-client";

export const metadata: Metadata = {
    title: "Help Center | Applicant Network",
    description:
        "Get help with Applicant Network. Find answers to common questions about jobs, applications, profiles, and more.",
};

export default function HelpMemphisPage() {
    return <HelpMemphisClient />;
}
