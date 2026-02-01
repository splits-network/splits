import type { Metadata } from "next";
import { PressContent } from "./press-content";

export const metadata: Metadata = {
    title: "Press",
    description: "Press kit, brand assets, and company updates from Splits Network.",
};

export default function PressKitPage() {
    return <PressContent />;
}
