import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import PublicLayout from './layouts/PublicLayout';
import AppLayout from './layouts/AppLayout';

import Home from './pages/public/Home';
import RequestQuote from './pages/public/RequestQuote';
import { Services, CommercialCleaning, ResidentialCleaning, Pricing, ServiceAreas, About, Testimonials, Gallery, FAQ, Contact } from './pages/public/SimplePages';
import Login from './pages/auth/Login';

import Dashboard from './pages/dashboard/Dashboard';
import LeadsList from './pages/leads/LeadsList';
import LeadDetail from './pages/leads/LeadDetail';
import QuotesList from './pages/quotes/QuotesList';
import QuoteDetail from './pages/quotes/QuoteDetail';
import ContractsList from './pages/contracts/ContractsList';
import ContractDetail from './pages/contracts/ContractDetail';
import Calendar from './pages/calendar/Calendar';
import JobsList from './pages/jobs/JobsList';
import JobDetail from './pages/jobs/JobDetail';
import EmployeesList from './pages/employees/EmployeesList';
import CustomersList from './pages/customers/CustomersList';
import CustomerDetail from './pages/customers/CustomerDetail';
import InvoicesList from './pages/invoices/InvoicesList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import FeedbackPage from './pages/feedback/FeedbackPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AuditLogPage from './pages/audit/AuditLogPage';
import SettingsPage from './pages/settings/SettingsPage';
import UsersList from './pages/users/UsersList';

import EmployeeToday from './pages/mobile/EmployeeToday';
import EmployeeJobDetail from './pages/mobile/EmployeeJobDetail';

import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerQuotes from './pages/customer/CustomerQuotes';
import CustomerContracts from './pages/customer/CustomerContracts';
import CustomerSchedule from './pages/customer/CustomerSchedule';
import CustomerHistory from './pages/customer/CustomerHistory';
import CustomerInvoices from './pages/customer/CustomerInvoices';

import './styles.css';

const STAFF_ROLES = ['OWNER', 'MANAGER'];

function RoleHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'EMPLOYEE') return <Navigate to="/app/mobile" replace />;
  if (user.role === 'CUSTOMER') return <Navigate to="/app/portal" replace />;
  return <Navigate to="/app/dashboard" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/request-quote" element={<RequestQuote />} />
              <Route path="/services" element={<Services />} />
              <Route path="/commercial-cleaning" element={<CommercialCleaning />} />
              <Route path="/residential-cleaning" element={<ResidentialCleaning />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/service-areas" element={<ServiceAreas />} />
              <Route path="/about" element={<About />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            <Route path="/login" element={<Login />} />

            <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<RoleHome />} />

              {/* Owner/Manager */}
              <Route path="dashboard" element={<ProtectedRoute roles={STAFF_ROLES}><Dashboard /></ProtectedRoute>} />
              <Route path="leads" element={<ProtectedRoute roles={STAFF_ROLES}><LeadsList /></ProtectedRoute>} />
              <Route path="leads/:id" element={<ProtectedRoute roles={STAFF_ROLES}><LeadDetail /></ProtectedRoute>} />
              <Route path="quotes" element={<ProtectedRoute roles={STAFF_ROLES}><QuotesList /></ProtectedRoute>} />
              <Route path="quotes/:id" element={<ProtectedRoute roles={['OWNER', 'MANAGER', 'CUSTOMER']}><QuoteDetail /></ProtectedRoute>} />
              <Route path="contracts" element={<ProtectedRoute roles={STAFF_ROLES}><ContractsList /></ProtectedRoute>} />
              <Route path="contracts/:id" element={<ProtectedRoute roles={['OWNER', 'MANAGER', 'CUSTOMER']}><ContractDetail /></ProtectedRoute>} />
              <Route path="calendar" element={<ProtectedRoute roles={STAFF_ROLES}><Calendar /></ProtectedRoute>} />
              <Route path="jobs" element={<ProtectedRoute roles={STAFF_ROLES}><JobsList /></ProtectedRoute>} />
              <Route path="jobs/:id" element={<ProtectedRoute roles={STAFF_ROLES}><JobDetail /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute roles={STAFF_ROLES}><EmployeesList /></ProtectedRoute>} />
              <Route path="customers" element={<ProtectedRoute roles={STAFF_ROLES}><CustomersList /></ProtectedRoute>} />
              <Route path="customers/:id" element={<ProtectedRoute roles={STAFF_ROLES}><CustomerDetail /></ProtectedRoute>} />
              <Route path="invoices" element={<ProtectedRoute roles={STAFF_ROLES}><InvoicesList /></ProtectedRoute>} />
              <Route path="invoices/:id" element={<ProtectedRoute roles={['OWNER', 'MANAGER', 'CUSTOMER']}><InvoiceDetail /></ProtectedRoute>} />
              <Route path="feedback" element={<ProtectedRoute roles={STAFF_ROLES}><FeedbackPage /></ProtectedRoute>} />
              <Route path="analytics" element={<ProtectedRoute roles={STAFF_ROLES}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="audit" element={<ProtectedRoute roles={['OWNER']}><AuditLogPage /></ProtectedRoute>} />
              <Route path="users" element={<ProtectedRoute roles={['OWNER']}><UsersList /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute roles={STAFF_ROLES}><SettingsPage /></ProtectedRoute>} />

              {/* Employee mobile */}
              <Route path="mobile" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeToday /></ProtectedRoute>} />
              <Route path="mobile/:id" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeJobDetail /></ProtectedRoute>} />

              {/* Customer portal */}
              <Route path="portal" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="portal/quotes" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerQuotes /></ProtectedRoute>} />
              <Route path="portal/contracts" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerContracts /></ProtectedRoute>} />
              <Route path="portal/schedule" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerSchedule /></ProtectedRoute>} />
              <Route path="portal/history" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerHistory /></ProtectedRoute>} />
              <Route path="portal/invoices" element={<ProtectedRoute roles={['CUSTOMER']}><CustomerInvoices /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
    </ErrorBoundary>
  );
}
