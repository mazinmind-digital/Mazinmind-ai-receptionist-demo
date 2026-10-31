# Cloudflare AI backend MVP

This is the first backend increment for MD-9. It adds a Cloudflare Worker API and a Workers AI binding while leaving the existing static demo unchanged.

## Routes

- `GET /health`: reports service availability and whether an AI binding is configured. It does not call the model.
- `POST /api/v1/chat`: accepts `{"message":"...","profile":"hvac|auto|general"}` and returns `{"reply":"...","provider":"cloudflare-workers-ai"}`.

## Local checks

Requires Node.js 20 or later.

```sh
npm run test:api
```

For a local Worker runtime, install Wrangler as a development dependency in a follow-up change or use the Cloudflare dashboard's Workers editor. Do not put credentials in the static frontend.

## Free-first deployment outline

1. Create/sign into a Cloudflare account and confirm Workers AI is available for the account and region.
2. Install Wrangler locally or use Cloudflare's dashboard.
3. Review `wrangler.toml`, especially `ALLOWED_ORIGINS` and the selected model ID.
4. Run `npx wrangler deploy` after installing Wrangler and authenticating. This deploys a Worker and can create a public workers.dev endpoint.
5. Set the final API URL as frontend configuration only after the API endpoint is deployed and tested. Never put provider credentials in browser code.
6. Confirm account usage limits and billing settings before exposing the endpoint to public traffic.

## Important limitations of this first increment

- No lead/conversation persistence or D1 binding yet.
- No tenant authentication or admin identity yet.
- The included in-memory rate limiter is best-effort per Worker isolate, not a global enforcement control. Do not treat it as production-grade abuse protection.
- CORS is not authentication; non-browser clients can call a public endpoint.
- The API fails closed when Workers AI is unavailable; it does not fall back to paid providers.
- Model outputs are not allowed to claim calls, texts, bookings, or CRM actions succeeded.
- Do not send real customer data until auth, retention, privacy, tenant isolation, and security review are complete.
