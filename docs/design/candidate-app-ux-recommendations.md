# Candidate App UI/UX Recommendations

**Date:** December 30, 2025  
**App:** Applicant Network (Candidate Portal)  
**Version:** Current State Analysis & Improvement Roadmap

---

## Executive Summary

This document provides a comprehensive UI/UX evaluation of the Candidate Portal with actionable recommendations to improve user experience, engagement, and conversion rates. The analysis covers the landing page, navigation, authenticated dashboard, job browsing, profile management, and application flow.

---

## Table of Contents

1. [Current State Overview](#1-current-state-overview)
2. [Landing Page Improvements](#2-landing-page-improvements)
3. [Navigation Enhancements](#3-navigation-enhancements)
4. [Dashboard Optimization](#4-dashboard-optimization)
5. [Job Browsing Experience](#5-job-browsing-experience)
6. [Application Flow Refinement](#6-application-flow-refinement)
7. [Profile Page Enhancements](#7-profile-page-enhancements)
8. [Mobile Experience](#8-mobile-experience)
9. [Accessibility Improvements](#9-accessibility-improvements)
10. [Performance Optimizations](#10-performance-optimizations)
11. [Implementation Priority Matrix](#11-implementation-priority-matrix)

---

## 1. Current State Overview

### Strengths ✅

- **Clean Visual Design**: DaisyUI components provide consistent styling with proper theming (light/dark mode)
- **Good Information Architecture**: Logical page structure with clear navigation hierarchy
- **Progressive Disclosure**: Application wizard breaks complex forms into manageable steps
- **Responsive Grid**: Uses Tailwind grid system for responsive layouts
- **Clear Value Proposition**: Homepage effectively communicates the platform's benefits

### Areas for Improvement 🔧

- **Hero Section Engagement**: Static statistics need dynamic data integration
- **Navigation Complexity**: Mega menus could overwhelm first-time users
- **Empty States**: Generic empty states don't guide users effectively
- **Loading States**: Some loading experiences feel disjointed
- **Onboarding**: No guided tour for new users
- **Visual Hierarchy**: Some pages lack clear focal points

---

## 2. Landing Page Improvements

### 2.1 Hero Section

**Current Issues:**

- Static statistics lack credibility (10K+, 500+, etc.)
- Two CTAs may cause decision paralysis

**Recommendations:**

#### A. Optimize Video Hero Performance

```tsx
// Enhance video performance while maintaining visual impact
<section className="hero min-h-[85vh] relative overflow-hidden">
    <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-contain opacity-20"
    >
        <source src="/hero-video.webm" type="video/webm" />
        <source src="/hero-video.mp4" type="video/mp4" />
    </video>
    {/* Improved content overlay */}
    <div className="hero-content relative z-10 text-center">
        <div className="backdrop-blur-sm bg-base-100/10 rounded-2xl p-8">
            {/* Hero content with better readability */}
        </div>
    </div>
</section>
```

#### B. Dynamic Statistics with Real Data

- Connect stats to actual API data
- Add subtle count-up animations on scroll
- Include "last updated" timestamp for credibility

```tsx
// API integration for live stats
const [stats, setStats] = useState({
    activeJobs: 0,
    companies: 0,
    recruiters: 0,
    placementRate: 0,
});

// Count-up animation component
<CountUp end={stactiveJobs} duration={2} separator="," />;
```

#### C. Single Primary CTA with Secondary Link

```tsx
<div className="flex flex-col items-center gap-4">
    <Link
        href="/jobs"
        className="btn btn-primary btn-lg gap-2 shadow-lg hover:shadow-xl transition-all"
    >
        <i className="fa-duotone fa-regular fa-magnifying-glass"></i>
        Explore Open Positions
    </Link>
    <p className="text-sm text-base-content/60">
        No account needed to browse •{" "}
        <Link href="/sign-up" className="link link-primary">
            Create profile
        </Link>{" "}
        to apply
    </p>
</div>
```

### 2.2 Social Proof Enhancement

**Current:** Generic testimonials with placeholder avatars

**Recommendation:** Add real social proof elements

```tsx
{
    /* Company Logos Section */
}
<section className="py-12 bg-base-100/50">
    <div className="container mx-auto px-4">
        <p className="text-center text-sm text-base-content/60 mb-6">
            Trusted by professionals from leading companies
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companyLogos.map((logo) => (
                <img
                    key={logo.name}
                    src={logo.src}
                    alt={logo.name}
                    className="h-8 grayscale hover:grayscale-0 transition"
                />
            ))}
        </div>
    </div>
</section>;
```

### 2.3 How It Works Section

**Enhancement:** Add interactive timeline with hover effects

```tsx
<div className="steps steps-vertical lg:steps-horizontal">
    {steps.map((step, index) => (
        <div
            key={step.id}
            className="step step-primary cursor-pointer group"
            onMouseEnter={() => setActiveStep(index)}
        >
            <div
                className={`transition-all ${activeStep === index ? "scale-110" : ""}`}
            >
                <i
                    className={`${step.icon} text-4xl group-hover:text-primary transition`}
                ></i>
                <h3 className="mt-2 font-bold">{step.title}</h3>
                <p className="text-sm text-base-content/70 max-w-xs">
                    {step.description}
                </p>
            </div>
        </div>
    ))}
</div>
```

---

## 3. Navigation Enhancements

### 3.1 Simplify Mega Menus

**Current Issues:**

- Mega menus contain too much information
- Categories don't match actual job data
- Overwhelming for new users

**Recommendations:**

#### A. Conditional Navigation Based on Auth State

```tsx
// For logged-out users: Simplified nav
{
    !isSignedIn && (
        <ul className="menu menu-horizontal">
            <li>
                <Link href="/jobs">Find Jobs</Link>
            </li>
            <li>
                <Link href="/marketplace">Find a Recruiter</Link>
            </li>
            <li>
                <Link href="/how-it-works">How It Works</Link>
            </li>
        </ul>
    );
}

// For logged-in users: Full navigation with account context
{
    isSignedIn && (
        <ul className="menu menu-horizontal">
            <li>
                <Link href="/portal/dashboard">Dashboard</Link>
            </li>
            <li>
                <Link href="/jobs">Jobs</Link>
            </li>
            <li>
                <Link href="/applications">Applications</Link>
            </li>
            <li>
                <Link href="/marketplace">Recruiters</Link>
            </li>
        </ul>
    );
}
```

#### B. Smart Job Categories

- Fetch actual categories from API
- Show count badges with real numbers
- Remember user's preferred categories

```tsx
// Dynamic category dropdown
<details className="dropdown">
    <summary>Jobs</summary>
    <ul className="dropdown-content">
        {categories.map((cat) => (
            <li key={cat.slug}>
                <Link href={`/jobs?category=${cat.slug}`}>
                    {cat.name}
                    <span className="badge badge-ghost badge-sm">
                        {cat.count}
                    </span>
                </Link>
            </li>
        ))}
    </ul>
</details>
```

### 3.2 Search-First Navigation

**Add Global Search Bar:**

```tsx
// Command palette style search (Cmd+K / Ctrl+K)
<div className="hidden lg:flex flex-1 mx-8 max-w-md">
    <label className="input input-sm flex items-center gap-2 w-full bg-base-200/50">
        <i className="fa-duotone fa-regular fa-search text-base-content/40"></i>
        <input
            type="text"
            className="grow"
            placeholder="Search jobs, companies, recruiters..."
            onClick={() => setShowCommandPalette(true)}
            readOnly
        />
        <kbd className="kbd kbd-sm">⌘K</kbd>
    </label>
</div>
```

### 3.3 Breadcrumb Navigation for Deep Pages

```tsx
// Add breadcrumbs to job detail, application detail pages
<div className="breadcrumbs text-sm mb-4">
    <ul>
        <li>
            <Link href="/jobs">Jobs</Link>
        </li>
        <li>
            <Link href={`/jobs?category=${job.category}`}>{job.category}</Link>
        </li>
        <li className="text-base-content/70">{job.title}</li>
    </ul>
</div>
```

---

## 4. Dashboard Optimization

### 4.1 Welcome Experience for New Users

**Current:** Shows empty states without guidance

**Recommendation:** Progressive onboarding widget

```tsx
{
    isNewUser && (
        <div className="card bg-gradient-to-r from-primary to-secondary text-white shadow-xl mb-8">
            <div className="card-body">
                <h2 className="card-title text-2xl">
                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles"></i>
                    Let's get you started!
                </h2>
                <p className="opacity-90">
                    Complete these steps to maximize your job search success
                </p>

                <div className="mt-4 space-y-3">
                    <OnboardingStep
                        completed={hasProfile}
                        icon="fa-user"
                        title="Complete your profile"
                        action="/profile"
                    />
                    <OnboardingStep
                        completed={hasResume}
                        icon="fa-file-alt"
                        title="Upload your resume"
                        action="/documents"
                    />
                    <OnboardingStep
                        completed={hasApplication}
                        icon="fa-paper-plane"
                        title="Apply to your first job"
                        action="/jobs"
                    />
                </div>

                <progress
                    className="progress progress-warning mt-4"
                    value={completionPercentage}
                    max="100"
                />
            </div>
        </div>
    );
}
```

### 4.2 Enhanced Stats Cards

**Add Sparklines and Trends:**

```tsx
<div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
    <div className="card-body">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-base-content/70 mb-1">
                    Applications
                </p>
                <p className="text-3xl font-bold">{stapplications}</p>
                <p className="text-xs text-success flex items-center gap-1 mt-1">
                    <i className="fa-duotone fa-regular fa-arrow-up"></i>
                    +3 this week
                </p>
            </div>
            <div className="flex flex-col items-end">
                <i className="fa-duotone fa-regular fa-file-lines text-4xl text-primary"></i>
                {/* Mini sparkline chart */}
                <Sparkline data={weeklyApplications} />
            </div>
        </div>
    </div>
</div>
```

### 4.3 Activity Feed

**Add Recent Activity Timeline:**

```tsx
<div className="card bg-base-100 shadow">
    <div className="card-body">
        <h2 className="card-title">
            <i className="fa-duotone fa-regular fa-clock"></i>
            Recent Activity
        </h2>
        <ul className="timeline timeline-vertical timeline-compact">
            {activities.map((activity) => (
                <li key={activity.id}>
                    <div className="timeline-start text-xs text-base-content/60">
                        {formatRelativeTime(activity.timestamp)}
                    </div>
                    <div className="timeline-middle">
                        <i
                            className={`fa-duotone fa-regular ${activity.icon} text-${activity.color}`}
                        ></i>
                    </div>
                    <div className="timeline-end timeline-box">
                        {activity.message}
                    </div>
                </li>
            ))}
        </ul>
    </div>
</div>
```

### 4.4 Quick Actions Improvement

**Make Context-Aware:**

```tsx
// Show different actions based on user state
const quickActions = useMemo(() => {
    const actions = [];

    if (!hasResume) {
        actions.push({
            priority: "high",
            label: "Upload Resume",
            icon: "fa-upload",
            href: "/documents",
            badge: "Recommended",
        });
    }

    if (hasInterviews) {
        actions.push({
            priority: "high",
            label: "Prepare for Interview",
            icon: "fa-calendar-check",
            href: "/interviews",
            badge: `${interviewCount} upcoming`,
        });
    }

    // Always show browse jobs
    actions.push({ label: "Browse Jobs", icon: "fa-search", href: "/jobs" });

    return actions.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );
}, [hasResume, hasInterviews]);
```

---

## 5. Job Browsing Experience

### 5.1 Search UX Improvements

**Current Issues:**

- Search happens on every keystroke
- No search suggestions/autocomplete
- Filters reset on page refresh

**Recommendations:**

#### A. Debounced Search with Suggestions

```tsx
// Search component with autocomplete
<div className="relative">
    <input
        type="text"
        className="input w-full"
        placeholder="Job title, skills, or company..."
        value={searchInput}
        onChange={(e) => {
            setSearchInput(e.target.value);
            debouncedSearch(e.target.value);
        }}
        onFocus={() => setShowSuggestions(true)}
    />

    {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-base-100 border border-base-300 rounded-box mt-1 shadow-lg">
            {suggestions.map((suggestion) => (
                <li
                    key={suggestion.id}
                    className="p-3 hover:bg-base-200 cursor-pointer flex items-center gap-2"
                    onClick={() => applySearch(suggestion.value)}
                >
                    <i
                        className={`fa-duotone fa-regular ${suggestion.type === "job" ? "fa-briefcase" : "fa-building"}`}
                    ></i>
                    <div>
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-xs text-base-content/60">
                            {suggestion.subtitle}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )}
</div>
```

#### B. Persistent Filter State

```tsx
// Save filters to URL and localStorage
useEffect(() => {
    const savedFilters = localStorage.getItem("jobSearchFilters");
    if (savedFilters && !hasUrlParams) {
        const filters = JSON.parse(savedFilters);
        setSearchQuery(filters.search || "");
        setLocationQuery(filters.location || "");
        setTypeFilter(filters.type || "");
    }
}, []);

useEffect(() => {
    localStorage.setItem(
        "jobSearchFilters",
        JSON.stringify({
            search: searchQuery,
            location: locationQuery,
            type: typeFilter,
        }),
    );
}, [searchQuery, locationQuery, typeFilter]);
```

### 5.2 Job Card Enhancements

**Current:** Basic job information display

**Recommendation:** Rich job cards with more context

```tsx
<div className="card bg-base-100 shadow hover:shadow-lg transition-all group">
    <div className="card-body">
        {/* Company logo & match score */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className="avatar">
                    <div className="w-12 rounded-lg bg-base-200">
                        <img
                            src={
                                job.company?.logo_url ||
                                "/company-placeholder.svg"
                            }
                        />
                    </div>
                </div>
                <div>
                    <Link
                        href={`/jobs/${job.id}`}
                        className="card-title text-lg group-hover:text-primary transition"
                    >
                        {job.title}
                    </Link>
                    <p className="text-sm text-base-content/70">
                        {job.company?.name}
                    </p>
                </div>
            </div>

            {/* Match Score */}
            {job.matchScore && (
                <div className="tooltip" data-tip="Match based on your profile">
                    <div
                        className="radial-progress text-primary text-sm"
                        style={{ "--value": job.matchScore, "--size": "3rem" }}
                    >
                        {job.matchScore}%
                    </div>
                </div>
            )}
        </div>

        {/* Key Details */}
        <div className="flex flex-wrap gap-2 mt-3">
            <span className="badge badge-ghost gap-1">
                <i className="fa-duotone fa-regular fa-location-dot"></i>
                {job.location || "Remote"}
            </span>
            <span className="badge badge-ghost gap-1">
                <i className="fa-duotone fa-regular fa-clock"></i>
                {job.employment_type}
            </span>
            {job.salary_min && job.salary_max && (
                <span className="badge badge-success badge-outline gap-1">
                    <i className="fa-duotone fa-regular fa-dollar-sign"></i>
                    {formatSalary(job.salary_min)} -{" "}
                    {formatSalary(job.salary_max)}
                </span>
            )}
        </div>

        {/* Skills Match */}
        {job.matchedSkills?.length > 0 && (
            <div className="mt-3">
                <p className="text-xs text-base-content/60 mb-1">
                    Matching Skills
                </p>
                <div className="flex flex-wrap gap-1">
                    {job.matchedSkills.slice(0, 3).map((skill) => (
                        <span
                            key={skill}
                            className="badge badge-primary badge-sm"
                        >
                            {skill}
                        </span>
                    ))}
                    {job.matchedSkills.length > 3 && (
                        <span className="badge badge-ghost badge-sm">
                            +{job.matchedSkills.length - 3}
                        </span>
                    )}
                </div>
            </div>
        )}

        {/* Action row */}
        <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-200">
            <span className="text-xs text-base-content/50">
                Posted {formatRelativeTime(job.posted_at)}
            </span>
            <div className="flex gap-2">
                <button
                    className="btn btn-ghost btn-sm btn-circle"
                    title="Save Job"
                >
                    <i
                        className={`fa-${savedJobs.includes(job.id) ? "solid" : "regular"} fa-bookmark`}
                    ></i>
                </button>
                <Link
                    href={`/jobs/${job.id}`}
                    className="btn btn-primary btn-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    </div>
</div>
```

### 5.3 Saved Jobs & Job Alerts

**Add Save Functionality:**

```tsx
// Saved jobs section on dashboard
<div className="card bg-base-100 shadow">
    <div className="card-body">
        <div className="flex justify-between items-center">
            <h2 className="card-title">
                <i className="fa-duotone fa-regular fa-bookmark"></i>
                Saved Jobs
            </h2>
            <Link href="/saved-jobs" className="link link-primary text-sm">
                View All ({savedJobs.length})
            </Link>
        </div>
        {/* Saved jobs list */}
    </div>
</div>

// Job alert setup
<div className="alert bg-primary/10 border-primary/20">
    <i className="fa-duotone fa-regular fa-bell text-primary"></i>
    <div>
        <h3 className="font-bold">Get notified about new jobs</h3>
        <p className="text-sm">Set up alerts based on your current search</p>
    </div>
    <button className="btn btn-primary btn-sm" onClick={() => setShowAlertModal(true)}>
        Create Alert
    </button>
</div>
```

---

## 6. Application Flow Refinement

### 6.1 Pre-Application Confidence Builder

**Before Starting Application:**

```tsx
<div className="card bg-base-100 shadow mb-6">
    <div className="card-body">
        <h3 className="font-bold text-lg mb-4">Your Application Readiness</h3>

        <div className="space-y-3">
            {/* Profile completeness */}
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <i
                        className={`fa-duotone fa-regular ${profileComplete ? "fa-check-circle text-success" : "fa-circle-exclamation text-warning"}`}
                    ></i>
                    Profile Complete
                </span>
                {!profileComplete && (
                    <Link href="/profile" className="link link-primary text-sm">
                        Complete Now
                    </Link>
                )}
            </div>

            {/* Resume uploaded */}
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <i
                        className={`fa-duotone fa-regular ${hasResume ? "fa-check-circle text-success" : "fa-circle-exclamation text-warning"}`}
                    ></i>
                    Resume Uploaded
                </span>
                {!hasResume && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="link link-primary text-sm"
                    >
                        Upload Now
                    </button>
                )}
            </div>

            {/* Skills match */}
            <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                    <i className="fa-duotone fa-regular fa-chart-pie text-info"></i>
                    Skills Match: {matchPercentage}%
                </span>
                <div className="w-24">
                    <progress
                        className="progress progress-info"
                        value={matchPercentage}
                        max="100"
                    ></progress>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 6.2 Wizard Step Improvements

**Current:** Basic step indicator

**Enhancement:** Rich step indicator with context

```tsx
// Enhanced step indicator
<ul className="steps steps-horizontal w-full mb-8">
    {steps.map((step, index) => (
        <li
            key={step.number}
            className={`step ${currentStep >= step.number ? "step-primary" : ""}`}
            data-content={currentStep > step.number ? "✓" : step.number}
        >
            <div className="text-center">
                <span className="font-medium">{step.title}</span>
                {currentStep === step.number && (
                    <span className="block text-xs text-base-content/60">
                        {step.description}
                    </span>
                )}
            </div>
        </li>
    ))}
</ul>
```

### 6.3 Application Confirmation & Next Steps

**Post-Submission Screen:**

```tsx
<div className="min-h-[60vh] flex items-center justify-center">
    <div className="text-center max-w-lg">
        {/* Success animation */}
        <div className="mb-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center">
                <i className="fa-duotone fa-regular fa-check text-5xl text-success animate-bounce"></i>
            </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-base-content/70 mb-6">
            Your application for <strong>{jobTitle}</strong> at{" "}
            <strong>{companyName}</strong> has been sent.
        </p>

        {/* Timeline expectation */}
        <div className="card bg-base-200 mb-6">
            <div className="card-body py-4">
                <h3 className="font-bold text-sm mb-2">What happens next?</h3>
                <ul className="text-sm text-left space-y-2">
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-envelope text-primary"></i>
                        Your recruiter will review your application within 24-48
                        hours
                    </li>
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-bell text-primary"></i>
                        You'll receive email updates on your application status
                    </li>
                    <li className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-comments text-primary"></i>
                        Your recruiter may reach out for additional information
                    </li>
                </ul>
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/applications" className="btn btn-primary">
                <i className="fa-duotone fa-regular fa-list-check"></i>
                View My Applications
            </Link>
            <Link href="/jobs" className="btn btn-ghost">
                Browse More Jobs
            </Link>
        </div>
    </div>
</div>
```

---

## 7. Profile Page Enhancements

### 7.1 Visual Profile Completeness

```tsx
// Profile completion ring
<div className="flex items-center gap-4 mb-6">
    <div
        className="radial-progress text-primary"
        style={{ "--value": completionPercentage, "--size": "5rem" }}
    >
        {completionPercentage}%
    </div>
    <div>
        <h3 className="font-bold">Profile Strength</h3>
        <p className="text-sm text-base-content/70">
            {completionPercentage < 50
                ? "Add more details to stand out"
                : completionPercentage < 80
                  ? "Looking good! A few more details to go"
                  : "Excellent! Your profile is complete"}
        </p>
        {missingFields.length > 0 && (
            <p className="text-xs text-warning mt-1">
                Missing: {missingFields.join(", ")}
            </p>
        )}
    </div>
</div>
```

### 7.2 Skills Management

**Current:** Simple text area for skills

**Enhancement:** Tag-based skill picker

```tsx
// Skill picker with suggestions
<fieldset className="fieldset">
    <legend className="fieldset-legend">Skills</legend>
    <div className="flex flex-wrap gap-2 p-3 bg-base-200 rounded-lg min-h-[100px]">
        {selectedSkills.map((skill) => (
            <span key={skill} className="badge badge-primary gap-1">
                {skill}
                <button
                    onClick={() => removeSkill(skill)}
                    className="hover:text-error"
                >
                    <i className="fa-duotone fa-regular fa-times"></i>
                </button>
            </span>
        ))}
        <input
            type="text"
            className="bg-transparent outline-none flex-1 min-w-[100px]"
            placeholder="Type to add skills..."
            value={skillInput}
            onChange={(e) => {
                setSkillInput(e.target.value);
                fetchSkillSuggestions(e.target.value);
            }}
            onKeyDown={handleSkillKeyDown}
        />
    </div>

    {/* Suggestions dropdown */}
    {skillSuggestions.length > 0 && (
        <div className="bg-base-100 border border-base-300 rounded-lg mt-1 shadow-lg">
            {skillSuggestions.map((suggestion) => (
                <button
                    key={suggestion}
                    className="w-full text-left px-3 py-2 hover:bg-base-200"
                    onClick={() => addSkill(suggestion)}
                >
                    {suggestion}
                </button>
            ))}
        </div>
    )}

    {/* Popular skills */}
    <div className="mt-2">
        <span className="text-xs text-base-content/60">Popular: </span>
        {popularSkills.map((skill) => (
            <button
                key={skill}
                className="text-xs link link-primary mr-2"
                onClick={() => addSkill(skill)}
            >
                +{skill}
            </button>
        ))}
    </div>
</fieldset>
```

### 7.3 Profile Preview

**Add "View as Recruiter" Mode:**

```tsx
<div className="flex justify-between items-center mb-6">
    <h1 className="text-4xl font-bold">My Profile</h1>
    <button
        className="btn btn-outline btn-sm gap-2"
        onClick={() => setShowPreview(true)}
    >
        <i className="fa-duotone fa-regular fa-eye"></i>
        View as Recruiter
    </button>
</div>;

{
    /* Preview Modal */
}
<dialog className={`modal ${showPreview ? "modal-open" : ""}`}>
    <div className="modal-box max-w-3xl">
        <h3 className="font-bold text-lg mb-4">
            <i className="fa-duotone fa-regular fa-user-tie mr-2"></i>
            Recruiter View
        </h3>
        <ProfilePreview profile={formData} />
        <div className="modal-action">
            <button className="btn" onClick={() => setShowPreview(false)}>
                Close
            </button>
        </div>
    </div>
</dialog>;
```

---

## 8. Mobile Experience

### 8.1 Bottom Navigation for Mobile

```tsx
// Add mobile dock navigation
<div className="dock dock-bottom lg:hidden">
    <Link
        href="/portal/dashboard"
        className={currentPath === "/portal/dashboard" ? "dock-active" : ""}
    >
        <i className="fa-duotone fa-regular fa-gauge"></i>
        <span className="dock-label">Dashboard</span>
    </Link>
    <Link
        href="/jobs"
        className={currentPath.startsWith("/jobs") ? "dock-active" : ""}
    >
        <i className="fa-duotone fa-regular fa-briefcase"></i>
        <span className="dock-label">Jobs</span>
    </Link>
    <Link
        href="/applications"
        className={currentPath.startsWith("/applications") ? "dock-active" : ""}
    >
        <i className="fa-duotone fa-regular fa-file-lines"></i>
        <span className="dock-label">Applications</span>
    </Link>
    <Link
        href="/profile"
        className={currentPath === "/profile" ? "dock-active" : ""}
    >
        <i className="fa-duotone fa-regular fa-user"></i>
        <span className="dock-label">Profile</span>
    </Link>
</div>
```

### 8.2 Touch-Friendly Interactions

```tsx
// Larger touch targets for mobile
<style jsx>{`
    @media (max-width: 768px) {
        .btn {
            min-height: 48px;
        }
        .menu li > * {
            min-height: 48px;
        }
        .card-body {
            padding: 1.25rem;
        }
    }
`}</style>
```

### 8.3 Swipe Gestures for Job Cards

```tsx
// Swipeable job cards on mobile
<SwipeableItem
    onSwipeLeft={() => handleDismiss(job.id)}
    onSwipeRight={() => handleSave(job.id)}
>
    <JobCard job={job} />
</SwipeableItem>

// Indicator overlays
<div className="swipe-indicator-left bg-error/20 text-error">
    <i className="fa-duotone fa-regular fa-times"></i> Skip
</div>
<div className="swipe-indicator-right bg-success/20 text-success">
    <i className="fa-duotone fa-regular fa-bookmark"></i> Save
</div>
```

---

## 9. Accessibility Improvements

### 9.1 Screen Reader Enhancements

```tsx
// Add ARIA labels and live regions
<main role="main" aria-label="Job listings">
    <div aria-live="polite" aria-atomic="true" className="sr-only">
        {loading
            ? "Loading jobs..."
            : `Showing ${jobs.length} of ${total} jobs`}
    </div>

    {/* Filter announcements */}
    <div role="status" aria-live="polite" className="sr-only">
        {activeFilters.length > 0 && `Filtered by: ${activeFilters.join(", ")}`}
    </div>
</main>
```

### 9.2 Focus Management

```tsx
// Skip to content link
<a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 btn btn-primary">
    Skip to main content
</a>

// Focus trap for modals
<FocusTrap active={modalOpen}>
    <dialog className="modal modal-open">
        {/* Modal content */}
    </dialog>
</FocusTrap>
```

### 9.3 Color Contrast

```css
/* Ensure sufficient contrast for all states */
.badge-ghost {
    --tw-bg-opacity: 0.15; /* Increased from default */
}

.text-base-content\/70 {
    opacity: 0.75; /* Ensure 4.5:1 contrast ratio */
}
```

---

## 10. Performance Optimizations

### 10.1 Lazy Loading Images

```tsx
// Use Next.js Image with lazy loading
import Image from "next/image";

<Image
    src={company.logo_url || "/company-placeholder.svg"}
    alt={`${company.name} logo`}
    width={48}
    height={48}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/png;base64,..."
/>;
```

### 10.2 Virtualized Lists for Large Datasets

```tsx
// Use react-window for long lists
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={jobs.length} itemSize={200} width="100%">
    {({ index, style }) => (
        <div style={style}>
            <JobCard job={jobs[index]} />
        </div>
    )}
</FixedSizeList>;
```

### 10.3 Optimistic UI Updates

```tsx
// Optimistic save job
const handleSaveJob = async (jobId: string) => {
    // Optimistically update UI
    setSavedJobs((prev) => [...prev, jobId]);

    try {
        await saveJob(jobId, token);
    } catch (error) {
        // Rollback on failure
        setSavedJobs((prev) => prev.filter((id) => id !== jobId));
        toast.error("Failed to save job");
    }
};
```

---

## 11. Implementation Priority Matrix

### High Priority (Implement First)

| Item                         | Impact | Effort | Justification                    |
| ---------------------------- | ------ | ------ | -------------------------------- |
| New User Onboarding Widget   | High   | Medium | Directly impacts user activation |
| Mobile Bottom Navigation     | High   | Low    | Critical for mobile experience   |
| Search Autocomplete          | High   | Medium | Improves job discovery           |
| Profile Completion Indicator | High   | Low    | Drives profile completion        |
| Empty State Improvements     | Medium | Low    | Better first impressions         |

### Medium Priority

| Item                      | Impact | Effort | Justification             |
| ------------------------- | ------ | ------ | ------------------------- |
| Job Card Enhancements     | Medium | Medium | Better job browsing UX    |
| Skills Tag Picker         | Medium | Medium | Easier profile management |
| Saved Jobs Feature        | Medium | Medium | User engagement           |
| Activity Feed             | Medium | Medium | Dashboard engagement      |
| Hero Section Optimization | Medium | High   | Performance + engagement  |

### Lower Priority (Nice to Have)

| Item                   | Impact | Effort | Justification           |
| ---------------------- | ------ | ------ | ----------------------- |
| Command Palette Search | Low    | High   | Power user feature      |
| Swipe Gestures         | Low    | High   | Mobile enhancement      |
| Match Score Display    | Medium | High   | Requires AI integration |
| Profile Preview Mode   | Low    | Low    | Nice to have            |
| Job Alerts             | Medium | High   | Engagement feature      |

---

## Appendix: Component Code Snippets

### A. Onboarding Step Component

```tsx
interface OnboardingStepProps {
    completed: boolean;
    icon: string;
    title: string;
    action: string;
}

function OnboardingStep({
    completed,
    icon,
    title,
    action,
}: OnboardingStepProps) {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg ${completed ? "bg-white/10" : "bg-white/20"}`}
        >
            <div className="flex items-center gap-3">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${completed ? "bg-success" : "bg-white/20"}`}
                >
                    <i
                        className={`fa-duotone fa-regular ${completed ? "fa-check" : icon}`}
                    ></i>
                </div>
                <span className={completed ? "line-through opacity-70" : ""}>
                    {title}
                </span>
            </div>
            {!completed && (
                <Link href={action} className="btn btn-ghost btn-sm">
                    Start{" "}
                    <i className="fa-duotone fa-regular fa-arrow-right"></i>
                </Link>
            )}
        </div>
    );
}
```

### B. Command Palette Component

```tsx
function CommandPalette({ isOpen, onClose }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    // Keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                onOpen();
            }
            if (e.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
            <div className="modal-box max-w-2xl p-0">
                <div className="p-4 border-b border-base-300">
                    <label className="input flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-search"></i>
                        <input
                            type="text"
                            className="grow"
                            placeholder="Search jobs, companies, or pages..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </label>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {results.map((result) => (
                        <ResultItem
                            key={result.id}
                            result={result}
                            onClick={onClose}
                        />
                    ))}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
```

---

## Revision History

| Version | Date       | Author         | Changes                   |
| ------- | ---------- | -------------- | ------------------------- |
| 1.0     | 2025-12-30 | GitHub Copilot | Initial document creation |

---

**Next Steps:**

1. Review recommendations with stakeholders
2. Prioritize based on development capacity
3. Create implementation tickets
4. Design mockups for high-priority items
5. Conduct user testing after implementation
