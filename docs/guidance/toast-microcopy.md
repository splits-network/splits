# Toast Microcopy Guide

Standard copy patterns for toast notifications across the Splits Network platform.

**System:** `useToast()` from `@splits-network/shared-hooks`
**Types:** `success`, `error`, `warning`, `info`
**API:** `toast.success(message)`, `toast.error(message)`, etc.

---

## Principles

1. **State what happened.** Not what the system did internally. The user performed an action; confirm the outcome.
2. **Past tense for results. Present tense for problems.** "Role saved." (done) vs. "That role can't be saved." (ongoing state)
3. **Name the object.** "Profile updated." is better than "Changes saved." because it confirms *what* was updated.
4. **No filler words.** Drop "successfully" — the success toast type already communicates that. Drop "please" — be direct without being rude.
5. **Errors need a next step.** What went wrong, then what to do about it. Two short sentences.
6. **No exclamation marks on routine actions.** Saving a profile is expected behavior, not a celebration.
7. **Period at the end.** Toasts are sentences. End them with a period.

---

## Pattern Library

### Success

Confirm the completed action. Name the thing. Past tense.

```
Pattern: "[Object] [past-tense verb]."
```

| Write this | Not this |
|---|---|
| `Profile updated.` | `Your profile has been successfully updated!` |
| `Role created.` | `Success! Your role was created.` |
| `Candidate submitted.` | `Candidate has been successfully submitted!` |
| `Invitation sent.` | `The invitation was sent successfully.` |
| `Draft saved.` | `Your draft has been saved.` |

When context adds clarity, include it briefly:

```
"Invitation sent to jane@acme.co."
"Role status updated to Active."
"Removed Sarah Chen from team."
```

### Error

State the problem, then the fix. Two sentences maximum. No blame, no jargon.

```
Pattern: "[What failed]. [What to do]."
```

| Write this | Not this |
|---|---|
| `That role couldn't be saved. Check the required fields.` | `An error occurred. Please try again later.` |
| `Profile photo failed to upload. Try a smaller file under 5MB.` | `Error: Upload failed (413)` |
| `Couldn't load documents. Refresh the page to retry.` | `Something went wrong.` |
| `Not authenticated. Sign in to continue.` | `Error: Not authenticated` |

When the API returns a meaningful message, use it — but clean it up:

```tsx
// Good: Use API message when it's human-readable
toast.error(error.message || "That action couldn't be completed. Try again.");

// Bad: Pass raw technical messages
toast.error(error.message || "An error occurred");
```

### Warning

Alert the user to something they should know before proceeding. Neutral tone, no alarm.

```
Pattern: "[Condition]. [Implication or action]."
```

| Write this | Not this |
|---|---|
| `This role has no fee agreement. Set terms before submitting candidates.` | `WARNING: No fee agreement found!` |
| `You have unsaved changes. They'll be lost if you leave.` | `Are you sure? Your changes might be lost!` |
| `Activation date required for Early Access status.` | `An activation date is required for Early Access status` |

### Info

Deliver neutral information. No positive or negative framing needed.

```
Pattern: "[What happened or what to know]."
```

| Write this | Not this |
|---|---|
| `You've already sent a request to this firm.` | `Info: A connection request already exists.` |
| `Link copied to clipboard.` | `The link has been copied to your clipboard!` |
| `Config imported. Review and save when ready.` | `Configuration has been successfully imported.` |

---

## Common Toast Messages

### Saving and Updating Records

```tsx
// Profile
toast.success("Profile updated.");
toast.error("Profile couldn't be saved. Check the required fields.");

// Role
toast.success("Role created.");
toast.success("Role updated.");
toast.error("That role couldn't be saved. Check the required fields.");

// Settings
toast.success("Settings saved.");
toast.error("Settings couldn't be saved. Try again.");

// Generic record
toast.success("[Object] saved.");
toast.error("[Object] couldn't be saved. Try again.");
```

### Submitting Candidates

```tsx
toast.success("Candidate submitted.");
toast.success("Candidate submitted for AI review.");
toast.error("Candidate couldn't be submitted. Check the required fields.");
```

### Invitations

```tsx
// Sending
toast.success("Invitation sent.");
toast.success("Invitation sent to jane@acme.co.");
toast.error("Invitation couldn't be sent. Try again.");

// Resending
toast.success("Invitation resent.");
toast.error("Invitation couldn't be resent. Try again.");

// Revoking/Cancelling
toast.success("Invitation cancelled.");
toast.success("Revoked invitation for jane@acme.co.");
toast.error("Invitation couldn't be revoked. Try again.");
```

### Deleting and Archiving

```tsx
// Deleting
toast.success("Role deleted.");
toast.success("Document removed.");
toast.success("3 notifications deleted.");
toast.error("That item couldn't be deleted. Try again.");

// Archiving
toast.success("Conversation archived.");
toast.success("Conversation unarchived.");
```

### Copy to Clipboard

```tsx
toast.info("Link copied to clipboard.");
toast.info("Code copied to clipboard.");
toast.info("URL copied to clipboard.");
toast.error("Couldn't copy to clipboard. Try selecting the text manually.");
```

Use `info` type for clipboard copies — not `success`. Copying text is informational, not an achievement.

### File Uploads

```tsx
// Success
toast.success("Profile photo updated.");
toast.success("Document uploaded.");
toast.success("Image uploaded.");

// Validation (before upload attempt)
toast.error("Select an image file to upload.");
toast.error("File too large. Maximum size is 5MB.");

// Upload failure
toast.error("File couldn't be uploaded. Check the format and try again.");

// Removal
toast.success("Profile photo removed.");
toast.success("Document removed.");
```

### Payment and Billing

```tsx
toast.success("Invoice created.");
toast.success("Payout processed.");
toast.success("Escrow hold released.");
toast.error("Payment couldn't be processed. Check your billing details.");
toast.error("Invoice couldn't be created. Try again.");
```

### Connection and Network Errors

```tsx
toast.error("Couldn't reach the server. Check your connection and try again.");
toast.error("Request timed out. Try again.");
toast.error("Session expired. Sign in again to continue.");
```

Never write "Please try again later." — if the user can retry now, say so. If they genuinely need to wait, say why: "The service is temporarily unavailable. Try again in a few minutes."

### Permission Denied

```tsx
toast.error("You don't have permission for that action.");
toast.error("Authentication required. Sign in to continue.");
toast.error("Only team admins can remove members.");
```

### Form Validation (as toast)

Prefer inline validation over toasts. When a toast is necessary:

```tsx
toast.error("Title is required.");
toast.error("Select a company before sending.");
toast.error("Add at least one block before publishing.");
```

One validation issue per toast. Don't list multiple errors in a single message.

---

## Action Buttons

The toast system supports an optional action button. Use it when the user has an obvious next step.

### When to Include an Action

| Scenario | Action Label |
|---|---|
| Destructive action that can be reversed | `Undo` |
| Created something the user might want to view | `View` |
| Error that has a specific fix location | `Go to Settings` |
| Offline-queued action that completed | `View` |

### Action Button Copy Rules

- 1-2 words, action verb first
- Match the verb to the destination: `View`, `Undo`, `Open`, `Retry`
- Never `Click here`, `OK`, or `Learn more`
- Capitalize like a button label: `View Role`, not `view role`

### Examples

```tsx
toast.success("Role created.", { action: { label: "View", onClick: () => router.push(`/roles/${id}`) }});
toast.success("Candidate submitted.", { action: { label: "View Pipeline", onClick: () => openPipeline() }});
toast.error("Profile incomplete.", { action: { label: "Edit Profile", onClick: () => router.push("/profile") }});
```

---

## Anti-Patterns

### Drop "Successfully"

The toast type already signals success. The word is redundant.

| Before | After |
|---|---|
| `Successfully saved` | `Saved.` |
| `Document uploaded successfully` | `Document uploaded.` |
| `Offer extended successfully` | `Offer extended.` |

### Drop "Failed to" as the Only Information

"Failed to" is acceptable as a prefix, but only when followed by useful context.

| Before | After |
|---|---|
| `Failed to save` | `That record couldn't be saved. Try again.` |
| `Failed to load documents` | `Couldn't load documents. Refresh the page.` |

### No Exclamation Marks on Routine Actions

```tsx
// No
toast.success("Role status updated to Active!");
toast.success("Job link copied to clipboard!");
toast.success("Candidate submitted successfully!");

// Yes
toast.success("Role status updated to Active.");
toast.info("Link copied to clipboard.");
toast.success("Candidate submitted.");
```

Exception: the candidate app may use one exclamation mark for milestone moments like accepting an offer — `"Offer accepted!"` — where genuine celebration is appropriate.

### No "Please Try Again Later"

This tells the user nothing. Be specific about what they can do and when.

| Before | After |
|---|---|
| `An error occurred. Please try again later.` | `Couldn't save that role. Try again.` |
| `Something went wrong. Please try again.` | `Profile update failed. Check your connection and retry.` |

### No Technical Jargon

| Before | After |
|---|---|
| `400 Bad Request` | `Check the required fields and try again.` |
| `Network error` | `Couldn't reach the server. Check your connection.` |
| `Unauthorized (401)` | `Sign in to continue.` |
| `Rate limited` | `Too many requests. Wait a moment and try again.` |

### No Generic Fallbacks

Every error toast should name the thing that failed. If you're writing a catch block and don't know the specific context, at minimum reference the action:

```tsx
// Bad: generic fallback
toast.error("Something went wrong");
toast.error("An error occurred");

// Good: action-specific fallback
toast.error("That action couldn't be completed. Try again.");
toast.error(error.message || "Invitation couldn't be sent. Try again.");
```

---

## Tone Calibration

### Success Toasts

| Too formal | Too casual | Just right |
|---|---|---|
| `Your profile has been updated.` | `Profile saved, nice!` | `Profile updated.` |
| `The candidate submission was processed.` | `Candidate sent off!` | `Candidate submitted.` |
| `The invitation has been sent to the recipient.` | `Invite fired off!` | `Invitation sent.` |

### Error Toasts

| Too formal | Too casual | Just right |
|---|---|---|
| `We were unable to process your request at this time.` | `Oops, that didn't work!` | `That request couldn't be processed. Try again.` |
| `The system encountered an error while saving.` | `Save broke, sorry!` | `Couldn't save. Check the form and try again.` |
| `An unexpected error has occurred.` | `Yikes, something went wrong!` | `That action couldn't be completed. Try again.` |

### Warning Toasts

| Too formal | Too casual | Just right |
|---|---|---|
| `Please be advised that changes will be lost.` | `Heads up, you'll lose your stuff!` | `Unsaved changes will be lost.` |
| `It has come to our attention that...` | `Just FYI...` | `This role has no fee terms set.` |

### Info Toasts

| Too formal | Too casual | Just right |
|---|---|---|
| `For your information, the link has been copied.` | `Copied! You're good to go.` | `Link copied to clipboard.` |
| `The connection request was previously submitted.` | `Already pinged them!` | `You've already sent a request to this firm.` |

---

## Implementation Checklist

Before shipping a toast message, verify:

- [ ] Names the object acted upon (not just "saved" — *what* was saved)
- [ ] Uses past tense for completed actions
- [ ] No "successfully" prefix
- [ ] No exclamation marks (unless candidate milestone)
- [ ] Error messages include a next step
- [ ] No technical jargon or HTTP status codes
- [ ] No "please try again later" — be specific
- [ ] Ends with a period
- [ ] Uses correct toast type (`info` for clipboard, `warning` for cautions, etc.)
- [ ] Fallback message in catch blocks references the specific action
- [ ] Single validation issue per toast (prefer inline validation)
