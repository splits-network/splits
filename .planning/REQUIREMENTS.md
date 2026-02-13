# Requirements: v3.0 Platform Admin Restructure

## Milestone Requirements

### Schema & Data Migration

- [ ] **SCHEMA-01**: Migration makes role_entity_id and role_entity_type nullable in user_roles table with zero downtime and reversibility
- [ ] **SCHEMA-02**: Partial unique index prevents duplicate platform_admin rows per user (handles NULL correctly)
- [ ] **SCHEMA-03**: Revoking platform_admin role immediately blocks access via deleted_at filtering in queries

### Access Control Integration

- [ ] **ACCESS-01**: resolveAccessContext() finds platform_admin in user_roles table and returns isPlatformAdmin: true (119+ downstream consumers unchanged)
- [ ] **ACCESS-02**: identity-service creates and deletes platform_admin via POST/DELETE /v2/user-roles with nullable entity fields
- [ ] **ACCESS-03**: All 13 frontend files checking isPlatformAdmin continue working without modification

### Audit & Cleanup

- [ ] **AUDIT-01**: Platform admin grant/revoke publishes user_role.created/deleted events via RabbitMQ
- [ ] **AUDIT-02**: Synthetic platform organization (type='platform') and related memberships are deleted after migration

## Future Requirements

- **DIFF-2**: Role-entity type validation — DB check constraint preventing platform_admin with entity_id (v3.1)
- **DIFF-3**: Migration rollback plan — documented/tested rollback SQL (v3.1)
- **DIFF-4**: Service-level abstraction — shared assignSystemRole() helper (v4+)
- **DIFF-5**: Admin activity dashboard — frontend audit trail view (v4+)

## Out of Scope

- Restructuring company_admin/hiring_manager roles — legitimately org-scoped, stay in memberships
- Fine-grained permissions system — future milestone
- Role UI/admin panel redesign — just the data model change
- Runtime role hierarchy engine — over-engineering for current needs

## Traceability

| REQ | Phase | Status |
|-----|-------|--------|
| SCHEMA-01 | Phase 4 | Complete |
| SCHEMA-02 | Phase 4 | Complete |
| SCHEMA-03 | Phase 4 | Complete |
| ACCESS-01 | Phase 5 | Pending |
| ACCESS-02 | Phase 5 | Pending |
| ACCESS-03 | Phase 5 | Pending |
| AUDIT-01 | Phase 5 | Pending |
| AUDIT-02 | Phase 6 | Pending |

---
*Created: 2026-02-13*
