import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import {
  Wrench, Zap, Hammer, Cpu, Paintbrush, Wind, Settings,
  ShieldCheck, Clock, CheckCircle2, ArrowRight, Truck, Boxes, Award
} from 'lucide-react';

const iconMap = {
  Wrench: <Wrench size={32} className="text-primary" />,
  Zap: <Zap size={32} className="text-warning" />,
  Hammer: <Hammer size={32} className="text-danger" />,
  Cpu: <Cpu size={32} className="text-info" />,
  Paintbrush: <Paintbrush size={32} className="text-success" />,
  Wind: <Wind size={32} className="text-primary" />,
  Tool: <Settings size={32} className="text-secondary" />,
};

export const Home = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-5 py-lg-6 position-relative overflow-hidden">
        <div className="container py-4">
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-25 text-info px-3 py-2 rounded-pill fw-medium mb-3 border border-primary border-opacity-50">
                Integrated Logistics & Material Coordination
              </span>
              <h1 className="display-4 fw-extrabold mb-3 text-white">
                Reliable Handyman Services, Delivered with the Right Spare Parts.
              </h1>
              <p className="lead text-light text-opacity-75 mb-4">
                No more surprise trips to the hardware store or delayed appointments. HandyConnect coordinates booking, technician availability, warehouse inventory, and multi-location logistics for guaranteed job readiness.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/book" className="btn btn-primary btn-lg rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
                  <span>Book a Repair Now</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-outline-light btn-lg rounded-pill px-4">
                  Explore Catalogue
                </Link>
              </div>

              <div className="row mt-5 pt-3 border-top border-light border-opacity-25 gy-3">
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <ShieldCheck className="text-info" size={24} />
                  <span className="small text-light">100% Background-Checked Pros</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <Boxes className="text-info" size={24} />
                  <span className="small text-light">Guaranteed Material Readiness</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2">
                  <Award className="text-info" size={24} />
                  <span className="small text-light">Transparent Upfront Pricing</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card bg-white text-dark shadow-lg p-4 border-0 rounded-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill">
                    System Feature Highlight
                  </span>
                  <span className="small text-muted">Intelligent Engine</span>
                </div>
                <h5 className="fw-bold mb-2">Job Readiness Coordination Engine</h5>
                <p className="text-secondary small mb-3">
                  Every booking runs through our deterministic decision engine that verifies required technician skills, material availability across 3 warehouses, and supplier lead times before dispatch.
                </p>

                <div className="bg-light p-3 rounded-3 mb-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">Plumbing Pipe Leak Repair</span>
                    <span className="badge bg-success text-white">READY (98%)</span>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                    Central Warehouse: 45 PEX pipes in stock &bull; Certified Plumber Robert Smith rostered
                  </div>
                </div>

                <div className="bg-light p-3 rounded-3 border">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-semibold">Multi-Location Stock Transfer</span>
                    <span className="badge bg-info text-dark">PARTIALLY READY</span>
                  </div>
                  <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                    Item at North Suburban Hub &bull; Transfer scheduled before appointment window
                  </div>
                </div>

                <div className="mt-4">
                  <Link to="/book" className="btn btn-outline-primary w-100 rounded-pill">
                    Try Booking Experience
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill mb-2">
              Our Capabilities
            </span>
            <h2 className="fw-bold">Browse Professional Service Categories</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Explore standardized home repair services with transparent indicative prices and standard material requirements.
            </p>
          </div>

          <div className="row g-4">
            {categories.map((cat) => (
              <div key={cat.id} className="col-lg-3 col-md-4 col-sm-6">
                <Link to={`/services?category=${cat.id}`} className="text-decoration-none text-dark">
                  <div className="card h-100 p-4 text-center card-hover">
                    <div className="mb-3 d-flex justify-content-center">
                      <div className="bg-light p-3 rounded-circle shadow-sm">
                        {iconMap[cat.iconName] || <Wrench size={32} className="text-primary" />}
                      </div>
                    </div>
                    <h5 className="fw-bold mb-2">{cat.name}</h5>
                    <p className="text-secondary small mb-3">{cat.description}</p>
                    <div className="mt-auto text-primary fw-medium small d-flex align-items-center justify-content-center gap-1">
                      <span>View Services</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-light border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-3 py-2 rounded-pill mb-2">
              Workflow Overview
            </span>
            <h2 className="fw-bold">How HandyConnect Solves Service Delays</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '650px' }}>
              Traditional services suffer from missing parts, wrong technician skillsets, and opaque billing. HandyConnect's synchronized workflow coordinates each step end-to-end.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm">
                <div className="metric-icon bg-primary text-white mx-auto mb-3 fs-5 fw-bold">1</div>
                <h5 className="fw-bold">Instant Booking</h5>
                <p className="text-muted small">
                  Customer selects service, date, time slot, and describes problem with optional photos.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm">
                <div className="metric-icon bg-info text-white mx-auto mb-3 fs-5 fw-bold">2</div>
                <h5 className="fw-bold">Material & Pro Matching</h5>
                <p className="text-muted small">
                  Readiness engine checks local stock, reserves pipes/fittings, and scores technician skills.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm">
                <div className="metric-icon bg-warning text-white mx-auto mb-3 fs-5 fw-bold">3</div>
                <h5 className="fw-bold">Job Execution</h5>
                <p className="text-muted small">
                  Handyman accepts job, arrives on site with reserved parts, and records material consumption.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="card h-100 p-4 border-0 shadow-sm">
                <div className="metric-icon bg-success text-white mx-auto mb-3 fs-5 fw-bold">4</div>
                <h5 className="fw-bold">Simulated Pay & Invoice</h5>
                <p className="text-muted small">
                  Customer reviews job completion notes, validates materials used, and completes receipt payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
