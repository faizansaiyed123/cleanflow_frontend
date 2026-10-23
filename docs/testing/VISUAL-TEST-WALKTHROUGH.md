# CleanFlow — Product Walkthrough

CleanFlow is a full-stack commercial cleaning operations platform for running the customer journey and the operations journey in one connected product.

A customer can discover services, request a quote, review quotes, manage contracts, see upcoming service, review invoices and follow their service history. The operations team can manage leads, customers, properties, services and pricing, quotes, contracts, schedules, jobs, employees, invoices, feedback, analytics, audit history, notifications, team accounts, settings and integrations. Field employees get a focused mobile experience for the work assigned to them.

This walkthrough is for someone looking at the product and trying to understand the complete experience from the outside in.

## The product at a glance

**Customer request → lead → quote → contract → recurring schedule → job → field execution → invoice → payment → customer history**

The product is connected end to end:

**User action → React/Vite interface → FastAPI API → business rules + authorization → database → API response → updated interface**

The screenshots in this document are generated from the real CleanFlow frontend against the real backend and seeded application data.

## How the product works

```mermaid
flowchart LR
  C[Customer] --> P[Customer portal]
  S[Owner / manager] --> W[Operations workspace]
  E[Field employee] --> M[Employee mobile]
  P --> A[FastAPI API]
  W --> A
  M --> A
  A --> R[Business rules + authorization]
  R --> DB[(Application database)]
  DB --> R --> A
  A --> P
  A --> W
  A --> M
```

## Public customer experience

### Home

![CleanFlow home](./visuals/01-home.png)

The public website introduces the cleaning business and gives a visitor a direct path into the service journey.

### Request a quote

![CleanFlow request a quote](./visuals/02-request-quote.png)

The quote form turns a visitor into a real business opportunity by collecting the property and service information needed for follow-up.

### Services

![CleanFlow services](./visuals/17-services.png)

The public site explains the available service offering.

### Commercial and residential cleaning

![Commercial cleaning](./visuals/18-commercial-cleaning.png)

![Residential cleaning](./visuals/19-residential-cleaning.png)

The public experience separates the major service stories instead of forcing every visitor through the same generic page.

### Pricing and service areas

![Pricing](./visuals/20-pricing.png)

![Service areas](./visuals/21-service-areas.png)

Visitors can understand pricing information and where the company operates before making a request.

### Trust and information

![About](./visuals/22-about.png)

![Testimonials](./visuals/23-testimonials.png)

![Gallery](./visuals/24-gallery.png)

![FAQ](./visuals/25-faq.png)

![Contact](./visuals/26-contact.png)

The remaining public pages cover company information, social proof, visual examples, common questions and direct contact.

## Sign in and choose the right workspace

![CleanFlow login](./visuals/03-login.png)

CleanFlow separates the experience by role. Owners and managers work in the operations workspace, employees get the field-mobile experience and customers get the portal.

## Owner and operations workspace

### Dashboard

![CleanFlow dashboard](./visuals/04-dashboard.png)

The dashboard gives the business a single operating picture: revenue, active contracts, upcoming work, completed jobs, invoices, leads and conversion signals.

### Leads

![CleanFlow leads](./visuals/05-leads.png)

Leads organize incoming opportunities and their progress toward becoming customers.

### Quotes

![CleanFlow quotes](./visuals/06-quotes.png)

Quotes turn customer requirements into a structured commercial proposal with connected pricing and customer data.

### Contracts

![CleanFlow contracts](./visuals/07-contracts.png)

Contracts carry the relationship beyond the sale and connect the customer agreement to recurring service.

### Calendar

![CleanFlow calendar](./visuals/08-calendar.png)

The calendar gives the operations team a visual view of scheduled service.

### Jobs

![CleanFlow jobs](./visuals/09-jobs.png)

Jobs are the operational work units that connect customers, properties, schedules and employees.

### Customers and properties

![CleanFlow customers](./visuals/10-customers.png)

Customer records keep the relationship, properties and service history together.

### Employees

![CleanFlow employees](./visuals/11-employees.png)

Employee management connects the workforce to the work that has to be completed in the field.

### Invoices

![CleanFlow invoices](./visuals/12-invoices.png)

Invoices turn completed service into a customer-facing financial record.

### Analytics

![CleanFlow analytics](./visuals/13-analytics.png)

Analytics brings business and operational performance into one view.

### Feedback

![CleanFlow feedback](./visuals/27-feedback.png)

Customer feedback feeds the service-quality side of the operations workflow.

### Audit and team accounts

![CleanFlow audit history](./visuals/28-audit.png)

![CleanFlow team accounts](./visuals/29-team-users.png)

Audit history records important activity, while team accounts let the owner control who can access the operational workspace.

### Settings and controls

![CleanFlow settings](./visuals/30-settings.png)

Settings provide the operational configuration surface, including feature controls used to manage how the platform behaves.

## Record details and the handoff between workflows

The list pages are not isolated screens. Each record can be opened and worked through its own lifecycle.

![Lead detail](./visuals/41-lead-detail.png)

![Quote detail](./visuals/31-quote-detail.png)

![Contract detail](./visuals/32-contract-detail.png)

![Job detail](./visuals/33-job-detail.png)

![Customer detail](./visuals/34-customer-detail.png)

![Invoice detail](./visuals/35-invoice-detail.png)

This is where the same customer and operational data gets progressively richer: a lead can become a quote, a quote can become a contract, a contract produces scheduled work and jobs, and completed work feeds billing and history.

## Customer portal

### Customer home and quotes

![Customer portal](./visuals/14-customer-portal.png)

![Customer quotes](./visuals/15-customer-quotes.png)

The customer sees a focused version of the relationship without entering the internal operations workspace.

### Customer contracts, schedule, history and invoices

![Customer contracts](./visuals/36-customer-contracts.png)

![Customer schedule](./visuals/37-customer-schedule.png)

![Customer history](./visuals/38-customer-history.png)

![Customer invoices](./visuals/39-customer-invoices.png)

The portal continues the relationship after the sale: agreements, upcoming service, history and financial documents remain visible in one place.

## Field operations

### Employee mobile

![Employee mobile](./visuals/16-employee-mobile.png)

The field employee gets a mobile-sized workflow centered on today's assigned work.

### Employee job detail

![Employee job detail](./visuals/40-employee-job-detail.png)

The job detail screen is where the field workflow becomes actionable. The wider system supports checklist completion, proof photos/uploads, notes, check-in/out and job completion gating.

## Billing, payments, notifications and integrations

Once service is delivered, CleanFlow keeps the rest of the relationship connected:

**Job completed → customer feedback → invoice → payment → customer history**

Behind those screens are shared platform capabilities for notifications, audit history, role-based access, feature flags, uploads, webhooks, search, configuration and reporting. They are not separate products; they support the same end-to-end workflow shown above.

## A real persistence story

A customer request can enter through the public experience, become a lead for the operations team, move into quoting and contract management, create scheduled work, produce jobs for employees and eventually appear in billing and the customer's history.

The same principle is used throughout the product:

**Create or change something in the interface → the backend processes it → the application stores it → another screen reads the updated record back**

## Feature map

| Area | What it is for |
|---|---|
| Public website | Service discovery, pricing, service areas, trust, FAQ and contact |
| Quote requests | Turn customer interest into business opportunities |
| Authentication & roles | Separate owner, manager, employee and customer experiences |
| Dashboard | Operational overview |
| Leads | Track and progress new opportunities |
| Customers & properties | Manage customer relationships and service locations |
| Services & pricing | Reusable service definitions, rates and quote inputs |
| Quotes | Customer-facing commercial proposals |
| Contracts | Ongoing service agreements |
| Scheduling & calendar | Recurring and future service planning |
| Jobs | Operational service work |
| Employee mobile | Field execution experience |
| Checklists, notes & proof uploads | Capture completion evidence in the field |
| Invoices & payments | Billing and money received |
| Feedback | Customer service experience |
| Analytics & reports | Business and operational visibility |
| Audit log | Activity history |
| Notifications | Important activity and status communication |
| Team accounts | Owner/manager access administration |
| Customer portal | Quotes, contracts, schedule, history and invoices |
| Settings & feature flags | Platform configuration and controlled behavior |
| Search | Operational discovery across records |
| Webhooks & integrations | Connected-system events and integration endpoints |

## The complete flow

**Public website → request → lead → quote → contract → schedule → calendar → job → employee mobile → checklist/proof → feedback → invoice → payment → customer portal/history**

That single flow is the core of CleanFlow: customer-facing experience, business operations, field execution and billing are connected rather than being separate tools.
