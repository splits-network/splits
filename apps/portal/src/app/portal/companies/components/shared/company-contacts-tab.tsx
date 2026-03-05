"use client";

import CompanyContacts from "@/components/company-contacts";

export function CompanyContactsTab({ companyId }: { companyId: string }) {
    return (
        <div className="p-6">
            <CompanyContacts companyId={companyId} />
        </div>
    );
}
