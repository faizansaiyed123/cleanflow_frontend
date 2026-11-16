# CleanFlow interactive demo

This `demo` branch includes a browser-only simulation of CleanFlow's commercial-cleaning workflow. It is designed to be explored without a deployed API, database, environment variables, or external services.

## Start

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`, select **Explore Interactive Demo**, and sign in using one of the accounts below.

## Demo accounts

All accounts use password `Demo1234!`.

| Role | Email |
|---|---|
| Owner | `owner@cleanflow.demo` |
| Manager | `manager@cleanflow.demo` |
| Employee | `employee@cleanflow.demo` |
| Customer | `customer@cleanflow.demo` |

## Suggested walkthrough

1. **Owner or Manager:** review the dashboard, leads, itemized pricing, quotes, contract lifecycle, recurring schedules, calendar, employee assignments, jobs, invoices, reports, notifications, and settings.
2. **Customer:** review the customer portal, accept a sent quote, inspect contracts/scheduled work, review completed service history, and view invoices.
3. **Employee:** open today's assigned job, check in, complete required checklist items, add before/after proof-photo placeholders, add notes, check out, and complete the job.
4. Submit a new public quote request from the website and then sign in as staff to see the new lead appear in the pipeline.

## What is simulated

- App data reads and writes are handled by `src/demo/demoApi.js` and stored in this browser's localStorage under `cleanflow_demo_state_v1`.
- Refreshing the page preserves changes on the same browser. Use **Reset sample data** in the signed-in app banner to restore the seeded walkthrough.
- Quote and invoice PDF actions open a locally generated HTML print preview, not a server PDF.
- Employee photo uploads create local proof-photo records/placeholders; image files are not uploaded.
- Quote requests, quote/invoice send actions, notifications, webhook actions, and payments are simulations. No email, webhook request, external message, or real payment is sent or charged.
- The browser-only app does not attempt to connect to the optional FastAPI backend. The Settings health panel identifies this as **LOCAL DEMO**, not as a live backend health result.

## Optional backend project

The companion backend repository has a separate `demo` branch and `demo.py` runner for local API exploration. The frontend demo does not need it. The backend runner uses an isolated disposable SQLite database under its own `.demo/` directory, disables the background worker, and binds only to `127.0.0.1`. See that repository's `DEMO.md` before starting it.

## Checks

```bash
npm ci
npm run lint
npm run build
```
