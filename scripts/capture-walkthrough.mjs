import { firefox } from "playwright";

const BASE = "http://127.0.0.1:5173";
const PASSWORD = "Demo1234!";

async function login(page, email) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/app\//);
  await page.waitForLoadState("networkidle");
}

async function shot(page, name, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `docs/testing/visuals/${name}.png`,
    fullPage: true,
  });
}

async function firstDetail(page, prefix) {
  await page.waitForLoadState("networkidle");
  const href = await page.locator(`a[href^="${prefix}"]`).first().getAttribute("href");
  if (!href) throw new Error(`No detail link found for ${prefix}`);
  return href;
}

const browser = await firefox.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();

try {
  // Public website.
  const publicPages = [
    ["01-home", "/"],
    ["02-request-quote", "/request-quote"],
    ["17-services", "/services"],
    ["18-commercial-cleaning", "/commercial-cleaning"],
    ["19-residential-cleaning", "/residential-cleaning"],
    ["20-pricing", "/pricing"],
    ["21-service-areas", "/service-areas"],
    ["22-about", "/about"],
    ["23-testimonials", "/testimonials"],
    ["24-gallery", "/gallery"],
    ["25-faq", "/faq"],
    ["26-contact", "/contact"],
  ];
  for (const [name, path] of publicPages) await shot(page, name, path);

  await shot(page, "03-login", "/login");

  // Owner/manager operations workspace.
  await login(page, "owner@cleanflow.demo");
  const ownerPages = [
    ["04-dashboard", "/app/dashboard"],
    ["05-leads", "/app/leads"],
    ["06-quotes", "/app/quotes"],
    ["07-contracts", "/app/contracts"],
    ["08-calendar", "/app/calendar"],
    ["09-jobs", "/app/jobs"],
    ["10-customers", "/app/customers"],
    ["11-employees", "/app/employees"],
    ["12-invoices", "/app/invoices"],
    ["13-analytics", "/app/analytics"],
    ["27-feedback", "/app/feedback"],
    ["28-audit", "/app/audit"],
    ["29-team-users", "/app/users"],
    ["30-settings", "/app/settings"],
  ];
  for (const [name, path] of ownerPages) await shot(page, name, path);

  // Detail records expose the next level of the same product flows.
  await page.goto(`${BASE}/app/leads`, { waitUntil: "networkidle" });
  const leadHref = await firstDetail(page, "/app/leads/");
  await shot(page, "41-lead-detail", leadHref);

  await page.goto(`${BASE}/app/quotes`, { waitUntil: "networkidle" });
  const quoteHref = await firstDetail(page, "/app/quotes/");
  await shot(page, "31-quote-detail", quoteHref);

  await page.goto(`${BASE}/app/contracts`, { waitUntil: "networkidle" });
  const contractHref = await firstDetail(page, "/app/contracts/");
  await shot(page, "32-contract-detail", contractHref);

  await page.goto(`${BASE}/app/jobs`, { waitUntil: "networkidle" });
  const jobHref = await firstDetail(page, "/app/jobs/");
  await shot(page, "33-job-detail", jobHref);

  await page.goto(`${BASE}/app/customers`, { waitUntil: "networkidle" });
  const customerHref = await firstDetail(page, "/app/customers/");
  await shot(page, "34-customer-detail", customerHref);

  await page.goto(`${BASE}/app/invoices`, { waitUntil: "networkidle" });
  const invoiceHref = await firstDetail(page, "/app/invoices/");
  await shot(page, "35-invoice-detail", invoiceHref);

  // Employee mobile.
  const employeeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const employeePage = await employeeContext.newPage();
  await login(employeePage, "employee@cleanflow.demo");
  await shot(employeePage, "16-employee-mobile", "/app/mobile");
  const mobileHref = await firstDetail(employeePage, "/app/mobile/");
  await shot(employeePage, "40-employee-job-detail", mobileHref);
  await employeeContext.close();

  // Customer portal.
  const customerContext = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
  const customerPage = await customerContext.newPage();
  await login(customerPage, "customer@cleanflow.demo");
  const customerPages = [
    ["14-customer-portal", "/app/portal"],
    ["15-customer-quotes", "/app/portal/quotes"],
    ["36-customer-contracts", "/app/portal/contracts"],
    ["37-customer-schedule", "/app/portal/schedule"],
    ["38-customer-history", "/app/portal/history"],
    ["39-customer-invoices", "/app/portal/invoices"],
  ];
  for (const [name, path] of customerPages) await shot(customerPage, name, path);
  await customerContext.close();
} finally {
  await browser.close();
}
