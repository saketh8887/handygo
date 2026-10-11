import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Flow
import BookService from './pages/BookService';
import MyBookings from './pages/MyBookings';
import BookingDetail from './pages/BookingDetail';
import SavedAddresses from './pages/SavedAddresses';
import Invoices from './pages/Invoices';

// Handyman Flow
import HandymanDashboard from './pages/HandymanDashboard';
import JobExecution from './pages/JobExecution';
import HandymanProfile from './pages/HandymanProfile';

// Admin Flow
import AdminDashboard from './pages/AdminDashboard';
import AdminBookings from './pages/AdminBookings';
import AdminHandymen from './pages/AdminHandymen';
import AdminServices from './pages/AdminServices';
import AdminAuditLogs from './pages/AdminAuditLogs';
import AdminTeams from './pages/AdminTeams';
import TeamDashboard from './pages/TeamDashboard';

// Inventory & Logistics Flow
import InventoryDashboard from './pages/InventoryDashboard';
import StockBalances from './pages/StockBalances';
import ReplenishmentPlanning from './pages/ReplenishmentPlanning';
import StockTransfers from './pages/StockTransfers';
import PurchaseOrders from './pages/PurchaseOrders';

// Supplier Flow
import SupplierDashboard from './pages/SupplierDashboard';

// 404 Component
function NotFound() {
  return (
    <div className="container py-5 text-center">
      <div className="py-5">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h3 className="fw-bold mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">
          The requested page could not be located on the HandyConnect platform.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

function TrackJobRedirect() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/track-job' } }} replace />;
  }
  return <Navigate to="/customer/bookings" replace />;
}

export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/catalogue" element={<Navigate to="/services" replace />} />
            <Route path="/catalog" element={<Navigate to="/services" replace />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Customer Routes & Canonical Aliases */}
            <Route
              path="/book"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <BookService />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />
            <Route path="/bookings" element={<Navigate to="/customer/bookings" replace />} />
            <Route path="/my-bookings" element={<Navigate to="/customer/bookings" replace />} />
            <Route path="/track-job" element={<TrackJobRedirect />} />
            <Route path="/track" element={<TrackJobRedirect />} />

            {/* Canonical Booking Details Route & Legacy Aliases */}
            <Route
              path="/bookings/:id"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_HANDYMAN', 'ROLE_INVENTORY_MANAGER']}>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/bookings/:id"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN', 'ROLE_HANDYMAN', 'ROLE_INVENTORY_MANAGER']}>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/addresses"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <SavedAddresses />
                </ProtectedRoute>
              }
            />
            <Route path="/addresses" element={<Navigate to="/customer/addresses" replace />} />
            <Route
              path="/customer/invoices"
              element={
                <ProtectedRoute roles={['ROLE_CUSTOMER', 'ROLE_ADMIN']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route path="/invoices" element={<Navigate to="/customer/invoices" replace />} />

          {/* Handyman Routes */}
          <Route
            path="/handyman"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <HandymanDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/handyman/workbench" element={<Navigate to="/handyman" replace />} />
          <Route path="/handyman/dashboard" element={<Navigate to="/handyman" replace />} />
          <Route path="/handyman/jobs" element={<Navigate to="/handyman" replace />} />

          {/* Handyman Job Execution Routes & Canonical Aliases */}
          <Route
            path="/handyman/jobs/:id/execution"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/jobs/:jobId/execution"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/jobs/:id/execute"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/jobs/:jobId/execute"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/jobs/:id"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/jobs/:jobId"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <JobExecution />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handyman/profile"
            element={
              <ProtectedRoute roles={['ROLE_HANDYMAN', 'ROLE_ADMIN']}>
                <HandymanProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/handymen"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminHandymen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminTeams />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teams/:id"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <TeamDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminAuditLogs />
              </ProtectedRoute>
            }
          />

          {/* Inventory & Logistics Routes */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute roles={['ROLE_INVENTORY_MANAGER', 'ROLE_ADMIN']}>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/balances"
            element={
              <ProtectedRoute roles={['ROLE_INVENTORY_MANAGER', 'ROLE_ADMIN']}>
                <StockBalances />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/replenishment"
            element={
              <ProtectedRoute roles={['ROLE_INVENTORY_MANAGER', 'ROLE_ADMIN']}>
                <ReplenishmentPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/transfers"
            element={
              <ProtectedRoute roles={['ROLE_INVENTORY_MANAGER', 'ROLE_ADMIN']}>
                <StockTransfers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/orders"
            element={
              <ProtectedRoute roles={['ROLE_INVENTORY_MANAGER', 'ROLE_ADMIN']}>
                <PurchaseOrders />
              </ProtectedRoute>
            }
          />

          {/* Supplier Routes */}
          <Route
            path="/supplier"
            element={
              <ProtectedRoute roles={['ROLE_SUPPLIER', 'ROLE_ADMIN']}>
                <SupplierDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
