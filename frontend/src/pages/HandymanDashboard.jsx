import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Wrench, Calendar, Clock, MapPin, DollarSign, Star, 
  CheckCircle2, XCircle, AlertCircle, ArrowRight, Play, Eye
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function HandymanDashboard() {
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING_RESPONSE');
  const [actionSuccess, setActionSuccess] = useState('');
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
      setActionSuccess(accept ? 'Job accepted! You can now start execution.' : 'Job declined.');
      fetchHandymanData();
    } catch (err) {
      console.error('Response failed:', err);
      setError(err.response?.data?.message || 'Failed to update assignment.');
    }
  };

  const pendingResponseJobs = bookings.filter((b) => b.status === 'ASSIGNED');
  const activeJobs = bookings.filter((b) => ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(b.status));
  const completedJobs = bookings.filter((b) => b.status === 'COMPLETED');

  // Compute stats
  const totalEarnings = completedJobs.reduce((acc, b) => acc + (parseFloat(b.totalAmount || b.estimatedBasePrice || 0) * 0.8), 0); // 80% technician share
  const avgRating = profile?.ratingAverage || 4.9;

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-1">Technician Workbench</h2>
            {profile?.isVerified && (
              <span className="badge bg-success bg-opacity-10 text-success border border-success">
                Verified Technician
              </span>
            )}
          </div>
          <p className="text-muted mb-0">Manage service dispatches, transit updates, spare parts usage, and earnings</p>
        </div>
        <Link to="/handyman/profile" className="btn btn-outline-primary d-inline-flex align-items-center gap-2">
          <Wrench size={18} /> Manage Skills &amp; Availability
        </Link>
      </div>

      {actionSuccess && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle2 size={18} />
          <div>{actionSuccess}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary bg-opacity-10">
            <div className="text-muted small fw-semibold">Pending Response</div>
            <div className="fs-3 fw-bold text-primary">{pendingResponseJobs.length}</div>
            <div className="small text-muted">Awaiting your approval</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-warning bg-opacity-10">
            <div className="text-muted small fw-semibold">Active In-Progress</div>
            <div className="fs-3 fw-bold text-warning">{activeJobs.length}</div>
            <div className="small text-muted">Dispatched / Working</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-success bg-opacity-10">
            <div className="text-muted small fw-semibold">Completed Jobs</div>
            <div className="fs-3 fw-bold text-success">{completedJobs.length}</div>
            <div className="small text-muted">Satisfactory completions</div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-info bg-opacity-10">
            <div className="text-muted small fw-semibold">Estimated Payout</div>
            <div className="fs-3 fw-bold text-info">${totalEarnings.toFixed(2)}</div>
            <div className="small text-muted">★ {avgRating.toFixed(1)} rating</div>
          </div>
        </div>
      </div>

      {/* Workbench Tabs */}
      <div className="card shadow-sm border-0 rounded-4 mb-4">
        <div className="card-body p-2 d-flex flex-wrap gap-2">
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'PENDING_RESPONSE' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('PENDING_RESPONSE')}
          >
            New Job Offers ({pendingResponseJobs.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'ACTIVE' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('ACTIVE')}
          >
            Active In-Progress ({activeJobs.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3 ${activeTab === 'COMPLETED' ? 'btn-primary' : 'btn-light'}`}
            onClick={() => setActiveTab('COMPLETED')}
          >
            Completed History ({completedJobs.length})
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading appointments...</span>
          </div>
        </div>
      ) : activeTab === 'PENDING_RESPONSE' ? (
        pendingResponseJobs.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <CheckCircle2 size={48} className="text-success mb-3" />
              <h5 className="fw-bold">No Pending Assignment Requests</h5>
              <p className="text-muted">You have reviewed all incoming dispatch matches.</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {pendingResponseJobs.map((job) => (
              <div key={job.id} className="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4 border-warning">
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-md-5">
                      <span className="badge bg-warning text-dark mb-2">NEW DISPATCH MATCH</span>
                      <h5 className="fw-bold text-primary mb-1">{job.serviceName}</h5>
                      <p className="text-muted small mb-2">{job.categoryName}</p>
                      <div className="p-2 bg-light rounded-3 small">
                        <strong>Customer Problem:</strong> {job.problemDescription}
                      </div>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="small text-muted d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-2">
                          <Calendar size={15} className="text-primary" />
                          <span>{job.scheduledDate} ({job.scheduledTimeSlot})</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <MapPin size={15} className="text-danger" />
                          <span>{job.customerAddress}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 text-success fw-bold">
                          <DollarSign size={15} />
                          <span>Base Compensation: ${parseFloat(job.estimatedBasePrice).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3 d-flex flex-column gap-2">
                      <button
                        className="btn btn-success d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleAssignmentResponse(job.id, true)}
                      >
                        <CheckCircle2 size={18} /> Accept Assignment
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleAssignmentResponse(job.id, false)}
                      >
                        <XCircle size={16} /> Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'ACTIVE' ? (
        activeJobs.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <Wrench size={48} className="text-muted mb-3" />
              <h5 className="fw-bold">No Active In-Progress Jobs</h5>
              <p className="text-muted">Accept incoming assignments above to begin service execution.</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="card border-0 shadow-sm rounded-4 overflow-hidden border-start border-4 border-primary">
                <div className="card-body p-4">
                  <div className="row align-items-center g-3">
                    <div className="col-12 col-md-5">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <StatusBadge status={job.status} />
                        <span className="badge bg-light text-dark border">#{job.bookingNumber}</span>
                      </div>
                      <h5 className="fw-bold text-primary mb-1">{job.serviceName}</h5>
                      <p className="text-muted small mb-0">{job.customerAddress}</p>
                    </div>

                    <div className="col-12 col-md-4">
                      <div className="small text-muted d-flex flex-column gap-1">
                        <div><strong>Scheduled:</strong> {job.scheduledDate} ({job.scheduledTimeSlot})</div>
                        <div><strong>Customer:</strong> {job.customerName || 'Resident'}</div>
                      </div>
                    </div>

                    <div className="col-12 col-md-3 text-md-end">
                      <Link
                        to={`/handyman/jobs/${job.id}/execute`}
                        className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                      >
                        <Play size={18} /> Execute Job
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        completedJobs.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body">
              <CheckCircle2 size={48} className="text-muted mb-3" />
              <h5 className="fw-bold">No Completed Jobs Yet</h5>
              <p className="text-muted">Completed service history and customer reviews will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {completedJobs.map((job) => (
              <div key={job.id} className="card border-0 shadow-sm rounded-4 p-4">
                <div className="row align-items-center g-3">
                  <div className="col-12 col-md-5">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <StatusBadge status={job.status} />
                      <span className="badge bg-light text-dark border">#{job.bookingNumber}</span>
                    </div>
                    <h5 className="fw-bold mb-1">{job.serviceName}</h5>
                    <p className="text-muted small mb-0">{job.customerAddress}</p>
                  </div>

                  <div className="col-12 col-md-4">
                    <div className="small text-muted">
                      <div>Completed on {job.scheduledDate}</div>
                      <div>Materials Consumed: ${parseFloat(job.materialsAmount || 0).toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="col-12 col-md-3 text-md-end">
                    <div className="fw-bold fs-5 text-success">
                      ${(parseFloat(job.totalAmount || job.estimatedBasePrice || 0) * 0.8).toFixed(2)}
                    </div>
                    <div className="small text-muted">Net technician payout</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
