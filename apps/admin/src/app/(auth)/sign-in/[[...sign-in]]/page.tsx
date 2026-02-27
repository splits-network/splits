'use client';

import { useSignIn, useAuth } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, useEffect } from 'react';

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const redirectUrl = searchParams.get('redirect_url');

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push(redirectUrl || '/secure');
        }
    }, [isLoaded, isSignedIn, router, redirectUrl]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setError('');
        setIsLoading(true);

        try {
            const signInAttempt = await signIn.create({
                identifier: email,
                password,
            });

            if (signInAttempt.status === 'complete') {
                await setActive({ session: signInAttempt.createdSessionId });
                router.push(redirectUrl || '/secure');
            } else {
                setError(`Authentication incomplete (${signInAttempt.status}). Please contact support.`);
            }
        } catch (err: any) {
            if (err.errors && err.errors.length > 0) {
                const clerkError = err.errors[0];
                switch (clerkError.code) {
                    case 'form_identifier_not_found':
                        setError('No account found with this email address.');
                        break;
                    case 'form_password_incorrect':
                        setError('Incorrect password. Please try again.');
                        break;
                    case 'too_many_requests':
                        setError('Too many sign-in attempts. Please wait a moment and try again.');
                        break;
                    default:
                        setError(clerkError.message || 'Invalid email or password.');
                }
            } else {
                setError(err.message || 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tight">Admin Sign In</h2>
                <p className="text-sm text-base-content/50 mt-1">
                    Sign in with your admin account.
                </p>
            </div>

            {error && (
                <div className="alert alert-error mb-4" role="alert">
                    <i className="fa-solid fa-circle-xmark" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div id="clerk-captcha" />

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Email Address
                    </label>
                    <label className="input input-bordered w-full">
                        <i className="fa-duotone fa-regular fa-envelope opacity-50" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="you@company.com"
                            className="grow"
                            required
                        />
                    </label>
                </fieldset>

                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Password
                    </label>
                    <label className="input input-bordered w-full">
                        <i className="fa-duotone fa-regular fa-lock opacity-50" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your password"
                            className="grow"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-base-content/30 hover:text-base-content/60"
                        >
                            <i className={`fa-duotone fa-regular fa-eye${showPassword ? '-slash' : ''}`} />
                        </button>
                    </label>
                </fieldset>

                <button
                    type="submit"
                    className="btn btn-primary w-full mt-2"
                    disabled={isLoading || !isLoaded}
                >
                    {isLoading ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>
        </>
    );
}
