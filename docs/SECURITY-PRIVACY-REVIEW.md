# MD-13: Production security, privacy, and data-retention review

**Review date:** 2026-10-31  
**Scope:** Current main implementation of the Cloudflare Workers AI backend and the proposed next steps.  
**Disposition:** **NOT APPROVED for production or real customer data.** This is a code/configuration review, not a penetration test, legal opinion, privacy-law determination, or proof of Cloudflare account configuration.

## Executive summary

The current backend is a useful demo foundation, but it is not a production multi-tenant service. The most important blocker is that POST /api/v1/chat has no caller authentication. CORS only constrains compliant browsers; it does not prevent direct HTTP clients from calling a public Worker. The current in-memory rate limiter is per isolate and is not a reliable global cost/abuse control.

No conversation/lead persistence or application logging is currently implemented in the reviewed Worker. That reduces the current stored-data footprint, but it does not make sending real customer information appropriate: messages are sent to the model provider, and retention/consent/data-handling controls have not been verified end to end.

## Findings and required disposition

| ID | Severity | Finding / evidence | Required remediation | Gate |
|---|---|---|---|---|
| SEC-01 | **P0 Blocker** | POST /api/v1/chat accepts requests without an authenticated identity. Requests without an Origin header are allowed, and an allowed browser origin is not proof of identity. | Before public/real-customer use, choose an explicit access model. For a browser demo, use a short-lived, server-validated session/token or a properly designed public-demo abuse-control model; never embed a shared secret in static frontend code. Protect admin and tenant APIs separately. | Block production and customer data until reviewed and tested. |
| SEC-02 | **P0 Blocker** | There is no tenant identity or tenant-scoped authorization because multi-tenant storage and identity are not implemented yet. | Before adding persistence, derive tenant identity from verified server-side claims, never from a user-supplied tenantId. Scope every query and mutation to that identity. Add cross-tenant negative tests. | Required before D1 customer records or CRM integration. |
| SEC-03 | **P1 High** | requestWindows is an in-memory Map per Worker isolate. It can reset, fragment across isolates, and is not a global enforcement mechanism. | Add Cloudflare edge rate limiting or another shared enforcement mechanism, plus bounded request/body/output limits, per-IP and (after auth) per-tenant budgets, concurrency protection, and clear 429 behavior. Verify current plan/feature availability and cost before selection. | Required before open public traffic. |
| SEC-04 | **P1 High** | No verified retention/deletion policy or data-subject workflow exists. D1 persistence is not implemented. | Minimize fields; document purpose, retention duration, deletion trigger, deletion verification, backups/logs scope, and owner. Prefer not storing full chat transcripts by default. Use configurable TTL/cleanup and tenant-scoped deletion tests before enabling storage. | Required before storing leads/conversations. |
| SEC-05 | **P1 High** | User messages are forwarded to Workers AI. The code does not itself disclose provider data handling, retention, regional processing, or business-use terms. These account/model terms were not independently verified in this code review. | Verify current provider terms, data use, retention, processing location, and account settings for the intended use case. Publish an accurate privacy notice and obtain any required consent before collecting personal data. Do not promise zero retention without evidence. | Required before real customer data. |
| SEC-06 | **P1 High** | No admin authentication/authorization, key rotation procedure, or secret inventory is implemented because no external provider credentials are currently required by this binding. | Keep credentials server-side in platform secrets, never in Git, wrangler.toml vars, logs, or browser assets. For future integrations, document owner, least privilege, rotation, revocation, and incident steps. | Required before adding CRM, telephony, or other credentialed integrations. |
| SEC-07 | **P1 High** | No incident-response or security-event handling procedure is documented. | Define reporting contact, triage owner, containment/revocation, evidence preservation, impact assessment, customer/regulatory notification decision process, and recovery. Avoid logging message bodies, tokens, or personal data. | Required before production launch. |
| SEC-08 | **P2 Medium** | The GitHub Actions workflow uses major-version action tags (for example, actions/checkout@v4 and actions/setup-node@v4) rather than immutable commit SHAs. | Consider pinning third-party actions to reviewed full commit SHAs and using automated update tooling. Keep workflow permissions least-privilege. | Hardening; address before raising assurance requirements. |
| SEC-09 | **P2 Medium** | Current tests cover basic API validation, CORS, and provider error normalization, but do not establish auth, tenant isolation, global rate limiting, retention/deletion, redaction, or abuse resistance. | Add regression tests alongside each corresponding control. Add dependency/code scanning and a repeatable pre-release checklist. | Required tests must pass before production approval. |
| SEC-10 | **P2 Medium** | GET /health reveals whether the AI binding is configured (ai-configured versus ai-unavailable). This is low sensitivity but unnecessary operational detail for a public health endpoint. | Consider returning a generic liveness response publicly and keeping readiness/configuration diagnostics private or in platform monitoring. | Recommended hardening. |

## Data inventory and minimization

### Current code-reviewed behavior
- Receives a JSON message (up to 2,000 characters) and optional service profile.
- Sends the message and a server-defined system prompt to the Cloudflare Workers AI binding.
- Returns the generated reply; response caching is disabled.
- Does not currently write messages/leads to D1 or another application database.
- Does not intentionally log request bodies or model outputs in application code.
- A request may still be processed by Cloudflare infrastructure and the model provider. Their current processing/retention terms and account configuration were not verified in this review.

### Proposed minimum data model (only if persistence is approved)
- tenant_id: internal tenant identifier from verified identity, never user-controlled.
- lead_id: opaque random identifier.
- created_at, updated_at, expires_at: timestamps for lifecycle/retention.
- contact_method and the minimum contact value necessary for the requested follow-up.
- consent_status, consent_timestamp, and notice_version where applicable.
- summary rather than full transcript by default; transcript storage must be separately justified.
- Avoid payment card data, passwords, government IDs, precise location beyond business need, and other unnecessary sensitive data.

Retention duration is intentionally **TBD pending product purpose and legal/business review**; do not silently default to indefinite retention. Set a documented finite default before enabling persistence. Deletion must cover primary rows, derived summaries, exports, and any applicable logs/backups subject to documented platform constraints.

## Security architecture requirements

1. **Identity:** Select a documented browser/demo access model. Static frontend secrets are not secrets. Verify tokens server-side, enforce expiry/audience/issuer, and rate-limit unauthenticated traffic.
2. **Authorization / tenant isolation:** Bind all reads/writes to verified tenant claims. Reject missing identity on protected routes. Test tenant A cannot read, update, or delete tenant B records.
3. **Secrets:** Use Cloudflare secret bindings or equivalent secret manager for future credentials. No credentials in client bundles, plain config, commits, exceptions, or logs.
4. **Abuse and cost controls:** Use edge/shared rate limiting, quotas, maximum payload and output sizes, timeout, concurrency protection, and graceful quota exhaustion. Keep paid-provider fallback disabled unless explicitly approved.
5. **Privacy:** Collect only needed fields; disclose model-provider processing; obtain required consent; define retention/deletion and a process for requests; never log raw prompts, responses, tokens, or contact details by default.
6. **Application security:** Validate inputs, use parameterized SQL for D1, apply least privilege, protect admin routes, review dependencies/workflows, and add security regression tests.
7. **Operations:** Add alerting for error spikes and abuse without exposing message content; document incident response, rollback, credential revocation, and backup/recovery responsibilities.

## Acceptance criteria for MD-13

- [x] Reviewed current Worker, Wrangler configuration, API test coverage, and workflow configuration on main.
- [x] Recorded risks, severity, evidence, and remediation gates.
- [x] Recorded current data flows and explicitly separated code-reviewed facts from unverified provider/account behavior.
- [ ] Authentication/access model implemented and independently reviewed before public production use.
- [ ] Tenant-scoped authorization implemented and cross-tenant denial tests pass before persistence/CRM integration.
- [ ] Shared/edge rate limiting and abuse budget implemented and tested before public traffic.
- [ ] Privacy notice, consent decision, finite retention policy, and verified deletion process approved before collecting real customer data.
- [ ] Provider data terms and account configuration verified for intended business use.
- [ ] Incident response and secret rotation/revocation procedures documented and exercised.
- [ ] Security regression tests and CI checks pass; remaining risks are explicitly accepted by the product owner.

## Recommended sequence

1. Keep the current Worker demo-only. Do not deploy it as a production public endpoint or submit real customer information.
2. Decide the access model for the static GitHub Pages demo. Avoid a permanent shared browser token.
3. Implement authentication and shared/edge rate limiting before connecting D1 or external systems.
4. Define tenant identity and enforce tenant scoping in every data access path before any persistence.
5. Approve the privacy notice, consent requirements, finite retention window, and deletion behavior; then add minimal D1 storage with migrations and automated cleanup.
6. Add security regression tests, secret-handling procedures, and incident-response steps.
7. Re-run this review against the deployed configuration and actual provider terms before production approval.

## Review limitations

This assessment is based on repository source/configuration only. It does not include a live deployment review, Cloudflare account settings/billing review, formal penetration test, legal analysis, or verification of current vendor terms. Findings marked as blockers remain open until their remediation is implemented and tested.
