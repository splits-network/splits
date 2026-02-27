import Link from 'next/link';

export default function UnauthorizedPage() {
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
                            You don&apos;t have admin access to this application.
                        </p>
                    </div>

                    <Link href="/sign-in" className="btn btn-ghost btn-sm">
                        Sign in with a different account
                    </Link>
                </div>
            </div>
        </div>
    );
}
