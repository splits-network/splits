import { JsonLd } from "@splits-network/shared-ui";
import { getDocMetadata, getDocJsonLd } from "../../../documentation/seo";
import Link from "next/link";
import { ProfileAnimator } from "./profile-animator";

export const metadata = getDocMetadata("feature-guides/profile");

export default function ProfileMemphisGuidePage() {
    return (
        <>
            <JsonLd
                data={getDocJsonLd("feature-guides/profile")}
                id="docs-feature-guides-profile-jsonld"
            />
            <ProfileAnimator>
                {/* ══════════════════════════════════════════════════════════
                    HERO
                   ══════════════════════════════════════════════════════════ */}
                <section className="hero-section relative min-h-[40vh] flex items-center bg-dark overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="memphis-shape absolute top-[12%] left-[6%] w-14 h-14 rounded-full border-4 border-coral opacity-0" />
                        <div className="memphis-shape absolute top-[55%] right-[8%] w-10 h-10 bg-teal opacity-0" />
                        <div className="memphis-shape absolute bottom-[18%] left-[20%] w-12 h-12 bg-yellow opacity-0" />
                        <div className="memphis-shape absolute top-[30%] right-[25%] w-8 h-8 rounded-full bg-purple opacity-0" />
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <div className="max-w-4xl mx-auto">
                            <nav className="hero-breadcrumb flex items-center gap-2 mb-6 opacity-0">
                                <Link
                                    href="/public/documentation-memphis"
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50 hover:text-coral transition-colors"
                                >
                                    Documentation
                                </Link>
                                <span className="text-cream/30">/</span>
                                <Link
                                    href="/public/documentation-memphis/feature-guides"
                                    className="text-xs font-bold uppercase tracking-[0.2em] text-cream/50 hover:text-coral transition-colors"
                                >
                                    Feature Guides
                                </Link>
                                <span className="text-cream/30">/</span>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-cream/70">
                                    Profile
                                </span>
                            </nav>

                            <h1 className="hero-headline text-4xl md:text-5xl font-black uppercase tracking-tight leading-[0.95] mb-6 text-cream opacity-0">
                                YOUR PROFILE IS YOUR REPUTATION
                            </h1>

                            <p className="hero-description text-lg md:text-xl text-cream/80 mb-8 opacity-0">
                                Your profile tells the network who you are, what you do, and how to reach you. A complete profile gets better matches, faster responses, and stronger trust. An incomplete one gets ignored.
                            </p>

                            <div className="hero-badges flex flex-wrap gap-2 opacity-0">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-coral text-coral">
                                    Recruiters
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-teal text-teal">
                                    Hiring Managers
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] border-4 border-yellow text-yellow">
                                    Company Admins
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    OVERVIEW
                   ══════════════════════════════════════════════════════════ */}
                <section className="overview-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="overview-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-dark opacity-0">
                            WHY YOUR PROFILE MATTERS
                        </h2>
                        <div className="overview-content space-y-4 opacity-0">
                            <p className="text-lg text-dark/80">
                                Your profile is the first thing other users see when you interact on the platform. It powers recruiter discovery, hiring manager decisions, and marketplace trust signals. Every field you fill out makes you more visible and more credible.
                            </p>
                            <p className="text-lg text-dark/80">
                                Incomplete profiles get deprioritized in search results, matched less frequently by the AI engine, and skipped by hiring managers who need to move fast. A strong profile is a competitive advantage.
                            </p>
                            <p className="text-lg text-dark/80">
                                <strong className="font-bold">The rule is simple:</strong> the more complete your profile, the more the platform works for you.
                            </p>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PERSONAL INFORMATION
                   ══════════════════════════════════════════════════════════ */}
                <section className="personal-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="personal-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            PERSONAL INFORMATION
                        </h2>
                        <div className="personal-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                This is the core of your profile. Name, title, company, and location. These fields are required and visible to anyone who can see your profile.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="personal-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-user mr-2 text-coral" />
                                        NAME AND TITLE
                                    </h3>
                                    <p className="text-dark/70">
                                        Your display name and professional title appear on every interaction -- applications, messages, proposals, and marketplace listings. Use your real name. Use a title that describes what you actually do.
                                    </p>
                                </div>
                                <div className="personal-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-building mr-2 text-teal" />
                                        COMPANY AND LOCATION
                                    </h3>
                                    <p className="text-dark/70">
                                        Company affiliation and location power geographic search, market matching, and compliance checks. If your company has multiple offices, set the location to where you primarily work.
                                    </p>
                                </div>
                                <div className="personal-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-image-portrait mr-2 text-yellow" />
                                        PROFILE PHOTO
                                    </h3>
                                    <p className="text-dark/70">
                                        A professional headshot. Not mandatory, but profiles with photos get significantly more engagement. Use a clear, recent photo with good lighting. Skip the vacation pics.
                                    </p>
                                </div>
                                <div className="personal-card p-6 border-4 border-purple bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-align-left mr-2 text-purple" />
                                        BIO
                                    </h3>
                                    <p className="text-dark/70">
                                        A short description of your experience and specialties. Two to three sentences. This shows up in recruiter search results and marketplace cards. Make it count.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    CONTACT PREFERENCES
                   ══════════════════════════════════════════════════════════ */}
                <section className="contact-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="contact-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            CONTACT PREFERENCES
                        </h2>
                        <div className="contact-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Control how people reach you. You choose what's visible and what stays private. Every contact method is optional except email, which is tied to your authentication.
                            </p>
                            <div className="space-y-4">
                                <div className="contact-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-coral flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-envelope text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            EMAIL
                                        </h3>
                                        <p className="text-dark/70">
                                            Primary email is set through your authentication provider. You can add a secondary business email for platform notifications. Toggle visibility to control who sees it.
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-teal flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-phone text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            PHONE
                                        </h3>
                                        <p className="text-dark/70">
                                            Optional. Useful for urgent recruiter-to-hiring-manager communication. Not displayed publicly by default -- only shared with users you're actively collaborating with on a role.
                                        </p>
                                    </div>
                                </div>
                                <div className="contact-card flex items-start gap-4 p-5 border-4 border-dark bg-cream">
                                    <div className="w-10 h-10 border-4 border-yellow flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-link text-yellow" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            LINKEDIN AND WEBSITE
                                        </h3>
                                        <p className="text-dark/70">
                                            Add your LinkedIn profile URL and personal or company website. These display on your public profile card and help establish credibility with new connections.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    VISIBILITY AND PRIVACY
                   ══════════════════════════════════════════════════════════ */}
                <section className="visibility-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="visibility-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            VISIBILITY AND PRIVACY
                        </h2>
                        <div className="visibility-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                You control who sees what. Visibility settings determine how your profile appears in search results, marketplace listings, and network directories.
                            </p>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="visibility-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        PUBLIC
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Your profile is visible to all authenticated users on the platform. Name, title, company, bio, and public contact info are searchable. Best for recruiters who want maximum exposure.
                                    </p>
                                </div>
                                <div className="visibility-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        NETWORK ONLY
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Only users in your direct network (connections, same organization, shared roles) can see your full profile. Others see a limited view with name and company only.
                                    </p>
                                </div>
                                <div className="visibility-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-lg font-black uppercase tracking-tight mb-3 text-dark">
                                        PRIVATE
                                    </h3>
                                    <p className="text-dark/70 text-sm">
                                        Minimal visibility. Your profile only appears to users you're actively collaborating with on specific roles. You won't show up in search results or marketplace listings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    NOTIFICATION PREFERENCES
                   ══════════════════════════════════════════════════════════ */}
                <section className="notifications-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="notifications-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            NOTIFICATION PREFERENCES
                        </h2>
                        <div className="notifications-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Notifications keep you in the loop. But too many, and you tune them out. Configure exactly what you want to hear about and how.
                            </p>
                            <div className="space-y-4">
                                <div className="notification-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-bell mr-2 text-coral" />
                                        APPLICATION UPDATES
                                    </h3>
                                    <p className="text-dark/70">
                                        Get notified when candidates are submitted, applications move stages, or placements are confirmed. Critical for hiring managers tracking active roles.
                                    </p>
                                </div>
                                <div className="notification-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-comments mr-2 text-teal" />
                                        MESSAGES
                                    </h3>
                                    <p className="text-dark/70">
                                        Real-time alerts for new messages and conversation activity. Choose between push notifications, email digests, or both. You can mute specific conversations without disabling all message notifications.
                                    </p>
                                </div>
                                <div className="notification-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-briefcase mr-2 text-yellow" />
                                        ROLE ACTIVITY
                                    </h3>
                                    <p className="text-dark/70">
                                        Alerts when new roles matching your criteria are posted, when roles you're working are updated, or when deadlines approach. Recruiters: this is how you stay ahead of the competition.
                                    </p>
                                </div>
                                <div className="notification-card p-6 border-4 border-dark bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-dark">
                                        <i className="fa-duotone fa-regular fa-chart-pie mr-2 text-purple" />
                                        WEEKLY DIGEST
                                    </h3>
                                    <p className="text-dark/70">
                                        A summary of your activity, pipeline health, and key metrics delivered to your inbox. Great for staying informed without checking the dashboard daily.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    SECURITY AND PASSWORD
                   ══════════════════════════════════════════════════════════ */}
                <section className="security-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="security-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            SECURITY AND ACCESS
                        </h2>
                        <div className="security-content space-y-6 opacity-0">
                            <p className="text-lg text-cream/80">
                                Authentication is managed through Clerk. Your password, MFA, and session management are handled outside the Splits Network profile page, but they're still part of your account security.
                            </p>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="security-card p-6 border-4 border-coral bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-lock mr-2 text-coral" />
                                        PASSWORD
                                    </h3>
                                    <p className="text-dark/70">
                                        Change your password through the account security panel (powered by Clerk). Use a strong, unique password. If you signed up with a social provider (Google, GitHub), you may not have a password set -- and that's fine.
                                    </p>
                                </div>
                                <div className="security-card p-6 border-4 border-teal bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-shield-check mr-2 text-teal" />
                                        TWO-FACTOR AUTH
                                    </h3>
                                    <p className="text-dark/70">
                                        Enable MFA for an extra layer of security. Supports authenticator apps and SMS. Strongly recommended for admin accounts and anyone with access to billing or sensitive candidate data.
                                    </p>
                                </div>
                                <div className="security-card p-6 border-4 border-yellow bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-desktop mr-2 text-yellow" />
                                        ACTIVE SESSIONS
                                    </h3>
                                    <p className="text-dark/70">
                                        View and manage your active sessions. See which devices are logged in, when they last accessed your account, and revoke any session you don't recognize. Check this periodically.
                                    </p>
                                </div>
                                <div className="security-card p-6 border-4 border-purple bg-cream">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-dark">
                                        <i className="fa-duotone fa-regular fa-plug mr-2 text-purple" />
                                        CONNECTED ACCOUNTS
                                    </h3>
                                    <p className="text-dark/70">
                                        Link or unlink social login providers. If you originally signed up with email/password, you can connect Google or GitHub for faster login. Disconnecting a provider doesn't delete your account.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    PROFILE COMPLETION
                   ══════════════════════════════════════════════════════════ */}
                <section className="completion-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="completion-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            GET TO 100%
                        </h2>
                        <div className="completion-content space-y-6 opacity-0">
                            <p className="text-lg text-dark/80">
                                Profile completeness is tracked automatically. Here's what moves the needle and what's optional but worth doing.
                            </p>
                            <div className="space-y-4">
                                <div className="completion-card flex items-start gap-4 p-5 border-4 border-teal bg-cream">
                                    <div className="w-10 h-10 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-black text-teal">1</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            REQUIRED FIELDS
                                        </h3>
                                        <p className="text-dark/70">
                                            Name, email, title, and company. Without these, your profile is incomplete and you may be restricted from certain actions like submitting candidates or publishing roles.
                                        </p>
                                    </div>
                                </div>
                                <div className="completion-card flex items-start gap-4 p-5 border-4 border-yellow bg-cream">
                                    <div className="w-10 h-10 border-4 border-yellow bg-yellow/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-black text-yellow">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            RECOMMENDED FIELDS
                                        </h3>
                                        <p className="text-dark/70">
                                            Bio, location, phone number, LinkedIn URL, and profile photo. These boost your search ranking and marketplace presence. Not mandatory, but completing them gets you noticed faster.
                                        </p>
                                    </div>
                                </div>
                                <div className="completion-card flex items-start gap-4 p-5 border-4 border-coral bg-cream">
                                    <div className="w-10 h-10 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-sm font-black text-coral">3</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight mb-1 text-dark">
                                            VISIBILITY SETTINGS
                                        </h3>
                                        <p className="text-dark/70">
                                            Review your visibility level and notification preferences. Default is Network Only, which is sensible for most users. Switch to Public if you want maximum marketplace exposure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    BEST PRACTICES
                   ══════════════════════════════════════════════════════════ */}
                <section className="practices-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="practices-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-cream opacity-0">
                            DO THIS, NOT THAT
                        </h2>
                        <div className="practices-content space-y-8 opacity-0">
                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            USE YOUR REAL NAME AND PHOTO
                                        </h3>
                                        <p className="text-cream/70">
                                            Trust is everything in recruiting. People work with people they can identify. A real name and photo get more responses than a blank avatar and "Recruiter123."
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            KEEP YOUR BIO CURRENT
                                        </h3>
                                        <p className="text-cream/70">
                                            Update your bio when you change roles, switch specialties, or join a new company. Stale bios erode trust. If your bio says "5 years in tech recruiting" but your account is 8 years old, it looks lazy.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-teal bg-teal/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-check text-2xl text-teal" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            REVIEW NOTIFICATION SETTINGS MONTHLY
                                        </h3>
                                        <p className="text-cream/70">
                                            Your workflow changes. Your notification needs change with it. What was useful during a hiring sprint might be noise during a quiet period. Audit and adjust.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T LEAVE REQUIRED FIELDS BLANK
                                        </h3>
                                        <p className="text-cream/70">
                                            Incomplete profiles restrict functionality. You can't submit candidates, publish roles, or appear in marketplace search until the required fields are filled. Do it once and move on.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="practice-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 border-4 border-coral bg-coral/20 flex items-center justify-center flex-shrink-0">
                                        <i className="fa-duotone fa-regular fa-xmark text-2xl text-coral" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight mb-2 text-cream">
                                            DON'T OVER-SHARE CONTACT INFO
                                        </h3>
                                        <p className="text-cream/70">
                                            Use the visibility controls. Set your phone to collaborators-only. Keep your personal email private. The platform handles communication routing -- you don't need to broadcast everything.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    TROUBLESHOOTING
                   ══════════════════════════════════════════════════════════ */}
                <section className="trouble-section py-16 bg-cream">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <h2 className="trouble-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 text-dark opacity-0">
                            COMMON ISSUES
                        </h2>
                        <div className="trouble-content space-y-6 opacity-0">
                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "My profile changes won't save"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> All required fields are filled. Name, email, title, and company cannot be blank. If validation fails, the form highlights which fields need attention. Fix them and save again.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "I can't see marketplace settings"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Marketplace features require an active subscription. If your organization hasn't enabled the marketplace plan, these settings won't appear. Contact your Company Admin or reach out to support.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "People can't find me in search"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Your visibility is set to Public or Network Only (not Private). Your profile is at least 80% complete. Your account is in good standing with no compliance holds.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "Notifications aren't arriving"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Your notification preferences are enabled for the relevant category. Check your email spam folder for digest emails. Verify your email address is confirmed in your account settings.
                                </p>
                            </div>

                            <div className="trouble-card p-6 border-4 border-dark bg-cream">
                                <h3 className="text-lg font-black uppercase tracking-tight mb-2 text-dark">
                                    "I can't change my email"
                                </h3>
                                <p className="text-dark/70">
                                    <strong>Check:</strong> Primary email is managed through your authentication provider (Clerk). Go to Account Security to update it. If you signed up with a social provider, your email is tied to that account.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════════════
                    NEXT STEPS
                   ══════════════════════════════════════════════════════════ */}
                <section className="cta-section py-16 bg-dark">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <h2 className="cta-heading text-3xl md:text-4xl font-black uppercase tracking-tight mb-6 text-cream opacity-0">
                            PROFILE SET? GO BUILD.
                        </h2>
                        <p className="cta-description text-lg text-cream/80 mb-8 opacity-0">
                            Now that your profile is dialed in, explore the rest of the platform.
                        </p>
                        <div className="cta-buttons flex flex-wrap gap-4 justify-center opacity-0">
                            <Link
                                href="/public/documentation-memphis/feature-guides/notifications"
                                className="btn btn-coral btn-md"
                            >
                                Notification Settings
                            </Link>
                            <Link
                                href="/public/documentation-memphis/feature-guides/billing"
                                className="btn btn-teal btn-md"
                            >
                                Billing & Plans
                            </Link>
                            <Link
                                href="/public/documentation-memphis/feature-guides/roles"
                                className="btn btn-yellow btn-md"
                            >
                                Manage Roles
                            </Link>
                        </div>
                    </div>
                </section>
            </ProfileAnimator>
        </>
    );
}
