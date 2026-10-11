import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, Clock, MapPin, Wrench, ChevronRight, PlusCircle, 
  Search, XCircle, Filter, Zap, Hammer, Paintbrush, Wind, Cpu, 
  Package, CheckCircle2, User, X, DollarSign, ShieldCheck
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Breadcrumb from '../components/Breadcrumb';
import EmptyState from '../components/EmptyState';
import { BookingCardSkeleton } from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

// Helper for category icons
const getCategoryIcon = (categoryName = '') => {
  const cat = categoryName.toLowerCase();
  if (cat.includes('plumb')) return { icon: Wrench, bg: '#eff6ff', color: '#2563eb' };
  if (cat.includes('elect')) return { icon: Zap, bg: '#fffbeb', color: '#f59e0b' };
  if (cat.includes('carp')) return { icon: Hammer, bg: '#fef2f2', color: '#dc2626' };
  if (cat.includes('paint')) return { icon: Paintbrush, bg: '#f0fdf4', color: '#16a34a' };
  if (cat.includes('air') || cat.includes('ac') || cat.includes('hvac')) return { icon: Wind, bg: '#ecfeff', color: '#06b6d4' };
  if (cat.includes('appliance')) return { icon: Cpu, bg: '#fdf4ff', color: '#c026d3' };
  return { icon: Wrench, bg: '#f8fafc', color: '#64748b' };
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancellingId, setCancellingId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bookings');
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Could not retrieve your service bookings. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId, bookingRef) => {
    if (!window.confirm(`Are you sure you want to cancel booking #${bookingRef || bookingId}?`)) return;

    try {
      setCancellingId(bookingId);
      await api.patch(`/bookings/${bookingId}/status`, {
        status: 'CANCELLED',
        notes: 'Cancelled by customer',
      });
      showToast(`Booking #${bookingRef || bookingId} has been cancelled.`, 'info');
      fetchBookings();
    } catch (err) {
      console.error('Cancellation failed:', err);
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      showToast(msg, 'error');
    } finally {
      setCancellingId(null);
    }
  };

  // Status mapping
  const filterCounts = useMemo(() => {
    const counts = {
      ALL: bookings.length,
      PENDING: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    bookings.forEach((b) => {
      if (b.status === 'PENDING') counts.PENDING++;
      else if (b.status === 'ASSIGNED' || b.status === 'ACCEPTED') counts.ASSIGNED++;
      else if (['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)) counts.IN_PROGRESS++;
      else if (b.status === 'COMPLETED') counts.COMPLETED++;
      else if (b.status === 'CANCELLED' || b.status === 'REJECTED') counts.CANCELLED++;
    });

    return counts;
  }, [bookings]);

  // Filtered & Searched bookings
  const displayedBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Status Filter
      let matchesStatus = true;
      if (activeFilter === 'PENDING') matchesStatus = b.status === 'PENDING';
      else if (activeFilter === 'ASSIGNED') matchesStatus = b.status === 'ASSIGNED' || b.status === 'ACCEPTED';
      else if (activeFilter === 'IN_PROGRESS') {
        matchesStatus = ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status);
      } else if (activeFilter === 'COMPLETED') matchesStatus = b.status === 'COMPLETED';
      else if (activeFilter === 'CANCELLED') matchesStatus = b.status === 'CANCELLED' || b.status === 'REJECTED';

      if (!matchesStatus) return false;

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ref = (b.bookingReference || b.bookingNumber || '').toLowerCase();
        const svc = (b.serviceName || '').toLowerCase();
        const cat = (b.categoryName || b.serviceCategory || '').toLowerCase();
        const tech = (b.assignedHandymanName || '').toLowerCase();
        const addr = (b.customerAddress || b.addressLine || '').toLowerCase();

        return ref.includes(q) || svc.includes(q) || cat.includes(q) || tech.includes(q) || addr.includes(q);
      }

      return true;
    });
  }, [bookings, activeFilter, searchQuery]);

  // Aggregate stats
  const totalSpent = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || b.finalAmount || b.estimatedBasePrice || 0), 0);
  }, [bookings]);

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: 1180 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'My Bookings', to: '/customer/bookings' }]} />

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1" style={{ letterSpacing: '-0.025em' }}>
            My Service Bookings
          </h2>
          <p className="text-secondary small mb-0">
            Track real-time handyman dispatch, material readiness allocations, and billing invoices.
          </p>
        </div>
        <Link
          to="/book"
          className="btn btn-primary d-inline-flex align-items-center gap-2 px-3 py-2 shadow-sm text-nowrap"
        >
          <PlusCircle size={18} />
          <span>Book a Service</span>
        </Link>
      </div>

      {/* Booking Statistics Bar */}
      {!loading && bookings.length > 0 && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card p-3 border shadow-xs h-100 bg-white">
              <span className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                Total Bookings
              </span>
              <div className="fs-4 fw-bold text-dark mt-1">{bookings.length}</div>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>All-time service requests</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border shadow-xs h-100 bg-white">
              <span className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                Active / Dispatched
              </span>
              <div className="fs-4 fw-bold text-primary mt-1">
                {filterCounts.PENDING + filterCounts.ASSIGNED + filterCounts.IN_PROGRESS}
              </div>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Live jobs in pipeline</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border shadow-xs h-100 bg-white">
              <span className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                Completed Jobs
              </span>
              <div className="fs-4 fw-bold text-success mt-1">{filterCounts.COMPLETED}</div>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Successfully fulfilled</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 border shadow-xs h-100 bg-white">
              <span className="text-secondary small fw-semibold text-uppercase" style={{ fontSize: '0.72rem' }}>
                Total Invoiced
              </span>
              <div className="fs-4 fw-bold text-dark mt-1">${totalSpent.toFixed(2)}</div>
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Across completed repairs</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Status Filter Tabs */}
      <div className="card border shadow-xs p-3 mb-4 bg-white">
        <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center justify-content-between gap-3">
          {/* Segmented Pill Filter Tabs */}
          <div className="d-flex flex-wrap gap-1">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'ALL'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('ALL')}
            >
              All ({filterCounts.ALL})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'PENDING'
                  ? 'btn-warning text-dark shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('PENDING')}
            >
              Pending ({filterCounts.PENDING})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'ASSIGNED'
                  ? 'btn-primary shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('ASSIGNED')}
            >
              Assigned ({filterCounts.ASSIGNED})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'IN_PROGRESS'
                  ? 'btn-info text-white shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('IN_PROGRESS')}
            >
              In Progress ({filterCounts.IN_PROGRESS})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'COMPLETED'
                  ? 'btn-success shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('COMPLETED')}
            >
              Completed ({filterCounts.COMPLETED})
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                activeFilter === 'CANCELLED'
                  ? 'btn-secondary text-white shadow-xs'
                  : 'btn-light border-0 text-secondary'
              }`}
              onClick={() => setActiveFilter('CANCELLED')}
            >
              Cancelled ({filterCounts.CANCELLED})
            </button>
          </div>

          {/* Search Input Field */}
          <div className="position-relative" style={{ minWidth: 260 }}>
            <Search
              size={16}
              className="position-absolute text-muted"
              style={{ left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 pe-4 rounded-pill"
              placeholder="Search reference, service, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn btn-sm btn-link text-muted position-absolute p-0 border-0"
                style={{ right: 10, top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List Section */}
      {loading ? (
        <div>
          <BookingCardSkeleton />
          <BookingCardSkeleton />
          <BookingCardSkeleton />
        </div>
      ) : displayedBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={searchQuery ? 'No matching bookings found' : 'No service bookings yet'}
          description={
            searchQuery
              ? `No bookings matched your search query "${searchQuery}". Try searching by another reference number or keyword.`
              : 'You have no service appointments matching this status filter. Browse our service catalog to book certified home repairs.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Book a Service'}
          actionTo={searchQuery ? undefined : '/book'}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {displayedBookings.map((b) => {
            const bookingRef = b.bookingReference || b.bookingNumber || `BK-${b.id}`;
            const serviceName = b.serviceName || 'Home Repair Service';
            const categoryName = b.categoryName || b.serviceCategory || 'Maintenance';
            const { icon: CategoryIcon, bg: iconBg, color: iconColor } = getCategoryIcon(categoryName);
            const address = b.customerAddress || b.addressLine || 'Customer premises';
            const isCancellable = ['PENDING', 'ASSIGNED'].includes(b.status);
            const amount = parseFloat(b.totalAmount || b.finalAmount || b.estimatedBasePrice || b.quotationAmount || 0);

            // Initials for handyman
            const hmInitials = b.assignedHandymanName
              ? b.assignedHandymanName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : null;

            return (
              <div
                key={b.id}
                className="booking-card card border shadow-xs p-3 p-md-4 bg-white"
              >
                {/* LEFT SECTION: Icon, Service, Ref, Schedule */}
                <div className="d-flex align-items-start gap-3 mb-3 mb-lg-0" style={{ minWidth: '32%' }}>
                  <div
                    className="service-icon-box shadow-xs"
                    style={{ backgroundColor: iconBg, color: iconColor }}
                  >
                    <CategoryIcon size={24} />
                  </div>

                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="badge bg-light text-secondary border px-2 py-0.5 rounded"
                        style={{ fontSize: '0.72rem', letterSpacing: '0.02em', fontWeight: 600 }}
                      >
                        #{bookingRef}
                      </span>
                      <span
                        className="text-secondary small fw-medium"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {categoryName}
                      </span>
                    </div>

                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '1rem', letterSpacing: '-0.01em' }}>
                      {serviceName}
                    </h6>

                    <div className="d-flex align-items-center gap-2 text-secondary small" style={{ fontSize: '0.8rem' }}>
                      <Calendar size={13} className="text-primary flex-shrink-0" />
                      <span>{b.scheduledDate}</span>
                      <span className="text-muted">•</span>
                      <Clock size={13} className="text-secondary flex-shrink-0" />
                      <span>{b.scheduledTimeSlot}</span>
                    </div>
                  </div>
                </div>

                {/* MIDDLE SECTION: Status, Address, Technician, Material Readiness */}
                <div className="d-flex flex-column gap-2 mb-3 mb-lg-0 ps-lg-3 border-start-lg" style={{ minWidth: '36%' }}>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <StatusBadge status={b.status} />

                    {/* Pre-allocated material readiness pill */}
                    <span
                      className="d-inline-flex align-items-center gap-1 badge bg-light text-secondary border px-2 py-1"
                      style={{ fontSize: '0.72rem', fontWeight: 500 }}
                      title="Material coordination status with regional distribution hubs"
                    >
                      <Package size={12} className="text-primary" />
                      <span>Parts: Pre-Allocated</span>
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 text-secondary small" style={{ fontSize: '0.8rem' }}>
                    <MapPin size={14} className="text-danger flex-shrink-0" />
                    <span className="text-truncate" style={{ maxWidth: 300 }}>
                      {address}
                    </span>
                  </div>

                  {/* Assigned Handyman Chip */}
                  {b.assignedHandymanName ? (
                    <div className="d-inline-flex align-items-center gap-2 mt-1">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-primary fw-bold"
                        style={{ width: 24, height: 24, backgroundColor: '#eff6ff', fontSize: '0.68rem' }}
                      >
                        {hmInitials || 'T'}
                      </div>
                      <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                        {b.assignedHandymanName}
                      </span>
                      <span
                        className="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5 rounded-pill"
                        style={{ fontSize: '0.65rem' }}
                      >
                        Verified Pro
                      </span>
                    </div>
                  ) : (
                    <div className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
                      <Clock size={12} className="text-warning" />
                      <span>Technician dispatch in progress</span>
                    </div>
                  )}
                </div>

                {/* RIGHT SECTION: Price & Action CTA */}
                <div className="d-flex flex-column align-items-lg-end justify-content-between gap-2 mt-2 mt-lg-0 pt-2 pt-lg-0 border-top-sm">
                  <div className="text-lg-end">
                    <div className="text-secondary small" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {b.status === 'COMPLETED' ? 'Final Invoiced' : 'Estimated Quotation'}
                    </div>
                    <div className="fw-bold fs-5 text-dark" style={{ letterSpacing: '-0.02em' }}>
                      ${amount.toFixed(2)}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    {isCancellable && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger px-2.5 py-1.5 rounded-2 d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.8rem' }}
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancelBooking(b.id, bookingRef)}
                        title="Cancel this appointment"
                      >
                        <XCircle size={14} />
                        <span className="d-none d-sm-inline">Cancel</span>
                      </button>
                    )}

                    <Link
                      to={`/bookings/${b.id}`}
                      className="btn btn-sm btn-primary px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 fw-semibold"
                      style={{ fontSize: '0.825rem' }}
                    >
                      <span>Track Job</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
