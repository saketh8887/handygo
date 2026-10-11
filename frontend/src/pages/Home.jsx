import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Wrench, Zap, Hammer, Cpu, Paintbrush, Wind, Settings,
  ShieldCheck, Clock, CheckCircle2, ArrowRight, Truck, Boxes, Award,
  Sparkles, Calendar, MapPin, ChevronRight, Check, Search, Star
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Skeleton from '../components/Skeleton';

const iconMap = {
  Wrench: <Wrench size={28} className="text-primary" />,
  Zap: <Zap size={28} className="text-warning" />,
  Hammer: <Hammer size={28} className="text-danger" />,
  Cpu: <Cpu size={28} className="text-info" />,
  Paintbrush: <Paintbrush size={28} className="text-success" />,
  Wind: <Wind size={28} className="text-primary" />,
  Tool: <Settings size={28} className="text-secondary" />,
};

export const Home = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const catRes = await api.get('/categories');
        if (catRes.data && catRes.data.data) {
          setCategories(catRes.data.data);
        }

        if (user && user.role === 'ROLE_CUSTOMER') {
          try {
            const bookRes = await api.get('/bookings');
            if (bookRes.data && bookRes.data.data) {
              setRecentBookings(bookRes.data.data.slice(0, 3));
            }
          } catch (e) {
            // Non-critical if bookings fail
          }
        }
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const activeBooking = recentBookings.find(b => 
    !['COMPLETED', 'CANCELLED'].includes(b.status)
  );

  const filteredCategories = categories.filter(c => 
    !searchQuery || 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Logged-In Customer Quick Action Banner */}
      {user && user.role === 'ROLE_CUSTOMER' && (
        <section className="bg-white border-bottom py-3">
          <div className="container">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                >
                  {user.name ? user.name[0].toUpperCase() : 'C'}
                </div>
                <div>
                  <h5 className="fw-bold text-dark mb-0">Welcome back, {user.name || 'Valued Customer'}!</h5>
                  <p className="text-secondary small mb-0">Need home maintenance or spare-parts repair today?</p>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <Link to="/book" className="btn btn-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 shadow-sm fw-medium">
                  <Sparkles size={15} /> Book a Service
                </Link>
                <Link to="/customer/bookings" className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
                  <Calendar size={15} /> My Bookings
                </Link>
              </div>
            </div>

            {/* Active Booking Notification Card if there's an ongoing job */}
            {activeBooking && (
              <div className="hc-card p-3 mt-3 border-0 shadow-sm border-start border-4 border-primary bg-primary bg-opacity-5">
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                  <div className="d-flex align-items-center gap-2.5">
                    <span className="spinner-grow spinner-grow-sm text-primary" role="status" />
                    <div>
                      <span className="fw-semibold text-dark small">Active Job in Progress: </span>
                      <span className="fw-bold text-primary small">#{activeBooking.bookingNumber} - {activeBooking.serviceName}</span>
                      <span className="ms-2"><StatusBadge status={activeBooking.status} /></span>
                    </div>
                  </div>
                  <Link 
                    to={`/bookings/${activeBooking.id}`} 
                    className="btn btn-sm btn-primary px-3 py-1 rounded-pill d-inline-flex align-items-center gap-1 align-self-start align-self-sm-auto text-xs"
                  >
                    <span>Track Live Job</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section 
        className="text-white py-5 py-lg-6 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #0F172A 100%)',
        }}
      >
        <div className="container py-3 position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center gy-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-15 text-white mb-4 shadow-sm" style={{ fontSize: '0.82rem' }}>
                <span className="badge bg-primary px-2 py-0.5 rounded-pill text-white" style={{ fontSize: '0.7rem' }}>PATENTED LOGISTICS</span>
                <span className="text-light text-opacity-90">First-Visit Resolution with Pre-Allocated Parts</span>
              </div>

              <h1 className="display-5 fw-bold mb-3 text-white lh-sm" style={{ letterSpacing: '-0.025em' }}>
                Reliable Handyman Services, Delivered with the <span style={{ color: 'var(--hc-accent)' }}>Right Spare Parts</span>.
              </h1>
              <p className="lead text-light text-opacity-75 mb-4" style={{ fontSize: '1.08rem', maxWidth: '580px' }}>
                Never suffer through repeated visits or hardware store delays. HandyConnect autonomously checks 3 regional warehouses, reserves certified components, and dispatches vetted tradespeople guaranteed.
              </p>

              {/* Fast Booking CTA */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link to="/book" className="btn btn-primary btn-lg rounded-3 px-4 shadow-sm d-inline-flex align-items-center gap-2 fw-semibold" style={{ fontSize: '1rem' }}>
                  <span>Book a Certified Pro</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/services" className="btn btn-outline-light btn-lg rounded-3 px-4 fw-medium" style={{ fontSize: '1rem', borderColor: 'rgba(255,255,255,0.3)' }}>
                  Browse Catalogue
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="row g-3 pt-3 border-top border-white border-opacity-15">
                <div className="col-sm-4 d-flex align-items-center gap-2 text-white">
                  <ShieldCheck className="text-info flex-shrink-0" size={20} />
                  <span className="small text-light text-opacity-90">100% Background-Vetted</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2 text-white">
                  <Boxes className="text-info flex-shrink-0" size={20} />
                  <span className="small text-light text-opacity-90">Parts Reserved in Warehouse</span>
                </div>
                <div className="col-sm-4 d-flex align-items-center gap-2 text-white">
                  <Award className="text-info flex-shrink-0" size={20} />
                  <span className="small text-light text-opacity-90">Zero Hidden Surcharges</span>
                </div>
              </div>
            </div>

            {/* Right Card: Interactive Job Readiness Showcase */}
            <div className="col-lg-5">
              <div className="hc-card bg-white text-dark shadow-xl p-4 border-0 rounded-4">
                <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                  <span className="badge bg-success bg-opacity-15 text-success px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
                    ● LIVE COORDINATION ENGINE
                  </span>
                  <span className="small text-secondary fw-medium">Deterministic Scoring</span>
                </div>
                
                <h5 className="fw-bold mb-2 text-dark">Autonomous Job Readiness</h5>
                <p className="text-secondary small mb-3">
                  Every booking runs through our multi-echelon engine before technician dispatch to ensure 100% parts compatibility.
                </p>

                {/* Example Evaluation 1 */}
                <div className="p-3 rounded-3 mb-2.5 border bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold text-dark">Plumbing Pipe Leak Repair</span>
                    <span className="badge bg-success text-white" style={{ fontSize: '0.7rem' }}>READY (98%)</span>
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                    Central Warehouse: 45 PEX pipes reserved &bull; Master Plumber allocated
                  </div>
                </div>

                {/* Example Evaluation 2 */}
                <div className="p-3 rounded-3 mb-3 border bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="small fw-bold text-dark">HVAC Capacitor Replacement</span>
                    <span className="badge bg-info text-dark" style={{ fontSize: '0.7rem' }}>PARTIALLY READY</span>
                  </div>
                  <div className="text-secondary small" style={{ fontSize: '0.78rem' }}>
                    North Suburban Hub &bull; Automatic stock transit scheduled before slot
                  </div>
                </div>

                <Link to="/book" className="btn btn-outline-primary w-100 rounded-3 py-2 fw-medium d-flex align-items-center justify-content-center gap-2">
                  <span>Start a Verified Booking</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories Section */}
      <section className="py-5 bg-white">
        <div className="container py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-3">
            <div>
              <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill mb-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
                OUR SERVICE EXPERTISE
              </span>
              <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                Browse Professional Trade Categories
              </h2>
              <p className="text-secondary small mb-0">
                Transparent indicative pricing, vetted tradespeople, and guaranteed spare parts catalog.
              </p>
            </div>

            {/* Quick Filter */}
            <div className="position-relative" style={{ minWidth: 260 }}>
              <Search size={16} className="text-secondary position-absolute" style={{ left: 12, top: 12 }} />
              <input
                type="text"
                className="form-control form-control-sm ps-4 py-2 rounded-3 border"
                placeholder="Search category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="col-lg-3 col-md-4 col-sm-6">
                  <Skeleton height="180px" />
                </div>
              ))}
            </div>
          ) : (
            <div className="row g-4">
              {filteredCategories.map((cat) => (
                <div key={cat.id} className="col-lg-3 col-md-4 col-sm-6">
                  <Link to={`/services?category=${cat.id}`} className="text-decoration-none text-dark h-100 d-block">
                    <div className="hc-card h-100 p-4 text-center border transition-all" style={{ borderRadius: '12px' }}>
                      <div className="mb-3 d-flex justify-content-center">
                        <div className="p-3 rounded-circle shadow-sm" style={{ backgroundColor: 'var(--hc-bg)' }}>
                          {iconMap[cat.iconName] || <Wrench size={28} className="text-primary" />}
                        </div>
                      </div>
                      <h6 className="fw-bold mb-1.5 text-dark">{cat.name}</h6>
                      <p className="text-secondary small mb-3 line-clamp-2" style={{ fontSize: '0.82rem', minHeight: '38px' }}>
                        {cat.description}
                      </p>
                      <div className="mt-auto text-primary fw-medium small d-flex align-items-center justify-content-center gap-1">
                        <span>Explore Services</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 border-top border-bottom" style={{ backgroundColor: 'var(--hc-bg)' }}>
        <div className="container py-3">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill mb-2 fw-semibold" style={{ fontSize: '0.75rem' }}>
              HOW HANDYCONNECT WORKS
            </span>
            <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Eliminating Handyman Delays Once and For All
            </h2>
            <p className="text-secondary small mx-auto mb-0" style={{ maxWidth: '600px' }}>
              Traditional services suffer from missing parts, wrong technician skillsets, and opaque billing. HandyConnect's synchronized workflow coordinates each step end-to-end.
            </p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-lg-3 col-md-6">
              <div className="hc-card h-100 p-4 border-0 shadow-sm">
                <div 
                  className="rounded-circle bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                >
                  1
                </div>
                <h6 className="fw-bold text-dark mb-1.5">Instant Booking</h6>
                <p className="text-secondary small mb-0">
                  Select service, time slot, and describe the issue with optional photo attachments.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="hc-card h-100 p-4 border-0 shadow-sm">
                <div 
                  className="rounded-circle bg-info text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                >
                  2
                </div>
                <h6 className="fw-bold text-dark mb-1.5">Parts &amp; Pro Scoring</h6>
                <p className="text-secondary small mb-0">
                  Autonomous engine verifies warehouse inventory, reserves materials, and matches top-rated technician.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="hc-card h-100 p-4 border-0 shadow-sm">
                <div 
                  className="rounded-circle bg-warning text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                >
                  3
                </div>
                <h6 className="fw-bold text-dark mb-1.5">First-Visit Execution</h6>
                <p className="text-secondary small mb-0">
                  Technician arrives with exact pre-allocated components, logs work notes, and takes completion photos.
                </p>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="hc-card h-100 p-4 border-0 shadow-sm">
                <div 
                  className="rounded-circle bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center fw-bold shadow-sm"
                  style={{ width: 44, height: 44, fontSize: '1.1rem' }}
                >
                  4
                </div>
                <h6 className="fw-bold text-dark mb-1.5">Transparent Invoicing</h6>
                <p className="text-secondary small mb-0">
                  Inspect itemized breakdown of labor and materials before completing seamless one-tap payment.
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
