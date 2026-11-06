# MazinMind AI Receptionist Demo — Project Roadmap

Updated: 2026-11-04

## Current state

- Public demo: https://mazinmind-digital.github.io/Mazinmind-ai-receptionist-demo/
- Latest verified main-branch workflows (2026-11-01): Pages deploy, browser smoke tests, backend API tests, and Aikido security scan all passed. See Actions run IDs 41337608615, 41337608627, 41337608579, and 41337608685.

- [x] Repository exists: `mazinmind-digital/Mazinmind-ai-receptionist-demo`
- [x] Static responsive interface added (`index.html`, `styles.css`, `app.js`)
- [x] Demo business profiles: HVAC/plumbing, auto repair, general service
- [x] Scripted receptionist conversation and lead capture
- [x] Browser-local leads dashboard and demo settings
- [x] README, .gitignore, and GitHub Pages workflow added
- [x] Verified all core files can be read back from GitHub
- [x] Identified first workflow failure: GitHub Pages site was not enabled/configured for the custom workflow
- [x] Updated Pages workflow to allow the Pages setup action to enable Pages
- [x] Verify the latest Pages workflow run completes successfully
- [x] Confirm the public site URL from the successful deployment logs
- [ ] Open the published site on mobile
- [ ] Manually test the chat, lead form, dashboard filters/status changes, and settings
- [x] Add JavaScript syntax validation and required-file checks to CI
- [x] Add browser-based smoke tests for navigation, lead capture, dashboard, settings, and responsive layout

## Phase 1: Publish and verify

1. Open the Actions tab and inspect the latest `Deploy static demo to GitHub Pages` run.
2. Confirm all steps pass, especially Configure Pages and Deploy.
3. Open repository Settings → Pages and copy the public URL.
4. On a phone, verify the page loads and all three navigation tabs work.
5. Run test cases:
   - Change business profile.
   - Ask a pricing question.
   - Submit a lead through chat.
   - Submit a missed-call lead.
   - Search/filter leads and change a lead status.
   - Save settings, refresh, and confirm local persistence.
6. Confirm the demo disclaimer is visible and no real messages are sent.

Acceptance criteria: public site loads over HTTPS, no console/runtime errors, and the listed flows behave as expected on mobile and desktop.

## Phase 2: Production architecture

- [x] Select Cloudflare Workers AI for the separate API MVP; complete production model, cost, latency, privacy, and reliability review before customer use.
- [x] Add a separate Cloudflare Workers AI API MVP; provider credentials remain server-side.
- [ ] Complete caller authentication, tenant identity/isolation, and production access control.
- [ ] Define tenant/business configuration, system prompts, approved FAQs, escalation rules, and fallback behavior.
- [ ] Store leads in a real database with tenant separation, validation, retention rules, and access control.
- [ ] Add authentication for business owners and an admin dashboard.
- [ ] Add rate limits, abuse protection, request IDs, error handling, logs, metrics, and alerts.
- [x] Add automated backend API tests and browser-based smoke tests.
- [ ] Configure staging deployment and validate production security controls.

Acceptance criteria: authenticated users only access their own business data; secrets are server-side; failures are observable; no fake claims about actions the system did not complete.

## Current backend API status (separate from the public static demo)

A Cloudflare Worker API MVP exists at `worker/src/index.js` with a Workers AI binding, Turnstile challenge, exact-origin CORS, request/body/output limits, best-effort per-isolate rate limiting, timeout, and stable provider error handling. It is not wired into the public static frontend and is not approved for real customer data. The security review in `docs/SECURITY-PRIVACY-REVIEW.md` is **NOT APPROVED** for production: caller authentication and tenant isolation are missing, the rate limiter is not globally consistent, and retention/deletion and incident-response controls are incomplete. The current public chat remains scripted/browser-local.\n\n## Phase 3: Real communications and scheduling

- [ ] Select telephony provider and provision a test number.
- [ ] Add inbound call flow, business-hours rules, call transfer, voicemail fallback, and human escalation.
- [ ] Add SMS follow-up with consent, opt-out handling, delivery status, and applicable legal compliance.
- [ ] Integrate a calendar with availability checks, timezone handling, booking confirmation, cancellation, and rescheduling.
- [ ] Add CRM/webhook integration with retries and duplicate protection.
- [ ] Test provider outages and human handoff.

Acceptance criteria: test calls and messages complete end-to-end in a sandbox; opt-outs are honored; appointments are checked against the real calendar; failure paths are tested.

## Phase 4: Sellable service

- [ ] Create an onboarding form for each business.
- [ ] Define packages, setup fee, monthly price, usage limits, and support boundaries.
- [ ] Create a demo script and sample lead report.
- [ ] Add terms, privacy notice, data retention policy, and customer consent language.
- [ ] Run a pilot with one friendly business and measure leads captured, missed calls recovered, bookings requested, and handoff success.
- [ ] Collect feedback and revise before broad sales.

## Security and product boundaries

The public prototype is a browser-only demonstration. Chat replies are scripted; lead/settings data live in browser localStorage; there are no real calls, SMS, email, calendar, or production CRM handoff. A separate Cloudflare Worker API MVP exists but is not wired into the public frontend and is not approved for real customer data. Do not enter real or sensitive customer data until authentication, tenant isolation, durable storage, retention/deletion, and privacy controls are implemented.

## Decision log

- Deployment target: GitHub Pages for the static prototype.
- Current frontend: plain HTML, CSS, and JavaScript; no build step.
- Current storage: browser localStorage only.
- Next immediate priority: get a clean Pages workflow run and verify the live mobile demo before adding backend complexity.
