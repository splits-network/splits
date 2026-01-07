# Portal App UX/UI Recommendations

**Document Version:** 1.0  
**Last Updated:** January 2025  
**App:** Splits Network Portal (Recruiter & Company Dashboard)

---

## Executive Summary

The Portal app serves as the primary interface for recruiters, company admins, and platform administrators on the Splits Network platform. This document provides a comprehensive UX/UI analysis with actionable recommendations to improve user experience, efficiency, and engagement.

### Key Personas

1. **Recruiters** - Independent or affiliated recruiters managing candidates and job placements
2. **Company Admins** - Company representatives managing job postings and reviewing candidates
3. **Hiring Managers** - Team members reviewing and interviewing candidates
4. **Platform Admins** - System administrators managing the platform

---

## Table of Contents

1. [Current State Overview](#1-current-state-overview)
2. [Landing Page & Marketing](#2-landing-page--marketing)
3. [Navigation & Information Architecture](#3-navigation--information-architecture)
4. [Dashboard Experience](#4-dashboard-experience)
5. [Roles & Job Management](#5-roles--job-management)
6. [Candidate Management](#6-candidate-management)
7. [Proposals & Workflow System](#7-proposals--workflow-system)
8. [Placements & Earnings](#8-placements--earnings)
9. [Onboarding Flow](#9-onboarding-flow)
10. [Mobile & Responsive Design](#10-mobile--responsive-design)
11. [Accessibility Improvements](#11-accessibility-improvements)
12. [Performance Optimizations](#12-performance-optimizations)
13. [Implementation Priority Matrix](#13-implementation-priority-matrix)

---

## 1. Current State Overview

### Strengths

1. **Role-Based Dashboards** - Excellent separation of concerns with dedicated dashboards for recruiters, companies, and admins
2. **DaisyUI Foundation** - Consistent design language with the `splits-light` and `splits-dark` themes
3. **Unified Proposals System** - Centralized workflow management for all proposal types
4. **Grid/Table View Options** - Users can switch between grid and table views on list pages
5. **Real-time Notifications** - NotificationBell component with polling for updates
6. **Progressive Onboarding** - 4-step wizard for new user setup

### Areas for Improvement

1. **Landing Page** - Long, text-heavy sections that could benefit from visual variety
2. **Sidebar Navigation** - Static design with no visual hierarchy or grouping
3. **Dashboard Data** - Placeholder stats with TODO comments; needs real data integration
4. **Empty States** - Basic empty states without clear calls-to-action
5. **Form Consistency** - Some pages still using older patterns
6. **Search & Filtering** - Limited advanced filtering options
7. **Bulk Actions** - No bulk selection/action capabilities on list views
8. **Keyboard Navigation** - Limited keyboard shortcut support

---

## 2. Landing Page & Marketing

### Current Implementation

The landing page (`/app/page.tsx`) is comprehensive but very long (~780 lines) with:
- Hero section with video background
- Dual-track "How It Works" for recruiters and companies
- Feature showcases
- Pricing preview
- Testimonials
- CTA sections

### Recommendations

#### 2.1 Optimize Video Hero Performance

**Issue:** Video hero can be optimized for better performance while maintaining visual impact.

**Recommendation:**
```tsx
{/* Performance-Optimized Video Hero */}
<section className="hero min-h-[80vh] relative overflow-hidden">
    <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        poster="/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
    >
        <source src="/ads.webm" type="video/webm" />
        <source src="/ads.mp4" type="video/mp4" />
    </video>
    
    {/* Enhanced content overlay with better contrast */}
    <div className="hero-content text-center relative z-10">
        <div className="max-w-4xl mx-auto backdrop-blur-sm bg-base-100/10 rounded-2xl p-8">
            <h1 className="text-5xl font-bold mb-6 text-white drop-shadow-lg">
                Connect. Place. Earn.
            </h1>
            <p className="text-xl mb-8 text-white/90 drop-shadow">
                The marketplace where recruiters and companies collaborate seamlessly
            </p>
            <div className="flex gap-4 justify-center">
                <Link href="/sign-up" className="btn btn-primary btn-lg">
                    Get Started
                </Link>
                <Link href="/learn-more" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                    Learn More
                </Link>
            </div>
        </div>
    </div>
</section>
```

#### 2.2 Add Social Proof Carousel

**Recommendation:** Replace static testimonial grid with an auto-playing carousel:

```tsx
{/* Testimonial Carousel */}
<div className="carousel carousel-center w-full p-4 space-x-4 bg-base-200 rounded-box">
    {testimonials.map((testimonial, i) => (
        <div key={i} className="carousel-item">
            <div className="card bg-base-100 w-96 shadow">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="avatar">
                            <div className="w-12 rounded-full">
                                <img src={testimonial.avatar} alt={testimonial.name} />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{testimonial.name}</div>
                            <div className="text-sm opacity-70">{testimonial.title}</div>
                        </div>
                    </div>
                    <p className="italic">"{testimonial.quote}"</p>
                    <div className="rating rating-sm mt-2">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className="fa-solid fa-star text-warning" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    ))}
</div>
```

#### 2.3 Add Animated Statistics Counter

**Recommendation:** Make key metrics more engaging:

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';

function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;
        
        let startTime: number;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return (
        <div ref={ref} className="stat-value text-primary">
            {count.toLocaleString()}{suffix}
        </div>
    );
}

// Usage
<div className="stats stats-horizontal shadow">
    <div className="stat">
        <div className="stat-title">Recruiters</div>
        <AnimatedCounter end={2500} suffix="+" />
    </div>
    <div className="stat">
        <div className="stat-title">Placements</div>
        <AnimatedCounter end={15000} suffix="+" />
    </div>
    <div className="stat">
        <div className="stat-title">Companies</div>
        <AnimatedCounter end={500} suffix="+" />
    </div>
</div>
```

---

## 3. Navigation & Information Architecture

### Current Implementation

- **Header:** Standard navbar with logo, marketing links, theme toggle, notifications, user dropdown
- **Sidebar:** Simple list of nav items filtered by role (recruiter, company_admin, etc.)

### Recommendations

#### 3.1 Enhanced Sidebar with Grouping

**Issue:** Flat navigation list makes it hard to scan for specific sections.

**Recommendation:**
```tsx
const navGroups = [
    {
        label: 'Overview',
        items: [
            { href: '/portal/dashboard', label: 'Dashboard', icon: 'fa-house' },
        ]
    },
    {
        label: 'Recruiting',
        items: [
            { href: '/portal/roles', label: 'Roles', icon: 'fa-briefcase' },
            { href: '/candidates', label: 'Candidates', icon: 'fa-users' },
            { href: '/applications', label: 'Applications', icon: 'fa-file-lines' },
        ]
    },
    {
        label: 'Workflow',
        items: [
            { href: '/proposals', label: 'Proposals', icon: 'fa-inbox', badge: actionableCount },
            { href: '/invitations', label: 'Invitations', icon: 'fa-envelope' },
            { href: '/placements', label: 'Placements', icon: 'fa-trophy' },
        ]
    },
    {
        label: 'Account',
        items: [
            { href: '/profile', label: 'Profile', icon: 'fa-user' },
            { href: '/billing', label: 'Billing', icon: 'fa-credit-card' },
        ]
    },
];

// Render with collapsible groups
{navGroups.map((group) => (
    <div key={group.label} className="mb-4">
        <div className="px-3 py-2 text-xs font-semibold text-base-content/50 uppercase tracking-wider">
            {group.label}
        </div>
        {group.items.map((item) => (
            <NavItem key={item.href} {...item} />
        ))}
    </div>
))}
```

#### 3.2 Add Quick Actions Floating Button

**Recommendation:** Add a floating action button for common tasks:

```tsx
{/* Quick Actions FAB */}
<div className="fixed bottom-6 right-6 z-50">
    <div className="dropdown dropdown-top dropdown-end">
        <label tabIndex={0} className="btn btn-primary btn-circle btn-lg shadow-lg">
            <i className="fa-solid fa-plus text-xl"></i>
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-52 mb-2">
            <li><a href="/portal/candidates/new"><i className="fa-solid fa-user-plus w-4"></i>New Candidate</a></li>
            <li><a href="/portal/roles/new"><i className="fa-solid fa-briefcase w-4"></i>New Role</a></li>
            <li><a href="/applications/quick-submit"><i className="fa-solid fa-paper-plane w-4"></i>Quick Submit</a></li>
        </ul>
    </div>
</div>
```

#### 3.3 Add Breadcrumb Navigation

**Recommendation:** Add breadcrumbs for deep pages:

```tsx
// components/breadcrumbs.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pathLabels: Record<string, string> = {
    'dashboard': 'Dashboard',
    'roles': 'Roles',
    'candidates': 'Candidates',
    'applications': 'Applications',
    'placements': 'Placements',
    'new': 'New',
    'edit': 'Edit',
};

export function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);
    
    if (segments.length <= 1) return null;
    
    return (
        <div className="breadcrumbs text-sm mb-4">
            <ul>
                <li><Link href="/portal/dashboard">Home</Link></li>
                {segments.map((segment, index) => {
                    const path = '/' + segments.slice(0, index + 1).join('/');
                    const isLast = index === segments.length - 1;
                    const label = pathLabels[segment] || segment;
                    
                    return (
                        <li key={path}>
                            {isLast ? (
                                <span className="text-base-content/70">{label}</span>
                            ) : (
                                <Link href={path}>{label}</Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
```

---

## 4. Dashboard Experience

### Current Implementation

Three dashboard variants exist:
- `RecruiterDashboard` - Stats, earnings, activity, proposals widget
- `CompanyDashboard` - Pipeline stats, role breakdown, activity
- `AdminDashboard` - Platform-wide metrics, quick actions

### Recommendations

#### 4.1 Customizable Dashboard Widgets

**Recommendation:** Allow users to customize their dashboard layout:

```tsx
interface DashboardWidget {
    id: string;
    type: 'stats' | 'activity' | 'chart' | 'list';
    title: string;
    size: 'sm' | 'md' | 'lg' | 'full';
    enabled: boolean;
    order: number;
}

// User can drag-and-drop or toggle widgets
const defaultRecruiterWidgets: DashboardWidget[] = [
    { id: 'key-stats', type: 'stats', title: 'Key Metrics', size: 'full', enabled: true, order: 1 },
    { id: 'earnings', type: 'chart', title: 'Earnings', size: 'md', enabled: true, order: 2 },
    { id: 'proposals', type: 'list', title: 'Action Required', size: 'md', enabled: true, order: 3 },
    { id: 'activity', type: 'list', title: 'Recent Activity', size: 'lg', enabled: true, order: 4 },
    { id: 'top-roles', type: 'list', title: 'Top Roles', size: 'md', enabled: true, order: 5 },
];

// Render customizable grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {widgets
        .filter(w => w.enabled)
        .sort((a, b) => a.order - b.order)
        .map(widget => (
            <div 
                key={widget.id} 
                className={cn(
                    'col-span-1',
                    widget.size === 'md' && 'md:col-span-2',
                    widget.size === 'lg' && 'md:col-span-3',
                    widget.size === 'full' && 'md:col-span-4'
                )}
            >
                <DashboardWidgetCard widget={widget} />
            </div>
        ))}
</div>
```

#### 4.2 Real-Time Stats Updates

**Issue:** Dashboard stats are loaded once on mount with placeholder data.

**Recommendation:** Add real-time polling with visual indicators:

```tsx
'use client';

import { useEffect, useState } from 'react';

function usePolledStats(fetchFn: () => Promise<any>, interval = 60000) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchFn();
                setStats(data);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        load();
        const timer = setInterval(load, interval);
        return () => clearInterval(timer);
    }, [fetchFn, interval]);

    return { stats, loading, lastUpdated };
}

// Usage with last updated indicator
<div className="flex items-center justify-between mb-4">
    <h3 className="card-title">Key Metrics</h3>
    {lastUpdated && (
        <span className="text-xs text-base-content/50">
            Updated {formatRelativeTime(lastUpdated)}
        </span>
    )}
</div>
```

#### 4.3 Enhanced Empty Dashboard State

**Recommendation:**

```tsx
{/* Empty state for new recruiters */}
<div className="card bg-base-100 shadow">
    <div className="card-body items-center text-center py-12">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-rocket text-4xl text-primary"></i>
        </div>
        <h3 className="text-2xl font-bold mb-2">Welcome to Splits Network!</h3>
        <p className="text-base-content/70 max-w-md mb-6">
            Get started by browsing available roles or adding your first candidate to the platform.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/portal/roles" className="btn btn-primary">
                <i className="fa-solid fa-briefcase mr-2"></i>
                Browse Roles
            </Link>
            <Link href="/portal/candidates/new" className="btn btn-outline">
                <i className="fa-solid fa-user-plus mr-2"></i>
                Add Candidate
            </Link>
        </div>
        
        {/* Quick tips */}
        <div className="divider">Getting Started Tips</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">1</div>
                <div>
                    <div className="font-semibold">Complete Your Profile</div>
                    <div className="text-sm text-base-content/70">Add your specialties to get matched with relevant roles</div>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">2</div>
                <div>
                    <div className="font-semibold">Join Active Roles</div>
                    <div className="text-sm text-base-content/70">Request access to roles in your niche</div>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <div className="badge badge-primary badge-lg">3</div>
                <div>
                    <div className="font-semibold">Submit Candidates</div>
                    <div className="text-sm text-base-content/70">Start earning by placing great candidates</div>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 5. Roles & Job Management

### Current Implementation

- Grid/table toggle view
- Basic search and status filtering
- Role cards with status badges

### Recommendations

#### 5.1 Advanced Filtering Panel

**Recommendation:**

```tsx
{/* Advanced Filters */}
<div className="collapse collapse-arrow bg-base-100 shadow mb-4">
    <input type="checkbox" />
    <div className="collapse-title font-medium">
        <i className="fa-solid fa-filter mr-2"></i>
        Advanced Filters
        {activeFiltersCount > 0 && (
            <span className="badge badge-primary ml-2">{activeFiltersCount}</span>
        )}
    </div>
    <div className="collapse-content">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4">
            <div className="fieldset">
                <label className="label">Location</label>
                <select className="select w-full" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                    <option value="">All Locations</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                </select>
            </div>
            <div className="fieldset">
                <label className="label">Salary Range</label>
                <div className="flex gap-2">
                    <input type="number" className="input w-full" placeholder="Min" />
                    <input type="number" className="input w-full" placeholder="Max" />
                </div>
            </div>
            <div className="fieldset">
                <label className="label">Fee Percentage</label>
                <input type="range" min="10" max="30" className="range range-primary" />
                <div className="flex justify-between text-xs px-2">
                    <span>10%</span>
                    <span>20%</span>
                    <span>30%</span>
                </div>
            </div>
            <div className="fieldset">
                <label className="label">Date Posted</label>
                <select className="select w-full">
                    <option value="">Any time</option>
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                </select>
            </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
            <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
                Clear All
            </button>
            <button className="btn btn-primary btn-sm" onClick={applyFilters}>
                Apply Filters
            </button>
        </div>
    </div>
</div>
```

#### 5.2 Role Card Enhancement

**Recommendation:** Add more visual information to role cards:

```tsx
<div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-200 group">
    <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
                {/* Company Logo */}
                <div className="avatar avatar-placeholder">
                    <div className="bg-base-200 text-base-content rounded-lg w-12">
                        <span className="text-lg">{job.company_name?.[0] || 'C'}</span>
                    </div>
                </div>
                <div>
                    <Link href={`/portal/roles/${job.id}`} className="hover:text-primary">
                        <h3 className="card-title text-lg group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                    </Link>
                    <div className="text-sm text-base-content/70">{job.company_name}</div>
                </div>
            </div>
            <span className={`badge ${getStatusBadge(job.status)}`}>
                {job.status}
            </span>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-2 mt-3">
            {job.location && (
                <span className="badge badge-ghost gap-1">
                    <i className="fa-solid fa-location-dot"></i>
                    {job.location}
                </span>
            )}
            {job.salary_min && job.salary_max && (
                <span className="badge badge-ghost gap-1">
                    <i className="fa-solid fa-dollar-sign"></i>
                    ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                </span>
            )}
            <span className="badge badge-primary badge-outline gap-1">
                <i className="fa-solid fa-percent"></i>
                {job.fee_percentage}% fee
            </span>
        </div>

        {/* Progress indicator */}
        <div className="mt-4">
            <div className="flex justify-between text-xs text-base-content/70 mb-1">
                <span>Pipeline Progress</span>
                <span>{job.applications_count || 0} candidates</span>
            </div>
            <div className="flex gap-1 h-2">
                <div className="bg-info rounded-l flex-1" style={{ width: `${job.applied_pct || 30}%` }} title="Applied"></div>
                <div className="bg-warning flex-1" style={{ width: `${job.interviewing_pct || 20}%` }} title="Interviewing"></div>
                <div className="bg-success rounded-r flex-1" style={{ width: `${job.offer_pct || 10}%` }} title="Offer"></div>
            </div>
        </div>

        {/* Actions */}
        <div className="card-actions justify-between items-center mt-4 pt-4 border-t border-base-200">
            <span className="text-xs text-base-content/50">
                Posted {formatDate(job.created_at)}
            </span>
            <div className="flex gap-2">
                <Link href={`/portal/roles/${job.id}`} className="btn btn-primary btn-sm">
                    View Details
                </Link>
                {isRecruiter && (
                    <Link href={`/portal/roles/${job.id}/submit`} className="btn btn-outline btn-sm">
                        Submit Candidate
                    </Link>
                )}
            </div>
        </div>
    </div>
</div>
```

---

## 6. Candidate Management

### Current Implementation

- Grid/table views with verification status badges
- Scope filter (mine/all)
- Basic search

### Recommendations

#### 6.1 Candidate Profile Quick Preview

**Recommendation:** Add hover preview without navigation:

```tsx
{/* Candidate card with quick preview on hover */}
<div className="relative group">
    <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow">
        {/* Regular card content */}
    </div>
    
    {/* Quick preview popover on hover */}
    <div className="absolute left-full top-0 ml-2 w-80 bg-base-100 rounded-box shadow-xl border border-base-200 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="flex items-center gap-3 mb-4">
            <div className="avatar">
                <div className="w-16 rounded-full bg-primary/10">
                    <span className="text-2xl text-primary flex items-center justify-center h-full">
                        {candidate.full_name[0]}
                    </span>
                </div>
            </div>
            <div>
                <div className="font-bold">{candidate.full_name}</div>
                <div className="text-sm text-base-content/70">{candidate.email}</div>
            </div>
        </div>
        
        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-base-200 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{candidate.applications_count || 0}</div>
                <div className="text-xs text-base-content/70">Applications</div>
            </div>
            <div className="bg-base-200 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{candidate.placements_count || 0}</div>
                <div className="text-xs text-base-content/70">Placements</div>
            </div>
        </div>
        
        {/* Quick actions */}
        <div className="flex gap-2">
            <Link href={`/candidates/${candidate.id}`} className="btn btn-primary btn-sm flex-1">
                View Profile
            </Link>
            <Link href={`/applications/new?candidate=${candidate.id}`} className="btn btn-outline btn-sm flex-1">
                Submit
            </Link>
        </div>
    </div>
</div>
```

#### 6.2 Bulk Actions for Candidates

**Recommendation:**

```tsx
const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

{/* Bulk action bar - appears when items selected */}
{selectedCandidates.size > 0 && (
    <div className="sticky top-0 z-10 bg-primary text-primary-content p-4 rounded-box mb-4 flex items-center justify-between animate-slide-in-down">
        <div className="flex items-center gap-4">
            <span className="font-medium">{selectedCandidates.size} selected</span>
            <button 
                className="btn btn-sm btn-ghost"
                onClick={() => setSelectedCandidates(new Set())}
            >
                Clear selection
            </button>
        </div>
        <div className="flex gap-2">
            <button className="btn btn-sm btn-ghost">
                <i className="fa-solid fa-tag mr-2"></i>
                Add Tag
            </button>
            <button className="btn btn-sm btn-ghost">
                <i className="fa-solid fa-file-export mr-2"></i>
                Export
            </button>
            <button className="btn btn-sm btn-ghost text-error">
                <i className="fa-solid fa-archive mr-2"></i>
                Archive
            </button>
        </div>
    </div>
)}

{/* Add checkbox to each candidate card */}
<input 
    type="checkbox" 
    className="checkbox checkbox-primary absolute top-3 left-3"
    checked={selectedCandidates.has(candidate.id)}
    onChange={(e) => {
        const newSet = new Set(selectedCandidates);
        e.target.checked ? newSet.add(candidate.id) : newSet.delete(candidate.id);
        setSelectedCandidates(newSet);
    }}
/>
```

---

## 7. Proposals & Workflow System

### Current Implementation

The unified proposals system (`/proposals`) provides:
- Tabbed interface (Action Required, Awaiting Response, Completed)
- Summary stats
- Accept/Decline actions

### Recommendations

#### 7.1 Enhanced Proposal Cards

**Recommendation:**

```tsx
<div className="card bg-base-100 shadow">
    <div className="card-body">
        {/* Urgency indicator */}
        {proposal.is_urgent && (
            <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-error border-l-[40px] border-l-transparent">
                <i className="fa-solid fa-exclamation absolute -top-8 right-1 text-white text-xs"></i>
            </div>
        )}
        
        {/* Header with type badge */}
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getProposalTypeColor(proposal.type)}`}>
                    <i className={`fa-solid ${getProposalTypeIcon(proposal.type)} text-xl`}></i>
                </div>
                <div>
                    <div className="font-bold">{proposal.title}</div>
                    <div className="text-sm text-base-content/70">
                        {proposal.type_label} • {formatRelativeTime(proposal.created_at)}
                    </div>
                </div>
            </div>
            <div className={`badge ${getProposalStateBadge(proposal.state)}`}>
                {proposal.state_label}
            </div>
        </div>
        
        {/* Context */}
        <p className="text-base-content/70 mt-4">{proposal.description}</p>
        
        {/* Timeline */}
        {proposal.deadline && (
            <div className="flex items-center gap-2 mt-4 text-sm">
                <i className="fa-solid fa-clock text-warning"></i>
                <span>Respond by {formatDate(proposal.deadline)}</span>
                {getDaysUntil(proposal.deadline) <= 2 && (
                    <span className="badge badge-warning badge-sm">
                        {getDaysUntil(proposal.deadline) === 0 ? 'Today!' : `${getDaysUntil(proposal.deadline)} days left`}
                    </span>
                )}
            </div>
        )}
        
        {/* Actions */}
        <div className="card-actions justify-end mt-4 pt-4 border-t border-base-200">
            {proposal.state === 'actionable' && (
                <>
                    <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleDecline(proposal.id)}
                    >
                        Decline
                    </button>
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAccept(proposal.id)}
                    >
                        Accept
                    </button>
                </>
            )}
            <button 
                className="btn btn-outline btn-sm"
                onClick={() => handleProposalClick(proposal.id)}
            >
                View Details
            </button>
        </div>
    </div>
</div>
```

#### 7.2 Inline Response Modal

**Recommendation:** Add quick response without leaving the page:

```tsx
{/* Quick Response Modal */}
<dialog id={`proposal-${proposal.id}-modal`} className="modal">
    <div className="modal-box">
        <h3 className="font-bold text-lg">{actionType === 'accept' ? 'Accept' : 'Decline'} Proposal</h3>
        <div className="py-4">
            <div className="fieldset">
                <label className="label">Add a note (optional)</label>
                <textarea 
                    className="textarea h-24 w-full"
                    placeholder="Any comments or conditions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>
        </div>
        <div className="modal-action">
            <form method="dialog">
                <button className="btn btn-ghost">Cancel</button>
            </form>
            <button 
                className={`btn ${actionType === 'accept' ? 'btn-success' : 'btn-error'}`}
                onClick={handleSubmit}
                disabled={submitting}
            >
                {submitting && <span className="loading loading-spinner loading-sm"></span>}
                {actionType === 'accept' ? 'Confirm Accept' : 'Confirm Decline'}
            </button>
        </div>
    </div>
</dialog>
```

---

## 8. Placements & Earnings

### Current Implementation

- Earnings statistics (lifetime, YTD, last 30 days)
- Placement list with search
- Grid/table view toggle

### Recommendations

#### 8.1 Earnings Chart Visualization

**Recommendation:** Add visual earnings chart:

```tsx
import { Line } from 'react-chartjs-2';

{/* Earnings Over Time Chart */}
<div className="card bg-base-100 shadow">
    <div className="card-body">
        <h3 className="card-title">
            <i className="fa-solid fa-chart-line mr-2"></i>
            Earnings Trend
        </h3>
        <div className="h-64">
            <Line 
                data={{
                    labels: last12Months,
                    datasets: [{
                        label: 'Earnings',
                        data: monthlyEarnings,
                        borderColor: 'oklch(var(--p))',
                        backgroundColor: 'oklch(var(--p) / 0.1)',
                        fill: true,
                        tension: 0.4,
                    }]
                }}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => `$${value.toLocaleString()}`
                            }
                        }
                    }
                }}
            />
        </div>
    </div>
</div>
```

#### 8.2 Placement Timeline View

**Recommendation:** Add timeline visualization for placement lifecycle:

```tsx
{/* Placement Timeline */}
<div className="card bg-base-100 shadow">
    <div className="card-body">
        <h3 className="card-title">Placement Journey</h3>
        <ul className="timeline timeline-vertical">
            <li>
                <div className="timeline-start text-sm">{formatDate(placement.submitted_at)}</div>
                <div className="timeline-middle">
                    <i className="fa-solid fa-paper-plane text-info"></i>
                </div>
                <div className="timeline-end timeline-box">Candidate Submitted</div>
                <hr className="bg-info"/>
            </li>
            <li>
                <hr className="bg-info"/>
                <div className="timeline-start text-sm">{formatDate(placement.interview_at)}</div>
                <div className="timeline-middle">
                    <i className="fa-solid fa-calendar-check text-warning"></i>
                </div>
                <div className="timeline-end timeline-box">Interview Scheduled</div>
                <hr className="bg-warning"/>
            </li>
            <li>
                <hr className="bg-warning"/>
                <div className="timeline-start text-sm">{formatDate(placement.offer_at)}</div>
                <div className="timeline-middle">
                    <i className="fa-solid fa-file-contract text-primary"></i>
                </div>
                <div className="timeline-end timeline-box">Offer Extended</div>
                <hr className="bg-primary"/>
            </li>
            <li>
                <hr className="bg-success"/>
                <div className="timeline-start text-sm">{formatDate(placement.hired_at)}</div>
                <div className="timeline-middle">
                    <i className="fa-solid fa-trophy text-success"></i>
                </div>
                <div className="timeline-end timeline-box bg-success text-success-content">Placement Complete!</div>
            </li>
        </ul>
    </div>
</div>
```

---

## 9. Onboarding Flow

### Current Implementation

4-step wizard modal:
1. Role Selection
2. Subscription Plan
3. Profile Info (Recruiter or Company)
4. Completion

### Recommendations

#### 9.1 Add Step Indicators

**Recommendation:** More descriptive step indicators:

```tsx
{/* Step Progress with Labels */}
<ul className="steps steps-horizontal w-full mb-8">
    <li className={`step ${state.currentStep >= 1 ? 'step-primary' : ''}`}>
        <span className="text-xs">Choose Role</span>
    </li>
    <li className={`step ${state.currentStep >= 2 ? 'step-primary' : ''}`}>
        <span className="text-xs">Select Plan</span>
    </li>
    <li className={`step ${state.currentStep >= 3 ? 'step-primary' : ''}`}>
        <span className="text-xs">Your Info</span>
    </li>
    <li className={`step ${state.currentStep >= 4 ? 'step-primary' : ''}`}>
        <span className="text-xs">Ready!</span>
    </li>
</ul>
```

#### 9.2 Role Selection Visual Cards

**Recommendation:** Make role selection more engaging:

```tsx
{/* Role Selection Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <button
        onClick={() => selectRole('recruiter')}
        className={`card bg-base-100 border-2 transition-all hover:border-primary hover:shadow-lg ${
            selectedRole === 'recruiter' ? 'border-primary ring-2 ring-primary/20' : 'border-base-200'
        }`}
    >
        <div className="card-body items-center text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-user-tie text-4xl text-primary"></i>
            </div>
            <h3 className="card-title">I'm a Recruiter</h3>
            <p className="text-base-content/70">
                Find roles, submit candidates, and earn placement fees
            </p>
            <ul className="text-left mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Access thousands of roles
                </li>
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Transparent fee splits
                </li>
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Quick payouts
                </li>
            </ul>
            {selectedRole === 'recruiter' && (
                <div className="badge badge-primary mt-4">
                    <i className="fa-solid fa-check mr-1"></i>
                    Selected
                </div>
            )}
        </div>
    </button>
    
    <button
        onClick={() => selectRole('company_admin')}
        className={`card bg-base-100 border-2 transition-all hover:border-secondary hover:shadow-lg ${
            selectedRole === 'company_admin' ? 'border-secondary ring-2 ring-secondary/20' : 'border-base-200'
        }`}
    >
        <div className="card-body items-center text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <i className="fa-solid fa-building text-4xl text-secondary"></i>
            </div>
            <h3 className="card-title">I'm Hiring</h3>
            <p className="text-base-content/70">
                Post roles and connect with specialized recruiters
            </p>
            <ul className="text-left mt-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Network of vetted recruiters
                </li>
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Only pay on placement
                </li>
                <li className="flex items-center gap-2">
                    <i className="fa-solid fa-check text-success"></i>
                    Full pipeline visibility
                </li>
            </ul>
            {selectedRole === 'company_admin' && (
                <div className="badge badge-secondary mt-4">
                    <i className="fa-solid fa-check mr-1"></i>
                    Selected
                </div>
            )}
        </div>
    </button>
</div>
```

---

## 10. Mobile & Responsive Design

### Current Implementation

- Responsive sidebar (drawer on mobile)
- Mobile dropdown menu in header
- Grid layouts with responsive columns

### Recommendations

#### 10.1 Bottom Navigation for Mobile

**Recommendation:** Add mobile-optimized bottom navigation:

```tsx
{/* Mobile Bottom Navigation - visible only on mobile */}
<div className="dock lg:hidden">
    <Link href="/portal/dashboard" className={pathname === '/portal/dashboard' ? 'dock-active' : ''}>
        <i className="fa-solid fa-house"></i>
        <span className="dock-label">Home</span>
    </Link>
    <Link href="/portal/roles" className={pathname?.startsWith('/portal/roles') ? 'dock-active' : ''}>
        <i className="fa-solid fa-briefcase"></i>
        <span className="dock-label">Roles</span>
    </Link>
    <Link href="/proposals" className={pathname?.startsWith('/proposals') ? 'dock-active' : ''}>
        <i className="fa-solid fa-inbox"></i>
        <span className="dock-label">Inbox</span>
        {actionableCount > 0 && (
            <span className="badge badge-xs badge-error absolute -top-1 -right-1">{actionableCount}</span>
        )}
    </Link>
    <Link href="/portal/placements" className={pathname?.startsWith('/placements') ? 'dock-active' : ''}>
        <i className="fa-solid fa-trophy"></i>
        <span className="dock-label">Earnings</span>
    </Link>
    <Link href="/profile" className={pathname?.startsWith('/profile') ? 'dock-active' : ''}>
        <i className="fa-solid fa-user"></i>
        <span className="dock-label">Profile</span>
    </Link>
</div>
```

#### 10.2 Touch-Friendly Card Actions

**Recommendation:** Larger touch targets on mobile:

```tsx
{/* Card actions with larger touch targets on mobile */}
<div className="card-actions justify-end mt-4">
    <Link 
        href={`/candidates/${candidate.id}`} 
        className="btn btn-primary min-h-[44px] min-w-[100px] sm:btn-sm sm:min-h-0 sm:min-w-0"
    >
        View Details
    </Link>
</div>
```

---

## 11. Accessibility Improvements

### Recommendations

#### 11.1 Skip Navigation Links

```tsx
{/* Skip to main content link */}
<a 
    href="#main-content" 
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-content focus:rounded"
>
    Skip to main content
</a>
```

#### 11.2 Improved Focus States

```css
/* Enhanced focus states for keyboard navigation */
@layer utilities {
    .focus-ring {
        @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-base-100;
    }
}
```

#### 11.3 ARIA Labels for Interactive Elements

```tsx
{/* Icon-only buttons need labels */}
<button 
    className="btn btn-ghost btn-circle"
    aria-label="Open sidebar menu"
>
    <i className="fa-solid fa-bars" aria-hidden="true"></i>
</button>

{/* Status badges */}
<span 
    className="badge badge-success" 
    role="status"
    aria-label={`Job status: ${status}`}
>
    {status}
</span>
```

#### 11.4 Form Accessibility

```tsx
{/* Accessible form field with error */}
<div className="fieldset">
    <label htmlFor="email" className="label">
        Email Address <span className="text-error">*</span>
    </label>
    <input
        type="email"
        id="email"
        name="email"
        className={`input ${error ? 'input-error' : ''}`}
        aria-required="true"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'email-error' : undefined}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
    />
    {error && (
        <p id="email-error" className="text-sm text-error mt-1" role="alert">
            {error}
        </p>
    )}
</div>
```

---

## 12. Performance Optimizations

### Recommendations

#### 12.1 Lazy Load Off-Screen Components

```tsx
import dynamic from 'next/dynamic';

const EarningsChart = dynamic(
    () => import('@/components/earnings-chart'),
    { 
        loading: () => <div className="skeleton h-64 w-full"></div>,
        ssr: false 
    }
);
```

#### 12.2 Virtual Scrolling for Long Lists

```tsx
import { FixedSizeList as List } from 'react-window';

{/* Virtualized candidate list */}
<List
    height={600}
    itemCount={candidates.length}
    itemSize={100}
    width="100%"
>
    {({ index, style }) => (
        <div style={style}>
            <CandidateCard candidate={candidates[index]} />
        </div>
    )}
</List>
```

#### 12.3 Optimistic Updates

```tsx
const handleAcceptProposal = async (proposalId: string) => {
    // Optimistic update
    setProposals(prev => 
        prev.map(p => 
            p.id === proposalId 
                ? { ...p, state: 'accepted', state_label: 'Accepted' }
                : p
        )
    );
    
    try {
        await api.acceptProposal(proposalId);
        // Success - optimistic update was correct
    } catch (error) {
        // Rollback on error
        setProposals(prev => 
            prev.map(p => 
                p.id === proposalId 
                    ? { ...p, state: 'actionable', state_label: 'Pending' }
                    : p
            )
        );
        toast.error('Failed to accept proposal');
    }
};
```

#### 12.4 Image Optimization

```tsx
import Image from 'next/image';

{/* Use Next.js Image for automatic optimization */}
<Image
    src={company.logo_url || '/placeholder-company.svg'}
    alt={company.name}
    width={48}
    height={48}
    className="rounded-lg"
    placeholder="blur"
    blurDataURL="data:image/png;base64,..."
/>
```

---

## 13. Implementation Priority Matrix

### Priority 1: High Impact, Low Effort (Do First)

| Recommendation | Section | Effort | Impact |
|---------------|---------|--------|--------|
| Sidebar navigation grouping | 3.1 | Low | High |
| Breadcrumb navigation | 3.3 | Low | Medium |
| Enhanced empty states | 4.3 | Low | High |
| Role card enhancements | 5.2 | Medium | High |
| Mobile bottom navigation | 10.1 | Low | High |
| Skip navigation links | 11.1 | Low | Medium |
| ARIA labels | 11.3 | Low | High |

### Priority 2: High Impact, Medium Effort

| Recommendation | Section | Effort | Impact |
|---------------|---------|--------|--------|
| Quick Actions FAB | 3.2 | Medium | High |
| Real-time stats updates | 4.2 | Medium | Medium |
| Advanced filtering panel | 5.1 | Medium | High |
| Candidate quick preview | 6.1 | Medium | High |
| Enhanced proposal cards | 7.1 | Medium | High |
| Onboarding step indicators | 9.1 | Low | Medium |

### Priority 3: Medium Impact, Higher Effort

| Recommendation | Section | Effort | Impact |
|---------------|---------|--------|--------|
| Customizable dashboard | 4.1 | High | Medium |
| Bulk candidate actions | 6.2 | Medium | Medium |
| Inline response modal | 7.2 | Medium | Medium |
| Earnings chart | 8.1 | Medium | Medium |
| Placement timeline | 8.2 | Medium | Low |

### Priority 4: Future Enhancements

| Recommendation | Section | Effort | Impact |
|---------------|---------|--------|--------|
| Animated statistics counter | 2.3 | Medium | Low |
| Testimonial carousel | 2.2 | Medium | Low |
| Virtual scrolling | 12.2 | High | Medium |
| Optimistic updates | 12.3 | Medium | Medium |

---

## Appendix: Component Examples

### A. Consistent Page Header Pattern

```tsx
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                    <p className="text-base-content/70 mt-1">{description}</p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Usage
<PageHeader 
    title="Candidates"
    description="View and manage all your submitted candidates"
    actions={
        <Link href="/portal/candidates/new" className="btn btn-primary gap-2">
            <i className="fa-solid fa-plus"></i>
            New Candidate
        </Link>
    }
/>
```

### B. Consistent Filter Card Pattern

```tsx
interface FilterCardProps {
    children: React.ReactNode;
    viewMode: 'grid' | 'table';
    onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function FilterCard({ children, viewMode, onViewModeChange }: FilterCardProps) {
    return (
        <div className="card bg-base-100 shadow mb-6">
            <div className="card-body">
                <div className="flex flex-wrap gap-4 items-end">
                    {children}
                    <div className="join ml-auto">
                        <button
                            className={`btn join-item ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onViewModeChange('grid')}
                            title="Grid View"
                        >
                            <i className="fa-solid fa-grip"></i>
                        </button>
                        <button
                            className={`btn join-item ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onViewModeChange('table')}
                            title="Table View"
                        >
                            <i className="fa-solid fa-table"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### C. Stats Card Pattern

```tsx
interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon: string;
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
    trend?: {
        value: number;
        direction: 'up' | 'down';
    };
}

export function StatCard({ title, value, description, icon, color = 'primary', trend }: StatCardProps) {
    return (
        <div className="stats shadow bg-base-100">
            <div className="stat">
                <div className={`stat-figure text-${color}`}>
                    <i className={`fa-solid ${icon} text-3xl`}></i>
                </div>
                <div className="stat-title">{title}</div>
                <div className={`stat-value text-${color}`}>{value}</div>
                {(description || trend) && (
                    <div className="stat-desc">
                        {trend && (
                            <span className={trend.direction === 'up' ? 'text-success' : 'text-error'}>
                                <i className={`fa-solid fa-arrow-${trend.direction} mr-1`}></i>
                                {trend.value}%
                            </span>
                        )}
                        {description && <span className="ml-1">{description}</span>}
                    </div>
                )}
            </div>
        </div>
    );
}
```

---

**Document Prepared By:** GitHub Copilot  
**Review Status:** Ready for team review  
**Next Steps:** Prioritize and schedule implementation sprints
