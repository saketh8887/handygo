import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { 
  Wrench, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, 
  ArrowLeft, Navigation, Play, Pause, Camera, Package, DollarSign
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function JobExecution() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Completion form fields
  const [materialsAmount, setMaterialsAmount] = useState('25.00');
  const [completionNotes, setCompletionNotes] = useState('Job executed according to standards. Replaced defective parts, tested functionality, and cleaned work area.');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600');

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error('Failed to load job:', err);
      setError('Could not retrieve job details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, notes) => {
    try {
      setUpdatingStatus(true);
      setError('');
      const res = await api.patch(`/bookings/${id}/status`, {
        status: newStatus,
        notes: notes || `Technician updated status to ${newStatus}`,
      });
      setBooking(res.data.data);
      setSuccess(`Status successfully transitioned to ${newStatus}`);
    } catch (err) {
      console.error('Failed status update:', err);
      setError(err.response?.data?.message || 'Failed to update job status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    try {
      setCompleting(true);
      setError('');
      const res = await api.post(`/bookings/${id}/complete`, {
        materialsAmount: parseFloat(materialsAmount) || 0,
        completionNotes,
        completionPhotoUrl,
      });
      setBooking(res.data.data);
      setSuccess('Job marked as completed! Final bill and invoice have been generated.');
      setTimeout(() => {
        navigate('/handyman');
      }, 2000);
    } catch (err) {
      console.error('Completion error:', err);
      setError(err.response?.data?.message || 'Failed to complete job.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading job workbench...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4>Job not found</h4>
        <Link to="/handyman" className="btn btn-primary mt-3">Back to Workbench</Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Top Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/handyman" className="btn btn-outline-secondary btn-sm p-2 rounded-circle">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="fw-bold mb-0">Job Execution #{booking.bookingNumber}</h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-muted small mb-0">{booking.serviceName} - {booking.customerAddress}</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
          <CheckCircle2 size={18} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
          <AlertCircle size={18} />
          <div>{error}</div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Job Details & Status Actions */}
        <div className="col-12 col-lg-7">
          {/* Status Progression Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Navigation className="text-primary" /> Transition Workflow Control
            </h5>
            <p className="text-muted small mb-3">
              Advance the service lifecycle to notify the customer and synchronise warehouse logistics:
            </p>

            <div className="d-flex flex-wrap gap-2">
              {booking.status === 'ACCEPTED' && (
                <button
                  className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('ON_THE_WAY', 'En route to customer premises')}
                >
                  <Navigation size={18} /> Mark "On The Way"
                </button>
              )}

              {booking.status === 'ON_THE_WAY' && (
                <button
                  className="btn btn-info text-white d-flex align-items-center gap-2 px-3 py-2"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('ARRIVED', 'Arrived at service location')}
                >
                  <MapPin size={18} /> Mark "Arrived on Site"
                </button>
              )}

              {booking.status === 'ARRIVED' && (
                <button
                  className="btn btn-warning text-dark d-flex align-items-center gap-2 px-3 py-2"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('IN_PROGRESS', 'Diagnosing issue and beginning repair')}
                >
                  <Play size={18} /> Start Work ("In Progress")
                </button>
              )}

              {booking.status === 'IN_PROGRESS' && (
                <button
                  className="btn btn-outline-warning d-flex align-items-center gap-2 px-3 py-2"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('WAITING_FOR_MATERIALS', 'Awaiting special spare parts delivery')}
                >
                  <Pause size={18} /> Need Spare Parts ("Waiting for Materials")
                </button>
              )}

              {booking.status === 'WAITING_FOR_MATERIALS' && (
                <button
                  className="btn btn-warning text-dark d-flex align-items-center gap-2 px-3 py-2"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('IN_PROGRESS', 'Parts received, resuming work')}
                >
                  <Play size={18} /> Resume Work ("In Progress")
                </button>
              )}

              {booking.status === 'COMPLETED' && (
                <span className="badge bg-success p-2 fs-6">Job Fully Completed &amp; Verified</span>
              )}
            </div>
          </div>

          {/* Job Specification Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3">Customer &amp; Problem Details</h5>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="small text-muted">Customer Address</div>
              <div className="fw-bold">{booking.customerAddress}</div>
            </div>
            <div className="p-3 bg-light rounded-3 mb-3">
              <div className="small text-muted">Reported Problem</div>
              <div className="fw-semibold text-dark">{booking.problemDescription}</div>
            </div>
            {booking.photoUrl && (
              <div>
                <div className="small text-muted mb-2">Customer Attached Photo</div>
                <img src={booking.photoUrl} alt="Problem" className="img-fluid rounded-3 border" style={{ maxHeight: 200 }} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Material Usage & Completion Evidence */}
        <div className="col-12 col-lg-5">
          {/* Material Usage & Completion Submission */}
          {['IN_PROGRESS', 'WAITING_FOR_MATERIALS', 'ARRIVED'].includes(booking.status) ? (
            <div className="card shadow-sm border-0 rounded-4 p-4 border-top border-4 border-success">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2 text-success">
                <CheckCircle2 /> Finalize &amp; Complete Job
              </h5>
              <p className="text-muted small mb-3">
                Record actual materials consumed and submit completion evidence to generate customer invoice.
              </p>

              <form onSubmit={handleCompleteJob}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Consumed Materials / Spare Parts Cost ($)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={materialsAmount}
                      onChange={(e) => setMaterialsAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text">
                    This amount will be added to the customer bill and updated in inventory logs.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Completion Proof Photo URL</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Camera size={18} /></span>
                    <input
                      type="url"
                      className="form-control"
                      value={completionPhotoUrl}
                      onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Completion Notes &amp; Findings</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Completing Job &amp; Invoicing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Mark Job Completed
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : booking.status === 'COMPLETED' ? (
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-light">
              <h5 className="fw-bold text-success mb-2">Job Successfully Completed</h5>
              <p className="text-muted small mb-3">All work logs and invoices have been archived.</p>
              <div className="mb-2"><strong>Materials Billed:</strong> ${parseFloat(booking.materialsAmount || 0).toFixed(2)}</div>
              <div className="mb-2"><strong>Total Invoiced:</strong> ${parseFloat(booking.totalAmount || 0).toFixed(2)}</div>
              <div><strong>Completion Notes:</strong> {booking.completionNotes || 'Satisfactory'}</div>
            </div>
          ) : (
            <div className="card shadow-sm border-0 rounded-4 p-4 bg-light text-muted small text-center">
              Please mark the job "On The Way" and "Arrived" to unlock completion and billing controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
