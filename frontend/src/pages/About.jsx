import React from 'react';
import { ShieldCheck, Cpu, Box, Wrench, Clock, RefreshCw, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
          Enterprise Business Operations
        </span>
        <h1 className="fw-bold display-5">About HandyConnect</h1>
        <p className="text-muted lead max-w-700 mx-auto">
          The next-generation unified platform bridging on-demand handyman services, warehouse logistics, and real-time inventory coordination.
        </p>
      </div>

      {/* Core Mission */}
      <div className="row g-4 mb-5 align-items-center">
        <div className="col-lg-6">
          <h3 className="fw-bold mb-3">Solving the Triple Friction of Home Maintenance</h3>
          <p className="text-muted">
            Traditional service marketplaces only match customers to independent contractors. When the technician arrives, they frequently lack the required replacement parts, leading to aborted appointments, unexpected trips to hardware stores, and inflated customer bills.
          </p>
          <p className="text-muted">
            <strong>HandyConnect</strong> solves this through its <em>Job Readiness and Material Coordination Engine</em>. Every service booking automatically determines standard bill-of-materials, queries multi-regional inventory balances, reserves components, and schedules replenishment with explainable AI-backed logistics recommendations.
          </p>
          <div className="d-flex gap-3 mt-4">
            <Link to="/services" className="btn btn-primary px-4 py-2">
              Explore Services
            </Link>
            <Link to="/contact" className="btn btn-outline-secondary px-4 py-2">
              Contact Support
            </Link>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="card shadow-sm border-0 bg-light p-4 rounded-4">
            <h5 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
              <Layers size={20} /> System Architecture Overview
            </h5>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
              <li className="d-flex gap-3 align-items-start">
                <span className="p-2 rounded bg-primary text-white"><Cpu size={18} /></span>
                <div>
                  <strong>Backend:</strong> Java 21 LTS, Spring Boot 3.3.5, Spring Security with stateless JWT, Spring Data JPA with Pessimistic Locking.
                </div>
              </li>
              <li className="d-flex gap-3 align-items-start">
                <span className="p-2 rounded bg-success text-white"><Box size={18} /></span>
                <div>
                  <strong>Database:</strong> MySQL 8 with 33 normalized tables, Flyway automated migrations, immutable stock-movement ledger.
                </div>
              </li>
              <li className="d-flex gap-3 align-items-start">
                <span className="p-2 rounded bg-warning text-dark"><RefreshCw size={18} /></span>
                <div>
                  <strong>Deterministic Readiness Engine:</strong> Computes stock readiness levels (<code>READY</code>, <code>PARTIALLY_READY</code>, <code>AT_RISK</code>, <code>BLOCKED</code>) and evaluates regional transfer vs supplier purchase trade-offs.
                </div>
              </li>
              <li className="d-flex gap-3 align-items-start">
                <span className="p-2 rounded bg-info text-white"><Wrench size={18} /></span>
                <div>
                  <strong>Frontend:</strong> React 19, Vite, Bootstrap 5 custom system, Lucide icons, Recharts interactive data visualization.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3 Pillars */}
      <div className="row g-4 text-center mt-2">
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="text-primary mb-3">
              <ShieldCheck size={40} />
            </div>
            <h5 className="fw-bold">Vetted &amp; Certified Handymen</h5>
            <p className="text-muted small">
              All technicians undergo rigorous skill assessment, background check validation, and administrative onboarding before being assigned customer jobs.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="text-success mb-3">
              <Box size={40} />
            </div>
            <h5 className="fw-bold">Pre-Allocated Spare Parts</h5>
            <p className="text-muted small">
              Parts are reserved from regional warehouses before dispatch. Technicians never arrive empty-handed, eliminating wasted travel and delays.
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 border-0 shadow-sm p-4 rounded-4">
            <div className="text-warning mb-3">
              <Clock size={40} />
            </div>
            <h5 className="fw-bold">Real-Time State Machine</h5>
            <p className="text-muted small">
              Transparent job tracking from booking to completion with strictly validated status transitions, photo evidence, and digital invoices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
