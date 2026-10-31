# MD-3 Validation Notes

**Issue:** MD-3 — Validate lead capture, dashboard, settings, and persistence  
**Scope:** Static Phase 1 browser demo only  
**Date:** 2026-10-31

## Verified behavior covered by Playwright

- Chat lead capture and urgent-request classification.
- Missed-call demo lead capture and visibility in the dashboard.
- Settings and leads persisted in the same browser after reload.
- Business profile switching.
- Dashboard search, status filtering, and status updates.
- Mobile viewport layout at 390 × 844 with no horizontal overflow.
- Recovery from malformed `mazinmind-demo` localStorage JSON.
- User-supplied lead strings are rendered as text rather than executable HTML.
- Missed-call recovery is visibly marked as a preview; the UI and save confirmation state that no SMS is sent.

## Product boundaries

This is not a connected telephony or messaging product. Chat is scripted, and leads/settings are stored in the current browser's localStorage. No real SMS, calls, emails, bookings, CRM writes, or calendar checks occur. The displayed message is a preview only. Do not enter real or sensitive customer information.

## Manual checks still required

Automated tests do not replace checking the published site on a real mobile device and reviewing browser console/network activity. Confirm the live GitHub Pages deployment, test with keyboard navigation, and check at least one additional narrow viewport before calling the demo fully accepted.

## Edge cases and follow-up risks

- Browser storage can be cleared by the user or browser policy; data is not backed up or shared across devices.
- Storage quota/security errors from localStorage writes are not currently handled explicitly.
- The prototype has no server-side validation, authentication, tenant isolation, consent workflow, or production data retention controls.
- Appointment requests are only captured as demo text; there is no connected calendar.
- The demo does not contact a human or emergency service for urgent requests. Urgency is a label in local demo data, not a dispatch guarantee.

## Run tests

The repository's browser smoke workflow runs the Playwright suite on pushes to `main` and pull requests targeting `main`. A passing CI run is required before merge.
