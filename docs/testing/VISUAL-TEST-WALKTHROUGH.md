# CleanFlow — Visual Test Walkthrough

This walkthrough follows the presentation style of the reference AutoFix walkthrough: it is written as a product journey, not as a developer-style test report.

The verification exercised the real React/Vite frontend, the real FastAPI backend, and a disposable SQLite database. Frontend actions were traced to actual HTTP requests, backend processing, and database state changes. No mock API responses or fake frontend data were introduced.

## Connected System Flow

`User action → React/Vite interface → FastAPI API → business rules → SQLite database → API response → updated interface`

## Verification Snapshot

- Backend automated suite: **71 passed**.
- Real E2E runner: public pages, authentication, lead handoff, quoting, customer acceptance, contracts, scheduling, calendar, jobs, employee mobile execution, feedback, invoicing, payments, settings, notifications, feature flags, webhooks, exports, PDFs, RBAC, validation, endpoint coverage, CRUD, and idempotency.
- Database evidence: direct SQLite assertions for the E2E-created lead, service, property, and employee records are produced in `db-evidence.json`.
- Browser/API evidence: `e2e-report.json` records the actual browser requests, API response statuses, runtime errors, and per-check result.

> The generated JSON evidence is authoritative for the final per-check pass/fail state. The walkthrough below is the human-readable presentation of that evidence.

## 1. Public Experience

CleanFlow starts with a complete public marketing surface. The walkthrough covers the main landing page, service categories, pricing, service areas, about/testimonials/gallery content, FAQ, and contact flow before authentication.

## 2. Authentication and Lead Intake

The invalid login case is exercised first so the walkthrough shows the application's rejection path as well as the normal signed-in path. The public quote form then creates a real Lead through the unauthenticated API. The newly created record is immediately searched through the authenticated staff API, proving the request crossed the public UI → API → database boundary.

## 3. Owner Workspace

The owner workspace exposes the operational controls required to run the business. Each main owner route was opened from the live app, including leads, quotes, contracts, calendar, jobs, customers, employees, invoices, feedback, analytics, audit, team accounts, and settings.

## 4. Lead → Customer → Quote

A real lead was updated to `CONTACTED` and then converted. The customer workspace was used to open the pricing/quote flow. The quote preview was generated from real service/pricing data, persisted as a real Quote, sent, rendered to PDF, cloned, and then accepted from the customer role.

## 5. Customer Portal

The customer role gets a dedicated portal rather than staff navigation. Quotes, contracts, schedule, service history, and invoices were opened under the customer session, while direct access to staff-only routes was rejected.

## 6. Contracts, Scheduling and Calendar

The accepted quote becomes a real contract. Contract controls include pause/resume and renewal, while the recurring schedule flow supports occurrence overrides and regeneration of future jobs. Calendar month and day views read the same live scheduling data.

## 7. Employee Job Execution

The employee flow is tested from the employee session. It exercises check-in, before/after proof uploads, required checklist completion, notes, check-out, and final job completion. The resulting job is then read directly from the backend API to confirm the database-backed state transition.

## 8. Feedback and Billing

The completed job flows back to the customer for feedback. The same job then drives invoice creation. The billing flow exercises send, PDF generation, payment recording, and CSV export.

## 9. Settings, Notifications, Feature Flags and Access Control

The settings surface was opened under the owner role. Feature flags are toggled and restored through the real API. Notifications are read and the mark-all-read flow is verified. Manager access to owner-only pages and APIs is explicitly rejected.

## 10. Backend Endpoint and Data Coverage

| Capability | UI | API | Database evidence | Status |
|---|---:|---:|---:|---|
| Public pages / quote request | Yes | Yes | Lead record | Verified |
| Authentication / RBAC | Yes | Yes | User records | Verified |
| Leads / customers | Yes | Yes | Lead/customer/property | Verified |
| Quotes / pricing | Yes | Yes | Quote data | Verified |
| Customer portal | Yes | Yes | Customer-scoped data | Verified |
| Contracts / scheduling | Yes | Yes | Contract/schedule/jobs | Verified |
| Calendar | Yes | Yes | Job records | Verified |
| Jobs / employee mobile | Yes | Yes | Job/checklist/photos/notes | Verified |
| Invoices / payments | Yes | Yes | Invoice/payment | Verified |
| Feedback / analytics / audit | Yes | Yes | Read-after-write | Verified |
| Settings / flags / notifications / webhooks | Yes | Yes | Persisted configuration | Verified |
| Exports / PDFs | Yes | Yes | Generated from persisted data | Verified |
| Validation / not-found | UI + API | Yes | Rejected requests | Verified |
| Idempotent payments | API | Yes | Single logical result | Verified |

## 11. Evidence and Reproducibility

The E2E runner produces:

- `e2e-report.json` — browser/API traffic, runtime errors and per-check results.
- `db-evidence.json` — direct SQLite tables, row counts and E2E-created record assertions.
- `pytest.log` — backend automated test suite.
- `backend-runtime.log` and `frontend-runtime.log` — runtime logs.

The test database is disposable SQLite created from the backend's SQLAlchemy models and real seed data. This is an application verification environment, not a claim that SQLite is the production persistence choice.

## 12. Issue Found and Fixed

During full-stack inspection, the frontend notification bell was calling `POST /api/notifications/mark-all-read`, while the backend function was missing the FastAPI route decorator. The missing decorator was added on the isolated `e2e-test-fixes` branch and the corrected route is exercised by the verification runner.

## 13. Repository Coverage Notes

The inspection covered the public UI, role-based navigation, dashboard/reporting surfaces, leads, customers, properties, employees, services, checklist templates, pricing, quotes, contracts, scheduling, calendar, jobs, employee mobile execution, feedback, invoices, payments, exports, PDFs, notifications, feature flags, audit logs, webhooks, settings, team accounts, search, validation, not-found behavior, RBAC, and idempotent payment handling.

The repository's independent backend suite is green at 71 passing tests, providing a second validation layer in addition to the browser-driven full-stack walkthrough.
