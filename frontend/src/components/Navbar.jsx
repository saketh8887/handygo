import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { 
  Wrench, LogOut, User, Shield, Package, Truck, Calendar, 
  MapPin, FileText, ChevronDown, Menu, X, PlusCircle, Activity
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isCustomer, isHandyman, isAdmin, isInventoryManager, isSupplier } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Extract initials
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const closeMenus = () => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="app-header sticky-top">
      <div className="container">
        <div className="d-flex align-items-center justify-content-between py-2 py-lg-3">
          {/* Brand Logo */}
          <Link
            to={user ? (isAdmin ? '/admin' : isHandyman ? '/handyman' : isInventoryManager ? '/inventory' : isSupplier ? '/supplier' : '/customer/bookings') : '/'}
            className="navbar-brand d-flex align-items-center gap-2 text-decoration-none"
            onClick={closeMenus}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-3 text-white shadow-sm"
              style={{ width: 38, height: 38, backgroundColor: '#2563eb' }}
            >
              <Wrench size={20} />
            </div>
            <div className="d-flex flex-column" style={{ lineHeight: 1.1 }}>
              <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
                Handy<span className="text-primary">Connect</span>
              </span>
              <span className="text-secondary small d-none d-sm-block" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                SERVICES & LOGISTICS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="d-none d-lg-flex align-items-center gap-1 ms-4">
            <Link
              to="/services"
              className={`nav-link-custom ${isActive('/services') ? 'active' : ''}`}
            >
              Services
            </Link>

            {/* Customer Role Links */}
            {isCustomer && (
              <>
                <Link
                  to="/book"
                  className={`nav-link-custom ${isActive('/book') ? 'active' : ''}`}
                >
                  <PlusCircle size={15} className="text-primary" />
                  <span>Book Service</span>
                </Link>
                <Link
                  to="/customer/bookings"
                  className={`nav-link-custom ${isActive('/customer/bookings') ? 'active' : ''}`}
                >
                  <Calendar size={15} />
                  <span>My Bookings</span>
                </Link>
                <Link
                  to="/customer/addresses"
                  className={`nav-link-custom ${isActive('/customer/addresses') ? 'active' : ''}`}
                >
                  <MapPin size={15} />
                  <span>Addresses</span>
                </Link>
                <Link
                  to="/customer/invoices"
                  className={`nav-link-custom ${isActive('/customer/invoices') ? 'active' : ''}`}
                >
                  <FileText size={15} />
                  <span>Invoices</span>
                </Link>
              </>
            )}

            {/* Handyman Links */}
            {isHandyman && (
              <>
                <Link
                  to="/handyman"
                  className={`nav-link-custom ${isActive('/handyman') && !location.pathname.includes('/profile') ? 'active' : ''}`}
                >
                  <Activity size={15} />
                  <span>Workbench</span>
                </Link>
                <Link
                  to="/handyman/profile"
                  className={`nav-link-custom ${isActive('/handyman/profile') ? 'active' : ''}`}
                >
                  <Wrench size={15} />
                  <span>Skills &amp; Profile</span>
                </Link>
              </>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <>
                <Link
                  to="/admin"
                  className={`nav-link-custom ${location.pathname === '/admin' ? 'active' : ''}`}
                >
                  <span>Analytics</span>
                </Link>
                <Link
                  to="/admin/bookings"
                  className={`nav-link-custom ${isActive('/admin/bookings') ? 'active' : ''}`}
                >
                  <span>Dispatch Board</span>
                </Link>
                <Link
                  to="/admin/handymen"
                  className={`nav-link-custom ${isActive('/admin/handymen') ? 'active' : ''}`}
                >
                  <span>Technicians</span>
                </Link>
                <Link
                  to="/admin/teams"
                  className={`nav-link-custom ${isActive('/admin/teams') ? 'active' : ''}`}
                >
                  <span>Teams</span>
                </Link>
                <Link
                  to="/admin/services"
                  className={`nav-link-custom ${isActive('/admin/services') ? 'active' : ''}`}
                >
                  <span>Catalog</span>
                </Link>
                <Link
                  to="/inventory/balances"
                  className={`nav-link-custom ${isActive('/inventory') ? 'active' : ''}`}
                >
                  <span>Inventory</span>
                </Link>
                <Link
                  to="/admin/audit"
                  className={`nav-link-custom ${isActive('/admin/audit') ? 'active' : ''}`}
                >
                  <span>Audit</span>
                </Link>
              </>
            )}

            {/* Inventory Manager Links */}
            {isInventoryManager && (
              <>
                <Link
                  to="/inventory"
                  className={`nav-link-custom ${location.pathname === '/inventory' ? 'active' : ''}`}
                >
                  <span>Inventory HQ</span>
                </Link>
                <Link
                  to="/inventory/balances"
                  className={`nav-link-custom ${isActive('/inventory/balances') ? 'active' : ''}`}
                >
                  <span>Stock Balances</span>
                </Link>
                <Link
                  to="/inventory/replenishment"
                  className={`nav-link-custom ${isActive('/inventory/replenishment') ? 'active' : ''}`}
                >
                  <span>Replenishment</span>
                </Link>
                <Link
                  to="/inventory/transfers"
                  className={`nav-link-custom ${isActive('/inventory/transfers') ? 'active' : ''}`}
                >
                  <span>Transfers</span>
                </Link>
                <Link
                  to="/inventory/orders"
                  className={`nav-link-custom ${isActive('/inventory/orders') ? 'active' : ''}`}
                >
                  <span>Purchase Orders</span>
                </Link>
              </>
            )}

            {/* Supplier Links */}
            {isSupplier && (
              <>
                <Link
                  to="/supplier"
                  className={`nav-link-custom ${isActive('/supplier') ? 'active' : ''}`}
                >
                  <Truck size={15} />
                  <span>Supplier Portal</span>
                </Link>
                <Link
                  to="/inventory/orders"
                  className={`nav-link-custom ${isActive('/inventory/orders') ? 'active' : ''}`}
                >
                  <span>Purchase Orders</span>
                </Link>
              </>
            )}

            <Link
              to="/about"
              className={`nav-link-custom ${isActive('/about') ? 'active' : ''}`}
            >
              About
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            {user ? (
              <>
                <NotificationBell />

                {/* Profile Avatar & Dropdown */}
                <div className="position-relative">
                  <button
                    className="btn btn-light d-flex align-items-center gap-2 p-1 pe-2 rounded-pill border bg-white shadow-xs"
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold"
                      style={{ width: 32, height: 32, backgroundColor: '#eff6ff', fontSize: '0.8rem' }}
                    >
                      {getInitials(user.fullName)}
                    </div>
                    <div className="d-none d-md-block text-start pe-1" style={{ lineHeight: 1.15 }}>
                      <div className="fw-semibold text-dark small" style={{ fontSize: '0.825rem' }}>
                        {user.fullName}
                      </div>
                      <span
                        className="badge px-1 py-0"
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          fontWeight: 500,
                        }}
                      >
                        {user.role?.replace('ROLE_', '') || 'CUSTOMER'}
                      </span>
                    </div>
                    <ChevronDown size={14} className="text-secondary d-none d-md-block" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="dropdown-menu dropdown-menu-end show shadow-lg border rounded-3 p-2 mt-2 position-absolute"
                      style={{ right: 0, minWidth: 200, zIndex: 1050 }}
                    >
                      <div className="px-3 py-2 border-bottom mb-1">
                        <div className="fw-bold small text-dark">{user.fullName}</div>
                        <div className="text-secondary small text-truncate" style={{ fontSize: '0.75rem' }}>
                          {user.email}
                        </div>
                      </div>

                      {isCustomer && (
                        <>
                          <Link
                            to="/customer/bookings"
                            className="dropdown-item small py-2 rounded-2 d-flex align-items-center gap-2"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <Calendar size={15} className="text-primary" />
                            <span>My Bookings</span>
                          </Link>
                          <Link
                            to="/customer/addresses"
                            className="dropdown-item small py-2 rounded-2 d-flex align-items-center gap-2"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <MapPin size={15} className="text-secondary" />
                            <span>Saved Addresses</span>
                          </Link>
                          <Link
                            to="/customer/invoices"
                            className="dropdown-item small py-2 rounded-2 d-flex align-items-center gap-2"
                            onClick={() => setUserDropdownOpen(false)}
                          >
                            <FileText size={15} className="text-secondary" />
                            <span>Invoices</span>
                          </Link>
                        </>
                      )}

                      {isHandyman && (
                        <Link
                          to="/handyman/profile"
                          className="dropdown-item small py-2 rounded-2 d-flex align-items-center gap-2"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Wrench size={15} className="text-primary" />
                          <span>My Skills &amp; Profile</span>
                        </Link>
                      )}

                      <div className="dropdown-divider my-1" />

                      <button
                        className="dropdown-item small py-2 text-danger rounded-2 d-flex align-items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-secondary px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary px-3">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              className="btn btn-sm btn-light border d-lg-none p-2 rounded-3 text-secondary"
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="d-lg-none border-top py-3">
            <nav className="d-flex flex-column gap-1">
              <Link to="/services" className="nav-link-custom" onClick={closeMenus}>
                Services
              </Link>

              {isCustomer && (
                <>
                  <Link to="/book" className="nav-link-custom text-primary fw-semibold" onClick={closeMenus}>
                    <PlusCircle size={16} /> Book Service
                  </Link>
                  <Link to="/customer/bookings" className="nav-link-custom" onClick={closeMenus}>
                    <Calendar size={16} /> My Bookings
                  </Link>
                  <Link to="/customer/addresses" className="nav-link-custom" onClick={closeMenus}>
                    <MapPin size={16} /> Saved Addresses
                  </Link>
                  <Link to="/customer/invoices" className="nav-link-custom" onClick={closeMenus}>
                    <FileText size={16} /> Invoices
                  </Link>
                </>
              )}

              {isHandyman && (
                <>
                  <Link to="/handyman" className="nav-link-custom" onClick={closeMenus}>
                    <Activity size={16} /> Workbench
                  </Link>
                  <Link to="/handyman/profile" className="nav-link-custom" onClick={closeMenus}>
                    <Wrench size={16} /> Skills &amp; Profile
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link to="/admin" className="nav-link-custom" onClick={closeMenus}>
                    Analytics Dashboard
                  </Link>
                  <Link to="/admin/bookings" className="nav-link-custom" onClick={closeMenus}>
                    Dispatch Board
                  </Link>
                  <Link to="/admin/handymen" className="nav-link-custom" onClick={closeMenus}>
                    Technicians
                  </Link>
                  <Link to="/admin/teams" className="nav-link-custom" onClick={closeMenus}>
                    Service Teams &amp; Departments
                  </Link>
                  <Link to="/inventory/balances" className="nav-link-custom" onClick={closeMenus}>
                    Inventory &amp; Stock
                  </Link>
                  <Link to="/admin/audit" className="nav-link-custom" onClick={closeMenus}>
                    Audit Logs
                  </Link>
                </>
              )}

              {isInventoryManager && (
                <>
                  <Link to="/inventory" className="nav-link-custom" onClick={closeMenus}>
                    Inventory Overview
                  </Link>
                  <Link to="/inventory/balances" className="nav-link-custom" onClick={closeMenus}>
                    Stock Balances
                  </Link>
                  <Link to="/inventory/replenishment" className="nav-link-custom" onClick={closeMenus}>
                    Replenishment Planning
                  </Link>
                  <Link to="/inventory/transfers" className="nav-link-custom" onClick={closeMenus}>
                    Stock Transfers
                  </Link>
                </>
              )}

              {isSupplier && (
                <Link to="/supplier" className="nav-link-custom" onClick={closeMenus}>
                  Supplier Portal
                </Link>
              )}

              <Link to="/about" className="nav-link-custom" onClick={closeMenus}>
                About
              </Link>
              <Link to="/contact" className="nav-link-custom" onClick={closeMenus}>
                Contact Support
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
