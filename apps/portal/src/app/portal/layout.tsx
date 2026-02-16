import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { AuthenticatedLayoutClient } from "./layout-client";

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <AuthenticatedLayoutClient>
            <Sidebar />
            <div className="lg:ml-[280px] min-h-screen">
                <main className="p-2">{children}</main>
            </div>
        </AuthenticatedLayoutClient>
    );
}
