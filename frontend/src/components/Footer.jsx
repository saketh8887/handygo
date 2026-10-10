import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Heart, Shield, Clock, CheckCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white p-2 rounded-3">
                <Wrench size={20} />
              </div>
              <h5 className="mb-0 fw-bold text-white">Handy<span className="text-primary">Connect</span></h5>
            </div>
            <p className="text-secondary small">
              Enterprise Handyman Service, Logistics and Inventory Management Platform.
              Connecting certified home service technicians, inventory managers, and suppliers with intelligent job readiness.
            </p>
            <div className="d-flex gap-3 text-secondary small">
              <span className="d-flex align-items-center gap-1"><Shield size={14} className="text-primary" /> Verified Pros</span>
              <span className="d-flex align-items-center gap-1"><Clock size={14} className="text-primary" /> On-Time Guarantee</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-semibold mb-3">Service Domains</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><Link to="/services" className="text-secondary text-decoration-none">Plumbing Services</Link></li>
              <li><Link to="/services" className="text-secondary text-decoration-none">Electrical Repairs</Link></li>
              <li><Link to="/services" className="text-secondary text-decoration-none">Carpentry & Locks</Link></li>
              <li><Link to="/services" className="text-secondary text-decoration-none">Air Conditioning</Link></li>
              <li><Link to="/services" className="text-secondary text-decoration-none">Wall Painting</Link></li>
            </ul>
          </div>

          <div className="col-lg-2 col-md-3 col-6">
            <h6 className="text-white fw-semibold mb-3">Platform Roles</h6>
            <ul className="list-unstyled text-secondary small d-flex flex-column gap-2">
              <li><Link to="/login" className="text-secondary text-decoration-none">Customer Portal</Link></li>
              <li><Link to="/register?role=HANDYMAN" className="text-secondary text-decoration-none">Become a Handyman</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">Inventory & Logistics</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">Supplier Hub</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none">Admin Console</Link></li>
            </ul>
          </div>

          <div className="col-lg-4 col-md-6">
            <h6 className="text-white fw-semibold mb-3">Platform Demo Accounts</h6>
            <div className="bg-secondary bg-opacity-10 p-3 rounded-3 text-secondary small">
              <p className="mb-1 text-white fw-medium">Universal Demo Password: <code>Password123!</code></p>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <span className="badge bg-secondary">admin@handyconnect.local</span>
                <span className="badge bg-secondary">customer@handyconnect.local</span>
                <span className="badge bg-secondary">handyman1@handyconnect.local</span>
                <span className="badge bg-secondary">inventory@handyconnect.local</span>
                <span className="badge bg-secondary">supplier@handyconnect.local</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-secondary small">
          <div>
            &copy; {new Date().getFullYear()} HandyConnect Inc. All rights reserved.
          </div>
          <div className="d-flex gap-3 mt-2 mt-sm-0">
            <Link to="/about" className="text-secondary text-decoration-none">About System</Link>
            <Link to="/contact" className="text-secondary text-decoration-none">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
