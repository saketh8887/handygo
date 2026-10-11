import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Activity, Calendar, Clock, MapPin, Wrench, UserCheck, 
  Search, Filter, CheckCircle2, AlertCircle, ChevronRight, Eye,
  Sparkles, X, User, Star, Award, AlertTriangle, RefreshCw, Briefcase, 
  ShieldCheck, Check, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function AdminBookings() {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');
  const urlStatus = searchParams.get('status');

  const [bookings, setBookings] = useState([]);
  const [handymen, setHandymen] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(urlStatus || 'ALL');
  const [categoryFilter, setCategoryFilter] = useState(urlCategory || 'ALL');
  const [handymanFilter, setHandymanFilter] = useState('ALL');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Assignment Modal & AI Recommendations
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReassignMode, setIsReassignMode] = useState(false);
  const [reassignReason, setReassignReason] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [selectedHandymanId, setSelectedHandymanId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showIneligible, setShowIneligible] = useState(false);
  const [isOverride, setIsOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    fetchBookingsAndHandymen();
  }, []);

  useEffect(() => {
    if (urlCategory) {
      setCategoryFilter(urlCategory);
    }
    if (urlStatus) {
      setFilter(urlStatus);
    }
  }, [urlCategory, urlStatus]);

  const fetchBookingsAndHandymen = async () => {
    try {
      setLoading(true);
      const [bookRes, hmRes, catRes] = await Promise.allSettled([
        api.get('/bookings'),
        api.get('/admin/handymen'),
        api.get('/categories'),
      ]);

      if (bookRes.status === 'fulfilled') {
        setBookings(bookRes.value.data.data || []);
      }
      if (hmRes.status === 'fulfilled') {
        setHandymen(hmRes.value.data.data || []);
      }
      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load dispatch data:', err);
      setError('Could not load bookings.');
      showToast('Could not load dispatch bookings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAssignModal = async (b, isReassign = false) => {
    setSelectedBooking(b);
    setIsReassignMode(isReassign);
    setReassignReason(isReassign ? 'Operational schedule adjustment' : '');
    setSelectedHandymanId('');
    setIsOverride(false);
    setOverrideReason('');
    setRecommendations(null);
    setLoadingRecs(true);
    setShowIneligible(false);

    try {
      const recRes = await api.get(`/bookings/${b.id}/recommendations`);
      const recData = recRes.data.data || [];
      setRecommendations(recData);

      // Pre-select top eligible candidate
      const eligibleCandidates = recData.filter(r => r.eligible || r.isEligible);
      if (eligibleCandidates.length > 0) {
        setSelectedHandymanId(eligibleCandidates[0].handymanId.toString());
      } else if (handymen.length > 0) {
        setSelectedHandymanId(handymen[0].id.toString());
      }
    } catch (err) {
      console.warn('Failed to fetch recommendations, falling back to manual list:', err);
      if (handymen.length > 0) {
        setSelectedHandymanId(handymen[0].id.toString());
      }
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleAssignHandyman = async (e) => {
    e.preventDefault();
    if (!selectedHandymanId) {
      showToast('Please select a technician to dispatch.', 'warning');
      return;
    }

    if (isOverride && !overrideReason.trim()) {
      showToast('Please provide an administrative justification for the override.', 'warning');
      return;
    }

    try {
      setAssigning(true);
      setError('');

      if (isReassignMode) {
        await api.post(`/bookings/${selectedBooking.id}/reassign`, {
          handymanId: parseInt(selectedHandymanId, 10),
          reason: reassignReason || 'Reassigned by dispatcher',
        });
        showToast(`Technician reassigned for booking #${selectedBooking.bookingNumber}!`, 'success');
      } else {
        await api.post(`/bookings/${selectedBooking.id}/assign`, {
          handymanId: parseInt(selectedHandymanId, 10),
          overrideRules: isOverride,
          overrideReason: isOverride ? overrideReason : '',
        });
        showToast(
          isOverride
            ? `Technician dispatched under Administrative Override for booking #${selectedBooking.bookingNumber}!`
            : `Technician assigned to booking #${selectedBooking.bookingNumber}!`,
          'success'
        );
      }

      setSelectedBooking(null);
      fetchBookingsAndHandymen();
    } catch (err) {
      console.error('Assignment error:', err);
      const msg = err.response?.data?.message || 'Failed to dispatch handyman.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setAssigning(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesFilter =
      filter === 'ALL'
        ? true
        : filter === 'PENDING'
        ? b.status === 'PENDING'
        : filter === 'ASSIGNED'
        ? b.status === 'ASSIGNED'
        : filter === 'IN_PROGRESS'
        ? ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)
        : filter === 'COMPLETED'
        ? b.status === 'COMPLETED'
        : true;

    // Category filter
    let matchesCategory = true;
    if (categoryFilter !== 'ALL') {
      const selectedCat = categories.find(c => c.id.toString() === categoryFilter.toString());
      if (selectedCat) {
        matchesCategory = b.categoryName === selectedCat.name;
      }
    }

    // Handyman filter
    let matchesHandyman = true;
    if (handymanFilter !== 'ALL') {
      const selectedHm = handymen.find(h => h.id.toString() === handymanFilter.toString());
      if (selectedHm) {
        matchesHandyman = b.assignedHandymanName === selectedHm.fullName || b.assignedHandymanId?.toString() === handymanFilter.toString();
      }
    }

    // Date range filter
    let matchesDate = true;
    if (fromDateFilter && b.scheduledDate) {
      if (b.scheduledDate < fromDateFilter) matchesDate = false;
    }
    if (toDateFilter && b.scheduledDate) {
      if (b.scheduledDate > toDateFilter) matchesDate = false;
    }

    const matchesSearch =
      searchQuery === '' ||
      b.bookingNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingReference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.customerAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.assignedHandymanName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesCategory && matchesHandyman && matchesDate && matchesSearch;
  });

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length;
  const assignedCount = bookings.filter(b => b.status === 'ASSIGNED').length;
  const activeCount = bookings.filter(b => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status)).length;
  const completedCount = bookings.filter(b => b.status === 'COMPLETED').length;

  const eligibleRecs = recommendations ? recommendations.filter(r => r.eligible || r.isEligible) : [];
  const ineligibleRecs = recommendations ? recommendations.filter(r => !(r.eligible || r.isEligible)) : [];

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Admin Command', path: '/admin' },
          { label: 'Service Dispatch Board' }
        ]}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              INTELLIGENT DISPATCH CENTER
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Service Dispatch Board
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Coordinate customer appointments, verify trade skill requirements, and dispatch certified specialists
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="hc-card p-3 mb-4 border-0 shadow-sm">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-5">
            <div className="position-relative">
              <Search size={16} className="text-secondary position-absolute" style={{ left: 12, top: 11 }} />
              <input
                type="text"
                className="form-control form-control-sm ps-4 pe-4 py-2 rounded-3 border"
                placeholder="Search reference #, service, customer or technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="btn btn-link position-absolute text-secondary p-0"
                  style={{ right: 10, top: 8 }}
                  onClick={() => setSearchQuery('')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="col-12 col-md-7">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              {[
                { id: 'ALL', label: 'All', count: bookings.length },
                { id: 'PENDING', label: 'Pending Dispatch', count: pendingCount },
                { id: 'ASSIGNED', label: 'Assigned', count: assignedCount },
                { id: 'IN_PROGRESS', label: 'In Progress', count: activeCount },
                { id: 'COMPLETED', label: 'Completed', count: completedCount },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn btn-sm px-2.5 py-1.5 rounded-pill fw-medium transition-all ${
                    filter === tab.id 
                      ? 'btn-primary text-white shadow-sm' 
                      : 'btn-light text-secondary border'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => setFilter(tab.id)}
                >
                  {tab.label} <span className="opacity-75 ms-1">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Secondary Filter Row: Category, Handyman, Date Range */}
        <div className="row g-2 pt-2.5 mt-2 border-top align-items-center">
          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.74rem', minWidth: 60 }}>Trade:</span>
              <select
                className="form-select form-select-sm rounded-2 border py-1"
                style={{ fontSize: '0.76rem' }}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id.toString()}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-3">
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.74rem', minWidth: 60 }}>Technician:</span>
              <select
                className="form-select form-select-sm rounded-2 border py-1"
                style={{ fontSize: '0.76rem' }}
                value={handymanFilter}
                onChange={(e) => setHandymanFilter(e.target.value)}
              >
                <option value="ALL">All Technicians</option>
                {handymen.map((h) => (
                  <option key={h.id} value={h.id.toString()}>
                    {h.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.74rem' }}>From:</span>
              <input
                type="date"
                className="form-control form-control-sm py-1 rounded-2"
                style={{ fontSize: '0.76rem' }}
                value={fromDateFilter}
                onChange={(e) => setFromDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="d-flex align-items-center gap-1.5">
              <span className="text-secondary small fw-medium" style={{ fontSize: '0.74rem' }}>To:</span>
              <input
                type="date"
                className="form-control form-control-sm py-1 rounded-2"
                style={{ fontSize: '0.76rem' }}
                value={toDateFilter}
                onChange={(e) => setToDateFilter(e.target.value)}
              />
            </div>
          </div>

          <div className="col-12 col-md-2 text-md-end">
            {(categoryFilter !== 'ALL' || handymanFilter !== 'ALL' || fromDateFilter || toDateFilter) && (
              <button
                className="btn btn-link text-danger p-0 small text-decoration-none"
                style={{ fontSize: '0.74rem' }}
                onClick={() => {
                  setCategoryFilter('ALL');
                  setHandymanFilter('ALL');
                  setFromDateFilter('');
                  setToDateFilter('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="hc-card p-4">
          <Skeleton height="40px" className="mb-3" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No bookings match criteria"
          description="Try selecting a different status filter or clear your search query."
          actionLabel="Reset Search"
          onAction={() => {
            setSearchQuery('');
            setFilter('ALL');
          }}
        />
      ) : (
        <div className="hc-card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small">
                <tr>
                  <th className="ps-4">Booking #</th>
                  <th>Service &amp; Category</th>
                  <th>Required Trade Skills</th>
                  <th>Customer &amp; Location</th>
                  <th>Scheduled Window</th>
                  <th>Assigned Tech</th>
                  <th>Status</th>
                  <th>Quotation</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-4 fw-bold font-monospace text-primary">
                      #{b.bookingNumber}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{b.serviceName}</div>
                      <div className="d-flex align-items-center gap-1 flex-wrap mt-0.5">
                        <span className="text-secondary" style={{ fontSize: '0.74rem' }}>{b.categoryName}</span>
                        {b.serviceTeamName && (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                            <Users size={9} /> {b.serviceTeamName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      {b.requiredSkills && b.requiredSkills.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1" style={{ maxWidth: 220 }}>
                          {b.requiredSkills.map((sk, idx) => (
                            <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small">Standard Trade</span>
                      )}
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{b.customerName || 'Customer'}</div>
                      <div className="text-secondary text-truncate" style={{ maxWidth: 180, fontSize: '0.74rem' }}>
                        {b.customerAddress}
                      </div>
                    </td>
                    <td>
                      <div className="text-dark fw-medium">{b.scheduledDate}</div>
                      <div className="text-secondary" style={{ fontSize: '0.74rem' }}>{b.scheduledTimeSlot}</div>
                    </td>
                    <td>
                      {b.assignedHandymanName ? (
                        <div>
                          <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
                            <Wrench size={11} className="text-primary" /> {b.assignedHandymanName}
                          </span>
                          {b.assignedHandymanTeamName ? (
                            <div className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 mt-0.5 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                              <Users size={9} /> {b.assignedHandymanTeamName}
                            </div>
                          ) : b.assignedHandymanSpecialization ? (
                            <div className="text-secondary mt-0.5" style={{ fontSize: '0.72rem' }}>
                              {b.assignedHandymanSpecialization}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="badge bg-warning bg-opacity-20 text-dark border border-warning">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="fw-bold text-dark">
                      ${parseFloat(b.totalAmount || b.estimatedBasePrice || 0).toFixed(2)}
                    </td>
                    <td className="text-end pe-4">
                      <div className="d-flex justify-content-end gap-1.5">
                        {b.status === 'PENDING' && (
                          <button
                            className="btn btn-primary btn-sm px-2.5 py-1 rounded-3 d-inline-flex align-items-center gap-1 fw-medium shadow-sm"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleOpenAssignModal(b, false)}
                          >
                            <Sparkles size={13} /> Dispatch
                          </button>
                        )}
                        {['ASSIGNED', 'ACCEPTED'].includes(b.status) && (
                          <button
                            className="btn btn-outline-warning btn-sm px-2 py-1 rounded-3 d-inline-flex align-items-center gap-1 fw-medium"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handleOpenAssignModal(b, true)}
                            title="Reassign to another technician"
                          >
                            <RefreshCw size={12} /> Reassign
                          </button>
                        )}
                        <Link
                          to={`/bookings/${b.id}`}
                          className="btn btn-outline-secondary btn-sm px-2 py-1 rounded-3 d-inline-flex align-items-center gap-1"
                          title="View Details & Job Readiness"
                        >
                          <Eye size={13} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Intelligent Technician Dispatch / Reassignment Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <span className={`badge ${isReassignMode ? 'bg-warning text-dark' : 'bg-primary text-white'} px-2.5 py-0.5 rounded-pill fw-semibold`} style={{ fontSize: '0.72rem' }}>
                      {isReassignMode ? 'TECHNICIAN REASSIGNMENT' : 'INTELLIGENT DISPATCH RECOMMENDATION'}
                    </span>
                    <span className="badge bg-light text-secondary border font-monospace">
                      #{selectedBooking.bookingNumber}
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-dark mb-0">
                    {isReassignMode ? 'Reassign Service Booking' : 'Dispatch Technician by Trade Specialization'}
                  </h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedBooking(null)}></button>
              </div>

              <form onSubmit={handleAssignHandyman} className="d-flex flex-column" style={{ minHeight: 0 }}>
                <div className="modal-body p-4 overflow-auto">
                  {/* Booking Summary Strip */}
                  <div className="p-3 bg-light rounded-3 mb-4 border">
                    <div className="row g-3">
                      <div className="col-md-3">
                        <span className="text-secondary small d-block">Service Required:</span>
                        <div className="fw-bold text-dark">{selectedBooking.serviceName}</div>
                        <div className="d-flex align-items-center gap-1 flex-wrap mt-0.5">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary" style={{ fontSize: '0.72rem' }}>
                            {selectedBooking.categoryName}
                          </span>
                          {selectedBooking.serviceTeamName && (
                            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                              <Users size={10} /> {selectedBooking.serviceTeamName}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <span className="text-secondary small d-block">Scheduled Window:</span>
                        <div className="fw-semibold text-dark d-flex align-items-center gap-1">
                          <Calendar size={13} className="text-primary" /> {selectedBooking.scheduledDate}
                        </div>
                        <div className="text-secondary small">{selectedBooking.scheduledTimeSlot}</div>
                      </div>
                      <div className="col-md-3">
                        <span className="text-secondary small d-block">Service Location:</span>
                        <div className="fw-medium text-dark text-truncate" title={selectedBooking.customerAddress}>
                          <MapPin size={13} className="text-primary me-1" />
                          {selectedBooking.customerAddress}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <span className="text-secondary small d-block">Mandatory Trade Skills:</span>
                        {selectedBooking.requiredSkills && selectedBooking.requiredSkills.length > 0 ? (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {selectedBooking.requiredSkills.map((sk, idx) => (
                              <span key={idx} className="badge bg-primary text-white" style={{ fontSize: '0.7rem' }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">Standard Maintenance</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isReassignMode && (
                    <div className="mb-4 p-3 bg-warning bg-opacity-10 rounded-3 border border-warning border-opacity-50">
                      <label className="form-label fw-bold text-dark small mb-1">
                        Reason for Technician Reassignment:
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Original technician sick leave, customer preference, urgent conflict"
                        value={reassignReason}
                        onChange={(e) => setReassignReason(e.target.value)}
                        required
                      />
                      <div className="text-muted small mt-1">
                        Currently assigned to: <strong>{selectedBooking.assignedHandymanName || 'Unassigned'}</strong>
                      </div>
                    </div>
                  )}

                  {/* AI Recommendation Engine Results */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div>
                        <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                          <Sparkles size={16} className="text-primary" />
                          Ranked Candidate Recommendations ({eligibleRecs.length} Eligible)
                        </h6>
                        <span className="text-secondary small">
                          Ranked by weighted readiness: Trade Skills (35%), Experience (20%), Workload (20%), Rating (15%), Service Area (10%)
                        </span>
                      </div>
                    </div>

                    {loadingRecs ? (
                      <div className="p-4 text-center">
                        <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                        <span className="small text-secondary">Analyzing technician trade skills, schedules, and workload capacity...</span>
                      </div>
                    ) : eligibleRecs.length === 0 ? (
                      <div className="alert alert-warning rounded-3 small">
                        <AlertTriangle size={16} className="me-1.5 inline" />
                        <strong>No eligible technicians matched all 7 mandatory gates:</strong> Either no technician has verified trade skills for this service, available schedule slots, or open workload capacity. You may inspect excluded candidates below or re-configure workforce specializations.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-2.5">
                        {eligibleRecs.map((rec, idx) => {
                          const isSelected = selectedHandymanId === rec.handymanId.toString();
                          return (
                            <div
                              key={rec.handymanId}
                              onClick={() => setSelectedHandymanId(rec.handymanId.toString())}
                              className={`p-3 rounded-3 border transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                                  : 'border-light-subtle bg-white hover-bg-light'
                              }`}
                              style={{ cursor: 'pointer' }}
                            >
                              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                                <div className="d-flex align-items-center gap-3">
                                  <input
                                    type="radio"
                                    name="selectedHandyman"
                                    className="form-check-input mt-0"
                                    checked={isSelected}
                                    onChange={() => setSelectedHandymanId(rec.handymanId.toString())}
                                  />
                                  <div
                                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                                    style={{ width: 44, height: 44, fontSize: '0.95rem' }}
                                  >
                                    {rec.profilePhotoUrl ? (
                                      <img src={rec.profilePhotoUrl} alt={rec.fullName} className="w-100 h-100 rounded-circle object-fit-cover" />
                                    ) : (
                                      rec.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                    )}
                                  </div>
                                  <div>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                      <span className="fw-bold text-dark">{rec.fullName}</span>
                                      {rec.primarySpecialization && (
                                        <span className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25" style={{ fontSize: '0.72rem' }}>
                                          {rec.primarySpecialization}
                                        </span>
                                      )}
                                      {(rec.assignedTeamName || rec.primaryTeamName) && (
                                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                                          <Users size={10} /> {rec.assignedTeamName || rec.primaryTeamName}
                                        </span>
                                      )}
                                      {idx === 0 && (
                                        <span className="badge bg-success text-white d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                          <Sparkles size={10} /> Top Match
                                        </span>
                                      )}
                                    </div>
                                    <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mt-1" style={{ fontSize: '0.76rem' }}>
                                      <span>★ {parseFloat(rec.ratingAvg || 5.0).toFixed(1)} ({rec.ratingCount || 0} reviews)</span>
                                      <span>•</span>
                                      <span>{rec.experienceYears || 0} yrs experience</span>
                                      <span>•</span>
                                      <span>{rec.completedJobCount || 0} jobs completed</span>
                                      <span>•</span>
                                      <span className="d-inline-flex align-items-center gap-1">
                                        <Briefcase size={12} /> Workload: {rec.activeWorkload}/{rec.maxWorkload} active
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="d-flex align-items-center gap-3">
                                  {/* Score Pill */}
                                  <div className="text-md-end">
                                    <div className="badge bg-primary text-white px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.82rem' }}>
                                      {parseFloat(rec.matchScore || 0).toFixed(1)} / 100 Match
                                    </div>
                                    {rec.scoreBreakdown && (
                                      <div className="text-secondary small mt-0.5" style={{ fontSize: '0.7rem' }}>
                                        Skills: {rec.scoreBreakdown.skills || 0} | Exp: {rec.scoreBreakdown.experience || 0} | Cap: {rec.scoreBreakdown.workload || 0}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Matched Skills & Reasons */}
                              {rec.matchedSkills && rec.matchedSkills.length > 0 && (
                                <div className="mt-2 pt-2 border-top border-light-subtle d-flex flex-wrap align-items-center gap-1.5">
                                  <span className="text-secondary" style={{ fontSize: '0.72rem' }}>Verified Skills:</span>
                                  {rec.matchedSkills.map((sk, skIdx) => (
                                    <span key={skIdx} className="badge bg-success bg-opacity-15 text-success border border-success border-opacity-25 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                                      <Check size={10} /> {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Excluded Ineligible Technicians Accordion */}
                  {ineligibleRecs.length > 0 && (
                    <div className="mt-4 border rounded-3 p-3 bg-light">
                      <div
                        className="d-flex align-items-center justify-content-between cursor-pointer"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowIneligible(!showIneligible)}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <AlertCircle size={16} className="text-secondary" />
                          <span className="fw-semibold text-secondary small">
                            Ineligible Technicians Excluded by System Gates ({ineligibleRecs.length})
                          </span>
                        </div>
                        <button type="button" className="btn btn-sm btn-link text-secondary p-0">
                          {showIneligible ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </div>

                      {showIneligible && (
                        <div className="mt-3 d-flex flex-column gap-2">
                          {ineligibleRecs.map((inelig) => (
                            <div key={inelig.handymanId} className="p-2.5 bg-white rounded-2 border border-danger border-opacity-25 small">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <span className="fw-bold text-dark">{inelig.fullName}</span>
                                <span className="badge bg-danger bg-opacity-10 text-danger" style={{ fontSize: '0.68rem' }}>
                                  Ineligible
                                </span>
                              </div>
                              <ul className="mb-0 ps-3 text-danger small">
                                {inelig.ineligibilityReasons && inelig.ineligibilityReasons.length > 0 ? (
                                  inelig.ineligibilityReasons.map((reason, rIdx) => (
                                    <li key={rIdx}>{reason}</li>
                                  ))
                                ) : (
                                  <li>Does not meet mandatory trade requirements or availability.</li>
                                )}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Fallback Manual Override Selection */}
                  <div className="mt-4 pt-3 border-top">
                    <label className="form-label text-secondary small fw-semibold">
                      Manual Technician Selection (All Technicians Pool):
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedHandymanId}
                      onChange={(e) => setSelectedHandymanId(e.target.value)}
                    >
                      <option value="">-- Choose technician --</option>
                      {handymen.map((hm) => (
                        <option key={hm.id} value={hm.id}>
                          {hm.fullName} ({hm.primaryTeamName || hm.primarySpecialization || 'General'}) — Hourly: ${hm.hourlyRate}/hr | Max Workload: {hm.maxActiveWorkload || 3}
                        </option>
                      ))}
                    </select>

                    {!isReassignMode && (
                      <div className="mt-3 p-3 bg-light rounded-3 border">
                        <div className="form-check form-switch mb-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="adminOverrideCheck"
                            checked={isOverride}
                            onChange={(e) => setIsOverride(e.target.checked)}
                          />
                          <label className="form-check-label fw-bold small text-dark" htmlFor="adminOverrideCheck">
                            Administrative Dispatch Override (Bypass Department &amp; Skill Gates)
                          </label>
                        </div>
                        <div className="text-secondary small mb-2" style={{ fontSize: '0.74rem' }}>
                          Enables dispatching a technician even if they are not approved in the service's department or lack specific trade skills.
                        </div>
                        {isOverride && (
                          <div className="mt-2">
                            <label className="form-label small fw-semibold text-danger">Override Audit Justification (Required):</label>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="e.g. Urgent customer escalation, supervisor authorization, cross-department assistance"
                              value={overrideReason}
                              onChange={(e) => setOverrideReason(e.target.value)}
                              required={isOverride}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary px-3 py-2 btn-sm" onClick={() => setSelectedBooking(null)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn ${isReassignMode ? 'btn-warning' : 'btn-primary'} px-4 py-2 fw-medium shadow-sm btn-sm`}
                    disabled={assigning || !selectedHandymanId}
                  >
                    {assigning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        {isReassignMode ? 'Reassigning...' : 'Dispatching...'}
                      </>
                    ) : (
                      <>
                        <UserCheck size={15} className="me-1 inline" />
                        {isReassignMode ? 'Confirm Reassignment' : 'Confirm Dispatch Assignment'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
