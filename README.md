# MazinMind AI Receptionist Demo

A responsive, static Phase 1 proof of concept for the AI receptionist offering at [MazinMind.digital](https://mazinmind.digital).

## Features
- Responsive landing page and navigation
- Three sample business profiles: HVAC/plumbing, auto repair, and general services
- Scripted receptionist chat and quick prompts
- Missed-call recovery preview and local demo lead capture
- Leads dashboard with search, status filters, and editable statuses
- Business settings saved in browser storage
- GitHub Pages deployment workflow

## Run locally
No build step, Node.js, API key, or external service is required. Run `python3 -m http.server 8080` and open `http://localhost:8080`, or open `index.html` in a modern browser.

## Important boundaries
This is **not production AI** yet. Chat responses are scripted and run in the browser. It does not place or answer phone calls, send SMS/email, check a real calendar, generate live quotes, or connect to a CRM/database. Leads and settings are stored only in the current browser. Do not enter sensitive or real customer information.

Before production, add a server-side API, authentication, consent and retention rules, error handling, observability, rate limiting, and real integrations. Keep API keys on the server, never in browser JavaScript.

## Deploy with GitHub Pages
1. Open repository **Settings → Pages**.
2. Choose **GitHub Actions** as the deployment source.
3. Push to `main`; the included workflow deploys the static site.
4. Find the published URL under Settings → Pages after the first successful workflow run.

## Suggested Phase 2
1. Server-side conversation API with business-specific guardrails.
2. Lead database with authentication and tenant separation.
3. Telephony and SMS integration with opt-in and delivery logs.
4. Calendar availability and appointment-request workflow.
5. CRM/webhook integrations, audit trail, monitoring, and deployment secrets.
6. Automated tests for conversation flows, validation, persistence, and accessibility.
