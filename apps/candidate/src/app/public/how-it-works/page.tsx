import type { Metadata } from "next";
import HowItWorksMemphisClient from "./how-it-works-memphis-client";

export const metadata: Metadata = {
    title: "How It Works | Applicant Network",
    description:
        "Your complete guide to finding your next role on Applicant Network. From profile creation to job placement — here's how the process works step by step.",
};

export default function HowItWorksMemphisPage() {
    return <HowItWorksMemphisClient />;
}
