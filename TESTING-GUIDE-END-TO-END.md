# End-to-End Testing Guide - Splits Network

**Version:** 1.0  
**Date:** January 18, 2026  
**Build Status:** ✅ All systems operational

---

## Overview

This guide walks testers through the complete Splits Network workflow from candidate application to successful hire and commission payout. Follow each section in order to validate the entire system.

**Test Duration:** ~45-60 minutes for complete workflow  
**Prerequisites:** Valid email addresses for testing, access to both candidate and portal apps

---

## 🎭 Test Personas & Roles

You'll need to test with these different user types:

1. **Candidate** - Job seeker applying to positions
2. **Recruiter** (Candidate-side) - Represents the candidate
3. **Recruiter** (Company-side) - Represents the hiring company
4. **Hiring Manager/Company Admin** - Makes final hiring decisions
5. **Platform Admin** - Oversees entire marketplace

**Recommendation:** Create 5 different user accounts with different email addresses.

---

## 📱 Application URLs

- **Candidate Portal:** `https://applicant.network` - For job seekers
- **Main Portal:** `https://splits.network` - For recruiters, companies, and admins

**Note:** All URLs use HTTPS with valid SSL certificates.

## Phase 1: Candidate Registration & Profile Setup

### Step 1.1: Create Candidate Account
1. Open candidate portal at `https://applicant.network`
2. Click **Sign Up** 
3. Complete registration with email/password
4. Verify email if required
5. **Expected Result:** Successfully logged into candidate portal

### Step 1.2: Complete Candidate Profile
1. Navigate to **Profile** or **Dashboard**
2. Click **Edit Profile** or complete onboarding
3. Fill in required fields:
   - Full Name
   - Email (should be pre-filled)
   - Phone Number
   - LinkedIn URL (optional)
   - Location/City
   - Skills/Expertise
4. Upload Resume (PDF, DOC, or DOCX format, max 10MB)
5. Click **Save Profile**
6. **Expected Result:** Profile saved successfully with green success message

### Step 1.3: Verify Profile Display
1. Refresh the profile page
2. **Expected Result:** All entered information displays correctly
3. **Expected Result:** Resume shows as uploaded with filename

**✅ Checkpoint:** Candidate profile is complete and saved

---

## Phase 2: Browse Jobs & Apply

### Step 2.1: Browse Available Jobs
1. Navigate to **Jobs** or **Browse Jobs** section
2. **Expected Result:** See list of active job postings
3. Try filters/search if available:
   - Search by job title
   - Filter by location
   - Filter by company
4. **Expected Result:** Filters work and update job list

### Step 2.2: View Job Details
1. Click on a specific job posting
2. **Expected Result:** See full job description with:
   - Job title
   - Company name
   - Location
   - Salary range (if provided)
   - Job description
   - Requirements
   - Responsibilities
   - Pre-screen questions (if any)

### Step 2.3: Submit Application
1. On job detail page, click **Apply for This Job**
2. Confirm your profile information is correct
3. Answer any pre-screen questions if present
4. Attach additional documents if needed
5. Click **Submit Application**
6. **Expected Result:** Success message appears
7. **Expected Result:** Redirected to application detail page

**✅ Checkpoint:** Application submitted successfully

---

## Phase 3: AI Review Process

### Step 3.1: Request AI Review
1. On your application detail page, locate the **AI Review** section
2. **Expected Result:** See "Request AI Review" button
3. Click **Request AI Review**
4. **Expected Result:** Button changes to loading state
5. Wait 5-30 seconds for AI analysis
6. **Expected Result:** AI review appears with:
   - Fit Score (percentage)
   - Recommendation (Strong Fit/Good Fit/Fair Fit/Poor Fit)
   - Detailed analysis
   - Red flags (if any)
   - Concerns (if any)
   - Improvement suggestions

### Step 3.2: Review AI Feedback
1. Read the AI analysis carefully
2. Note the fit score and recommendation
3. Review any red flags or concerns
4. **Expected Result:** Analysis makes sense based on resume and job requirements

### Step 3.3: Return to Draft (Optional)
If AI suggests improvements:
1. Click **Return to Draft** button
2. **Expected Result:** Application moves back to draft status
3. Update your profile or resume based on feedback
4. Resubmit application
5. Request AI review again
6. **Expected Result:** New AI review with updated scores

### Step 3.4: Final Submission
1. Once satisfied with AI review, click **Submit to Company**
2. **Expected Result:** Confirmation modal appears
3. Confirm submission
4. **Expected Result:** Application moves to "Submitted" or first gate review stage
5. **Expected Result:** Email notification sent confirming submission

**✅ Checkpoint:** Application submitted with AI review complete

---

## Phase 4: Gate Review System (Multi-Stage Approval)

**Note:** Gate sequence depends on whether recruiters are involved. Test all scenarios:

- **Scenario A:** Direct application (no recruiters) → Goes straight to Company gate
- **Scenario B:** Candidate has recruiter → Candidate Recruiter gate → Company gate
- **Scenario C:** Job has company recruiter → Company Recruiter gate → Company gate
- **Scenario D:** Both recruiters → Candidate Recruiter → Company Recruiter → Company gate

### Step 4.1: Candidate Recruiter Gate (If Applicable)

**As Candidate:**
1. Check application status shows "Awaiting Candidate Recruiter Review"
2. **Expected Result:** Cannot take action, waiting for recruiter

**As Candidate Recruiter:**
1. Log into main portal at `https://splits.network`
2. Navigate to **Gate Reviews** or **Pending Reviews**
3. **Expected Result:** See the application awaiting your review
4. Click on application to view details
5. Review candidate information and job fit
6. Choose action:
   - **Option A - Approve:** Click **Approve** → Add notes → Submit
   - **Option B - Deny:** Click **Deny** → Add feedback → Submit
   - **Option C - Request Info:** Click **Request Info** → Ask questions → Submit
7. **Expected Result:** Action processed successfully
8. **Expected Result:** Email notifications sent to candidate and next reviewer

**If Info Requested:**
1. **As Candidate:** Check email for info request
2. Navigate to application
3. Click **Provide Information**
4. Answer questions
5. Submit responses
6. **Expected Result:** Returns to recruiter for review

### Step 4.2: Company Recruiter Gate (If Applicable)

Repeat same process as Step 4.1, but as **Company Recruiter** role:
1. Log into portal as company recruiter
2. Navigate to pending gate reviews
3. Review application
4. Approve/Deny/Request Info
5. **Expected Result:** Moves to final Company gate or rejection

### Step 4.3: Company Gate (Always Required)

**As Hiring Manager or Company Admin:**
1. Log into main portal
2. Navigate to **Applications** or **Gate Reviews**
3. **Expected Result:** See application at Company gate
4. Click to view full application details
5. Review:
   - Candidate profile
   - Resume
   - AI Review results
   - Pre-screen answers
   - Gate history (previous approvals)
6. Make final decision:
   - **Approve:** Click **Approve** → Moves to "Accepted" status
   - **Deny:** Click **Deny** → Provide reason → Moves to "Rejected"
7. **Expected Result:** Decision recorded in gate history
8. **Expected Result:** Email notifications sent to all parties

**✅ Checkpoint:** Application passed all gates OR was rejected with proper notifications

---

## Phase 5: Company Acceptance & Offer Stage

### Step 5.1: View Accepted Application (Company Side)
1. **As Company Admin/Hiring Manager**
2. Navigate to **Applications** → **Accepted**
3. Find the approved application
4. **Expected Result:** Shows "Accepted" status
5. Review candidate contact information (now visible)
6. Click **Move to Offer** (if available)

### Step 5.2: Candidate Notification
1. **As Candidate:** Check email
2. **Expected Result:** Received acceptance notification
3. Log into candidate portal
4. Navigate to **My Applications**
5. **Expected Result:** Application shows "Accepted" or "Offer" status
6. **Expected Result:** Can see company contact information

### Step 5.3: Offer & Interview Process
1. **Expected Result:** Company can schedule interviews through platform OR externally
2. **Expected Result:** Status updates tracked in application timeline
3. **Expected Result:** Email notifications for major milestones

**✅ Checkpoint:** Candidate accepted, offer stage reached

---

## Phase 6: Hiring & Placement Creation

### Step 6.1: Mark as Hired
1. **As Company Admin/Hiring Manager**
2. Navigate to application in "Offer" status
3. Click **Mark as Hired** or **Create Placement**
4. Enter placement details:
   - Start Date
   - Annual Salary (USD)
   - Placement Fee (default to job's fee percentage)
   - Job Title (should pre-fill)
5. Click **Create Placement**
6. **Expected Result:** Success message appears
7. **Expected Result:** Placement record created

### Step 6.2: Verify Placement Details
1. Navigate to **Placements** section
2. Find the new placement
3. **Expected Result:** See placement with:
   - Candidate name
   - Job title
   - Company name
   - Annual salary
   - Placement fee amount
   - Start date
   - Status: "Active" or "Pending"
   - Involved recruiters (if any)

### Step 6.3: Check Candidate Notification
1. **As Candidate:** Check email
2. **Expected Result:** Congratulations email received
3. Log into candidate portal
4. **Expected Result:** Application shows "Hired" status
5. **Expected Result:** Can see placement details

**✅ Checkpoint:** Placement created successfully

---

## Phase 7: Commission Splits & Payout Creation

### Step 7.1: Verify Commission Splits (Admin View)
1. **As Platform Admin**
2. Navigate to **Placements** → Select the placement
3. Click **View Commission Breakdown** or **Splits**
4. **Expected Result:** See split breakdown with roles:
   - **Candidate Recruiter:** X% (if assigned)
   - **Company Recruiter:** X% (if assigned)
   - **Job Owner:** X% (if assigned)
   - **Candidate Sourcer:** X% (if assigned)
   - **Company Sourcer:** X% (if assigned)
   - **Platform:** Remainder %
5. **Expected Result:** All percentages add to 100%
6. **Expected Result:** Dollar amounts calculated correctly

### Step 7.2: Check Payout Transactions
1. Still as Platform Admin
2. Navigate to **Payouts** or **Transactions**
3. **Expected Result:** See payout transactions created for each recruiter
4. Each transaction should show:
   - Recruiter name
   - Role (e.g., "Candidate Recruiter")
   - Amount
   - Status: "Pending" or "Processing"
   - Placement reference

### Step 7.3: Verify Recruiter Can See Their Payout
1. **As Recruiter** (any involved recruiter)
2. Log into portal
3. Navigate to **My Payouts** or **Earnings**
4. **Expected Result:** See the new payout listed
5. Click to view details
6. **Expected Result:** See:
   - Placement details
   - Your role in the deal
   - Payout amount
   - Fee percentage
   - Status
   - Expected payout date

**✅ Checkpoint:** Commission splits calculated, payout transactions created

---

## Phase 8: Notifications & Email Testing

### Step 8.1: Verify All Email Notifications Were Sent
Check email inboxes for all test accounts. Expected emails:

**Candidate Should Receive:**
- ✅ Welcome/registration confirmation
- ✅ Application submitted confirmation
- ✅ AI review completed
- ✅ Gate approval notifications (at each stage)
- ✅ Application accepted by company
- ✅ Hired/placement created congratulations

**Recruiters Should Receive:**
- ✅ Gate review request notifications
- ✅ Gate approval/denial notifications
- ✅ Application accepted by company
- ✅ Placement created notification
- ✅ Payout created notification

**Company Users Should Receive:**
- ✅ New application notification
- ✅ Gate approval notifications (when moves to their gate)
- ✅ Application status updates
- ✅ Placement created confirmation

### Step 8.2: Check In-App Notifications
1. Log into portal/candidate app
2. Click notification bell icon (if available)
3. **Expected Result:** See notification history
4. **Expected Result:** Unread count is accurate
5. Click notification to mark as read
6. **Expected Result:** Notification marked read, redirects to relevant page

**✅ Checkpoint:** All notifications working correctly

---

## Phase 9: Dashboard & Analytics

### Step 9.1: Recruiter Dashboard
1. **As Recruiter**
2. Navigate to **Dashboard**
3. **Expected Result:** See metrics:
   - Active Roles (jobs you're working on)
   - Candidates in Process
   - Pending Offers
   - Placements This Month
   - Placements This Year
   - Total Earnings YTD
   - Pending Payouts
4. **Expected Result:** Charts showing trends (if available)

### Step 9.2: Company Dashboard
1. **As Company Admin**
2. Navigate to **Dashboard**
3. **Expected Result:** See metrics:
   - Open Positions
   - Active Applications
   - Interviews Scheduled (if implemented)
   - Pending Offers
   - Recent Hires
4. **Expected Result:** Application pipeline visualization

### Step 9.3: Admin Dashboard
1. **As Platform Admin**
2. Navigate to **Admin Dashboard**
3. **Expected Result:** See platform-wide metrics:
   - Total Applications
   - Active Placements
   - Total Revenue
   - Recruiter Marketplace Health
   - Recent Activity

**✅ Checkpoint:** Dashboards display correct data

---

## 🐛 Common Issues & Troubleshooting

### Issue: Can't Upload Resume
- **Check:** File is PDF, DOC, or DOCX
- **Check:** File is under 10MB
- **Check:** Browser allows file uploads
- **Fix:** Try different file format or smaller file

### Issue: AI Review Fails or Takes Too Long
- **Check:** Resume has been uploaded
- **Check:** Job has requirements defined
- **Wait:** Can take up to 2 minutes for complex analysis
- **Check Console:** Look for errors in browser dev tools

### Issue: Gate Review Not Appearing
- **Check:** User has correct role (recruiter, company admin)
- **Check:** Application is at the correct gate stage
- **Check:** User has permission for this specific application
- **Refresh:** Try logging out and back in

### Issue: Email Notifications Not Arriving
- **Check:** Spam/junk folder
- **Check:** Email service is configured (Resend)
- **Check:** SMTP/email service is running
- **Wait:** Emails can take 1-2 minutes to deliver

### Issue: Payout Splits Don't Add to 100%
- **Report:** This is a bug - splits must always equal 100%
- **Check:** Recruiter subscription tiers are set correctly
- **Check:** All sourcer attributions are recorded

### Issue: Can't See Application Details
- **Check:** You have permission to view this application
- **Check:** You're logged in with correct account
- **Check:** Application exists and isn't deleted
- **Try:** Refresh page or clear browser cache

---

## 📋 Test Scenarios Checklist

Use this checklist to ensure you've tested all scenarios:

### Basic Flow
- [ ] Candidate registration & profile setup
- [ ] Job browsing and search
- [ ] Application submission
- [ ] AI review request and completion
- [ ] Final submission to company
- [ ] Company acceptance
- [ ] Placement creation
- [ ] Payout generation

### Gate Review Scenarios
- [ ] Direct application (no recruiters)
- [ ] Candidate with recruiter (2 gates)
- [ ] Job with company recruiter (2 gates)
- [ ] Both recruiters assigned (3 gates)
- [ ] Gate approval at each level
- [ ] Gate denial with feedback
- [ ] Info request → info provided → approval

### Edge Cases
- [ ] Application withdrawal by candidate
- [ ] Application rejection at gate review
- [ ] Multiple applications from same candidate
- [ ] Recruiter with multiple roles (e.g., both candidate & company)
- [ ] Job with no recruiters assigned
- [ ] Candidate with no sourcer
- [ ] Company with no sourcer

### Commission Scenarios
- [ ] All 5 roles filled (max commissions)
- [ ] Only candidate recruiter assigned
- [ ] Only company recruiter assigned
- [ ] Direct candidate (no candidate recruiter)
- [ ] Job created by company employee (no job owner commission)
- [ ] Inactive sourcer (no sourcer payout)

### Subscription Tiers
- [ ] Premium recruiter (highest rates)
- [ ] Paid recruiter (mid rates)
- [ ] Free recruiter (lowest rates)
- [ ] Sourcer commission bonus by tier

---

## 🎯 Success Criteria

The system passes testing if:

✅ **Functional Requirements:**
- All user flows complete without errors
- Data persists correctly across sessions
- Email notifications deliver reliably
- Commission splits always equal 100%
- Payouts created for all eligible recruiters

✅ **User Experience:**
- UI is intuitive and easy to navigate
- Loading states display during async operations
- Success/error messages are clear
- Forms validate inputs appropriately
- Responsive design works on mobile/tablet

✅ **Business Logic:**
- Gate routing follows correct sequence
- Only authorized users can approve gates
- Commission calculations match expected rates
- Sourcer attribution is permanent
- Platform gets remainder of unclaimed commissions

✅ **Technical Requirements:**
- No console errors in browser
- Pages load within 3 seconds
- Searches return results quickly
- No data corruption or race conditions
- Proper error handling for all failures

---

## 📝 Bug Reporting Template

When you find an issue, report it with this format:

```markdown
**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots/Videos:**
[Attach if helpful]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- Device: [Desktop/Mobile/Tablet]
- User Role: [Candidate/Recruiter/Company/Admin]
- Account Email: [test user email]

**Console Errors:**
[Copy any errors from browser console]

**Additional Context:**
[Any other relevant information]
```

---

## 🚀 Ready to Test!

You now have everything you need to thoroughly test Splits Network. Start with Phase 1 and work your way through each section. Take your time and test both happy paths and edge cases.

**Good luck, and happy testing! 🎉**

---

**Questions or Issues?**
- Check the browser console for errors
- Review the application logs (if you have access)
- Contact the development team with detailed bug reports

**Testing Complete?**
Submit your bug reports and feedback to the development team for review and fixes.
