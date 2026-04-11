# Automation Rules Management

## Current State

**Route:** `/secure/automation`
**Data source:** `/automation/admin/rules`

### What Exists
- **Table columns:** Rule Name/Description, Trigger (badge), Action (badge), Run Count, Last Run date, Active toggle
- **Sorting:** By name, run count
- **Actions:** Toggle active/inactive (PATCH to update `is_active`)
- **Empty state:** "No automation rules" placeholder
- **No detail view** - No click-through to rule details
- **No create/edit** - Cannot create or modify rules from UI

### What's Missing

#### Critical (Phase Priority: High)
- **Rule creation** - Form to create new automation rules with trigger, conditions, and action configuration
- **Rule editing** - Edit existing rules (name, description, trigger, conditions, actions)
- **Rule detail page** - View full rule configuration, execution history, error log
- **Execution history** - See every time a rule fired: timestamp, trigger data, action result, success/failure
- **Rule testing** - Dry-run a rule to see what it would do without executing

#### Important (Phase Priority: Medium)
- **Trigger configuration** - Configure trigger events (e.g., "when application reaches stage X", "when recruiter signs up")
- **Condition builder** - Visual condition builder (if X AND Y, then do Z)
- **Action configuration** - Configure actions (send email, change status, create notification, assign recruiter)
- **Rule ordering/priority** - Set execution order when multiple rules match
- **Error monitoring** - Alert when rules fail, show error details
- **Rule templates** - Pre-built rule templates for common automations
- **Execution log** - Filterable log of all rule executions with results
- **Rule versioning** - Track changes to rules over time
- **Bulk enable/disable** - Toggle multiple rules at once

#### Nice to Have
- **Rule analytics** - Which rules fire most, which save most time
- **Rule dependencies** - Show which rules depend on others
- **Webhooks** - Configure webhook actions for external integrations
- **Scheduled rules** - Rules that fire on a schedule (cron-like)

## Implementation Notes
- Rule creation needs a structured form with: trigger event selector, condition builder, action configurator
- Triggers should map to RabbitMQ events that already exist in the system
- Actions should be pluggable (email, status change, notification, webhook)
- Execution history is critical for debugging automation issues
- Test/dry-run should show exactly what would happen without side effects
