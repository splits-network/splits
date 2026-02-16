# Memphis Status Page Copy Specification

**Project**: Memphis Status Pages Copy
**Voice**: Designer Six (Bold, Disruptive, Confident)
**Apps**: Portal (Splits Network), Candidate (Applicant Network), Corporate (Employment Networks)
**Created**: 2026-02-16

---

## Voice Calibration

### What Designer Six Sounds Like (Status Context)

**Too Corporate**:
"We are currently investigating service anomalies and will provide updates as they become available."

**Too Casual**:
"Oops! Something broke. We're fixing it, lol."

**Just Right (Designer Six)**:
"We're on it. The issue is isolated. Updates in 15 minutes."

### Core Principles for Status Copy

1. **Be direct, not vague** - "API gateway timed out" beats "Investigating connectivity issues"
2. **State outcomes, not processes** - "Services back online" beats "We have completed our investigation"
3. **Confidence without fluff** - "All systems operational" beats "We're pleased to report everything is working"
4. **Action over apology** - "We're deploying a fix" beats "We apologize for the inconvenience"
5. **Time-specific when possible** - "Resolved in 8 minutes" beats "Quickly resolved"

---

## Status States: System-Wide Messaging

### State 1: All Healthy (Teal Background)

#### **Portal (Splits Network) - Recruiter Focus**

**Hero Headline** (h1):
```
ALL SYSTEMS OPERATIONAL
```

**Hero Subtext**:
```
Recruiter dashboards, pipelines, automations, and AI review signals are green.
Post roles, submit candidates, track placements — everything's running smooth.
```

**Metrics Labels**:
- Services Healthy: `{count}/{total} Services`
- Avg Response: `{ms}ms Average`
- Uptime: `{percentage}% Uptime`
- Last Check: `{time} ago`

---

#### **Candidate (Applicant Network) - Candidate Focus**

**Hero Headline**:
```
EVERYTHING'S RUNNING SMOOTH
```

**Hero Subtext**:
```
Your profile, applications, and recruiter connections are all green.
Browse roles, track your pipeline, message recruiters — all systems operational.
```

---

#### **Corporate (Employment Networks) - Enterprise Focus**

**Hero Headline**:
```
FULL SYSTEM HEALTH
```

**Hero Subtext**:
```
Platform infrastructure, marketplace services, and network integrations are operational.
Real-time data flows, API responses, and partner connections running at full capacity.
```

---

### State 2: Service Degradation (Coral Background)

#### **Portal (Splits Network)**

**Hero Headline**:
```
INVESTIGATING SERVICE DEGRADATION
```

**Hero Subtext**:
```
We detected a hiccup in {service_name}. Core features still work — you can browse, apply, and message.
Check the incident feed below for details. We're on it.
```

---

#### **Candidate (Applicant Network)**

**Hero Headline**:
```
ONE SERVICE RUNNING SLOW
```

**Hero Subtext**:
```
We spotted an issue with {service_name}. Your profile and applications are safe.
Some features might load slower than usual. We're fixing it now.
```

---

#### **Corporate (Employment Networks)**

**Hero Headline**:
```
DEGRADED PERFORMANCE DETECTED
```

**Hero Subtext**:
```
{service_name} is experiencing elevated response times. The issue is isolated.
Core platform functions remain operational. Update timeline: 15-minute intervals.
```

---

### State 3: Major Outage (Dark Background)

#### **Portal (Splits Network)**

**Hero Headline**:
```
SERVICE DISRUPTION IN PROGRESS
```

**Hero Subtext**:
```
Multiple systems are down. We're deploying fixes now.
Your data is safe — nothing's lost. Follow the live feed below for real-time updates.
```

---

#### **Candidate (Applicant Network)**

**Hero Headline**:
```
SYSTEMS TEMPORARILY DOWN
```

**Hero Subtext**:
```
We're working through an outage. Your profile and application data are safe.
Service will restore shortly. Check below for live updates.
```

---

#### **Corporate (Employment Networks)**

**Hero Headline**:
```
PLATFORM OUTAGE ACTIVE
```

**Hero Subtext**:
```
Critical infrastructure is offline. The engineering team is deployed.
All client data remains intact. Status updates every 10 minutes below.
```

---

### State 4: Investigating / Unknown (Yellow Background)

#### **Portal (Splits Network)**

**Hero Headline**:
```
MONITORING SYSTEM ANOMALIES
```

**Hero Subtext**:
```
We're seeing unusual patterns in {service_name}. No confirmed impact yet.
Everything still works — this is precautionary. We'll update as we learn more.
```

---

#### **Candidate (Applicant Network)**

**Hero Headline**:
```
DOUBLE-CHECKING EVERYTHING
```

**Hero Subtext**:
```
We noticed something unusual and we're investigating. Your account is fine.
Services are operational. We're just making sure everything stays that way.
```

---

#### **Corporate (Employment Networks)**

**Hero Headline**:
```
ANOMALY DETECTION IN PROGRESS
```

**Hero Subtext**:
```
Automated monitoring flagged potential degradation. Systems remain operational.
The team is validating telemetry. Status confirmed within 10 minutes.
```

---

## Section Headlines

### Service Breakdown Section

**Portal**:
```
Service BREAKDOWN
Real-time health across all infrastructure layers
```

**Candidate**:
```
What's RUNNING
Every service that keeps your profile live
```

**Corporate**:
```
Infrastructure STATUS
Component-level health across the platform stack
```

---

### Live Incident Feed

**Portal**:
```
Active INCIDENTS
{count} issues being tracked right now
```
(If no incidents):
```
No active incidents.
All services running smooth. We'll update here if anything changes.
```

**Candidate**:
```
What's HAPPENING
Live updates on any service issues
```
(If no incidents):
```
Nothing to report.
Everything's green. You're good to go.
```

**Corporate**:
```
Incident TRACKING
Real-time alerts for platform disruptions
```
(If no incidents):
```
Zero active incidents.
Full operational status across all infrastructure tiers.
```

---

### Past Incidents Timeline

**Portal**:
```
Past INCIDENTS
Resolved issues from the last 30 days
```

**Candidate**:
```
Recent FIXES
What we fixed and when
```

**Corporate**:
```
Incident HISTORY
Chronological log of resolved disruptions
```

---

## Service-Specific Messages

### Service Status Labels

**Operational** (teal badge):
```
Operational
```

**Degraded** (yellow badge):
```
Degraded
```

**Unhealthy** (coral badge):
```
Down
```

### Default Error Messages (when no specific error returned)

**Portal**:
```
We're mitigating the issue. Updates every 10 minutes.
```

**Candidate**:
```
We're on it. This won't take long.
```

**Corporate**:
```
Engineering team deployed. Status updates in 10-minute intervals.
```

---

## Contact Form Copy

### Form Header

**Portal**:
```
PING Support

Hit us up if something's broken. We'll loop you into the incident thread.
```

**Candidate**:
```
NEED Help?

Let us know what's not working. We'll get back to you fast.
```

**Corporate**:
```
CONTACT Operations

Enterprise support line. Response within 2 hours for Sev 1 incidents.
```

---

### Form Field Labels

**All Apps** (consistent):
- Full Name
- Email
- Topic
- Urgency
- Message

### Form Field Placeholders

**Name**:
```
Casey Operations
```

**Email**:
```
you@company.com
```

**Message** (Portal):
```
What's happening? Include affected teams and timelines.
```

**Message** (Candidate):
```
Describe what's not working. Screenshots help.
```

**Message** (Corporate):
```
Incident description. Include error codes and affected services.
```

---

### Form Button

**Portal**:
```
SEND UPDATE
```

**Candidate**:
```
SEND MESSAGE
```

**Corporate**:
```
SUBMIT TICKET
```

---

### Form Success Message

**Portal**:
```
Thanks — we got it. Support will reply within 2 hours.
```

**Candidate**:
```
Message sent. We'll get back to you shortly.
```

**Corporate**:
```
Ticket created. Enterprise support will respond within SLA window.
```

---

### Form Error Message

**All Apps**:
```
That didn't work. Check the required fields and try again.
```

---

## Support Hours Card

**Portal**:
```
SUPPORT Hours

Weekdays: 8am - 8pm ET
Weekends: On-call for Sev 1 incidents

Mention the incident ID if you see one below — we'll tie your note to the active thread.
```

**Candidate**:
```
SUPPORT Hours

Weekdays: 8am - 8pm ET
Weekends: On-call for urgent issues

We're fast. Average response: under 2 hours.
```

**Corporate**:
```
SUPPORT Hours

Enterprise Support: 24/7 for Sev 1
Standard Support: Weekdays 8am - 8pm ET

SLA terms in your enterprise agreement.
```

---

## Quick Links Card

**Portal**:
```
QUICK Links

→ Release notes
→ Incident SLA document (PDF)
→ Subscribe to status RSS
```

**Candidate**:
```
HELPFUL Links

→ Help center
→ Feature updates
→ Subscribe to notifications
```

**Corporate**:
```
PLATFORM Resources

→ System architecture docs
→ API status dashboard
→ Subscribe to RSS/JSON feeds
```

---

## Loading States

### Initial Page Load

**All Apps**:
```
Checking system health...
```

### Auto-Refresh (Subtle)

No visible loading message — just update the timestamp:
```
Last checked: {time}
```

### Form Submission

**Button text changes**:
```
SENDING...
```

---

## Incident Timeline Copy

### Incident Start Notification

**Portal**:
```
{service_name} — Degraded performance detected
Started: {timestamp}
We're investigating root cause. Updates every 10 minutes.
```

**Candidate**:
```
{service_name} — Running slow
Started: {timestamp}
We're on it. Your data is safe.
```

**Corporate**:
```
{service_name} — Performance degradation
Detected: {timestamp}
Engineering deployed. Root cause analysis in progress.
```

---

### Incident Resolution Notification

**Portal**:
```
{service_name} — Resolved
Duration: {minutes}m
The issue is fixed. Service restored to full capacity.
```

**Candidate**:
```
{service_name} — Back online
Down for: {minutes}m
All fixed. You're good to go.
```

**Corporate**:
```
{service_name} — Incident closed
Downtime: {minutes}m
Service restored. Post-incident review available in 24 hours.
```

---

## Meta / SEO Copy

### Page Title

**Portal**:
```
System Status | Splits Network
```

**Candidate**:
```
System Status | Applicant Network
```

**Corporate**:
```
Platform Status | Employment Networks
```

---

### Meta Description

**Portal**:
```
Live system health for Splits Network. Real-time service status, incident tracking, and support contact.
```

**Candidate**:
```
Applicant Network system status. Check service health, active incidents, and get support.
```

**Corporate**:
```
Employment Networks platform status. Real-time infrastructure health, incident logs, and enterprise support.
```

---

## Auto-Refresh Indicator

**All Apps** (small text near timestamp):
```
Auto-refresh every 30 seconds
```

---

## Typography Guidelines

### Headlines (H1)
- ALL UPPERCASE
- font-black
- Max 5 words
- No punctuation

### Subheadings (H2, H3)
- UPPERCASE for primary sections
- Title Case for subsections
- Include one colored accent word

### Body Text
- Sentence case
- text-base (16px) — NEVER text-sm for main content
- Short paragraphs (2-3 sentences max)

### Timestamps
- text-xs acceptable here (this is afterthought content)
- Format: "2 minutes ago" or "Feb 16, 3:42 PM"

### Badges
- UPPERCASE
- text-xs acceptable (badges inherently use small text)

---

## Tone Matrix

|                     | Portal (Splits)           | Candidate (Applicant)     | Corporate (Employment)    |
|---------------------|---------------------------|---------------------------|---------------------------|
| **Healthy State**   | Confident, professional   | Friendly, reassuring      | Enterprise, precise       |
| **Degraded State**  | Direct, action-focused    | Calm, informative         | Technical, time-specific  |
| **Outage State**    | Honest, resolute          | Apologetic but strong     | Formal, SLA-aware         |
| **Form Copy**       | "Ping us"                 | "Need help?"              | "Contact operations"      |
| **Success Message** | "We got it"               | "Message sent"            | "Ticket created"          |

---

## Copy Checklist

Before delivering copy, verify:

- [ ] Headlines are UPPERCASE, under 5 words
- [ ] No weasel words (might, could, potentially)
- [ ] No corporate jargon (synergy, leverage, ecosystem)
- [ ] Time-specific when possible ("15 minutes" not "soon")
- [ ] Action verbs, not passive voice
- [ ] Brand voice matches app (Portal=pro, Candidate=friendly, Corporate=enterprise)
- [ ] Error messages say what happened + what to do
- [ ] Empty states acknowledge + suggest action
- [ ] Form labels are clear, concise, UPPERCASE for fieldsets
- [ ] No text-sm or text-xs on body content (only metadata/timestamps)

---

## Implementation Notes

- All copy should be stored in TypeScript const objects for easy updates
- Status message copy should be derived from system state, not hardcoded per service
- Incident messages can use template strings: `{service_name} is {status}. We're {action}.`
- Brand-specific copy variations can be determined by app domain detection

---

**Next Steps**:
1. Review this spec with user
2. Implement copy in TypeScript const objects
3. Wire up to Memphis client components
4. Test all status states (healthy, degraded, outage, investigating)
5. Verify tone consistency across all three apps
