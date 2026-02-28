"use client";

import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

export default function UnauthorizedPage() {
    const { signOut } = useClerk();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut({ redirectUrl: "/sign-in" });
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="card bg-base-100 shadow-xl w-full max-w-sm">
                <div className="card-body items-center text-center gap-6">
                    <div className="text-error">
                        <i className="fa-duotone fa-regular fa-shield-xmark text-5xl" />
                    </div>

                    <div>
                        <h1 className="text-xl font-bold">Access Denied</h1>
                        <p className="text-sm text-base-content/60 mt-2">
                            You don&apos;t have admin access to this
                            application.
                        </p>
                    </div>

                    <Link href="/sign-in" className="btn btn-ghost btn-sm">
                        Sign in with a different account
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="btn btn-ghost btn-sm"
                        disabled={isSigningOut}
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
