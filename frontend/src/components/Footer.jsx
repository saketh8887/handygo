import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, CheckCircle2, Award, ExternalLink } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5">
      <div className="container">
        {/* Trust Badges Bar */}
        <div className="row g-3 pb-4 mb-4 border-bottom">
          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 text-primary" style={{ backgroundColor: '#eff6ff' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="fw-bold small text-dark">Verified Technicians</div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>Screened &amp; background checked</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 text-success" style={{ backgroundColor: '#f0fdf4' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div className="fw-bold small text-dark">Pre-Allocated Parts</div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>No empty-handed appointments</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 text-warning" style={{ backgroundColor: '#fffbeb' }}>
                <Clock size={20} />
              </div>
              <div>
                <div className="fw-bold small text-dark">On-Time Arrival</div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>Tracked appointment windows</div>
              </div>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-3 text-info" style={{ backgroundColor: '#ecfeff' }}>
                <Award size={20} />
              </div>
              <div>
                <div className="fw-bold small text-dark">Upfront Pricing</div>
                <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>No hidden charges or markups</div>
              </div>
            </div>
          </div>
        </div>

        {/* Links & Brand Description */}
        <div className="row gy-4 mb-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-2 text-white"
                style={{ width: 30, height: 30, backgroundColor: '#2563eb' }}
              >
                <Wrench size={16} />
              </div>
              <span className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
                Handy<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-secondary small mb-3" style={{ maxWidth: 320, lineHeight: 1.6 }}>
              The unified full-stack platform coordinating certified home service technicians, regional warehouse inventories, and automated material logistics.
            </p>
            <div className="d-flex align-items-center gap-2 small text-secondary">
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }}
              />
              <span>System Status: Core Engine &amp; DB Operational</span>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.04em' }}>
              Service Marketplace
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              <li>
                <Link to="/services" className="text-secondary text-decoration-none hover-primary">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/book" className="text-secondary text-decoration-none hover-primary">
                  Book a Service
                </Link>
              </li>
              <li>
                <Link to="/customer/bookings" className="text-secondary text-decoration-none hover-primary">
                  Track Bookings
                </Link>
              </li>
              <li>
                <Link to="/customer/invoices" className="text-secondary text-decoration-none hover-primary">
                  Billing &amp; Invoices
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-2 col-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.04em' }}>
              Operations &amp; Tech
            </h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small mb-0">
              <li>
                <Link to="/admin" className="text-secondary text-decoration-none hover-primary">
                  Admin Console
                </Link>
              </li>
              <li>
                <Link to="/handyman" className="text-secondary text-decoration-none hover-primary">
                  Technician Workbench
                </Link>
              </li>
              <li>
                <Link to="/inventory" className="text-secondary text-decoration-none hover-primary">
                  Logistics &amp; ROP
                </Link>
              </li>
              <li>
                <Link to="/supplier" className="text-secondary text-decoration-none hover-primary">
                  Supplier Portal
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="fw-bold text-dark small text-uppercase mb-3" style={{ letterSpacing: '0.04em' }}>
              Architecture &amp; API
            </h6>
            <p className="text-secondary small mb-2">
              Powered by Spring Boot 3.3.5, Java 21 LTS, React 18, and MySQL 8.
            </p>
            <div className="d-flex gap-2">
              <a
                href="/swagger-ui.html"
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.8rem' }}
              >
                <span>Swagger OpenAPI</span>
                <ExternalLink size={13} />
              </a>
              <Link
                to="/about"
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.8rem' }}
              >
                About Architecture
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Legal / Copyright */}
        <div className="pt-3 border-top d-flex flex-column flex-sm-row justify-content-between align-items-center small text-secondary gap-2">
          <div>
            &copy; {new Date().getFullYear()} HandyConnect Inc. Built for Google Antigravity.
          </div>
          <div className="d-flex gap-3">
            <Link to="/about" className="text-secondary text-decoration-none hover-primary">
              System Overview
            </Link>
            <Link to="/contact" className="text-secondary text-decoration-none hover-primary">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
