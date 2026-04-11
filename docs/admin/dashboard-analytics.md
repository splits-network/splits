# Dashboard & Analytics

## Current State

### Dashboard
**Route:** `/secure` (main page)

- **Stats tiles:** KPI stats from `useAdminStats` hook (time-period aware)
- **Charts:** Via `useAdminChartData` hook with time period selector
- **Activity feed:** Recent platform activity
- **Actions panel:** Quick action shortcuts
- **Health checks:** Platform health status (service-level)
- **Time period selector:** 7d, 30d, 90d, 1y
- **Refresh button:** Manual refresh

### Activity Log
**Route:** `/secure/activity`
**Data source:** `/identity/admin/activity`

- **Table columns:** Timestamp, Actor, Action (badge), Entity Type, Entity ID (truncated), Details
- **Filters:** Search, Entity Type dropdown (User, Recruiter, Job, Application, Placement, Payout)
- **Pagination:** Standard numbered pagination
- **Read-only** audit trail

### Metrics
**Route:** `/secure/metrics`

- **Charts:** User Signups (line), Job Postings (line), Application Volume (bar)
- **Time period selector:** 7d, 30d, 90d, 1y
- **Uses shared-charts package** (LineChart, BarChart)
- **Read-only** visualization

### AI Usage
**Route:** `/secure/ai-usage`

- **Tabs:** Usage Dashboard, Model Config, Usage Log
- **Usage Dashboard** - Cost and usage charts
- **Model Config** - Configure AI providers per operation
- **Usage Log** - Detailed usage entries

### What's Missing

#### Critical (Phase Priority: High)
- **Dashboard KPIs should be actionable** - Click any stat to drill into the underlying data (e.g., click "Pending Payouts" -> goes to payouts page filtered to pending)
- **Revenue dashboard** - Total revenue, MRR/ARR, revenue by recruiter/firm/company, revenue trend
- **Alerts & anomalies** - Highlight unusual patterns (spike in signups, drop in applications, payment failures)
- **Activity log: actor links** - Click actor name to go to user profile
- **Activity log: entity links** - Click entity ID to go to the actual entity

#### Important (Phase Priority: Medium)
- **Customizable dashboard** - Drag-and-drop dashboard widgets, personalized layouts
- **Cohort analysis** - User retention, recruiter activation rates, placement success rates over time
- **Funnel analytics** - Full funnel: signup -> profile complete -> first job -> first placement -> first payout
- **Geographic analytics** - Map view of jobs, candidates, recruiters by location
- **Comparison periods** - Compare this month vs last month, this quarter vs last quarter
- **Export reports** - Export dashboard data as PDF or CSV
- **Scheduled reports** - Auto-email weekly/monthly reports to admins
- **Real-time stats** - WebSocket-updated live counters for critical metrics
- **AI usage budget management** - Set spending limits, alerts when approaching limits
- **AI model performance tracking** - Accuracy, latency, cost per operation

#### Nice to Have
- **Custom report builder** - Build custom reports from available data
- **Dashboard sharing** - Share specific dashboard views via URL
- **Trend annotations** - Mark events on charts (e.g., "Launched feature X here")
- **Predictive analytics** - Forecast future trends based on historical data

## Implementation Notes
- Actionable KPIs: each stat card should link to filtered list view
- Revenue dashboard is business-critical for a marketplace
- Activity log links need the entity type to determine the correct route
- Anomaly detection could start simple (% change from average) before getting to ML
- AI usage budget should integrate with provider dashboards (OpenAI, Anthropic)
