# Phase 2 Testing Guide

This document outlines manual testing flows for Phase 2 features in Splits Network.

## Prerequisites

Before testing Phase 2 features:

1. Ensure all services are running:
   ```bash
   pnpm run dev  # From root, or use Dev: Full Stack task
   ```

2. Have test data ready:
   - At least 2-3 recruiter accounts
   - At least 1-2 company accounts
   - Several test candidates
   - Several active jobs

3. Access to admin panel (platform_admin role required)

---

## 1. Candidate Ownership & Sourcing

### Test Flow: Establish Ownership

**Objective**: Verify that the first recruiter to source a candidate establishes ownership.

**Steps**:
1. Log in as Recruiter A
2. Navigate to Candidates
3. Create or select a new candidate
4. Click "Source Candidate" button
5. Verify:
   - ✅ Success message appears
   - ✅ Ownership badge shows on candidate detail page
   - ✅ Protection window expiry date is displayed (365 days from now)
   - ✅ Sourcer type is "Recruiter"

**Expected Result**: Recruiter A now owns this candidate for 365 days.

---

### Test Flow: Ownership Conflict Detection

**Objective**: Verify that other recruiters cannot claim already-sourced candidates.

**Steps**:
1. While logged in as Recruiter A, note the candidate ID from previous test
2. Log out and log in as Recruiter B
3. Navigate to the same candidate's detail page
4. Attempt to click "Source Candidate"
5. Verify:
   - ✅ Error message: "Candidate already sourced by another recruiter"
   - ✅ Original sourcer's information is displayed
   - ✅ Protection expiry date is shown
   - ✅ No ownership change occurs

**Expected Result**: Recruiter B is blocked from claiming ownership.

---

### Test Flow: Ownership Expiry

**Objective**: Verify that ownership can be transferred after protection window expires.

**Note**: This requires database manipulation for testing as the default window is 365 days.

**Steps**:
1. As admin, access database
2. Update `protection_expires_at` for a candidate_sourcer record to yesterday's date
3. Log in as Recruiter B
4. Navigate to that candidate
5. Click "Source Candidate"
6. Verify:
   - ✅ Success message appears
   - ✅ Recruiter B is now listed as the sourcer
   - ✅ New protection window starts (365 days from now)
   - ✅ Old sourcer is no longer shown

**Expected Result**: Ownership successfully transfers after expiry.

---

## 2. Candidate-Role Assignment Proposals

### Test Flow: Create Proposal

**Objective**: Verify recruiters can propose to work on candidate-job pairings.

**Steps**:
1. Log in as Recruiter A
2. Navigate to Proposals page
3. Click "Create New Proposal"
4. Select:
   - Job (any active job)
   - Candidate (any available candidate)
   - Add proposal notes (optional)
5. Submit proposal
6. Verify:
   - ✅ Proposal created successfully
   - ✅ State is "Proposed"
   - ✅ Response due date is 3 days from now
   - ✅ Proposal appears in proposals list

**Expected Result**: Proposal is created and awaiting company response.

---

### Test Flow: Accept Proposal

**Objective**: Verify company can accept recruiter proposals.

**Steps**:
1. Log in as Company Admin (hiring manager)
2. Navigate to Proposals (incoming)
3. Find the proposal from previous test
4. Click "Accept"
5. Add response notes (optional)
6. Confirm acceptance
7. Verify:
   - ✅ Proposal state changes to "Accepted"
   - ✅ Accepted timestamp is recorded
   - ✅ Recruiter receives notification email
   - ✅ Proposal no longer appears in "Pending" filter

**Expected Result**: Proposal is accepted and recruiter can proceed.

---

### Test Flow: Decline Proposal

**Objective**: Verify company can decline proposals with reason.

**Steps**:
1. Create a new proposal (as Recruiter A)
2. Log in as Company Admin
3. Find the new proposal
4. Click "Decline"
5. Enter decline reason: "Not a good fit for this role"
6. Confirm decline
7. Verify:
   - ✅ Proposal state changes to "Declined"
   - ✅ Decline reason is stored
   - ✅ Recruiter receives notification with reason
   - ✅ Recruiter's reputation metrics update (proposals_declined += 1)

**Expected Result**: Proposal is declined and reason is communicated.

---

### Test Flow: Proposal Timeout

**Objective**: Verify proposals automatically timeout after response window.

**Note**: Requires database manipulation or background worker.

**Steps**:
1. Create a new proposal
2. As admin, update `response_due_at` to yesterday's date in database
3. Run timeout checker (or wait for cron job)
4. Reload proposals page
5. Verify:
   - ✅ Proposal state changes to "Timed Out"
   - ✅ Timed out timestamp is recorded
   - ✅ Recruiter receives timeout notification
   - ✅ Reputation metrics update (proposals_timed_out += 1)

**Expected Result**: Proposals expire after deadline.

---

## 3. Multi-Recruiter Placement & Splits

### Test Flow: Create Placement with Single Recruiter

**Objective**: Verify standard placement creation (Phase 1 compatibility).

**Steps**:
1. Log in as Company Admin
2. Navigate to Applications
3. Find an application in "Offer" stage
4. Click "Mark as Hired"
5. Fill in placement details:
   - Salary: $150,000
   - Fee percentage: 20% (from job settings)
   - Start date: Next Monday
6. Submit
7. Verify:
   - ✅ Placement created with state "Hired"
   - ✅ Single collaborator: submitting recruiter as "submitter" at 100%
   - ✅ Fee calculations correct ($30,000 total, $30,000 to recruiter)
   - ✅ Guarantee period set to 90 days

**Expected Result**: Standard single-recruiter placement works.

---

### Test Flow: Add Collaborators to Placement

**Objective**: Verify multiple recruiters can be added with splits.

**Steps**:
1. Navigate to the placement from previous test
2. Click "Add Collaborator"
3. Add Recruiter B:
   - Role: "Sourcer"
   - Split: 30%
4. Verify split recalculation:
   - ✅ Sourcer (Recruiter B): 30% = $9,000
   - ✅ Submitter (Recruiter A): 70% = $21,000
   - ✅ Total still 100% = $30,000
5. Add Recruiter C:
   - Role: "Closer"
   - Split from remaining: 20% of 70% = 14% total
6. Verify final splits:
   - ✅ Sourcer (B): 30% = $9,000
   - ✅ Submitter (A): 56% = $16,800
   - ✅ Closer (C): 14% = $4,200
   - ✅ Total: 100% = $30,000
   - ✅ All collaborators receive notification

**Expected Result**: Multi-recruiter splits calculated correctly.

---

### Test Flow: Invalid Split Percentages

**Objective**: Verify split validation prevents errors.

**Steps**:
1. Attempt to add collaborator with split > 100%
2. Verify:
   - ✅ Error: "Split percentages cannot exceed 100%"
3. Attempt to add collaborator with negative split
4. Verify:
   - ✅ Error: "Split percentage must be positive"
5. Attempt splits that total to 101%
6. Verify:
   - ✅ Error: "Total splits must equal 100%"

**Expected Result**: Invalid splits are rejected.

---

## 4. Placement Lifecycle & Guarantees

### Test Flow: Activate Placement

**Objective**: Verify placement transitions from Hired → Active.

**Steps**:
1. Navigate to a placement in "Hired" state
2. Click "Activate Placement"
3. Set start date: Today
4. Confirm activation
5. Verify:
   - ✅ State changes to "Active"
   - ✅ Start date recorded
   - ✅ Guarantee expiry calculated (start_date + 90 days)
   - ✅ All collaborators notified via email
   - ✅ Placement lifecycle component shows progress

**Expected Result**: Placement successfully activated with guarantee tracking.

---

### Test Flow: Complete Placement

**Objective**: Verify placement completes successfully after guarantee period.

**Steps**:
1. Navigate to an Active placement (past guarantee period)
2. Click "Complete Placement"
3. Set end date
4. Confirm completion
5. Verify:
   - ✅ State changes to "Completed"
   - ✅ End date recorded
   - ✅ All collaborators receive payout notification
   - ✅ Final amounts displayed on placement detail
   - ✅ Recruiter reputation metrics update (completed_placements += 1)

**Expected Result**: Placement completes and recruiters are notified of payouts.

---

### Test Flow: Placement Failure Within Guarantee

**Objective**: Verify failed placement tracking and replacement flow.

**Steps**:
1. Navigate to an Active placement (within 90-day guarantee)
2. Click "Mark as Failed"
3. Select failure reason: "Candidate left voluntarily"
4. Confirm failure
5. Verify:
   - ✅ State changes to "Failed"
   - ✅ Failure reason recorded
   - ✅ Failed timestamp saved
   - ✅ "Request Replacement" button appears
   - ✅ All collaborators notified
   - ✅ Reputation metrics update (failed_placements += 1)

**Expected Result**: Failure tracked with replacement option available.

---

### Test Flow: Create Replacement Placement

**Objective**: Verify replacement candidate flow for failed placements.

**Steps**:
1. On the failed placement from previous test
2. Click "Request Replacement"
3. Select new candidate
4. Submit replacement request
5. Verify:
   - ✅ New placement created
   - ✅ `replacement_placement_id` links to original
   - ✅ Same collaborators and splits carried over
   - ✅ New guarantee period starts
   - ✅ Original placement links to replacement

**Expected Result**: Replacement placement created with same terms.

---

### Test Flow: Guarantee Expiring Notifications

**Objective**: Verify reminders sent as guarantee period nears end.

**Note**: Requires background worker or cron job.

**Steps**:
1. Create a placement with start date 85 days ago (5 days until expiry)
2. Run guarantee expiry checker
3. Verify:
   - ✅ Email notifications sent to all collaborators
   - ✅ Days remaining displayed on placement detail
   - ✅ Warning badge shows on placements list

**Expected Result**: Proactive notifications about upcoming guarantee expiry.

---

## 5. Recruiter Reputation System

### Test Flow: View Recruiter Reputation

**Objective**: Verify reputation metrics are displayed correctly.

**Steps**:
1. Navigate to any recruiter profile
2. View reputation badge
3. Hover over badge for tooltip
4. Verify displayed metrics:
   - ✅ Overall score (0-100)
   - ✅ Hire rate percentage
   - ✅ Completion rate percentage
   - ✅ Total submissions
   - ✅ Total hires
   - ✅ Collaboration count
   - ✅ Avg response time

**Expected Result**: All reputation metrics displayed accurately.

---

### Test Flow: Reputation Score Calculation

**Objective**: Verify score updates based on recruiter activity.

**Steps**:
1. Note current reputation score for Recruiter A
2. Create a placement with Recruiter A
3. Complete the placement successfully
4. Navigate to admin → Reputation Management
5. Click "Refresh" for Recruiter A
6. Verify:
   - ✅ Reputation score increased
   - ✅ Completed placements count increased
   - ✅ Completion rate recalculated
   - ✅ Last calculated timestamp updated

**Expected Result**: Reputation reflects successful placement.

---

### Test Flow: Negative Reputation Impact

**Objective**: Verify score decreases for poor performance.

**Steps**:
1. Note current reputation for Recruiter B
2. Create a proposal (as Recruiter B)
3. Let it timeout (update database)
4. Refresh reputation
5. Verify:
   - ✅ Score decreased slightly
   - ✅ Proposals timed out counter increased
   - ✅ Responsiveness metrics worsened
6. Create a placement with Recruiter B
7. Fail it within guarantee period
8. Refresh reputation
9. Verify:
   - ✅ Score decreased more
   - ✅ Completion rate decreased
   - ✅ Failed placements counter increased

**Expected Result**: Poor performance lowers reputation score.

---

### Test Flow: Reputation Leaderboard

**Objective**: Verify top recruiters are ranked correctly.

**Steps**:
1. Navigate to admin → Reputation Management
2. View leaderboard
3. Change sort metric to "Hire Rate"
4. Verify:
   - ✅ Recruiters sorted by hire rate descending
   - ✅ Rank numbers displayed (#1, #2, etc.)
5. Change sort to "Completion Rate"
6. Verify sort order updates
7. Change sort to "Overall Score"
8. Verify default leaderboard view

**Expected Result**: Leaderboard sorts correctly by all metrics.

---

## 6. Admin Audit Views

### Test Flow: Ownership Audit

**Objective**: Verify admin can review all candidate ownership.

**Steps**:
1. Log in as platform admin
2. Navigate to Admin → Ownership Audit
3. View "All" tab
4. Verify table shows:
   - ✅ Candidate name and email
   - ✅ Sourcer type (Recruiter / TSN)
   - ✅ Sourced date
   - ✅ Protection status (Active / Expired)
   - ✅ Expiry date and days remaining
   - ✅ Notes
5. Switch to "Active" filter
6. Verify only active protections shown
7. Switch to "Expired" filter
8. Verify only expired protections shown

**Expected Result**: Complete ownership visibility for admins.

---

### Test Flow: Reputation Management Dashboard

**Objective**: Verify admin can monitor all recruiter reputations.

**Steps**:
1. Navigate to Admin → Reputation Management
2. Verify table displays:
   - ✅ Rank for each recruiter
   - ✅ Overall score with colored badge
   - ✅ Submission stats
   - ✅ Hire rate
   - ✅ Completion rate
   - ✅ Collaboration count
   - ✅ Response time
   - ✅ Refresh and View buttons
3. Click "Refresh" on a recruiter
4. Verify:
   - ✅ Reputation recalculated
   - ✅ Metrics updated
   - ✅ Last calculated timestamp updated
5. View summary statistics at bottom
6. Verify aggregates are correct

**Expected Result**: Comprehensive reputation monitoring dashboard.

---

## 7. Integration Testing

### End-to-End Flow: Full Placement with Multiple Recruiters

**Objective**: Test complete workflow from sourcing to payout.

**Steps**:
1. **Sourcing** (Recruiter A):
   - Source candidate
   - Verify ownership established
   
2. **Proposal** (Recruiter A):
   - Create proposal for candidate-job pair
   - Wait for acceptance (Company Admin)
   - Verify state transitions
   
3. **Submission** (Recruiter A):
   - Submit application
   - Move through stages
   - Reach "Offer" stage
   
4. **Collaboration** (Recruiter B):
   - Get added as "Closer" to help seal deal
   - Negotiate final terms
   
5. **Hiring** (Company):
   - Mark as hired
   - Create placement with splits:
     - Sourcer (A): 40%
     - Closer (B): 60%
   
6. **Activation**:
   - Set start date
   - Activate placement
   - Verify guarantee period starts
   
7. **Completion** (after 90 days):
   - Complete placement
   - Verify splits distributed correctly
   - Check reputation updates for both recruiters

**Expected Result**: Complete flow works end-to-end with proper tracking.

---

## 8. Notification Testing

### Test Flow: All Phase 2 Email Notifications

**Objective**: Verify all Phase 2 events trigger correct emails.

**Events to Test**:
1. ✅ Candidate sourced confirmation
2. ✅ Ownership conflict detected (to original sourcer)
3. ✅ Ownership conflict rejection (to attempting recruiter)
4. ✅ Proposal accepted
5. ✅ Proposal declined
6. ✅ Proposal timeout
7. ✅ Placement activated
8. ✅ Placement completed (with payout info)
9. ✅ Placement failed (with reason)
10. ✅ Guarantee expiring reminder
11. ✅ Collaborator added to placement

**Verification** for each email:
- ✅ Correct recipient
- ✅ Relevant data included
- ✅ Links work (if applicable)
- ✅ Email templates render correctly
- ✅ Unsubscribe link present

**Expected Result**: All notifications send correctly with proper content.

---

## Test Data Checklist

Before running tests, ensure you have:

- [ ] 3+ recruiter user accounts
- [ ] 2+ company user accounts
- [ ] 10+ test candidates
- [ ] 5+ active jobs
- [ ] At least 1 admin account (platform_admin role)
- [ ] Email service configured (Resend API key)
- [ ] RabbitMQ running for events
- [ ] All database migrations applied

---

## Troubleshooting Common Issues

### Ownership Not Establishing
- Check database: `ats.candidate_sourcers` table
- Verify API endpoint: `/candidates/:id/source`
- Check event publishing: `candidate.sourced` event

### Splits Not Calculating Correctly
- Verify all percentages sum to 100%
- Check `ats.placement_collaborators` table
- Review split math in `PlacementCollaborationService`

### Reputation Not Updating
- Check if metrics are being counted in database
- Run manual refresh: `POST /recruiters/:id/reputation/refresh`
- Verify reputation calculation logic in `RecruiterReputationService`

### Notifications Not Sending
- Check Resend API key configuration
- Verify RabbitMQ is running and connected
- Check `notifications.notification_logs` table for errors
- Review event bindings in `consumer.ts`

---

## Reporting Test Results

When completing testing, document:

1. Test date and tester name
2. Environment (dev/staging)
3. Pass/fail status for each test flow
4. Any bugs discovered with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots/logs if applicable
5. Performance observations
6. Suggested improvements

---

**Last Updated**: December 14, 2025  
**Version**: 1.0 (Phase 2 Initial Release)
