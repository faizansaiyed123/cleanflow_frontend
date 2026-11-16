// Browser-only CleanFlow demo API. All writes stay in this browser's localStorage.
export const DEMO_MODE = true;
export const DEMO_PASSWORD = 'Demo1234!';
export const DEMO_PHOTO_PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="#e7eee8"/><path d="M0 250L125 145l78 65 91-108 186 148v70H0z" fill="#b8cbbd"/><circle cx="350" cy="88" r="30" fill="#d7c58e"/><text x="240" y="294" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#385846">CleanFlow sample proof photo</text></svg>')}`;
const STORAGE_KEY = 'cleanflow_demo_state_v1';
const SESSION_PREFIX = 'cleanflow-demo:';

const id = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
const iso = (days = 0, hour = 9, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const clone = (value) => JSON.parse(JSON.stringify(value));

const USERS = [
  { id: 'user-owner', email: 'owner@cleanflow.demo', full_name: 'Alex Rivera', role: 'OWNER' },
  { id: 'user-manager', email: 'manager@cleanflow.demo', full_name: 'Jordan Blake', role: 'MANAGER' },
  { id: 'user-employee', email: 'employee@cleanflow.demo', full_name: 'Maria Gonzalez', role: 'EMPLOYEE', employee_id: 'emp-maria' },
  { id: 'user-customer', email: 'customer@cleanflow.demo', full_name: 'Morgan Ellis', role: 'CUSTOMER', customer_id: 'cust-ellis' },
];

function makeState() {
  const checklist = () => [
    ['Empty all trash and recycling bins', true],
    ['Vacuum all carpeted areas', true],
    ['Mop hard-surface floors', true],
    ['Clean and disinfect restrooms', true],
    ['Wipe down desks and common surfaces', true],
    ['Clean interior glass and doors', false],
    ['Restock restroom and kitchen supplies', true],
    ['Clean kitchen / break room', true],
  ].map(([label, is_required], sort_order) => ({
    id: id('check'), label, is_required, sort_order, is_completed: false, completed_at: null, note: null,
  }));

  const customers = [
    {
      id: 'cust-ellis', company_name: 'Ellis & Co. Consulting', contact_name: 'Morgan Ellis',
      email: 'customer@cleanflow.demo', phone: '(555) 555-0199', billing_address: '800 Commerce St, Austin, TX 78702',
      notes: 'Primary demo customer. Weekly office cleaning.', is_archived: false, created_at: iso(-35),
      properties: [{
        id: 'prop-ellis', customer_id: 'cust-ellis', label: 'Ellis & Co. HQ', address_line1: '800 Commerce St',
        city: 'Austin', state: 'TX', zip_code: '78702', property_type: 'OFFICE', square_footage: 3000,
        bathrooms: 3, floors: 2, full_address: '800 Commerce St, Austin, TX 78702',
      }],
    },
    {
      id: 'cust-northgate', company_name: 'Northgate Realty', contact_name: 'Casey Morgan',
      email: 'casey@northgate.demo', phone: '(555) 555-0120', billing_address: '200 Market St, Austin, TX 78703',
      notes: '', is_archived: false, created_at: iso(-24),
      properties: [{
        id: 'prop-northgate', customer_id: 'cust-northgate', label: 'Main Location', address_line1: '200 Market St',
        city: 'Austin', state: 'TX', zip_code: '78703', property_type: 'OFFICE', square_footage: 2200,
        bathrooms: 2, floors: 1, full_address: '200 Market St, Austin, TX 78703',
      }],
    },
    {
      id: 'cust-lakeside', company_name: 'Lakeside Family Medicine', contact_name: 'Robin Torres',
      email: 'robin@lakesidemed.demo', phone: '(555) 555-0121', billing_address: '200 Market St, Austin, TX 78703',
      notes: 'Medical-grade cleaning protocols.', is_archived: false, created_at: iso(-18),
      properties: [{
        id: 'prop-lakeside', customer_id: 'cust-lakeside', label: 'Clinic', address_line1: '200 Market St',
        city: 'Austin', state: 'TX', zip_code: '78703', property_type: 'MEDICAL', square_footage: 3100,
        bathrooms: 5, floors: 1, full_address: '200 Market St, Austin, TX 78703',
      }],
    },
    {
      id: 'cust-union', company_name: 'Union Square Retail', contact_name: 'Jamie Foster',
      email: 'jamie@unionsquare.demo', phone: '(555) 555-0122', billing_address: '200 Market St, Austin, TX 78703',
      notes: '', is_archived: false, created_at: iso(-12),
      properties: [{
        id: 'prop-union', customer_id: 'cust-union', label: 'Retail Store', address_line1: '200 Market St',
        city: 'Austin', state: 'TX', zip_code: '78703', property_type: 'RETAIL', square_footage: 4000,
        bathrooms: 2, floors: 1, full_address: '200 Market St, Austin, TX 78703',
      }],
    },
  ];

  const employees = [
    { id: 'emp-maria', full_name: 'Maria Gonzalez', email: 'maria@cleanflow.demo', phone: '(555) 555-0101', hourly_rate: 19.5, skills: ['floors', 'windows'], availability: { MON: [['08:00', '17:00']], TUE: [['08:00', '17:00']], WED: [['08:00', '17:00']], THU: [['08:00', '17:00']], FRI: [['08:00', '17:00']] }, profile_photo_url: null, is_active: true },
    { id: 'emp-james', full_name: 'James Carter', email: 'james@cleanflow.demo', phone: '(555) 555-0102', hourly_rate: 21, skills: ['medical-grade', 'floors'], availability: { MON: [['08:00', '17:00']], TUE: [['08:00', '17:00']], WED: [['08:00', '17:00']], THU: [['08:00', '17:00']], FRI: [['08:00', '17:00']] }, profile_photo_url: null, is_active: true },
    { id: 'emp-priya', full_name: 'Priya Patel', email: 'priya@cleanflow.demo', phone: '(555) 555-0103', hourly_rate: 20, skills: ['carpets', 'windows'], availability: { MON: [['08:00', '17:00']], TUE: [['08:00', '17:00']], WED: [['08:00', '17:00']], THU: [['08:00', '17:00']], FRI: [['08:00', '17:00']] }, profile_photo_url: null, is_active: true },
    { id: 'emp-devon', full_name: 'Devon Brooks', email: 'devon@cleanflow.demo', phone: '(555) 555-0104', hourly_rate: 18.5, skills: ['floors', 'supplies'], availability: { MON: [['08:00', '17:00']], TUE: [['08:00', '17:00']], WED: [['08:00', '17:00']], THU: [['08:00', '17:00']], FRI: [['08:00', '17:00']] }, profile_photo_url: null, is_active: true },
  ];

  const leads = [
    { id: 'lead-downtown', reference_number: 'LEAD-0101', contact_name: 'Sam Whitfield', company_name: 'Downtown Legal Group', email: 'sam@downtownlegal.demo', phone: '(555) 555-0111', address_line1: '123 Business Ave', city: 'Austin', state: 'TX', zip_code: '78701', property_type: 'OFFICE', square_footage: 4200, bathrooms: 3, floors: 2, frequency: 'WEEKLY', requested_services: ['Standard Commercial Cleaning'], requested_addons: [], notes: 'After-hours access available.', source: 'WEBSITE', status: 'NEW', estimated_value: 336, created_at: iso(-2), last_contacted_at: null, converted_customer_id: null },
    { id: 'lead-riverside', reference_number: 'LEAD-0102', contact_name: 'Dana Kim', company_name: 'Riverside Dental', email: 'dana@riversidedental.demo', phone: '(555) 555-0112', address_line1: '45 River Rd', city: 'Austin', state: 'TX', zip_code: '78702', property_type: 'MEDICAL', square_footage: 2100, bathrooms: 4, floors: 1, frequency: 'WEEKLY', requested_services: ['Medical-Grade Cleaning'], requested_addons: [], notes: 'Needs documented disinfection.', source: 'PHONE', status: 'CONTACTED', estimated_value: 168, created_at: iso(-5), last_contacted_at: iso(-3), converted_customer_id: null },
    { id: 'lead-metro', reference_number: 'LEAD-0103', contact_name: 'Chris Lee', company_name: 'Metro Fitness Studio', email: 'chris@metrofitness.demo', phone: '(555) 555-0113', address_line1: '77 Fitness Way', city: 'Austin', state: 'TX', zip_code: '78703', property_type: 'RETAIL', square_footage: 5200, bathrooms: 3, floors: 1, frequency: 'DAILY', requested_services: ['Standard Commercial Cleaning'], requested_addons: ['Interior Window Cleaning'], notes: '', source: 'REFERRAL', status: 'QUALIFIED', estimated_value: 416, created_at: iso(-8), last_contacted_at: iso(-4), converted_customer_id: null },
    { id: 'lead-warehouse', reference_number: 'LEAD-0104', contact_name: 'Pat Nguyen', company_name: 'Sunridge Warehouse', email: 'pat@sunridge.demo', phone: '(555) 555-0114', address_line1: '90 Logistics Dr', city: 'Austin', state: 'TX', zip_code: '78704', property_type: 'WAREHOUSE', square_footage: 15000, bathrooms: 2, floors: 1, frequency: 'MONTHLY', requested_services: ['Deep Clean'], requested_addons: [], notes: '', source: 'WEBSITE', status: 'NEW', estimated_value: 1200, created_at: iso(-1), last_contacted_at: null, converted_customer_id: null },
    { id: 'lead-cafe', reference_number: 'LEAD-0105', contact_name: 'Taylor Reed', company_name: 'Blue Oak Cafe', email: 'taylor@blueoak.demo', phone: '(555) 555-0115', address_line1: '19 Oak St', city: 'Austin', state: 'TX', zip_code: '78705', property_type: 'RESTAURANT', square_footage: 1800, bathrooms: 2, floors: 1, frequency: 'WEEKLY', requested_services: ['Standard Commercial Cleaning'], requested_addons: [], notes: '', source: 'WALK_IN', status: 'LOST', estimated_value: 144, created_at: iso(-20), last_contacted_at: iso(-19), converted_customer_id: null },
    { id: 'lead-ellis', reference_number: 'LEAD-0106', contact_name: 'Morgan Ellis', company_name: 'Ellis & Co. Consulting', email: 'customer@cleanflow.demo', phone: '(555) 555-0199', address_line1: '800 Commerce St', city: 'Austin', state: 'TX', zip_code: '78702', property_type: 'OFFICE', square_footage: 3000, bathrooms: 3, floors: 2, frequency: 'WEEKLY', requested_services: ['Standard Commercial Cleaning'], requested_addons: ['Refrigerator/Kitchen Deep Clean'], notes: 'Weekly office service.', source: 'WEBSITE', status: 'QUOTED', estimated_value: 240, created_at: iso(-35), last_contacted_at: iso(-30), converted_customer_id: 'cust-ellis' },
  ];

  const makeBreakdown = (squareFootage = 3000, bathrooms = 3, floors = 2, addon = 35) => {
    const line_items = [
      { label: 'Base service', amount: 100 },
      { label: `Square footage (${squareFootage.toLocaleString()} sq ft)`, amount: money(squareFootage * 0.05) },
      { label: `Bathrooms (${bathrooms})`, amount: money(bathrooms * 15) },
      { label: 'Additional floors', amount: money(Math.max(0, floors - 1) * 10) },
      { label: 'Weekly frequency adjustment', amount: -39 },
      { label: 'Supplies', amount: 15 },
    ];
    if (addon) line_items.push({ label: 'Refrigerator/Kitchen Deep Clean', amount: addon });
    const total = money(line_items.reduce((sum, item) => sum + item.amount, 0));
    return { line_items, subtotal: total, total };
  };

  const quotes = [
    {
      id: 'quote-accepted', reference_number: 'QUO-0201', lead_id: 'lead-ellis', customer_id: 'cust-ellis', property_id: 'prop-ellis',
      property_type: 'OFFICE', square_footage: 3000, bathrooms: 3, floors: 2, frequency: 'WEEKLY',
      has_special_conditions: false, addon_service_ids: ['svc-fridge'], pricing_breakdown: makeBreakdown(), subtotal: 271, total: 271,
      status: 'ACCEPTED', valid_until: iso(14), terms: 'Net 15. Cancel with 30 days notice.', notes: 'Accepted recurring office service.',
      sent_at: iso(-3), viewed_at: iso(-2), responded_at: iso(-1), created_at: iso(-4), created_by_user_id: 'user-manager',
    },
    {
      id: 'quote-sent', reference_number: 'QUO-0202', lead_id: null, customer_id: 'cust-ellis', property_id: 'prop-ellis',
      property_type: 'OFFICE', square_footage: 3000, bathrooms: 3, floors: 2, frequency: 'BIWEEKLY',
      has_special_conditions: false, addon_service_ids: [], pricing_breakdown: makeBreakdown(3000, 3, 2, 0), subtotal: 236, total: 236,
      status: 'SENT', valid_until: iso(12), terms: 'Net 15. Quote valid for 14 days.', notes: 'Optional second visit / biweekly plan.',
      sent_at: iso(-1), viewed_at: null, responded_at: null, created_at: iso(-2), created_by_user_id: 'user-manager',
    },
    {
      id: 'quote-draft', reference_number: 'QUO-0203', lead_id: 'lead-metro', customer_id: null, property_id: null,
      property_type: 'RETAIL', square_footage: 5200, bathrooms: 3, floors: 1, frequency: 'DAILY',
      has_special_conditions: false, addon_service_ids: ['svc-windows'], pricing_breakdown: makeBreakdown(5200, 3, 1, 45), subtotal: 396, total: 396,
      status: 'DRAFT', valid_until: iso(14), terms: 'Net 15.', notes: 'Pricing proposal for studio.', sent_at: null, viewed_at: null, responded_at: null,
      created_at: iso(-2), created_by_user_id: 'user-owner',
    },
  ];

  const contracts = [
    { id: 'contract-ellis', reference_number: 'CON-0301', customer_id: 'cust-ellis', property_id: 'prop-ellis', quote_id: 'quote-accepted', frequency: 'WEEKLY', monthly_value: 1084, start_date: iso(-21), end_date: iso(344), status: 'ACTIVE', terms: 'Net 15. Cancel with 30 days notice.', schedule_id: 'schedule-ellis', created_at: iso(-21) },
    { id: 'contract-northgate', reference_number: 'CON-0302', customer_id: 'cust-northgate', property_id: 'prop-northgate', quote_id: null, frequency: 'WEEKLY', monthly_value: 760, start_date: iso(-14), end_date: iso(351), status: 'ACTIVE', terms: 'Weekly office cleaning.', schedule_id: 'schedule-northgate', created_at: iso(-14) },
    { id: 'contract-lakeside', reference_number: 'CON-0303', customer_id: 'cust-lakeside', property_id: 'prop-lakeside', quote_id: null, frequency: 'WEEKLY', monthly_value: 1220, start_date: iso(-12), end_date: iso(353), status: 'ACTIVE', terms: 'Medical-grade disinfection protocol.', schedule_id: 'schedule-lakeside', created_at: iso(-12) },
  ];

  const schedules = [
    { id: 'schedule-ellis', contract_id: 'contract-ellis', frequency: 'WEEKLY', days_of_week: ['MON', 'WED', 'FRI'], interval_weeks: 1, time_of_day: '09:00', duration_minutes: 90, generate_horizon_days: 30, last_generated_through: iso(7) },
    { id: 'schedule-northgate', contract_id: 'contract-northgate', frequency: 'WEEKLY', days_of_week: ['TUE', 'THU'], interval_weeks: 1, time_of_day: '08:00', duration_minutes: 120, generate_horizon_days: 30, last_generated_through: iso(7) },
    { id: 'schedule-lakeside', contract_id: 'contract-lakeside', frequency: 'WEEKLY', days_of_week: ['MON', 'THU'], interval_weeks: 1, time_of_day: '07:00', duration_minutes: 135, generate_horizon_days: 30, last_generated_through: iso(7) },
  ];

  const assignment = (employee_id, employee_name, is_lead = true) => ({ employee_id, employee_name, is_lead });
  const jobs = [
    {
      id: 'job-history', reference_number: 'JOB-0401', version: 1, customer_id: 'cust-ellis', property_id: 'prop-ellis', contract_id: 'contract-ellis',
      scheduled_start: iso(-7, 9), scheduled_end: iso(-7, 10, 30), status: 'COMPLETED',
      check_in_at: iso(-7, 8, 58), check_out_at: iso(-7, 10, 25), completed_at: iso(-7, 10, 25), cancelled_at: null,
      cancellation_reason: null, requires_photo_proof: true, actual_duration_minutes: 87,
      customer_name: 'Ellis & Co. Consulting', property_label: 'Ellis & Co. HQ', property_address: '800 Commerce St, Austin, TX 78702',
      assignments: [assignment('emp-maria', 'Maria Gonzalez')], checklist_items: checklist().map((x) => ({ ...x, is_completed: true, completed_at: iso(-7, 10, 25) })),
      photos: [{ id: 'photo-history-before', photo_type: 'BEFORE', caption: 'Before service', created_at: iso(-7, 9), uploaded_by_employee_id: 'emp-maria' }, { id: 'photo-history-after', photo_type: 'AFTER', caption: 'After service', created_at: iso(-7, 10), uploaded_by_employee_id: 'emp-maria' }],
      job_notes: [{ id: 'note-history', body: 'All rooms serviced; supplies restocked.', is_problem_report: false, created_at: iso(-7, 10, 20), author_user_id: 'user-employee' }],
    },
    {
      id: 'job-today', reference_number: 'JOB-0402', version: 1, customer_id: 'cust-ellis', property_id: 'prop-ellis', contract_id: 'contract-ellis',
      scheduled_start: iso(0, 10), scheduled_end: iso(0, 11, 30), status: 'ASSIGNED',
      check_in_at: null, check_out_at: null, completed_at: null, cancelled_at: null, cancellation_reason: null, requires_photo_proof: true, actual_duration_minutes: null,
      customer_name: 'Ellis & Co. Consulting', property_label: 'Ellis & Co. HQ', property_address: '800 Commerce St, Austin, TX 78702',
      assignments: [assignment('emp-maria', 'Maria Gonzalez')], checklist_items: checklist(), photos: [], job_notes: [],
    },
    {
      id: 'job-northgate', reference_number: 'JOB-0403', version: 1, customer_id: 'cust-northgate', property_id: 'prop-northgate', contract_id: 'contract-northgate',
      scheduled_start: iso(1, 8), scheduled_end: iso(1, 10), status: 'ASSIGNED',
      check_in_at: null, check_out_at: null, completed_at: null, cancelled_at: null, cancellation_reason: null, requires_photo_proof: true, actual_duration_minutes: null,
      customer_name: 'Northgate Realty', property_label: 'Main Location', property_address: '200 Market St, Austin, TX 78703',
      assignments: [assignment('emp-priya', 'Priya Patel')], checklist_items: checklist(), photos: [], job_notes: [],
    },
    {
      id: 'job-unassigned', reference_number: 'JOB-0404', version: 1, customer_id: 'cust-lakeside', property_id: 'prop-lakeside', contract_id: 'contract-lakeside',
      scheduled_start: iso(2, 7), scheduled_end: iso(2, 9, 15), status: 'SCHEDULED',
      check_in_at: null, check_out_at: null, completed_at: null, cancelled_at: null, cancellation_reason: null, requires_photo_proof: true, actual_duration_minutes: null,
      customer_name: 'Lakeside Family Medicine', property_label: 'Clinic', property_address: '200 Market St, Austin, TX 78703',
      assignments: [], checklist_items: checklist(), photos: [], job_notes: [],
    },
  ];

  const invoices = [
    { id: 'invoice-paid', reference_number: 'INV-0501', customer_id: 'cust-ellis', property_id: 'prop-ellis', contract_id: 'contract-ellis', source_type: 'JOB', subtotal: 271, discount_amount: 0, tax_amount: 0, total: 271, amount_paid: 271, balance_due: 0, status: 'PAID', due_date: iso(-2), sent_at: iso(-9), notes: 'Completed weekly office service.', created_at: iso(-10), items: [{ id: 'item-paid', description: 'Weekly office cleaning — JOB-0401', amount: 271, job_id: 'job-history' }] },
    { id: 'invoice-overdue', reference_number: 'INV-0502', customer_id: 'cust-ellis', property_id: 'prop-ellis', contract_id: 'contract-ellis', source_type: 'JOB', subtotal: 385, discount_amount: 0, tax_amount: 0, total: 385, amount_paid: 85, balance_due: 300, status: 'OVERDUE', due_date: iso(-3), sent_at: iso(-12), notes: 'Partial payment received.', created_at: iso(-14), items: [{ id: 'item-open', description: 'Office deep clean and supplies', amount: 385, job_id: null }] },
    { id: 'invoice-draft', reference_number: 'INV-0503', customer_id: 'cust-northgate', property_id: 'prop-northgate', contract_id: 'contract-northgate', source_type: 'MANUAL', subtotal: 240, discount_amount: 0, tax_amount: 0, total: 240, amount_paid: 0, balance_due: 240, status: 'DRAFT', due_date: iso(15), sent_at: null, notes: 'Draft invoice for review.', created_at: iso(-1), items: [{ id: 'item-draft', description: 'Commercial cleaning service', amount: 240, job_id: null }] },
  ];

  return {
    users: USERS, customers, employees, leads, quotes, contracts, schedules, jobs, invoices,
    payments: [
      { id: 'payment-paid', invoice_id: 'invoice-paid', amount: 271, method: 'CREDIT_CARD', reference: 'CARD-4471', paid_at: iso(-8), notes: 'Paid via card on file' },
      { id: 'payment-partial', invoice_id: 'invoice-overdue', amount: 85, method: 'ACH', reference: 'ACH-1024', paid_at: iso(-5), notes: 'Partial payment' },
    ],
    feedback: [{ id: 'feedback-1', job_id: 'job-history', customer_id: 'cust-ellis', rating: 5, comment: 'Great job, office looked spotless!', created_at: iso(-6) }],
    notifications: [
      { id: 'notif-1', title: 'New lead received', body: 'Sunridge Warehouse requested a cleaning quote.', type: 'NEW_LEAD', is_read: false, created_at: iso(-1) },
      { id: 'notif-2', title: 'Invoice overdue', body: 'INV-0502 has an outstanding balance of $300.', type: 'INVOICE_OVERDUE', is_read: false, created_at: iso(-1) },
    ],
    audit: [
      { id: 'audit-1', action: 'quote.accepted', entity_type: 'Quote', entity_id: 'quote-accepted', actor_role: 'CUSTOMER', created_at: iso(-1) },
      { id: 'audit-2', action: 'contract.activated', entity_type: 'Contract', entity_id: 'contract-ellis', actor_role: 'MANAGER', created_at: iso(-1) },
      { id: 'audit-3', action: 'job.completed', entity_type: 'Job', entity_id: 'job-history', actor_role: 'EMPLOYEE', created_at: iso(-7) },
    ],
    settings: {
      company_name: 'CleanFlow Commercial Cleaning', phone: '(512) 555-0190', email: 'hello@cleanflow.demo',
      address: 'Austin, TX', currency: 'USD', quote_validity_days: 14, invoice_due_days: 15, default_tax_rate_percent: 0,
      business_hours: { MON: '08:00–17:00', TUE: '08:00–17:00', WED: '08:00–17:00', THU: '08:00–17:00', FRI: '08:00–17:00', SAT: 'Closed', SUN: 'Closed' },
      notification_settings: { new_lead: true, quote_accepted: true, job_completed: true, invoice_overdue: true, contract_expiring: true },
    },
    pricingRules: ['OFFICE', 'RETAIL', 'MEDICAL', 'WAREHOUSE', 'RESTAURANT', 'RESIDENTIAL', 'OTHER'].map((property_type) => ({
      property_type, base_rate: 100, rate_per_sqft: 0.05, rate_per_bathroom: 15, rate_per_floor_above_one: 10, supplies_flat_fee: 15,
      frequency_adjustments: { DAILY: -0.22, WEEKLY: -0.12, BIWEEKLY: -0.06, MONTHLY: 0, ONE_TIME: 0.12, CUSTOM: -0.08 },
      special_condition_surcharge_percent: 0.1, is_active: true,
    })),
    featureFlags: [
      { key: 'customer_portal', description: 'Customer self-service portal', is_enabled: true },
      { key: 'photo_proof', description: 'Require before/after photos for job completion', is_enabled: true },
      { key: 'advanced_analytics', description: 'Expanded analytics views', is_enabled: true },
    ],
    webhooks: [], webhookDeliveries: [],
  };
}

function getState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // A malformed browser-local snapshot is replaced with the sample dataset.
  }
  const state = makeState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}
function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
export function resetDemoData() {
  saveState(makeState());
}
export function getDemoUser(email) {
  return USERS.find((user) => user.email === email.toLowerCase()) || null;
}
export function getDemoUserFromToken(token) {
  if (!token || !token.startsWith(SESSION_PREFIX)) return null;
  return USERS.find((user) => user.id === token.slice(SESSION_PREFIX.length)) || null;
}
export function authenticateDemo(email, password) {
  const user = getDemoUser(String(email || '').trim().toLowerCase());
  if (!user || password !== DEMO_PASSWORD) throw new Error('Use one of the listed demo accounts and password Demo1234!.');
  return clone(user);
}
export function isDemoToken(token) {
  return Boolean(token && token.startsWith(SESSION_PREFIX));
}

function page(items, params = {}) {
  const pageNumber = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.page_size || 25));
  const start = (pageNumber - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page: pageNumber, page_size: pageSize };
}
function currentUser() {
  return getDemoUserFromToken(localStorage.getItem('cleanflow_token'));
}
function customerOf(state, customerId) {
  return state.customers.find((customer) => customer.id === customerId);
}
function employeeOf(state, employeeId) {
  return state.employees.find((employee) => employee.id === employeeId);
}
function customerVisible(state, customerId) {
  const user = currentUser();
  return !user || user.role !== 'CUSTOMER' || user.customer_id === customerId;
}
function leadToCustomer(state, lead) {
  if (lead.converted_customer_id) {
    const existing = customerOf(state, lead.converted_customer_id);
    if (existing) return existing;
  }
  const customer = {
    id: id('cust'), company_name: lead.company_name, contact_name: lead.contact_name, email: lead.email,
    phone: lead.phone, billing_address: [lead.address_line1, lead.city, lead.state, lead.zip_code].filter(Boolean).join(', '),
    notes: lead.notes || '', is_archived: false, created_at: new Date().toISOString(), properties: [],
  };
  if (lead.address_line1 && lead.square_footage) {
    customer.properties.push({
      id: id('prop'), customer_id: customer.id, label: 'Primary Location', address_line1: lead.address_line1,
      city: lead.city || '', state: lead.state || '', zip_code: lead.zip_code || '', property_type: lead.property_type,
      square_footage: lead.square_footage, bathrooms: lead.bathrooms || 1, floors: lead.floors || 1,
      full_address: [lead.address_line1, lead.city, lead.state, lead.zip_code].filter(Boolean).join(', '),
    });
  }
  state.customers.push(customer);
  lead.converted_customer_id = customer.id;
  if (lead.status === 'NEW') lead.status = 'QUALIFIED';
  return customer;
}
function fullJob(state, job) {
  return {
    ...job,
    assignments: job.assignments.map((assignment) => ({ ...assignment })),
    checklist_items: job.checklist_items.map((item) => ({ ...item })),
    photos: job.photos.map((photo) => ({ ...photo })),
    job_notes: job.job_notes.map((note) => ({ ...note })),
  };
}
function jobSummary(job) {
  return {
    id: job.id, reference_number: job.reference_number, scheduled_start: job.scheduled_start,
    scheduled_end: job.scheduled_end, status: job.status, customer_name: job.customer_name, property_label: job.property_label,
  };
}
function contractHealth(state, contract) {
  const jobs = state.jobs.filter((job) => job.contract_id === contract.id);
  const completed = jobs.filter((job) => job.status === 'COMPLETED').length;
  const invoices = state.invoices.filter((invoice) => invoice.contract_id === contract.id);
  return {
    completed_job_count: completed, job_completion_rate: jobs.length ? completed / jobs.length : null,
    total_revenue_invoiced: invoices.reduce((sum, invoice) => sum + invoice.total, 0),
    average_feedback_rating: state.feedback.length ? state.feedback.reduce((sum, item) => sum + item.rating, 0) / state.feedback.length : null,
    is_expiring_soon: false, days_until_expiration: null,
  };
}
function makeQuote(state, payload) {
  const sqft = Number(payload.square_footage || 1000);
  const bathrooms = Number(payload.bathrooms || 1);
  const floors = Number(payload.floors || 1);
  const service = state.services?.find((item) => item.id === payload.primary_service_id) || { id: 'svc-standard', name: 'Standard Commercial Cleaning', base_rate: 100 };
  const addonIds = payload.addon_service_ids || [];
  const addons = [
    { id: 'svc-windows', name: 'Interior Window Cleaning', base_rate: 45 },
    { id: 'svc-carpet', name: 'Carpet Shampooing', base_rate: 80 },
    { id: 'svc-fridge', name: 'Refrigerator/Kitchen Deep Clean', base_rate: 35 },
  ].filter((addon) => addonIds.includes(addon.id));
  const adjustments = { DAILY: -0.22, WEEKLY: -0.12, BIWEEKLY: -0.06, MONTHLY: 0, ONE_TIME: 0.12, CUSTOM: -0.08 };
  const baseLines = [
    { label: 'Base service', amount: service.base_rate },
    { label: `Square footage (${sqft.toLocaleString()} sq ft)`, amount: money(sqft * 0.05) },
    { label: `Bathrooms (${bathrooms})`, amount: money(bathrooms * 15) },
    { label: 'Additional floors', amount: money(Math.max(0, floors - 1) * 10) },
    { label: `${payload.frequency || 'WEEKLY'} frequency adjustment`, amount: -money((service.base_rate + sqft * 0.05 + bathrooms * 15 + Math.max(0, floors - 1) * 10) * Math.abs(adjustments[payload.frequency] || 0)) },
    { label: 'Supplies', amount: 15 },
  ];
  const special = payload.has_special_conditions ? money(baseLines.reduce((sum, item) => sum + Math.abs(item.amount), 0) * 0.1) : 0;
  if (special) baseLines.push({ label: 'Special-condition surcharge', amount: special });
  addons.forEach((addon) => baseLines.push({ label: addon.name, amount: addon.base_rate }));
  const discount = money(baseLines.reduce((sum, item) => sum + item.amount, 0) * (Number(payload.manual_discount_percent || 0) / 100));
  if (discount) baseLines.push({ label: payload.manual_discount_reason || 'Manual discount', amount: -discount });
  const total = money(baseLines.reduce((sum, item) => sum + item.amount, 0));
  return { line_items: baseLines, subtotal: total, total };
}
function makeContract(state, quote) {
  let customer = customerOf(state, quote.customer_id);
  if (!customer && quote.lead_id) {
    const lead = state.leads.find((item) => item.id === quote.lead_id);
    if (lead) customer = leadToCustomer(state, lead);
  }
  if (!customer) customer = state.customers[0];
  const property = customer.properties[0] || state.customers[0].properties[0];
  const contract = {
    id: id('contract'), reference_number: `CON-${String(3100 + state.contracts.length).padStart(4, '0')}`,
    customer_id: customer.id, property_id: property?.id || 'prop-ellis', quote_id: quote.id, frequency: quote.frequency,
    monthly_value: money(quote.total * (quote.frequency === 'WEEKLY' ? 4 : quote.frequency === 'BIWEEKLY' ? 2 : 1)),
    start_date: new Date().toISOString(), end_date: iso(365), status: 'ACTIVE', terms: quote.terms || 'Net 15.',
    schedule_id: null, created_at: new Date().toISOString(),
  };
  state.contracts.push(contract);
  const schedule = {
    id: id('schedule'), contract_id: contract.id, frequency: quote.frequency, days_of_week: ['MON', 'WED', 'FRI'],
    interval_weeks: 1, time_of_day: '09:00', duration_minutes: 90, generate_horizon_days: 30, last_generated_through: iso(30),
  };
  state.schedules.push(schedule);
  contract.schedule_id = schedule.id;
  const customerName = customer.company_name || customer.contact_name;
  const newJob = {
    id: id('job'), reference_number: `JOB-${String(4100 + state.jobs.length).padStart(4, '0')}`, version: 1,
    customer_id: customer.id, property_id: property?.id || 'prop-ellis', contract_id: contract.id,
    scheduled_start: iso(3, 9), scheduled_end: iso(3, 10, 30), status: 'SCHEDULED',
    check_in_at: null, check_out_at: null, completed_at: null, cancelled_at: null, cancellation_reason: null,
    requires_photo_proof: true, actual_duration_minutes: null, customer_name: customerName,
    property_label: property?.label || 'Primary Location', property_address: property?.full_address || customer.billing_address,
    assignments: [], checklist_items: [
      'Empty all trash and recycling bins', 'Vacuum all carpeted areas', 'Mop hard-surface floors',
      'Clean and disinfect restrooms', 'Wipe down desks and common surfaces',
    ].map((label, index) => ({ id: id('check'), label, is_required: true, sort_order: index, is_completed: false, completed_at: null, note: null })),
    photos: [], job_notes: [],
  };
  state.jobs.push(newJob);
  return contract;
}

export async function demoRequest(path, { method = 'GET', body, params = {} } = {}) {
  const state = getState();
  const user = currentUser();
  const write = (value) => { saveState(state); return clone(value); };
  const q = String(params.q || '').toLowerCase();
  const currentTime = new Date().toISOString();

  if (method === 'GET' && path === '/api/health/ready') return { status: 'local-demo', database: 'browser-storage' };

  if (method === 'POST' && path === '/api/public/quote-requests') {
    const lead = {
      id: id('lead'), reference_number: `LEAD-${String(1100 + state.leads.length).padStart(4, '0')}`,
      contact_name: body.contact_name, company_name: body.company_name || null, email: body.email, phone: body.phone,
      address_line1: body.address_line1 || null, city: body.city || null, state: body.state || null, zip_code: body.zip_code || null,
      property_type: body.property_type || 'OFFICE', square_footage: Number(body.square_footage || 0) || null,
      bathrooms: Number(body.bathrooms || 0), floors: Number(body.floors || 1), frequency: body.frequency || 'WEEKLY',
      requested_services: body.requested_services || ['Standard Commercial Cleaning'], requested_addons: body.requested_addons || [],
      notes: body.notes || 'Submitted through the browser-only interactive demo.', source: 'WEBSITE',
      status: 'NEW', estimated_value: money(Number(body.square_footage || 0) * 0.08), created_at: currentTime,
      last_contacted_at: null, converted_customer_id: null,
    };
    state.leads.push(lead);
    state.audit.unshift({ id: id('audit'), action: 'lead.created.demo', entity_type: 'Lead', entity_id: lead.id, actor_role: 'PUBLIC', created_at: currentTime });
    state.notifications.unshift({ id: id('notif'), title: 'New lead received', body: `${lead.company_name || lead.contact_name} requested a quote (simulated).`, type: 'NEW_LEAD', is_read: false, created_at: currentTime });
    return write({ reference_number: lead.reference_number, message: 'Your request was added to this browser’s demo data. No email or external message was sent.' });
  }

  if (method === 'GET' && path === '/api/auth/me') return clone(user || {});
  if (method === 'GET' && path === '/api/dashboard/summary') {
    return {
      monthly_revenue: 7810, active_contracts: state.contracts.filter((c) => c.status === 'ACTIVE').length,
      upcoming_jobs_next_7_days: state.jobs.filter((j) => ['SCHEDULED', 'ASSIGNED', 'IN_PROGRESS'].includes(j.status) && new Date(j.scheduled_start) >= new Date()).length,
      completed_jobs_this_month: state.jobs.filter((j) => j.status === 'COMPLETED').length,
      outstanding_invoice_total: money(state.invoices.filter((i) => !['PAID', 'VOID'].includes(i.status)).reduce((s, i) => s + i.balance_due, 0)),
      overdue_invoice_count: state.invoices.filter((i) => i.status === 'OVERDUE').length,
      overdue_invoice_total: money(state.invoices.filter((i) => i.status === 'OVERDUE').reduce((s, i) => s + i.balance_due, 0)),
      new_leads_this_month: state.leads.filter((l) => l.status === 'NEW').length,
      quote_conversion_rate_percent: 67, average_rating: 5,
    };
  }
  if (method === 'GET' && path === '/api/dashboard/attention-required') {
    return {
      unassigned_jobs: state.jobs.filter((j) => j.status === 'SCHEDULED' && !j.assignments.length).map(jobSummary),
      overdue_invoices: state.invoices.filter((i) => i.status === 'OVERDUE'),
      stale_leads: state.leads.filter((l) => ['NEW', 'CONTACTED'].includes(l.status)).slice(0, 3),
      expiring_contracts: [],
    };
  }
  if (method === 'GET' && path === '/api/dashboard/revenue-trend') return ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month, i) => ({ month, revenue: [4200, 5100, 5900, 6100, 6900, 7810][i] }));
  if (method === 'GET' && path === '/api/dashboard/jobs-trend') return ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month, i) => ({ month, completed: [28, 31, 35, 39, 43, 48][i], cancelled_or_no_show: [2, 1, 2, 1, 2, 1][i] }));
  if (method === 'GET' && path === '/api/dashboard/lead-conversion-trend') return ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month, i) => ({ month, leads: [9, 11, 13, 15, 18, 20][i], converted: [4, 5, 7, 8, 10, 13][i] }));
  if (method === 'GET' && path === '/api/dashboard/contract-status-breakdown') return ['ACTIVE', 'PAUSED', 'PENDING', 'EXPIRED'].map((status) => ({ status, count: state.contracts.filter((c) => c.status === status).length }));
  if (method === 'GET' && path === '/api/dashboard/customer-growth') return ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'].map((month, i) => ({ month, customers: [8, 10, 12, 14, 17, state.customers.length + 13][i] }));

  if (path === '/api/leads' && method === 'GET') {
    let items = state.leads.filter((l) => (!params.status || l.status === params.status) && (!q || [l.contact_name, l.company_name, l.email].join(' ').toLowerCase().includes(q)));
    return page(items, params);
  }
  let match = path.match(/^\/api\/leads\/([^/]+)\/convert$/);
  if (match && method === 'POST') {
    const lead = state.leads.find((item) => item.id === match[1]);
    if (!lead) throw new Error('Lead not found');
    const customer = leadToCustomer(state, lead);
    state.audit.unshift({ id: id('audit'), action: 'lead.converted', entity_type: 'Lead', entity_id: lead.id, actor_role: user?.role || 'OWNER', created_at: currentTime });
    return write(customer);
  }
  match = path.match(/^\/api\/leads\/([^/]+)$/);
  if (match && method === 'GET') return clone(state.leads.find((item) => item.id === match[1]) || {});
  if (match && method === 'PATCH') {
    const lead = state.leads.find((item) => item.id === match[1]);
    if (!lead) throw new Error('Lead not found');
    Object.assign(lead, body);
    lead.last_contacted_at = currentTime;
    state.audit.unshift({ id: id('audit'), action: 'lead.updated', entity_type: 'Lead', entity_id: lead.id, actor_role: user?.role || 'OWNER', created_at: currentTime });
    return write(lead);
  }

  if (method === 'GET' && path === '/api/services') {
    return [
      { id: 'svc-standard', name: 'Standard Commercial Cleaning', description: 'Recurring office/commercial cleaning', base_rate: 100, is_addon: false },
      { id: 'svc-medical', name: 'Medical-Grade Cleaning', description: 'Enhanced disinfection for clinics', base_rate: 140, is_addon: false },
      { id: 'svc-deep', name: 'Deep Clean', description: 'One-time intensive deep clean', base_rate: 250, is_addon: false },
      { id: 'svc-windows', name: 'Interior Window Cleaning', base_rate: 45, is_addon: true },
      { id: 'svc-carpet', name: 'Carpet Shampooing', base_rate: 80, is_addon: true },
      { id: 'svc-fridge', name: 'Refrigerator/Kitchen Deep Clean', base_rate: 35, is_addon: true },
    ];
  }
  if (method === 'POST' && path === '/api/pricing/preview') return makeQuote(state, body);
  if (method === 'GET' && path === '/api/pricing/rules') return clone(state.pricingRules);
  if (method === 'PUT' && path === '/api/pricing/rules') {
    const index = state.pricingRules.findIndex((r) => r.property_type === body.property_type);
    if (index >= 0) state.pricingRules[index] = { ...state.pricingRules[index], ...body };
    return write(state.pricingRules);
  }

  if (path === '/api/quotes' && method === 'GET') {
    let items = state.quotes.filter((quote) => (!params.status || quote.status === params.status) && (!params.customer_id || quote.customer_id === params.customer_id));
    if (user?.role === 'CUSTOMER') items = items.filter((quote) => quote.customer_id === user.customer_id);
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return page(items, params);
  }
  if (path === '/api/quotes' && method === 'POST') {
    const breakdown = makeQuote(state, body);
    const quote = {
      id: id('quote'), reference_number: `QUO-${String(2100 + state.quotes.length).padStart(4, '0')}`,
      lead_id: body.lead_id || null, customer_id: body.customer_id || null, property_id: body.customer_id ? customerOf(state, body.customer_id)?.properties?.[0]?.id || null : null,
      property_type: body.property_type, square_footage: Number(body.square_footage), bathrooms: Number(body.bathrooms), floors: Number(body.floors),
      frequency: body.frequency, has_special_conditions: body.has_special_conditions, addon_service_ids: body.addon_service_ids || [],
      pricing_breakdown: breakdown, subtotal: breakdown.total, total: breakdown.total, status: 'DRAFT', valid_until: iso(14),
      terms: 'Net 15. Quote valid for 14 days.', notes: body.manual_discount_reason || null,
      sent_at: null, viewed_at: null, responded_at: null, created_at: currentTime, created_by_user_id: user?.id || 'user-owner',
    };
    state.quotes.push(quote);
    state.audit.unshift({ id: id('audit'), action: 'quote.created', entity_type: 'Quote', entity_id: quote.id, actor_role: user?.role || 'OWNER', created_at: currentTime });
    return write(quote);
  }
  match = path.match(/^\/api\/quotes\/([^/]+)\/(send|clone|accept|reject)$/);
  if (match && method === 'POST') {
    const quote = state.quotes.find((item) => item.id === match[1]);
    if (!quote) throw new Error('Quote not found');
    const action = match[2];
    if (action === 'send') {
      quote.status = 'SENT'; quote.sent_at = currentTime;
      return write(quote);
    }
    if (action === 'clone') {
      const copy = { ...clone(quote), id: id('quote'), reference_number: `QUO-${String(2100 + state.quotes.length).padStart(4, '0')}`, status: 'DRAFT', sent_at: null, viewed_at: null, responded_at: null, created_at: currentTime };
      state.quotes.push(copy); return write(copy);
    }
    if (action === 'reject') { quote.status = 'REJECTED'; quote.responded_at = currentTime; return write(quote); }
    if (action === 'accept') {
      if (!['SENT', 'VIEWED', 'ACCEPTED'].includes(quote.status)) throw new Error('Quote must be sent before it can be accepted.');
      quote.status = 'ACCEPTED'; quote.responded_at = currentTime;
      const existing = state.contracts.find((c) => c.quote_id === quote.id);
      const contract = existing || makeContract(state, quote);
      state.audit.unshift({ id: id('audit'), action: 'quote.accepted', entity_type: 'Quote', entity_id: quote.id, actor_role: user?.role || 'CUSTOMER', created_at: currentTime });
      return write(contract);
    }
  }
  match = path.match(/^\/api\/quotes\/([^/]+)$/);
  if (match && method === 'GET') {
    const quote = state.quotes.find((item) => item.id === match[1]);
    if (quote && user?.role === 'CUSTOMER' && quote.status === 'SENT') { quote.status = 'VIEWED'; quote.viewed_at = currentTime; saveState(state); }
    return clone(quote || {});
  }

  if (path === '/api/contracts' && method === 'GET') {
    let items = state.contracts.filter((contract) => (!params.status || contract.status === params.status) && (!params.customer_id || contract.customer_id === params.customer_id));
    if (user?.role === 'CUSTOMER') items = items.filter((contract) => contract.customer_id === user.customer_id);
    return page(items, params);
  }
  match = path.match(/^\/api\/contracts\/([^/]+)\/health$/);
  if (match && method === 'GET') {
    const contract = state.contracts.find((item) => item.id === match[1]);
    return contract ? contractHealth(state, contract) : {};
  }
  match = path.match(/^\/api\/contracts\/([^/]+)\/(pause|resume|cancel|renew)$/);
  if (match && method === 'POST') {
    const contract = state.contracts.find((item) => item.id === match[1]);
    if (!contract) throw new Error('Contract not found');
    if (match[2] === 'pause') contract.status = 'PAUSED';
    if (match[2] === 'resume') contract.status = 'ACTIVE';
    if (match[2] === 'cancel') contract.status = 'CANCELLED';
    if (match[2] === 'renew') {
      const next = { ...clone(contract), id: id('contract'), reference_number: `CON-${String(3100 + state.contracts.length).padStart(4, '0')}`, status: 'ACTIVE', start_date: currentTime, end_date: iso(365), created_at: currentTime };
      state.contracts.push(next); return write(next);
    }
    return write(contract);
  }
  match = path.match(/^\/api\/contracts\/([^/]+)$/);
  if (match && method === 'GET') return clone(state.contracts.find((item) => item.id === match[1]) || {});

  if (method === 'GET' && path === '/api/employees') return clone(state.employees);
  if (method === 'POST' && path === '/api/employees') {
    const employee = { id: id('emp'), full_name: body.full_name, email: body.email, phone: body.phone, hourly_rate: Number(body.hourly_rate || 18), skills: body.skills || [], availability: {}, profile_photo_url: null, is_active: true };
    state.employees.push(employee); return write(employee);
  }
  match = path.match(/^\/api\/employees\/([^/]+)$/);
  if (match && method === 'PATCH') {
    const employee = state.employees.find((item) => item.id === match[1]);
    if (!employee) throw new Error('Employee not found');
    Object.assign(employee, body); return write(employee);
  }

  if (method === 'GET' && path === '/api/customers') {
    let items = state.customers.filter((customer) => !customer.is_archived && (!q || [customer.company_name, customer.contact_name, customer.email].join(' ').toLowerCase().includes(q)));
    return page(items.map(({ properties, ...item }) => item), params);
  }
  match = path.match(/^\/api\/customers\/([^/]+)\/archive$/);
  if (match && method === 'POST') {
    const customer = customerOf(state, match[1]); if (!customer) throw new Error('Customer not found');
    customer.is_archived = true; return write(customer);
  }
  match = path.match(/^\/api\/customers\/([^/]+)$/);
  if (match && method === 'GET') return clone(customerOf(state, match[1]) || {});

  if (method === 'GET' && path === '/api/jobs/today') {
    const employeeId = user?.employee_id;
    const today = new Date().toDateString();
    return state.jobs.filter((job) => job.assignments.some((a) => a.employee_id === employeeId) && new Date(job.scheduled_start).toDateString() === today && job.status !== 'CANCELLED').map(jobSummary);
  }
  if (method === 'GET' && path === '/api/jobs') {
    let items = state.jobs.filter((job) => (!params.status || job.status === params.status) && (!params.customer_id || job.customer_id === params.customer_id));
    if (user?.role === 'CUSTOMER') items = items.filter((job) => job.customer_id === user.customer_id);
    if (user?.role === 'EMPLOYEE') items = items.filter((job) => job.assignments.some((a) => a.employee_id === user.employee_id));
    if (params.upcoming_only) items = items.filter((job) => new Date(job.scheduled_start) >= new Date());
    items.sort((a, b) => a.scheduled_start.localeCompare(b.scheduled_start));
    return page(items.map(jobSummary), params);
  }
  if (method === 'GET' && path === '/api/scheduling/calendar') {
    const start = new Date(params.start || 0); const end = new Date(params.end || 8640000000000000);
    return clone(state.jobs.filter((job) => new Date(job.scheduled_start) >= start && new Date(job.scheduled_start) < end &&
      (!params.employee_id || job.assignments.some((a) => a.employee_id === params.employee_id)) && (!params.status || job.status === params.status)).map(jobSummary));
  }
  match = path.match(/^\/api\/jobs\/([^/]+)\/health$/);
  if (match && method === 'GET') {
    const job = state.jobs.find((item) => item.id === match[1]);
    return job ? { steps: { assigned: job.assignments.length > 0, checked_in: Boolean(job.check_in_at), checklist_complete: job.checklist_items.filter((i) => i.is_required).every((i) => i.is_completed), before_photo: job.photos.some((p) => p.photo_type === 'BEFORE'), after_photo: job.photos.some((p) => p.photo_type === 'AFTER'), checked_out: Boolean(job.check_out_at) } } : {};
  }
  match = path.match(/^\/api\/jobs\/([^/]+)\/suggested-employees$/);
  if (match && method === 'GET') return state.employees.slice(0, 3).map((employee) => ({ employee_id: employee.id, employee_name: employee.full_name, workload: 2 }));
  match = path.match(/^\/api\/jobs\/([^/]+)\/assign$/);
  if (match && method === 'POST') {
    const job = state.jobs.find((item) => item.id === match[1]); if (!job) throw new Error('Job not found');
    job.assignments = (body.employee_ids || []).map((employeeId) => { const employee = employeeOf(state, employeeId); return employee && { employee_id: employee.id, employee_name: employee.full_name, is_lead: true }; }).filter(Boolean);
    job.status = job.assignments.length ? 'ASSIGNED' : 'SCHEDULED'; job.version += 1; return write(fullJob(state, job));
  }
  match = path.match(/^\/api\/jobs\/([^/]+)\/bulk-assign$/);
  if (match && method === 'POST') return write({ assigned: [], failed: [] });
  if (method === 'POST' && path === '/api/jobs/bulk-assign') {
    const assigned = [];
    for (const jobId of body.job_ids || []) {
      const job = state.jobs.find((item) => item.id === jobId); if (!job) continue;
      job.assignments = (body.employee_ids || []).map((employeeId) => { const employee = employeeOf(state, employeeId); return employee && { employee_id: employee.id, employee_name: employee.full_name, is_lead: true }; }).filter(Boolean);
      job.status = job.assignments.length ? 'ASSIGNED' : 'SCHEDULED'; job.version += 1; assigned.push(jobId);
    }
    return write({ assigned, failed: [] });
  }
  match = path.match(/^\/api\/jobs\/([^/]+)\/(check-in|check-out|cancel|complete|notes|photos)$/);
  if (match && method === 'POST') {
    const job = state.jobs.find((item) => item.id === match[1]); if (!job) throw new Error('Job not found');
    const action = match[2];
    if (action === 'check-in') { job.check_in_at = currentTime; job.status = 'IN_PROGRESS'; job.version += 1; return write(fullJob(state, job)); }
    if (action === 'check-out') { if (!job.check_in_at) throw new Error('Check in before checking out.'); job.check_out_at = currentTime; job.version += 1; return write(fullJob(state, job)); }
    if (action === 'cancel') { job.status = 'CANCELLED'; job.cancelled_at = currentTime; job.cancellation_reason = body.reason || 'Cancelled in demo'; job.version += 1; return write(fullJob(state, job)); }
    if (action === 'complete') {
      const requiredDone = job.checklist_items.filter((item) => item.is_required).every((item) => item.is_completed);
      if (!job.check_in_at || !job.check_out_at || !requiredDone || !job.photos.some((p) => p.photo_type === 'BEFORE') || !job.photos.some((p) => p.photo_type === 'AFTER')) {
        throw new Error('Complete check-in/out, required checklist items, and before/after photos before marking this job complete.');
      }
      job.status = 'COMPLETED'; job.completed_at = currentTime; job.version += 1;
      state.audit.unshift({ id: id('audit'), action: 'job.completed', entity_type: 'Job', entity_id: job.id, actor_role: user?.role || 'EMPLOYEE', created_at: currentTime });
      return write(fullJob(state, job));
    }
    if (action === 'notes') {
      job.job_notes.push({ id: id('note'), body: body.body, is_problem_report: Boolean(body.is_problem_report), created_at: currentTime, author_user_id: user?.id || null });
      return write(fullJob(state, job));
    }
    if (action === 'photos') {
      const photoType = body?.get?.('photo_type') || 'BEFORE';
      job.photos.push({ id: id('photo'), photo_type: photoType, caption: 'Browser-local demo upload (file not sent to a server)', created_at: currentTime, uploaded_by_employee_id: user?.employee_id || null });
      return write(fullJob(state, job));
    }
  }
  match = path.match(/^\/api\/jobs\/([^/]+)\/checklist\/([^/]+)$/);
  if (match && method === 'PATCH') {
    const job = state.jobs.find((item) => item.id === match[1]); const item = job?.checklist_items.find((entry) => entry.id === match[2]);
    if (!item) throw new Error('Checklist item not found');
    item.is_completed = Boolean(body.is_completed); item.completed_at = item.is_completed ? currentTime : null; item.note = body.note || null;
    return write(fullJob(state, job));
  }
  match = path.match(/^\/api\/jobs\/([^/]+)$/);
  if (match && method === 'GET') return clone(fullJob(state, state.jobs.find((item) => item.id === match[1]) || { assignments: [], checklist_items: [], photos: [], job_notes: [] }));

  if (method === 'GET' && path === '/api/scheduling/contracts/' + (params.contract_id || '') + '/schedule') return clone(state.schedules.find((s) => s.contract_id === params.contract_id) || {});
  match = path.match(/^\/api\/scheduling\/contracts\/([^/]+)\/schedule$/);
  if (match && method === 'GET') return clone(state.schedules.find((s) => s.contract_id === match[1]) || {});
  match = path.match(/^\/api\/scheduling\/schedules\/([^/]+)$/);
  if (match && method === 'PATCH') {
    const schedule = state.schedules.find((s) => s.id === match[1]); if (!schedule) throw new Error('Schedule not found');
    Object.assign(schedule, body); return write(schedule);
  }
  match = path.match(/^\/api\/scheduling\/schedules\/([^/]+)\/(generate|exceptions)$/);
  if (match && method === 'POST') {
    const schedule = state.schedules.find((s) => s.id === match[1]); if (!schedule) throw new Error('Schedule not found');
    if (match[2] === 'generate') return write({ created_job_count: 1 });
    (schedule.exceptions ||= []).push(body); return write(schedule.exceptions);
  }

  if (method === 'GET' && path === '/api/invoices') {
    let items = state.invoices.filter((invoice) => (!params.status || invoice.status === params.status) && customerVisible(state, invoice.customer_id));
    return page(items, params);
  }
  if (method === 'GET' && path === '/api/invoices/' + (params.invoice_id || '') + '/payments') return [];
  match = path.match(/^\/api\/invoices\/([^/]+)\/payments$/);
  if (match && method === 'GET') return clone(state.payments.filter((payment) => payment.invoice_id === match[1]));
  match = path.match(/^\/api\/invoices\/([^/]+)\/(send|void)$/);
  if (match && method === 'POST') {
    const invoice = state.invoices.find((item) => item.id === match[1]); if (!invoice) throw new Error('Invoice not found');
    if (match[2] === 'send') { invoice.status = 'SENT'; invoice.sent_at = currentTime; }
    if (match[2] === 'void') { invoice.status = 'VOID'; invoice.balance_due = 0; }
    return write(invoice);
  }
  match = path.match(/^\/api\/invoices\/([^/]+)\/payments$/);
  if (match && method === 'POST') {
    const invoice = state.invoices.find((item) => item.id === match[1]); if (!invoice) throw new Error('Invoice not found');
    const amount = money(Number(body.amount));
    if (amount <= 0 || amount > invoice.balance_due) throw new Error('Payment amount must be positive and cannot exceed the balance due.');
    const payment = { id: id('payment'), invoice_id: invoice.id, amount, method: body.method || 'CASH', reference: body.reference || null, paid_at: currentTime, notes: null };
    state.payments.push(payment);
    invoice.amount_paid = money(invoice.amount_paid + amount);
    invoice.balance_due = money(invoice.total - invoice.amount_paid);
    invoice.status = invoice.balance_due === 0 ? 'PAID' : 'PARTIALLY_PAID';
    return write(payment);
  }
  if (method === 'POST' && path === '/api/invoices/bulk-send') {
    const sent = [];
    for (const invoiceId of body.invoice_ids || []) {
      const invoice = state.invoices.find((item) => item.id === invoiceId);
      if (invoice && invoice.status === 'DRAFT') { invoice.status = 'SENT'; invoice.sent_at = currentTime; sent.push(invoiceId); }
    }
    return write({ sent, failed: [] });
  }
  match = path.match(/^\/api\/invoices\/from-job\/([^/]+)$/);
  if (match && method === 'POST') {
    const job = state.jobs.find((item) => item.id === match[1]); if (!job || job.status !== 'COMPLETED') throw new Error('Only completed jobs can be invoiced.');
    const invoice = {
      id: id('invoice'), reference_number: `INV-${String(5100 + state.invoices.length).padStart(4, '0')}`,
      customer_id: job.customer_id, property_id: job.property_id, contract_id: job.contract_id, source_type: 'JOB',
      subtotal: 300, discount_amount: 0, tax_amount: 0, total: 300, amount_paid: 0, balance_due: 300, status: 'DRAFT',
      due_date: iso(15), sent_at: null, notes: 'Generated from completed job.', created_at: currentTime,
      items: [{ id: id('item'), description: `Cleaning service — ${job.reference_number}`, amount: 300, job_id: job.id }],
    };
    state.invoices.push(invoice); return write(invoice);
  }
  match = path.match(/^\/api\/invoices\/([^/]+)$/);
  if (match && method === 'GET') return clone(state.invoices.find((item) => item.id === match[1]) || {});

  if (method === 'GET' && path === '/api/customer-portal/dashboard') {
    const customerId = user?.customer_id || 'cust-ellis';
    const contracts = state.contracts.filter((c) => c.customer_id === customerId && c.status === 'ACTIVE');
    const invoices = state.invoices.filter((i) => i.customer_id === customerId && !['PAID', 'VOID'].includes(i.status));
    const jobs = state.jobs.filter((j) => j.customer_id === customerId);
    return {
      active_contracts: contracts.length, outstanding_invoice_total: money(invoices.reduce((s, i) => s + i.balance_due, 0)),
      outstanding_invoice_count: invoices.length, average_rating_given: state.feedback.length ? 5 : null,
      upcoming_jobs: jobs.filter((j) => new Date(j.scheduled_start) >= new Date() && j.status !== 'CANCELLED').map(jobSummary),
      recent_service_reports: jobs.filter((j) => j.status === 'COMPLETED').map((j) => ({ ...jobSummary(j), completed_at: j.completed_at })),
    };
  }
  if (method === 'POST' && path.startsWith('/api/jobs/') && path.endsWith('/feedback')) {
    const jobId = path.split('/')[3]; const job = state.jobs.find((item) => item.id === jobId);
    const feedback = { id: id('feedback'), job_id: jobId, customer_id: job?.customer_id || user?.customer_id, rating: Number(body.rating || 5), comment: body.comment || '', created_at: currentTime };
    state.feedback.push(feedback); return write(feedback);
  }
  if (method === 'GET' && path === '/api/feedback') {
    const recent = state.feedback.map((f) => ({ ...f, customer_name: customerOf(state, f.customer_id)?.company_name || 'Demo customer' }));
    return { average_rating: recent.length ? money(recent.reduce((s, f) => s + f.rating, 0) / recent.length) : null, review_count: recent.length, response_rate_percent: 82, recent };
  }
  if (method === 'GET' && path === '/api/analytics') return {
    revenue: { total: 7810, trend: [] }, jobs: { total: state.jobs.length, completed: state.jobs.filter((j) => j.status === 'COMPLETED').length },
    leads: { total: state.leads.length, converted: state.leads.filter((l) => l.converted_customer_id).length }, customers: { total: state.customers.length },
  };
  if (method === 'GET' && path === '/api/audit-logs') {
    const items = state.audit.filter((entry) => !q || entry.action.toLowerCase().includes(q));
    return page(items, params);
  }
  if (method === 'GET' && path === '/api/search') {
    const list = [
      ...state.customers.map((item) => ({ id: item.id, type: 'Customer', label: item.company_name || item.contact_name })),
      ...state.leads.map((item) => ({ id: item.id, type: 'Lead', label: item.company_name || item.contact_name })),
      ...state.quotes.map((item) => ({ id: item.id, type: 'Quote', label: item.reference_number })),
      ...state.contracts.map((item) => ({ id: item.id, type: 'Contract', label: item.reference_number })),
      ...state.jobs.map((item) => ({ id: item.id, type: 'Job', label: item.reference_number })),
      ...state.invoices.map((item) => ({ id: item.id, type: 'Invoice', label: item.reference_number })),
      ...state.employees.map((item) => ({ id: item.id, type: 'Employee', label: item.full_name })),
    ];
    return list.filter((item) => item.label.toLowerCase().includes(q)).slice(0, 10);
  }

  if (method === 'GET' && path === '/api/notifications') return clone(state.notifications);
  if (method === 'GET' && path === '/api/notifications/stream-ticket') return { ticket: 'local-demo', simulated: true };
  if (method === 'POST' && path === '/api/notifications/mark-all-read') { state.notifications.forEach((n) => { n.is_read = true; }); return write({ success: true }); }
  match = path.match(/^\/api\/notifications\/([^/]+)\/read$/);
  if (match && method === 'POST') { const n = state.notifications.find((item) => item.id === match[1]); if (n) n.is_read = true; return write(n || { success: true }); }

  if (method === 'GET' && path === '/api/users') return state.users.map((u) => ({ ...u, is_active: true }));
  match = path.match(/^\/api\/users\/([^/]+)\/deactivate$/);
  if (match && method === 'POST') { const target = state.users.find((u) => u.id === match[1]); return write({ ...(target || {}), is_active: false }); }

  if (method === 'GET' && path === '/api/settings') return clone(state.settings);
  if (method === 'PATCH' && path === '/api/settings') { Object.assign(state.settings, body); return write(state.settings); }
  if (method === 'GET' && path === '/api/feature-flags') return clone(state.featureFlags);
  match = path.match(/^\/api\/feature-flags\/([^/]+)$/);
  if (match && (method === 'PATCH' || method === 'PUT')) {
    const flag = state.featureFlags.find((item) => item.key === match[1]);
    if (flag) flag.is_enabled = Boolean(body.is_enabled);
    return write(flag || {});
  }
  if (method === 'GET' && path === '/api/webhooks/endpoints') return clone(state.webhooks);
  if (method === 'GET' && path === '/api/webhooks/event-types') return { event_types: ['lead.created', 'quote.accepted', 'job.completed', 'invoice.overdue', 'contract.activated'] };
  if (method === 'POST' && path === '/api/webhooks/endpoints') {
    const endpoint = { id: id('webhook'), url: body.url, subscribed_events: body.subscribed_events || [], description: body.description || '', is_active: true };
    state.webhooks.push(endpoint); return write({ ...endpoint, secret: 'demo-secret-not-valid-for-delivery' });
  }
  match = path.match(/^\/api\/webhooks\/endpoints\/([^/]+)\/deactivate$/);
  if (match && method === 'POST') { const endpoint = state.webhooks.find((e) => e.id === match[1]); if (endpoint) endpoint.is_active = false; return write(endpoint || {}); }
  match = path.match(/^\/api\/webhooks\/endpoints\/([^/]+)\/deliveries$/);
  if (match && method === 'GET') return clone(state.webhookDeliveries.filter((d) => d.endpoint_id === match[1]));
  match = path.match(/^\/api\/webhooks\/deliveries\/([^/]+)\/redeliver$/);
  if (match && method === 'POST') return write({ id: match[1], status: 'QUEUED', simulated: true });

  // API endpoints not essential to this walkthrough intentionally return empty demo collections.
  if (method === 'GET') return path.includes('export') ? '' : [];
  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') return { simulated: true, message: 'Saved in this browser only.' };
  return {};
}

function triggerDownload(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = filename;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  URL.revokeObjectURL(url);
}
export function demoDownload(path, filename) {
  const state = getState();
  const rows = path.includes('leads') ? state.leads : path.includes('customers') ? state.customers : state.invoices;
  const headers = path.includes('leads') ? ['Reference', 'Contact', 'Company', 'Email', 'Status', 'Estimated Value']
    : path.includes('customers') ? ['Company', 'Contact', 'Email', 'Phone'] : ['Reference', 'Total', 'Balance Due', 'Status'];
  const values = rows.map((row) => path.includes('leads')
    ? [row.reference_number, row.contact_name, row.company_name, row.email, row.status, row.estimated_value]
    : path.includes('customers')
      ? [row.company_name, row.contact_name, row.email, row.phone]
      : [row.reference_number, row.total, row.balance_due, row.status]);
  const csv = [headers, ...values].map((line) => line.map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  triggerDownload(filename, csv, 'text/csv;charset=utf-8');
  return Promise.resolve();
}
export function demoOpenInNewTab(path) {
  const state = getState();
  const quoteMatch = path.match(/^\/api\/quotes\/([^/]+)\/pdf$/);
  const invoiceMatch = path.match(/^\/api\/invoices\/([^/]+)\/pdf$/);
  const quote = quoteMatch && state.quotes.find((item) => item.id === quoteMatch[1]);
  const invoice = invoiceMatch && state.invoices.find((item) => item.id === invoiceMatch[1]);
  const title = quote ? `Quote ${quote.reference_number}` : invoice ? `Invoice ${invoice.reference_number}` : 'CleanFlow demo document';
  const details = quote
    ? `<p>Property: ${quote.property_type} · ${quote.square_footage} sq ft · ${quote.frequency}</p><p>Total: $${quote.total.toFixed(2)}</p><p>Status: ${quote.status}</p>`
    : invoice
      ? `<p>Total: $${invoice.total.toFixed(2)}</p><p>Paid: $${invoice.amount_paid.toFixed(2)}</p><p>Balance due: $${invoice.balance_due.toFixed(2)}</p><p>Status: ${invoice.status}</p>`
      : '<p>Generated in the browser-only demo.</p>';
  const html = `<!doctype html><html><head><title>${title}</title><style>body{font:16px Arial,sans-serif;max-width:720px;margin:60px auto;color:#22372d}small{color:#68786f}article{border:1px solid #dce4dc;border-radius:12px;padding:28px}</style></head><body><article><small>SIMULATED DOCUMENT · CLEANFLOW DEMO</small><h1>${title}</h1>${details}<p>This preview is generated locally. No email, payment, or external document service was contacted.</p><button onclick="window.print()">Print this preview</button></article></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  window.open(url, '_blank', 'noopener');
}
