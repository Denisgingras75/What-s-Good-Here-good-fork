# Plan: Layered Bot/Spam Deterrence with Jitter

## Context
The app already has server-side rate limiting via Supabase RPCs (`check_vote_rate_limit`, `check_photo_upload_rate_limit`, `check_and_record_rate_limit`). We want to add jitter and complementary client-side defenses to make bot automation harder without degrading UX for real users.

## Strategy: Defense in Depth (4 layers)

### Layer 1: Jitter on Rate Limit Timing (Server-Side)
**What:** Add random delay (200-800ms) to rate-limited API responses. Randomize the rate limit window slightly so bots can't binary-search the exact reset time.

**Where:** `src/api/votesApi.js` — wrap `submitVote()` with a small random delay before sending. Also applies to photo uploads and any other rate-limited actions.

**Why it works:** Bots that probe rate limits with precise timing can't find the exact boundary. The jitter makes automated timing unreliable.

**Implementation:**
- Add a `jitteredDelay()` utility to `src/utils/antiSpam.js` that returns a promise resolving after a random delay
- Call it before vote/photo submission in the API layer
- Server-side: modify the rate limit RPCs to add ±15% randomness to the window check (optional, lower priority since it requires SQL changes)

### Layer 2: Honeypot Fields (Client-Side)
**What:** Add an invisible form field to the vote flow and any other user-input forms. Real users never see or fill it. Bots auto-fill everything.

**Where:** `ReviewFlow.jsx`, `AddDishModal` (if it exists), photo upload forms.

**Implementation:**
- Add a hidden input (CSS `position: absolute; left: -9999px; opacity: 0; pointer-events: none`) with an enticing name like `website` or `email_confirm`
- In the API layer, check if the honeypot field has a value — if yes, silently reject (return fake success so bot doesn't know it was caught)
- Add `checkHoneypot()` function to `src/utils/antiSpam.js`

### Layer 3: Minimum Submission Time (Client-Side)
**What:** Record when a form opens. Reject submissions that happen faster than a human could realistically complete (e.g., < 1.5 seconds for a vote, < 3 seconds for a review with text).

**Where:** `ReviewFlow.jsx` (vote flow), photo upload.

**Implementation:**
- Record `Date.now()` when ReviewFlow mounts
- On submit, check elapsed time. If < 1500ms (thumbs up/down only) or < 3000ms (with review text), silently delay to meet minimum OR reject
- Add `createTimingGuard()` to `src/utils/antiSpam.js` — returns `{ start(), check() }` interface

### Layer 4: Account Age Gate (Server-Side, Future)
**What:** New accounts (< 24h old) get stricter rate limits (e.g., 3 votes/min instead of 10). Trusted accounts (> 7 days, 10+ votes) get relaxed limits.

**Where:** Would require modifying the rate limit RPCs in `schema.sql`.

**Implementation:** Lower priority — skip for now unless spam actually becomes a problem. Document in TASKS.md as a future escalation option.

---

## Files to Create/Modify

| File | Action | What |
|------|--------|------|
| `src/utils/antiSpam.js` | **CREATE** | `jitteredDelay()`, `checkHoneypot()`, `createTimingGuard()` utilities |
| `src/api/votesApi.js` | **MODIFY** | Add jitter before `submitVote()`, add honeypot check |
| `src/api/dishPhotosApi.js` | **MODIFY** | Add jitter before photo upload |
| `src/components/ReviewFlow.jsx` | **MODIFY** | Add honeypot field + timing guard |
| `src/constants/app.js` | **MODIFY** | Add `ANTI_SPAM_MIN_VOTE_TIME_MS = 1500`, `ANTI_SPAM_MIN_REVIEW_TIME_MS = 3000`, `ANTI_SPAM_JITTER_MIN_MS = 200`, `ANTI_SPAM_JITTER_MAX_MS = 800` |
| `TASKS.md` | **MODIFY** | Add account age gate as future task |

## What We're NOT Doing
- **No CAPTCHA** — kills UX for a food app. Nuclear option if layers 1-3 fail.
- **No device fingerprinting** — privacy-invasive, overkill for current scale.
- **No server-side jitter in SQL** — the client-side jitter is sufficient for now; SQL changes require running in Supabase SQL Editor and add complexity.

## Verification
- `npm run build` passes
- `npm run test` passes
- Manual test: vote flow still works normally (delay is imperceptible to humans at 200-800ms since network latency already exists)
- Honeypot field is truly invisible (check on mobile + desktop)
