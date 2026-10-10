import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { Wrench, LogOut, User, Shield, Package, Truck, Calendar, Home } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isCustomer, isHandyman, isAdmin, isInventoryManager, isSupplier } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold text-white fs-4" to="/">
          <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center">
            <Wrench size={22} />
          </div>
          <span>Handy<span className="text-primary">Connect</span></span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3 gap-1">
            <li className="nav-item">
              <Link className="nav-link" to="/services">
                Services
              </Link>
            </li>

            {/* Customer Navigation */}
            {isCustomer && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/book">
                    Book Service
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-bookings">
                    My Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/addresses">
                    Saved Addresses
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/customer/invoices">
                    Invoices
                  </Link>
                </li>
              </>
            )}

            {/* Handyman Navigation */}
            {isHandyman && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/handyman/dashboard">
                    Jobs Portal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/handyman/schedule">
                    Availability
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/handyman/profile">
                    My Skills & Bio
                  </Link>
                </li>
              </>
            )}

            {/* Inventory Manager Navigation */}
            {isInventoryManager && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/inventory/dashboard">
                    Inventory Overview
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/inventory/balances">
                    Stock Balances
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/inventory/replenishment">
                    Replenishment Planning
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/inventory/transfers">
                    Warehouse Transfers
                  </Link>
                </li>
              </>
            )}

            {/* Supplier Navigation */}
            {isSupplier && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/supplier/dashboard">
                    Supplier Portal
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/supplier/orders">
                    Purchase Orders
                  </Link>
                </li>
              </>
            )}

            {/* Administrator Navigation */}
            {isAdmin && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/dashboard">
                    Admin Analytics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/bookings">
                    Dispatch & Bookings
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/handymen">
                    Technician Verification
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/services">
                    Catalog Management
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/inventory/balances">
                    Inventory & Logistics
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/admin/audit">
                    Audit Logs
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <div className="d-flex align-items-center gap-2 text-white">
                  <div className="bg-secondary bg-opacity-25 p-2 rounded-circle">
                    <User size={18} />
                  </div>
                  <div className="d-none d-md-block text-start" style={{ lineHeight: 1.2 }}>
                    <div className="fw-semibold small">{user.fullName}</div>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle" style={{ fontSize: '0.65rem' }}>
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </div>
                </div>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-pill px-3"
                  onClick={handleLogout}
                  title="Logout"
                >
                  <LogOut size={15} />
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm rounded-pill px-3">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3 fw-medium">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
