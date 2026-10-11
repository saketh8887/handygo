import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Wrench, Calendar, Clock, MapPin, DollarSign, Star, 
  CheckCircle2, XCircle, AlertCircle, ArrowRight, Play, Eye,
  ShieldCheck, Package, Navigation, Phone, ChevronRight, Users
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Breadcrumb from '../components/Breadcrumb';
import MetricCard from '../components/MetricCard';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function HandymanDashboard() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_RESPONSE');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHandymanData();
  }, []);

  const fetchHandymanData = async () => {
    try {
      setLoading(true);
      const [profRes, bookRes] = await Promise.allSettled([
        api.get('/handyman/profile'),
        api.get('/bookings'),
      ]);

      if (profRes.status === 'fulfilled') {
        setProfile(profRes.value.data.data);
      }
      if (bookRes.status === 'fulfilled') {
        setBookings(bookRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load handyman data:', err);
      setError('Could not retrieve handyman appointments.');
      showToast('Could not load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentResponse = async (bookingId, accept) => {
    try {
      setError('');
      await api.post(`/bookings/${bookingId}/respond`, {
        accept,
        rejectionReason: accept ? '' : 'Technician schedule conflict',
      });
      showToast(accept ? 'Job accepted! You can now start execution.' : 'Job declined.', accept ? 'success' : 'info');
      fetchHandymanData();
    } catch (err) {
      console.error('Response failed:', err);
      const msg = err.response?.data?.message || 'Failed to update assignment.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const pendingResponseJobs = bookings.filter((b) => b.status === 'ASSIGNED');
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  // Compute stats
  const totalEarnings = completedJobs.reduce((acc, b) => acc + (parseFloat(b.totalAmount || b.estimatedBasePrice || 0) * 0.8), 0);
  const avgRating = profile?.ratingAverage || 4.9;

  const currentList = 
    activeTab === 'PENDING_RESPONSE' ? pendingResponseJobs :
    activeTab === 'ACTIVE' ? activeJobs : completedJobs;

  return (
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Technician Workbench' }]} />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
            <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
              Technician Workbench
            </h2>
            {profile?.isVerified ? (
              <span className="hc-badge hc-badge-success" style={{ fontSize: '0.75rem' }}>
                <ShieldCheck size={12} className="me-0.5" /> Verified Specialist
              </span>
            ) : (
              <span className="badge bg-warning bg-opacity-20 text-dark border border-warning" style={{ fontSize: '0.75rem' }}>
                Pending Verification
              </span>
            )}
            {profile?.teamMemberships && profile.teamMemberships.filter(m => m.approvalStatus === 'APPROVED').map(m => (
              <span 
                key={m.teamId} 
                className={`badge d-inline-flex align-items-center gap-1 ${
                  m.isPrimary 
                    ? 'bg-primary text-white shadow-sm' 
                    : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'
                }`} 
                style={{ fontSize: '0.74rem' }}
                title={m.isPrimary ? 'Primary Department' : 'Secondary Department'}
              >
                <Users size={11} /> {m.teamName} {m.isPrimary && '★'}
              </span>
            ))}
          </div>
          <p className="text-secondary small mb-0">
            Real-time assignment responses, GPS transit updates, material logging, and verified payouts
          </p>
        </div>

        <Link to="/handyman/profile" className="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium">
          <Wrench size={15} /> Skills &amp; Availability
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <MetricCard
            title="Awaiting Response"
            value={pendingResponseJobs.length}
            subtitle="Requires your action"
            icon={Clock}
            color="primary"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Active In-Flight"
            value={activeJobs.length}
            subtitle="Dispatched / working"
            icon={Navigation}
            color="warning"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Completed Jobs"
            value={completedJobs.length}
            subtitle="Satisfactory repairs"
            icon={CheckCircle2}
            color="success"
          />
        </div>

        <div className="col-6 col-lg-3">
          <MetricCard
            title="Estimated Payout"
            value={`$${totalEarnings.toFixed(2)}`}
            subtitle={`Rating: ★ ${avgRating.toFixed(1)}`}
            icon={DollarSign}
            color="info"
          />
        </div>
      </div>

      {/* Workbench Navigation Tabs */}
      <div className="d-flex align-items-center gap-2 overflow-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        {[
          { id: 'PENDING_RESPONSE', label: 'Pending Response', count: pendingResponseJobs.length },
          { id: 'ACTIVE', label: 'In Progress & Dispatched', count: activeJobs.length },
          { id: 'COMPLETED', label: 'Job History & Closed', count: completedJobs.length },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`btn btn-sm px-3 py-2 rounded-pill fw-medium transition-all flex-shrink-0 ${
              activeTab === tab.id 
                ? 'btn-primary text-white shadow-sm' 
                : 'btn-light text-secondary border'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label} <span className="opacity-75 ms-1">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Job Cards List */}
      {loading ? (
        <div className="d-flex flex-column gap-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="hc-card p-4">
              <Skeleton height="70px" />
            </div>
          ))}
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No jobs in this category"
          description={
            activeTab === 'PENDING_RESPONSE'
              ? 'No pending assignment requests right now. New dispatches will appear here instantly.'
              : activeTab === 'ACTIVE'
              ? 'You have no jobs currently under execution.'
              : 'Completed service records and earnings summaries will display here.'
          }
        />
      ) : (
        <div className="d-flex flex-column gap-3">
          {currentList.map((b) => (
            <div key={b.id} className="hc-card p-4 border-0 shadow-sm transition-all">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                {/* Details */}
                <div>
                  <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
                    <span className="badge bg-light text-primary font-monospace border" style={{ fontSize: '0.78rem' }}>
                      #{b.bookingNumber}
                    </span>
                    <StatusBadge status={b.status} />
                    <span className="badge bg-light text-secondary border" style={{ fontSize: '0.72rem' }}>
                      {b.categoryName}
                    </span>
                    {b.serviceTeamName && (
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <Users size={10} /> {b.serviceTeamName}
                      </span>
                    )}
                  </div>

                  <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.15rem' }}>
                    {b.serviceName}
                  </h5>

                  <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small mb-2">
                    <span className="d-inline-flex align-items-center gap-1 text-dark fw-medium">
                      <Calendar size={14} className="text-primary" /> {b.scheduledDate} ({b.scheduledTimeSlot})
                    </span>
                    <span>•</span>
                    <span className="d-inline-flex align-items-center gap-1">
                      <MapPin size={14} className="text-primary" /> {b.customerAddress}
                    </span>
                  </div>

                  {b.problemDescription && (
                    <div className="p-2.5 bg-light rounded-3 text-dark small mb-2" style={{ maxWidth: '640px', fontSize: '0.82rem' }}>
                      <strong>Customer issue:</strong> {b.problemDescription}
                    </div>
                  )}

                  {/* Required Skills Badges */}
                  {b.requiredSkills && b.requiredSkills.length > 0 && (
                    <div className="d-flex flex-wrap align-items-center gap-1">
                      <span className="text-secondary" style={{ fontSize: '0.72rem' }}>Required Skills:</span>
                      {b.requiredSkills.map((sk, idx) => (
                        <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.7rem' }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Earnings & Actions */}
                <div className="d-flex flex-column align-items-lg-end gap-2">
                  <div className="text-lg-end">
                    <div className="small text-secondary">Estimated Technician Payout</div>
                    <div className="fs-5 fw-bold text-success">
                      ${(parseFloat(b.totalAmount || b.estimatedBasePrice || 0) * 0.8).toFixed(2)}
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {b.status === 'ASSIGNED' && (
                      <>
                        <button
                          className="btn btn-success btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1 fw-medium shadow-sm"
                          onClick={() => handleAssignmentResponse(b.id, true)}
                        >
                          <CheckCircle2 size={15} /> Accept Job
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1 fw-medium"
                          onClick={() => handleAssignmentResponse(b.id, false)}
                        >
                          <XCircle size={15} /> Decline
                        </button>
                      </>
                    )}

                    {['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status) && (
                      <Link
                        to={`/handyman/jobs/${b.id}/execution`}
                        className="btn btn-primary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm"
                      >
                        <Play size={14} /> Update Transit / Execute
                      </Link>
                    )}

                    <Link
                      to={`/bookings/${b.id}`}
                      className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1"
                    >
                      <Eye size={14} /> Readiness &amp; BOM
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
