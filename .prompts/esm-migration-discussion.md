# ESM Migration Discussion

## Context

The Splits Network monorepo is entirely CJS (CommonJS) — all services, all shared packages. This worked fine until now, but we're hitting the wall: modern npm packages are going ESM-only (`file-type` v17+, `got` v12+, `chalk` v5+, `execa` v6+, `node-fetch` v3+, etc.), and we can't use them without hacks.

The immediate trigger: `officeparser` (used in document-processing-service for smart resume extraction) depends on `file-type@^21` which is ESM-only. We currently have a fragile `pnpm.overrides` pinning `file-type` to v16 (last CJS version) — this will break when officeparser updates to require v21 features.

## Current State

- **Base tsconfig:** `"module": "commonjs"`, `"moduleResolution": "node"`
- **All shared packages** (shared-config, shared-logging, shared-types, shared-access-context, shared-job-queue, shared-fastify, shared-api-client, shared-hooks, shared-ui, etc.): CJS, no `"type"` field
- **All backend services** (ats-service, ai-service, matching-service, document-service, document-processing-service, notification-service, etc.): CJS
- **Frontend apps** (portal, candidate, corporate): Next.js handles module resolution — these are fine either way
- **Docker:** Services run via `node dist/index.js` (CJS) or `tsx watch src/index.ts` (dev, supports both)
- **No service is ESM today**

## Questions to Answer

1. **Scope:** Should we migrate the entire monorepo to ESM at once, or do it service-by-service as needed?
2. **Shared packages:** These are consumed by every service. If we make them ESM, all services need to handle ESM imports. If we make them dual (CJS + ESM), it's more build complexity but backward compatible. If we leave them CJS, ESM services can still import them (Node supports `import` of CJS modules).
3. **Migration order:** If service-by-service, which ones first? document-processing-service is the immediate need. Others will follow as they adopt ESM-only dependencies.
4. **tsconfig strategy:** Override per-service (`"module": "NodeNext"`) or change the base tsconfig for everyone?
5. **Import extensions:** ESM TypeScript requires `.js` extensions on relative imports (`import { foo } from './bar.js'`). This is the biggest mechanical change — every import in every file. Tools like `tsc-esm` or eslint rules can help.
6. **Testing:** Vitest supports both CJS and ESM. Any concerns?
7. **Docker:** `node dist/index.js` works for ESM if `"type": "module"` is in package.json. No Dockerfile changes needed.
8. **Risk:** What breaks during migration? Mainly: default export behavior differences between CJS and ESM, packages that assume `require()`, dynamic imports.

## What Needs to Change (Per Service)

1. Add `"type": "module"` to `package.json`
2. Override tsconfig: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`
3. Add `.js` extensions to all relative imports
4. Test all shared package imports (CJS → ESM interop)
5. Test all third-party imports
6. Verify Docker build + runtime

## What Needs to Change (Shared Packages, if going dual)

1. Build both CJS and ESM outputs
2. Add `"exports"` field with conditional exports (`"import"` → ESM, `"require"` → CJS)
3. Update tsconfig to output both formats (or use a bundler)

## Temporary Workaround in Place

Root `package.json` has:
```json
"pnpm": {
    "overrides": {
        "file-type": "16.5.4"
    }
}
```
This pins `file-type` to the last CJS version so `officeparser` works in our CJS services. This is fragile and should be removed once we migrate to ESM.
