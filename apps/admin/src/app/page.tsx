import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex min-h-screen items-center justify-center p-6">
            <div className="card bg-base-100 shadow-xl w-full max-w-sm">
                <div className="card-body items-center text-center gap-6">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-primary">
                            Splits Network
                        </h1>
                        <p className="text-base-content/60 text-sm mt-1">
                            Admin Portal
                        </p>
                    </div>

                    <div className="divider my-0" />

                    <p className="text-sm text-base-content/70">
                        Sign in with your admin account to access the platform administration tools.
                    </p>

                    <Link href="/sign-in" className="btn btn-primary w-full">
                        <i className="fa-duotone fa-regular fa-lock" />
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
