# Portal Header with Page Title Implementation

Move theme toggle, notification bell, and user menu from sidebar to a persistent header. Add dynamic page title support.

## Goals

1. **Familiar UX**: Header with title + controls follows Linear/Notion patterns
2. **Dynamic titles**: Pages set their own titles via context
3. **Mobile-friendly**: Hamburger menu in header on small screens
4. **Sticky header**: Stays visible during scroll
5. **Clean sidebar**: Remove user controls from sidebar (just navigation)

---

## Implementation Steps

### 1. Create Page Title Context

**File**: `apps/portal/src/contexts/page-title-context.tsx`

```tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface PageTitleContextType {
    title: string;
    setTitle: (title: string) => void;
}

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

export function PageTitleProvider({ children }: { children: ReactNode }) {
    const [title, setTitleState] = useState('');

    const setTitle = useCallback((newTitle: string) => {
        setTitleState(newTitle);
    }, []);

    return (
        <PageTitleContext.Provider value={{ title, setTitle }}>
            {children}
        </PageTitleContext.Provider>
    );
}

export function usePageTitle() {
    const context = useContext(PageTitleContext);
    if (!context) {
        throw new Error('usePageTitle must be used within a PageTitleProvider');
    }
    return context;
}
```

---

### 2. Create Page Title Setter Component

**File**: `apps/portal/src/components/page-title.tsx`

```tsx
'use client';

import { useEffect } from 'react';
import { usePageTitle } from '@/contexts/page-title-context';

interface PageTitleProps {
    title: string;
}

export function PageTitle({ title }: PageTitleProps) {
    const { setTitle } = usePageTitle();

    useEffect(() => {
        setTitle(title);
        return () => setTitle('');
    }, [title, setTitle]);

    return null;
}
```

---

### 3. Create Portal Header Component

**File**: `apps/portal/src/components/portal-header.tsx`

```tsx
'use client';

import { usePageTitle } from '@/contexts/page-title-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from '@/components/notification-bell';
import { UserButton } from '@clerk/nextjs';

export function PortalHeader() {
    const { title } = usePageTitle();

    return (
        <header className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-30 min-h-16">
            {/* Mobile menu toggle */}
            <div className="flex-none lg:hidden">
                <label htmlFor="sidebar-drawer" className="btn btn-square btn-ghost">
                    <i className="fa-duotone fa-regular fa-bars text-lg"></i>
                </label>
            </div>

            {/* Page title */}
            <div className="flex-1 px-2">
                <h1 className="text-xl font-semibold truncate">{title}</h1>
            </div>

            {/* User controls */}
            <div className="flex-none flex items-center gap-1">
                <ThemeToggle />
                <NotificationBell />
                <div className="ml-2">
                    <UserButton 
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: 'w-9 h-9'
                            }
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
```

---

### 4. Update Layout Client

**File**: `apps/portal/src/app/portal/layout-client.tsx`

Add `PageTitleProvider` wrapper around children.

```tsx
import { PageTitleProvider } from '@/contexts/page-title-context';

// Wrap existing content with PageTitleProvider
```

---

### 5. Update Main Layout

**File**: `apps/portal/src/app/portal/layout.tsx`

```tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { AuthenticatedLayoutClient } from './layout-client';
import { ServiceStatusBanner } from '@/components/service-status-banner';
import { PortalHeader } from '@/components/portal-header';

export default async function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    return (
        <AuthenticatedLayoutClient>
            <div className="drawer lg:drawer-open">
                <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <Sidebar />
                <div className="drawer-content flex flex-col min-h-screen">
                    <PortalHeader />
                    <ServiceStatusBanner />
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </div>
        </AuthenticatedLayoutClient>
    );
}
```

---

### 6. Update Sidebar

**File**: `apps/portal/src/components/sidebar.tsx`

Remove the following from sidebar:
- Theme toggle
- Notification bell
- User menu / UserButton

Keep only navigation items and logo.

---

### 7. Add PageTitle to All Portal Pages

Each page needs to include the `<PageTitle>` component:

```tsx
import { PageTitle } from '@/components/page-title';

export default function SomePage() {
    return (
        <>
            <PageTitle title="Page Name" />
            {/* existing content */}
        </>
    );
}
```

**Pages to update**:
- [ ] `portal/dashboard/page.tsx` - "Dashboard"
- [ ] `portal/roles/page.tsx` - "Roles"
- [ ] `portal/roles/[id]/page.tsx` - Dynamic: job title or "Role Details"
- [ ] `portal/candidates/page.tsx` - "Candidates"
- [ ] `portal/candidates/[id]/page.tsx` - Dynamic: candidate name
- [ ] `portal/applications/page.tsx` - "Applications"
- [ ] `portal/placements/page.tsx` - "Placements"
- [ ] `portal/companies/page.tsx` - "Companies"
- [ ] `portal/settings/page.tsx` - "Settings"
- [ ] `portal/admin/*` pages - Various admin titles
- [ ] Any other portal pages

---

## Checklist

- [ ] Create `contexts/page-title-context.tsx`
- [ ] Create `components/page-title.tsx`
- [ ] Create `components/portal-header.tsx`
- [ ] Update `layout-client.tsx` with PageTitleProvider
- [ ] Update `layout.tsx` to include PortalHeader
- [ ] Remove user controls from Sidebar
- [ ] Add PageTitle to all portal pages
- [ ] Test mobile hamburger menu
- [ ] Test theme toggle in new location
- [ ] Test notification bell in new location
- [ ] Verify sticky header behavior
