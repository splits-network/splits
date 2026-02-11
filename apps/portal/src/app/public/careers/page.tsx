import type { Metadata } from "next";
import { CareersContent } from "./careers-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Careers",
    description: "Join the team building the future of collaborative recruiting.",
    ...buildCanonical("/public/careers"),
};

export default function CareersPage() {
    return <CareersContent />;
}