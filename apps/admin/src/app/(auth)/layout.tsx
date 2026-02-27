import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-screen items-center justify-center p-6 bg-base-200">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    <div className="mb-6 text-center">
                        <h1 className="text-xl font-black tracking-tight text-primary">
                            Splits Network
                        </h1>
                        <p className="text-xs text-base-content/50 mt-1">Admin Portal</p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
