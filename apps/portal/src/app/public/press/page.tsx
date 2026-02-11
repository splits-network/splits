import type { Metadata } from "next";
import { PressContent } from "./press-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Press",
    description: "Press kit, brand assets, and company updates from Splits Network.",
    ...buildCanonical("/public/press"),
};

export default function PressKitPage() {
    return <PressContent />;
}