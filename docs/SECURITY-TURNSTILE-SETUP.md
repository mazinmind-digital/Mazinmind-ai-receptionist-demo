# Turnstile protection for the AI chat API

## What this changes

The `POST /api/v1/chat` endpoint now requires a Turnstile token in the JSON field `turnstileToken`. The Worker validates that token server-side using Cloudflare Siteverify before invoking Workers AI. Missing secrets, missing tokens, invalid tokens, and Siteverify failures are rejected with a generic `403 CHALLENGE_REQUIRED` response. The public `/health` response no longer exposes whether the AI binding is configured.

Turnstile is an abuse-control signal, **not user authentication, tenant authorization, or a complete rate limiter**. Do not treat a successful challenge as proof of a user's identity. The current in-memory request limiter is still per Worker isolate and must be supplemented by edge/shared rate limiting before open public traffic.

## Cloudflare configuration

1. In the Cloudflare dashboard, create a Turnstile widget for the intended demo hostname(s). Use the least permissive hostname configuration appropriate for the deployment.
2. Configure the widget's **site key** in the browser UI when the frontend is wired to the API. A site key is public; it is not a secret.
3. Set the secret on the Worker using the Wrangler secret store from a trusted terminal:

   ```sh
   npx wrangler secret put TURNSTILE_SECRET_KEY
   ```

4. Never add the secret to `wrangler.toml` vars, HTML, browser JavaScript, Git, or logs.
5. Deploy only after the widget's site key and API request flow are integrated and tested. The current static demo remains scripted; this PR does not wire the frontend to the AI API.
6. Test a missing token, invalid token, valid token, unavailable Siteverify, and origin rejection. Confirm that no failed challenge reaches Workers AI.

## Remaining production gates

- Configure Cloudflare edge/shared rate limiting and cost budgets; this code's in-memory limiter is best effort only.
- Implement verified identity and tenant-scoped authorization before persistence or CRM integrations.
- Approve privacy/consent, provider terms, retention/deletion, and incident response.
- Re-review the deployed Worker and account configuration. This change alone does not approve production use or real customer data.
