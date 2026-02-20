# Security Audit – Panel (Next.js)

This document lists **security issues** identified in the codebase and **patches** applied for client-editable field validation. It is not exhaustive; treat it as a starting point for hardening.

---

## 1. Patches applied (client-editable fields)

The following server-side validations were added so values cannot be bypassed by editing the page source or API requests.

### 1.1 Orders API (`/api/orders`)

- **Speed (hashtag)** for `mentions_hashtag`: required; must be integer in **10–900** (reject and return error if out of range).
- **Dripfeed interval**: only **0, 5, 10, 15, 30, 60** minutes allowed (reject invalid values).
- **Delay1 / Delay2** (custom comments): clamped to **1–60** on the server before saving.
- **Position / position_time / position_upvotes**: clamped to safe bounds (e.g. position 0–10, position_time/position_upvotes 0–9999) so they cannot be set to arbitrary large values.
- **Mass order** `service_id|quantity|link|speed`: when the 4th column (speed) is numeric, it is validated to be in **10–900** and sanitized before storing in `hashtag`.

### 1.2 API v1 (`/api/v1`)

- **Quantity**: enforced **quantity ≥ service.min** (previously only `quantity ≥ 1` and `quantity ≤ max` were checked).
- **Speed (hashtag)** for `mentions_hashtag`: when present and numeric, must be in **10–900**.
- **Dripfeed interval**: restricted to **0, 5, 10, 15, 30, 60** (aligned with panel).
- **Delay1 / Delay2** (custom comments): clamped to **1–60** on the server.

### 1.3 Profile scan API (`/api/profile-scan`)

- **speed**: clamped to **0.25–900**.
- **position_time**: clamped to **0–1440**.
- **no_of_upvotes / no_of_upvotes2**: clamped to **1–1000**.

### 1.4 Add funds (`/api/add-funds`)

- Already validated: **amount** is checked against payment method **min/max** from the database (not trusted from client only).

---

## 2. Security issues (findings)

### 2.1 Authentication & session

- **Legacy MD5 passwords**: Auth still accepts MD5 hashes and migrates to bcrypt on login. Until all users have logged in once, MD5 is in use; consider forcing reset for remaining MD5 users.
- **Admin auth**: Admin routes use `getAdminSession()` and JWT `isAdmin`/`staffId`; ensure middleware and route protection consistently require admin for all `/admin` and `/api/admin/*` paths.

### 2.2 Authorization & IDOR

- **Admin profile update** (`/api/admin/profile`): `staffId` can be taken from request body (`body.staffId || session.staffId`). An admin could send another staff’s `staffId` and update that account (e.g. password, email). **Recommendation**: Use only `session.staffId` for “update my profile”; use body `staffId` only for a dedicated “admin edits another staff” action with explicit permission checks.
- **User-scoped resources**: Profile scan, tickets, orders, etc. are scoped by `uid` from session; confirm every read/write/delete uses the session `uid` and not an ID from the request (no IDOR).

### 2.3 Rate limiting & abuse

- **No rate limiting** on:
  - Login (`/api/auth/[...nextauth]`).
  - Signup (`/api/auth/signup`).
  - Forgot password (`/api/auth/forgot-password`).
  - Order creation (`/api/orders`).
  - API v1 (`/api/v1`).
  - Add funds, tickets, profile-scan, etc.
- **Risk**: Brute-force login, signup spam, password-reset abuse, order/API abuse. **Recommendation**: Add rate limiting (e.g. by IP and/or user/session) for auth and sensitive actions.

### 2.4 Signup & account creation

- **Weak password policy**: Only “at least 6 characters”; no complexity or breach checks.
- **No email verification**: Accounts are active immediately; no verification link.
- **User enumeration**: Signup returns “account already exists” for duplicate email; consider a generic message and handling duplicates in backend only.

### 2.5 Forgot password

- **User enumeration**: Different responses (e.g. 404 vs success) can reveal whether an email exists.
- **No email sent**: Response says “we have sent you a link” but no email is sent; reset flow is incomplete.
- **No rate limit**: Allows unlimited requests per email/IP.

### 2.6 Payment & webhooks

- **NOWPayments IPN** (`/api/nowpayments/ipn`): No webhook signature verification. Status is verified by calling NOWPayments API; consider also verifying IPN signature if the provider supports it to prevent replay or forged callbacks.
- **Add funds**: Amount is validated against DB min/max; ensure payment method config (min/max) is not user-controllable.

### 2.7 Input validation & injection

- **Prisma**: Queries use parameterized APIs; SQL injection risk is low.
- **HTML stripping**: Order/ticket messages use `stripTags`; ensure all user-derived content that is stored or reflected is sanitized (and consider CSP).
- **XSS**: `dangerouslySetInnerHTML` in layout is used for a fixed theme script only (no user input); keep it that way and avoid injecting user/content there.

### 2.8 API key & secrets

- **API v1**: Uses `key` (user API key) for authentication; ensure API keys are not logged or exposed in error responses.
- **Env**: Ensure `NEXTAUTH_SECRET`, DB URL, payment API keys, etc. are only in env and not committed.

### 2.9 Information disclosure

- **Error messages**: Some API errors may expose internal details (e.g. “Transaction ID does not exist”); avoid leaking schema or internal IDs where possible.
- **Search/query**: Orders search by ID/link; ensure results are strictly scoped to the current user and no cross-user data is returned.

### 2.10 CSRF

- **NextAuth**: Uses session cookies and POST for credentials; same-site and origin checks depend on deployment (HTTPS, SameSite).
- **API routes**: Mutating actions require session or API key; ensure no state-changing GET and that custom tokens are not guessable.

### 2.11 Mass order & bulk actions

- **Mass order**: Many orders in one request can be created; consider a cap per request and per user per day to limit abuse and load.

### 2.12 Admin actions

- **Sensitive admin actions** (user balance, delete user, payment config, etc.): Ensure only intended admin roles can call these; consider audit logging for balance changes, user edits, and payment/config changes.

---

## 3. Recommendations (summary)

1. **Enforce server-side bounds** for all user/API-editable fields (done for speed, delays, interval, position, quantity min, profile-scan numbers).
2. **Add rate limiting** on login, signup, forgot-password, orders, and API v1.
3. **Harden auth**: Stronger password policy, optional email verification, and phase out MD5.
4. **Fix admin profile IDOR**: Do not allow updating another staff’s profile via body `staffId` unless explicitly authorized.
5. **Forgot password**: Unify response to avoid enumeration; actually send email; add rate limit.
6. **Webhooks**: Verify NOWPayments IPN signature if supported.
7. **Audit logging**: Log admin actions and high-value operations (balance, refunds, config).
8. **CSP and security headers**: Add Content-Security-Policy and other headers where applicable.

---

*Last updated: after patching exposed field values and scanning for security issues.*
