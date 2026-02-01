import type { Metadata } from "next";
import { CareersContent } from "./careers-content";

export const metadata: Metadata = {
    title: "Careers",
    description: "Join the team building the future of collaborative recruiting.",
};

export default function CareersPage() {
    return <CareersContent />;
}
