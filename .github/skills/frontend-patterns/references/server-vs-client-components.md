# Server vs Client Components

## When to Use Server Components (Default)

Server Components are the **default** in Next.js 16 App Router. Use them whenever possible.

### ✅ Use Server Components When:

1. **Data Fetching**
   ```typescript
   // No 'use client' directive = Server Component
   export default async function JobsPage() {
     const jobs = await fetch(`${process.env.API_URL}/jobs`);
     return <JobsList jobs={jobs} />;
   }
   ```

2. **Static Content**
   ```typescript
   export default function AboutPage() {
     return (
       <div>
         <h1>About Splits Network</h1>
         <p>Static content renders on server</p>
       </div>
     );
   }
   ```

3. **SEO-Critical Pages**
   - Marketing pages
   - Job listings
   - Public profiles

4. **Security-Sensitive Operations**
   - API keys only on server
   - Database connections
   - Authentication checks

### Benefits of Server Components:
- ✅ Smaller bundle size (code stays on server)
- ✅ Faster initial page load
- ✅ Better SEO (fully rendered HTML)
- ✅ Direct database/API access
- ✅ No client-side JavaScript needed

---

## When to Use Client Components

Add `'use client'` directive **only when you need**:

### ✅ Use Client Components When:

1. **Interactive State**
   ```typescript
   'use client';
   
   export function JobApplicationForm() {
     const [formData, setFormData] = useState({});
     const [submitting, setSubmitting] = useState(false);
     
     return <form>...</form>;
   }
   ```

2. **Event Handlers**
   ```typescript
   'use client';
   
   export function DeleteButton({ jobId }) {
     async function handleDelete() {
       await client.delete(`/jobs/${jobId}`);
     }
     
     return <button onClick={handleDelete}>Delete</button>;
   }
   ```

3. **Browser APIs**
   ```typescript
   'use client';
   
   export function ThemeToggle() {
     const [theme, setTheme] = useState(() => 
       localStorage.getItem('theme') || 'light'
     );
     
     return <button onClick={() => setTheme('dark')}>Toggle</button>;
   }
   ```

4. **React Hooks**
   - `useState`, `useEffect`, `useContext`
   - `useReducer`, `useRef`, `useCallback`
   - `useMemo`, `useLayoutEffect`
   - Custom hooks

5. **Third-Party Libraries Requiring Browser**
   - Chart libraries
   - Map libraries
   - Animation libraries

---

## Composition Pattern

**Best Practice**: Server Component wraps Client Components

```typescript
// app/jobs/page.tsx - Server Component
export default async function JobsPage() {
  const jobs = await fetchJobs(); // Server-side fetch
  
  return (
    <div>
      <h1>Jobs</h1>
      {/* Pass data to Client Component */}
      <JobsTable jobs={jobs} />
    </div>
  );
}

// components/JobsTable.tsx - Client Component
'use client';

export function JobsTable({ jobs }) {
  const [sortBy, setSortBy] = useState('title');
  
  const sorted = useMemo(() => {
    return [...jobs].sort((a, b) => a[sortBy].localeCompare(b[sortBy]));
  }, [jobs, sortBy]);
  
  return (
    <div>
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="title">Title</option>
        <option value="location">Location</option>
      </select>
      <table>{/* Render sorted jobs */}</table>
    </div>
  );
}
```

---

## Common Mistakes

### ❌ Making Everything Client Components

```typescript
// WRONG - Unnecessary 'use client'
'use client';

export default function JobsPage() {
  // No state, no interactivity, no browser APIs
  return <div>Static content</div>;
}
```

**Fix**: Remove `'use client'` - let it be a Server Component.

### ❌ Fetching Data in Client Components

```typescript
// WRONG - Data fetching in Client Component
'use client';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  
  useEffect(() => {
    fetch('/api/v2/jobs').then(r => r.json()).then(setJobs);
  }, []);
  
  return <div>{jobs.map(...)}</div>;
}
```

**Fix**: Fetch in Server Component, pass to Client Component.

### ❌ Mixing Server-Only Code in Client Components

```typescript
// WRONG - Direct database access in Client Component
'use client';

import { supabase } from '@/lib/supabase';

export default function JobsPage() {
  // This will fail - supabase not available in browser
  const jobs = await supabase.from('jobs').select('*');
}
```

**Fix**: Move data fetching to Server Component.

---

## Decision Tree

```
Need interactivity (state, events, hooks)?
├─ YES → Client Component ('use client')
└─ NO → Server Component (default)

Need browser APIs (localStorage, window)?
├─ YES → Client Component
└─ NO → Server Component

Just displaying data?
├─ YES → Server Component
└─ NO → Client Component

SEO important?
├─ YES → Server Component (when possible)
└─ NO → Either works

Performance critical?
├─ YES → Server Component (smaller bundle)
└─ NO → Either works
```

---

## Performance Impact

| Aspect | Server Component | Client Component |
|--------|------------------|------------------|
| Bundle Size | ✅ Zero (stays on server) | ❌ Added to bundle |
| Initial Load | ✅ Fast (fully rendered) | ⚠️ Slower (hydration needed) |
| SEO | ✅ Perfect (HTML complete) | ⚠️ Depends on hydration |
| Interactivity | ❌ None | ✅ Full interactivity |
| Data Fetching | ✅ Direct (server-side) | ❌ Requires API call |

---

## Best Practices

1. **Default to Server Components** - Only add `'use client'` when needed
2. **Keep Client Components Small** - Minimize client-side JavaScript
3. **Pass Data Down** - Fetch in Server, pass to Client
4. **Use Composition** - Wrap Client Components with Server Components
5. **Lazy Load Heavy Components** - Use `dynamic()` for large Client Components

```typescript
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div className="loading loading-spinner"></div>,
  ssr: false // Don't render on server
});
```
