import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingContent from "./components/billing-content";
import { PageTitle } from "@/components/page-title";

export default async function BillingPage() {
    const { getToken } = await auth();

    const token = await getToken();
    if (!token) {
        redirect("/sign-in");
    }

    return (
        <>
            <PageTitle
                title="Billing"
                subtitle="Manage your subscription and payments"
            />
            <BillingContent />
        </>
    );
}
