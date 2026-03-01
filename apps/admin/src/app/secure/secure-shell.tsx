'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/header/admin-header';
import { AdminSidebar } from '@/components/sidebar/admin-sidebar';
import { AdminConfirmProvider } from '@/components/shared/admin-confirm-provider';

export function SecureShell({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Fixed header */}
            <AdminHeader onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />

            {/* Below header: sidebar + content */}
            <div className="flex flex-1 pt-14">
                {/* Desktop sidebar */}
                <div className="hidden lg:flex h-[calc(100vh-3.5rem)] sticky top-14">
                    <AdminSidebar />
                </div>

                {/* Mobile drawer overlay */}
                {mobileOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                            onClick={() => setMobileOpen(false)}
                        />
                        <div className="fixed left-0 top-14 bottom-0 z-50 lg:hidden">
                            <AdminSidebar />
                        </div>
                    </>
                )}

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-6 min-w-0">
                    <AdminConfirmProvider>
                        {children}
                    </AdminConfirmProvider>
                </main>
            </div>
        </div>
    );
}
