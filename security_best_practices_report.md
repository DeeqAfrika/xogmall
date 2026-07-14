# Xogmall security review

## Executive summary

The cloned application has been reviewed as a Next.js 16, React 19, TypeScript, and Supabase application handling private onboarding documents. One high-impact authorization gap inherited from the source was fixed before publication. No known critical or high-severity issue remains in the reviewed code. Hosted Supabase policy testing and advisors still must run after the migrations are applied to the new project.

## Fixed findings

### SEC-001 — applicant could change privileged review fields

- Severity: High
- Location: `supabase/migrations/20260701120000_agent_onboarding.sql` applicant update policy; fixed by `supabase/migrations/20260714124640_harden_xogmall_access_controls.sql:14`
- Evidence: the inherited policy limited updates by `user_id` but did not limit status, reviewer, review timestamp, or admin-note changes.
- Impact: an authenticated applicant could have attempted to self-approve or falsify review data on their own row.
- Fix: a security-invoker trigger now blocks applicant writes to review fields and enforces allowed status transitions. Admin authorization remains based on non-user-editable `app_metadata`.

### SEC-002 — sensitive tables were enabled for RLS but not forced

- Severity: Medium
- Location: `supabase/migrations/20260714124640_harden_xogmall_access_controls.sql:4`
- Evidence: inherited migrations used `ENABLE ROW LEVEL SECURITY` only.
- Impact: table-owner execution paths could bypass RLS unexpectedly.
- Fix: RLS is now forced for rates, agents, site content, applications, and document metadata.

### SEC-003 — baseline response hardening headers absent

- Severity: Low
- Location: `next.config.ts`
- Impact: browsers lacked explicit MIME-sniffing, framing, referrer, and unused-capability restrictions from application configuration.
- Fix: added `nosniff`, frame denial, strict-origin referrer policy, and a restrictive permissions policy. A nonce-based CSP should be evaluated with the final production integrations rather than adding unsafe inline allowances.

## Verified controls

- Admin API routes validate an authenticated JWT and `app_metadata.role = admin` server-side.
- The service-role client is isolated to a server module and uses a non-public environment variable.
- Private document downloads require admin authorization and return `Content-Disposition: attachment` with `private, no-store` caching.
- The onboarding bucket is private and limited to PDF/JPEG/PNG files up to 10 MB.
- Storage policies namespace applicant objects by authenticated user ID; admins alone receive cross-applicant read access.
- Public policies expose only the active rate, published agents, and published site content.
- Applicant application/document policies enforce row ownership.
- Privileged database functions revoke execution from `PUBLIC` and `anon`, then perform explicit app-metadata authorization checks.
- `.env.local`, `.vercel`, private keys, and local Supabase link state are ignored.
- No credentials, personal records, old applicant data, or storage objects are present in the repository.

## Remaining verification

- Apply migrations to the empty Xogmall project and run Supabase database/security advisors.
- Exercise anon, applicant, non-admin authenticated, admin, and service-role access cases against the hosted project.
- Verify Auth redirect allowlists, password policy, MFA expectations for admins, rate limiting, and production email configuration in the Supabase dashboard.
- Validate production response headers and add a nonce-based Content Security Policy after final portal, analytics, and third-party integrations are known.
