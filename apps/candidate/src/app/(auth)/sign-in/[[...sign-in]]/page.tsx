'use client';

import { useSignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function SignInPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Get redirect parameter (from invitation or other flow) and store in state
    // so it persists through the entire sign-in flow even if URL changes
    const [redirectUrl] = useState(() => searchParams.get('redirect_url'));

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
                router.push(redirectUrl || '/portal/dashboard');
            } else {
                setError('Sign in incomplete. Please try again.');
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || 'Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithOAuth = (provider: 'oauth_google' | 'oauth_github' | 'oauth_microsoft') => {
        if (!isLoaded) return;

        signIn.authenticateWithRedirect({
            strategy: provider,
            redirectUrl: '/sso-callback',
            redirectUrlComplete: redirectUrl || '/portal/dashboard',
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card w-full max-w-md bg-base-100 shadow">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <i className="fa-solid fa-briefcase text-4xl text-primary mb-2"></i>
                        <h2 className="card-title text-2xl font-bold justify-center">
                            Welcome Back
                        </h2>
                        <p className="text-sm text-base-content/70">Sign in to continue your job search</p>
                    </div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div id="clerk-captcha"></div>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Email</legend>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                className="input w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Password</legend>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="input w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                            <p className="fieldset-label">
                                <Link href="/forgot-password" className="link link-hover">
                                    Forgot password?
                                </Link>
                            </p>
                        </fieldset>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={isLoading || !isLoaded}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-2">
                        <button
                            onClick={() => signInWithOAuth('oauth_google')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-google"></i>
                            Continue with Google
                        </button>
                        <button
                            onClick={() => signInWithOAuth('oauth_github')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-github"></i>
                            Continue with GitHub
                        </button>
                        <button
                            onClick={() => signInWithOAuth('oauth_microsoft')}
                            className="btn btn-outline w-full"
                            disabled={!isLoaded}
                        >
                            <i className="fa-brands fa-microsoft"></i>
                            Continue with Microsoft
                        </button>
                    </div>

                    <p className="text-center text-sm mt-4">
                        Don't have an account?{' '}
                        <Link
                            href={redirectUrl ? `/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}` : '/sign-up'}
                            className="link link-primary"
                        >
                            Create free account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
