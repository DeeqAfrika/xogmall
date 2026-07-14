# Xogmall

Independent Xogmall-branded Next.js application with a public GBP/USD calculator, rate publishing, agent locator and management, agent onboarding with private document uploads, admin review, content management, and PDF/DOCX exports.

This repository must remain isolated from every other brand's database, authentication users, storage, Vercel project, environment variables, domains, and customer data.

## Technology

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4
- Supabase Postgres, Auth, Storage, and Row Level Security
- `pdf-lib` and DOCX templates for admin exports
- Vercel deployment

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add only Xogmall development credentials to `.env.local`. Never use credentials from another project. When public Supabase configuration is missing, the website still renders and the public rate shows a safe temporary-unavailable state.

## Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Xogmall Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public | Preferred browser-safe Supabase key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public, legacy | Fallback browser-safe anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin bootstrap and server-side private downloads |
| `ADMIN_EMAIL` | Local/server only | Initial admin bootstrap |
| `ADMIN_PASSWORD` | Local/server only | Initial admin bootstrap |
| `ADMIN_FULL_NAME` | Local/server only | Initial admin display name |
| `NEXT_PUBLIC_CUSTOMER_PORTAL_URL` | Public | Approved customer portal URL |
| `NEXT_PUBLIC_AGENT_PORTAL_URL` | Public | Approved agent portal URL |
| `NEXT_PUBLIC_SITE_URL` | Public | Approved deployed website URL |

Never prefix a service-role key, password, or other secret with `NEXT_PUBLIC_`.

## Fresh Supabase setup

The intended project reference is `tucdbycpgfvcceauttyb`. The URL is configured only through `NEXT_PUBLIC_SUPABASE_URL`; it is not hardcoded into application modules.

1. Install/login to the Supabase CLI.
2. Link this checkout to the Xogmall project only:

   ```bash
   npx supabase login
   npx supabase link --project-ref tucdbycpgfvcceauttyb
   ```

3. Review the target shown by `npx supabase status` or `npx supabase migration list` before making changes.
4. Apply the migrations:

   ```bash
   npx supabase db push
   ```

5. Confirm the `agent-application-documents` bucket is private, limited to 10 MB, and permits only PDF/JPEG/PNG.
6. Run Supabase database/security advisors and resolve findings before production.
7. Do not import users, rate history, agents, applications, content, document metadata, or storage objects. `supabase/seed.sql` is intentionally empty.

Migrations create the rate, agent, content, application, and document-metadata tables; indexes and update triggers; the private storage bucket and policies; public published-record policies; applicant ownership policies; admin policies; and privileged admin/rate functions.

### Initial admin

Set `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and the three `ADMIN_*` variables in `.env.local`, then run:

```bash
npm run admin:create
```

The script uses Supabase Admin Auth from the server and stores authorization in `app_metadata`, not user-editable metadata. Remove `ADMIN_PASSWORD` from the local environment after bootstrap. Do not commit credentials.

## Security model

- RLS is enabled and forced on exposed application tables.
- Public users can read only the active rate, published agents, and published content.
- Applicants can access only their own application and document metadata.
- A database trigger prevents applicants from assigning reviewers, writing admin notes, or self-approving.
- Onboarding objects are private and namespaced by authenticated user ID.
- Admin route handlers validate signed claims and the `app_metadata.role = admin` authorization claim server-side.
- Service-role access is confined to server-only modules.
- Upload type and 10 MB size restrictions exist in both the UI and bucket configuration.
- Private-download and export responses use `private, no-store` caching.

## New Vercel project

Create a new Vercel project from this repository. Do not link or reuse another brand's Vercel project or `.vercel` directory.

Configure these variables separately for Preview and Production as appropriate:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_CUSTOMER_PORTAL_URL
NEXT_PUBLIC_AGENT_PORTAL_URL
NEXT_PUBLIC_SITE_URL
```

The service-role key is server-only. After the first deploy, add the exact preview/production URLs to Supabase Auth URL configuration, validate a preview deployment, and promote the same verified artifact to production.

## Quality checks

```bash
npm run lint
npm run build
```

Manually verify the homepage, two-way calculator, mobile navigation, agent directory, onboarding/account flow, upload restrictions, submission, admin login and access denial, rate publishing/history, agent and application review, document downloads, PDF/DOCX exports, logout, empty states, and missing-configuration behavior.

## Remaining launch requirements

The current logos are clearly temporary generated placeholders. Before launch, Xogmall must provide and approve:

- official logo and brand colours
- legal company name, company number, and registered address
- contact telephone, contact email, and support email
- website, customer portal, and agent portal URLs
- supported countries and service descriptions
- regulatory wording and verified status/references
- privacy policy, terms, complaints, cookies, and accessibility wording
- approved agent agreement, application, and consent documents
- social links

The repository is currently public. Change it to private before production development, and never commit personal or confidential data even after doing so.
