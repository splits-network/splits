# Memphis Migration Workflow

## Overview

This document outlines the complete workflow for migrating Splits Network apps to Memphis design system.

## Pre-Migration Checklist

Before starting migration:

- [ ] Memphis UI package built and published (`packages/memphis-ui/`)
- [ ] All 26 showcase pages reviewed and understood
- [ ] Design principles documented and agreed upon
- [ ] Target app selected (portal, candidate, or corporate)
- [ ] Build progress tracker initialized (`.build-progress.json`)
- [ ] Team notified of migration timeline

## Migration Phases

### Phase 1: Planning (1-2 hours)

**Goal**: Analyze app structure and create migration plan

**Steps**:
1. Run app inventory
   ```bash
   # List all pages
   find apps/<app>/src/app -name "page.tsx"

   # List all components
   find apps/<app>/src/components -name "*.tsx"
   ```

2. Categorize pages by complexity:
   - **Simple** (0-5 components, minimal interactions)
   - **Medium** (5-15 components, forms, modals)
   - **Complex** (15+ components, dashboards, data viz)

3. Identify dependencies:
   - Shared components used across pages
   - Custom hooks
   - Context providers
   - Third-party UI libraries

4. Create migration order:
   - Start with simple pages
   - Migrate shared components early
   - Complex pages last
   - Critical user flows prioritized

5. Generate task list:
   ```json
   {
     "tasks": [
       {
         "id": "migrate-login",
         "type": "page",
         "target": "apps/portal/src/app/login/page.tsx",
         "complexity": "simple",
         "priority": "high",
         "estimatedTime": "30min"
       },
       // ... more tasks
     ]
   }
   ```

6. Update build progress:
   ```json
   {
     "currentPhase": "planning",
     "totalTasks": 45,
     "estimatedDuration": "2-3 days"
   }
   ```

**Deliverables**:
- Task list with priorities
- Dependency graph
- Migration schedule
- Risk assessment

### Phase 2: Component Migration (60-70% of time)

**Goal**: Migrate all pages and components to Memphis design

**Workflow per Component**:

```
1. SELECT TASK
   ├─ Load from build progress
   ├─ Mark as in_progress
   └─ Assign to designer agent

2. ANALYZE TARGET
   ├─ Read component file
   ├─ Identify current styling
   ├─ Count violations (shadows, rounded, gradients)
   ├─ Identify similar showcase page
   └─ Note functionality requirements

3. APPLY TRANSFORMATIONS
   ├─ Remove shadows
   │  └─ shadow-* → border-4 border-dark
   ├─ Remove rounded corners
   │  └─ rounded-* → (none, default 0)
   ├─ Remove gradients
   │  └─ bg-gradient-* → bg-<memphis-color>
   ├─ Replace colors
   │  ├─ bg-blue-* → bg-coral or bg-teal
   │  ├─ bg-green-* → bg-teal
   │  ├─ bg-red-* → bg-coral
   │  ├─ bg-gray-* → bg-cream or text-dark opacity-*
   │  └─ etc.
   ├─ Add thick borders
   │  └─ Interactive elements → border-4 border-dark
   └─ Add geometric decorations
      ├─ 1-3 shapes per page
      └─ Use absolute positioning

4. VALIDATE
   ├─ Check for remaining violations
   ├─ Verify functionality preserved
   ├─ Test interactions
   ├─ Validate accessibility
   └─ Confirm Memphis compliance

5. SAVE & CHECKPOINT
   ├─ Write migrated file
   ├─ Update build progress
   ├─ Mark task as completed
   └─ Log any issues

6. MOVE TO NEXT TASK
   └─ Repeat from step 1
```

**Parallel Work**:
Spawn multiple designer agents for parallel migration:

```typescript
// Orchestrator spawns 3-5 designers
const designers = [
  { name: 'designer-1', tasks: [task1, task2, task3] },
  { name: 'designer-2', tasks: [task4, task5, task6] },
  { name: 'designer-3', tasks: [task7, task8, task9] },
];

// Each designer works independently
// Orchestrator monitors progress
// Save checkpoints after each task
```

**Error Handling**:
```typescript
try {
  await migrateComponent(task);
  markCompleted(task);
} catch (error) {
  logError(task, error);
  markFailed(task);
  notifyOrchestrator(task, error);
}
```

### Phase 3: Validation (10-15% of time)

**Goal**: Ensure 100% Memphis compliance across app

**Steps**:
1. Run comprehensive audit:
   ```bash
   /memphis:audit <app>
   ```

2. Review audit report:
   - Critical violations: MUST FIX (auto-fail)
   - Warning violations: SHOULD FIX
   - Info violations: NICE TO FIX

3. Fix violations:
   ```bash
   # For each failing file
   /memphis:migrate <file>

   # Or auto-fix all
   /memphis:audit <app> --fix
   ```

4. Re-audit until 100%:
   ```bash
   # Repeat until compliance = 100%
   while compliance < 100; do
     /memphis:audit <app>
     /memphis:migrate <failed-files>
   done
   ```

5. Manual review:
   - Check visual appearance
   - Test user flows
   - Verify accessibility
   - Confirm responsive design

6. Stakeholder review:
   - Demo migrated app
   - Collect feedback
   - Make adjustments
   - Re-validate

**Deliverables**:
- 100% compliance audit report
- Visual comparison (before/after)
- Functionality test results
- Accessibility report (WCAG AA)

### Phase 4: Cleanup (10-15% of time)

**Goal**: Remove old dependencies, optimize, and finalize

**Steps**:
1. Remove old theme imports:
   ```bash
   # Find old theme references
   grep -r "import.*theme" apps/<app>/src/

   # Remove unused imports
   ```

2. Update package dependencies:
   ```bash
   # Add Memphis UI
   pnpm --filter @splits-network/<app> add @splits-network/memphis-ui

   # Remove old UI libraries (if any)
   pnpm --filter @splits-network/<app> remove <old-library>
   ```

3. Run tests:
   ```bash
   pnpm --filter @splits-network/<app> test
   ```

4. Run build:
   ```bash
   pnpm --filter @splits-network/<app> build
   ```

5. Fix build errors:
   - Missing imports
   - Type errors
   - Runtime errors

6. Performance check:
   - Check bundle size
   - Test page load times
   - Verify no regressions

7. Final review:
   - Code review
   - Design review
   - UX review
   - Accessibility review

**Deliverables**:
- Passing tests
- Successful build
- Performance report
- Final migration summary

## Post-Migration

### Documentation
1. Update component docs
2. Add Memphis usage examples
3. Document migration learnings
4. Update design system guide

### Deployment
1. Deploy to staging
2. QA testing
3. Fix bugs
4. Deploy to production
5. Monitor for issues

### Retrospective
1. What went well?
2. What could be improved?
3. Lessons learned
4. Process improvements

## Migration Metrics

Track these metrics throughout migration:

```json
{
  "totalPages": 45,
  "totalComponents": 127,
  "completed": 38,
  "inProgress": 3,
  "failed": 2,
  "blocked": 2,
  "complianceScore": 84,
  "criticalViolations": 7,
  "warningViolations": 23,
  "timeElapsed": "14 hours",
  "estimatedRemaining": "4 hours"
}
```

## Common Issues & Solutions

### Issue: Shadows won't go away
**Solution**: Check for inline styles, CSS modules, global CSS
```bash
# Find inline shadows
grep -r 'style={{.*boxShadow' apps/<app>/
```

### Issue: Rounded corners persist
**Solution**: Check for CSS classes in global styles
```bash
# Find global rounded utilities
grep -r '\.rounded' apps/<app>/src/
```

### Issue: Colors not updating
**Solution**: Ensure Memphis UI theme is imported
```tsx
// In layout.tsx or _app.tsx
import '@splits-network/memphis-ui/theme.css';
```

### Issue: Build fails after migration
**Solution**: Check TypeScript errors, missing imports
```bash
pnpm --filter @splits-network/<app> tsc --noEmit
```

## Rollback Plan

If migration needs to be rolled back:

1. Checkout previous commit:
   ```bash
   git checkout <pre-migration-commit>
   ```

2. Or revert specific files:
   ```bash
   git checkout <pre-migration-commit> -- apps/<app>/src/
   ```

3. Rebuild:
   ```bash
   pnpm --filter @splits-network/<app> build
   ```

## Success Criteria

Migration is complete when:

- [ ] 100% Memphis compliance (no critical violations)
- [ ] All tests passing
- [ ] Build succeeds
- [ ] No accessibility regressions
- [ ] Stakeholder approval
- [ ] Performance maintained or improved
- [ ] Documentation updated
- [ ] Deployed to production

## Timeline Estimate

| App | Pages | Components | Estimated Time |
|-----|-------|------------|----------------|
| Portal | 45 | 127 | 2-3 days |
| Candidate | 28 | 82 | 1-2 days |
| Corporate | 15 | 43 | 1 day |

**Total**: 4-6 days for full migration across all apps
