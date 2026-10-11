import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  Wrench, MapPin, Calendar, Clock, CheckCircle2, AlertCircle, 
  ArrowLeft, Navigation, Play, Pause, Camera, Package, DollarSign,
  Phone, ShieldCheck, ShieldAlert, Check, Sparkles, User, RefreshCw,
  ExternalLink, Building2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';

export default function JobExecution() {
  const { id, jobId } = useParams();
  const effectiveId = id || jobId;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(null); // 'NOT_FOUND' | 'FORBIDDEN' | 'SERVER_ERROR'
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState(null);

  // Completion form fields
  const [materialsAmount, setMaterialsAmount] = useState('25.00');
  const [completionNotes, setCompletionNotes] = useState('Job executed according to standards. Replaced defective parts, tested functionality, and cleaned work area.');
  const [completionPhotoUrl, setCompletionPhotoUrl] = useState('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600');

  useEffect(() => {
    if (effectiveId) {
      fetchBooking();
    }
  }, [effectiveId]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorType(null);
      const res = await api.get(`/bookings/${effectiveId}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error('Failed to load job:', err);
      const status = err.response?.status;
      if (status === 404) {
        setErrorType('NOT_FOUND');
        setError(`Job #${effectiveId} was not found. The requested job does not exist or has been removed.`);
      } else if (status === 403) {
        setErrorType('FORBIDDEN');
        setError(`Access Denied: You are not authorized to view or execute Job #${effectiveId}. This job may be assigned to another technician.`);
      } else {
        setErrorType('SERVER_ERROR');
        setError(err.response?.data?.message || 'Could not retrieve job execution details.');
      }
      showToast(err.response?.data?.message || 'Could not retrieve job details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus, notes) => {
    try {
      setUpdatingStatus(true);
      setError('');
      const targetId = booking?.id || effectiveId;
      const res = await api.patch(`/bookings/${targetId}/status`, {
        status: newStatus,
        notes: notes || `Technician updated status to ${newStatus}`,
      });
      setBooking(res.data.data);
      showToast(`Status updated to: ${newStatus.replace(/_/g, ' ')}`, 'success');
    } catch (err) {
      console.error('Failed status update:', err);
      const msg = err.response?.data?.message || 'Failed to update job status.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCompleteJob = async (e) => {
    e.preventDefault();
    try {
      setCompleting(true);
      setError('');
      const targetId = booking?.id || effectiveId;
      const res = await api.post(`/bookings/${targetId}/complete`, {
        materialsAmount: parseFloat(materialsAmount) || 0,
        completionNotes,
        completionPhotoUrl,
      });
      setBooking(res.data.data);
      showToast('Job completed! Final invoice and customer receipt generated.', 'success');
      setTimeout(() => {
        navigate('/handyman');
      }, 1500);
    } catch (err) {
      console.error('Completion error:', err);
      const msg = err.response?.data?.message || 'Failed to complete job.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <Skeleton width="180px" height="20px" className="mb-4" />
        <div className="row g-4">
          <div className="col-lg-7"><Skeleton height="350px" /></div>
          <div className="col-lg-5"><Skeleton height="350px" /></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    if (errorType === 'FORBIDDEN') {
      return (
        <div className="container py-5 text-center">
          <div className="hc-card p-5 max-w-md mx-auto shadow-sm" style={{ maxWidth: 520 }}>
            <div className="d-inline-flex p-3 rounded-circle bg-warning bg-opacity-10 text-warning mb-3">
              <ShieldAlert size={48} />
            </div>
            <h4 className="fw-bold mb-2 text-dark">Access Denied</h4>
            <p className="text-secondary small mb-4">
              {error || `You do not have authorization to view or execute Job #${effectiveId}. This job may be assigned to another technician or restricted.`}
            </p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/handyman" className="btn btn-primary px-4">
                Back to Technician Workbench
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="container py-5 text-center">
        <div className="hc-card p-5 max-w-md mx-auto shadow-sm" style={{ maxWidth: 520 }}>
          <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
            <AlertCircle size={48} />
          </div>
          <h4 className="fw-bold mb-2 text-dark">Job Not Found</h4>
          <p className="text-secondary small mb-4">
            {error || `Job #${effectiveId} was not found. The requested job does not exist, has been cancelled, or has already been closed.`}
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/handyman" className="btn btn-primary px-4">
              Back to Technician Workbench
            </Link>
            <button onClick={fetchBooking} className="btn btn-outline-secondary px-3 d-inline-flex align-items-center gap-1.5">
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bookingRef = booking.bookingReference || booking.bookingNumber || effectiveId;
  const categoryLabel = booking.serviceCategory || booking.categoryName;
  const addressLabel = booking.customerAddress || `${booking.addressLine || ''}${booking.addressCity ? ', ' + booking.addressCity : ''}`.trim() || 'Customer premises';

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Technician Workbench', path: '/handyman' },
          { label: `Execute Job #${bookingRef}` }
        ]}
      />

      {/* Header Banner */}
      <div className="hc-card p-4 mb-4 border-0 shadow-sm">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1.5">
              <span className="badge bg-light text-primary font-monospace border">
                #{bookingRef}
              </span>
              <StatusBadge status={booking.status} />
              {categoryLabel && (
                <span className="badge bg-light text-secondary border">{categoryLabel}</span>
              )}
              {booking.serviceTeamName && (
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25">
                  {booking.serviceTeamName}
                </span>
              )}
            </div>
            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.4rem' }}>
              {booking.serviceName}
            </h2>
            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
              <span className="d-inline-flex align-items-center gap-1">
                <MapPin size={14} className="text-primary" /> {addressLabel}
              </span>
              <span>•</span>
              <span className="d-inline-flex align-items-center gap-1">
                <Calendar size={14} className="text-primary" /> {booking.scheduledDate} ({booking.scheduledTimeSlot})
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link to={`/bookings/${booking.id}`} className="btn btn-outline-secondary btn-sm px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5">
              <Package size={15} /> Job Details &amp; BOM
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger rounded-3 border-0 shadow-sm mb-4 small">
          {error}
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Workflow Transition Controls & Job Details */}
        <div className="col-12 col-lg-7">
          {/* Progression Controls Card */}
          <div className="hc-card p-4 mb-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <Navigation size={18} className="text-primary" /> Field Status Progression
            </h5>
            <p className="text-secondary small mb-3">
              Advance your arrival status to synchronize customer alerts and regional warehouse tracking:
            </p>

            <div className="d-flex flex-wrap gap-2 mb-4">
              {booking.status === 'ACCEPTED' && (
                <button
                  className="btn btn-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('ON_THE_WAY', 'En route to customer premises')}
                >
                  <Navigation size={16} /> Mark "On The Way"
                </button>
              )}

              {booking.status === 'ON_THE_WAY' && (
                <button
                  className="btn btn-info text-white px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('ARRIVED', 'Arrived at service location')}
                >
                  <MapPin size={16} /> Mark "Arrived On Site"
                </button>
              )}

              {booking.status === 'ARRIVED' && (
                <button
                  className="btn btn-success px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('IN_PROGRESS', 'Beginning diagnostic and repair work')}
                >
                  <Play size={16} /> Start Job (In Progress)
                </button>
              )}

              {booking.status === 'IN_PROGRESS' && (
                <button
                  className="btn btn-outline-warning px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('WAITING_FOR_MATERIALS', 'Awaiting additional spare parts dispatch')}
                >
                  <Pause size={16} /> Pause (Waiting on Parts)
                </button>
              )}

              {booking.status === 'WAITING_FOR_MATERIALS' && (
                <button
                  className="btn btn-primary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-2 fw-medium"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('IN_PROGRESS', 'Parts received, resuming job')}
                >
                  <Play size={16} /> Resume Work
                </button>
              )}

              {booking.status === 'COMPLETED' && (
                <div className="badge bg-success bg-opacity-15 text-success px-3 py-2 rounded-3 fw-semibold">
                  <Check size={14} className="me-1" /> Job Officially Completed
                </div>
              )}
            </div>

            {/* Customer Contact & Destination */}
            <div className="p-3 bg-light rounded-3 border mb-3">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <User size={16} className="text-primary" />
                  <span className="fw-semibold text-dark small">{booking.customerName || 'Customer'}</span>
                </div>
                {booking.customerPhone && (
                  <a href={`tel:${booking.customerPhone}`} className="btn btn-sm btn-outline-primary py-0.5 px-2 rounded-2 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                    <Phone size={12} /> {booking.customerPhone}
                  </a>
                )}
              </div>
              <div className="small text-secondary d-flex align-items-start gap-1.5">
                <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                <span>{addressLabel}</span>
              </div>
            </div>

            {/* Customer problem summary */}
            <div className="p-3 bg-light rounded-3 border">
              <div className="small text-secondary mb-1">Customer Problem Description:</div>
              <div className="text-dark small lh-base">
                {booking.problemDescription || 'No detailed issue notes recorded.'}
              </div>
              {((booking.attachments && booking.attachments.length > 0) || booking.photoUrl) && (
                <div className="mt-3 pt-2.5 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="small fw-semibold text-dark d-flex align-items-center gap-1">
                      <Camera size={14} className="text-primary" /> Customer Problem Photos:
                    </span>
                    <span className="badge bg-light text-secondary border small">
                      {booking.attachments?.length || 1} photo{booking.attachments?.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2">
                    {booking.attachments && booking.attachments.length > 0 ? (
                      booking.attachments.map((att, idx) => {
                        const token = localStorage.getItem('token');
                        const authUrl = att.url && !att.url.startsWith('http') && token 
                          ? `${att.url}?token=${encodeURIComponent(token)}` 
                          : att.url;
                        return (
                          <div
                            key={att.id || idx}
                            className="border rounded-2 overflow-hidden shadow-sm position-relative"
                            style={{ width: 90, height: 90, cursor: 'pointer' }}
                            onClick={() => setSelectedPreviewPhoto(authUrl)}
                            title="Click to zoom"
                          >
                            <img
                              src={authUrl}
                              alt={att.originalFilename || `Problem photo ${idx + 1}`}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                            <div className="position-absolute bottom-0 start-0 end-0 px-1 text-center text-white" style={{ background: 'rgba(15,23,42,0.7)', fontSize: '0.65rem' }}>
                              #{idx + 1}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <img
                        src={
                          booking.photoUrl && !booking.photoUrl.startsWith('http') && localStorage.getItem('token')
                            ? `${booking.photoUrl}?token=${encodeURIComponent(localStorage.getItem('token'))}`
                            : booking.photoUrl
                        }
                        alt="Problem attachment"
                        className="img-fluid rounded-2 border"
                        style={{ maxHeight: 160, cursor: 'pointer' }}
                        onClick={() => {
                          const token = localStorage.getItem('token');
                          const authUrl = booking.photoUrl && !booking.photoUrl.startsWith('http') && token 
                            ? `${booking.photoUrl}?token=${encodeURIComponent(token)}` 
                            : booking.photoUrl;
                          setSelectedPreviewPhoto(authUrl);
                        }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reserved Materials Manifest */}
            {booking.materials && booking.materials.length > 0 && (
              <div className="mt-3 p-3 bg-light rounded-3 border">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="small fw-semibold text-dark d-flex align-items-center gap-1.5">
                    <Package size={14} className="text-primary" /> Reserved Replacement Parts ({booking.materials.length}):
                  </span>
                  <span className="badge bg-success bg-opacity-15 text-success small">Pre-Allocated</span>
                </div>
                <div className="border rounded-2 bg-white overflow-hidden">
                  {booking.materials.map((mat, idx) => (
                    <div key={mat.id || idx} className="p-2.5 d-flex justify-content-between align-items-center border-bottom last:border-0 small">
                      <div>
                        <div className="fw-medium text-dark">{mat.itemName}</div>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          SKU: {mat.itemSku || 'N/A'} • Source: {mat.locationName || 'Warehouse'}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-light text-primary border font-monospace">Qty: {mat.reservedQty || 1}</span>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>${mat.unitPrice ? Number(mat.unitPrice).toFixed(2) : '0.00'} ea</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete Job Form or Completion Summary */}
        <div className="col-12 col-lg-5">
          {['ARRIVED', 'IN_PROGRESS', 'WAITING_FOR_MATERIALS'].includes(booking.status) ? (
            <div className="hc-card p-4 border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-2 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <CheckCircle2 size={18} className="text-success" /> Sign-Off &amp; Complete Job
              </h5>
              <p className="text-secondary small mb-3">
                Log actual material charges consumed and submit completion verification:
              </p>

              <form onSubmit={handleCompleteJob}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">
                    Actual Materials Consumed ($)
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><DollarSign size={16} /></span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control"
                      value={materialsAmount}
                      onChange={(e) => setMaterialsAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-text small text-secondary mt-1">
                    Added to base labor rate in customer's final itemized invoice.
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-dark">
                    Completion Notes / Resolution Summary
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold text-dark">
                    After-Repair Photo URL
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light"><Camera size={16} /></span>
                    <input
                      type="url"
                      className="form-control"
                      value={completionPhotoUrl}
                      onChange={(e) => setCompletionPhotoUrl(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100 py-2.5 rounded-3 fw-medium d-inline-flex align-items-center justify-content-center gap-2 shadow-sm"
                  disabled={completing}
                >
                  {completing ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>Generating Final Invoice...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      <span>Submit Completion &amp; Close Job</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : booking.status === 'COMPLETED' ? (
            <div className="hc-card p-4 border-0 shadow-sm text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                <CheckCircle2 size={40} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Job Officially Completed</h5>
              <p className="text-secondary small mb-3">
                Final invoice has been generated for ${booking.finalAmount ? Number(booking.finalAmount).toFixed(2) : Number(booking.quotationAmount || 0).toFixed(2)}.
              </p>
              {booking.completionNotes && (
                <div className="p-3 bg-light rounded-3 text-start small mb-3 border">
                  <div className="text-secondary mb-1">Completion Notes:</div>
                  <div className="text-dark">{booking.completionNotes}</div>
                </div>
              )}
              <Link to={`/bookings/${booking.id}`} className="btn btn-outline-primary btn-sm px-4 py-2 rounded-3">
                View Final Invoice
              </Link>
            </div>
          ) : (
            <div className="hc-card p-4 border-0 shadow-sm text-center">
              <Clock size={36} className="text-secondary mx-auto mb-2 opacity-50" />
              <h6 className="fw-bold text-dark mb-1">Sign-Off Unavailable</h6>
              <p className="text-secondary small mb-0">
                You must advance the field status to "Arrived On Site" or "In Progress" before submitting final sign-off.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Photo Zoom Modal */}
      {selectedPreviewPhoto && (
        <div 
          className="modal show d-block" 
          tabIndex="-1" 
          style={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(5px)', zIndex: 1060 }}
          onClick={() => setSelectedPreviewPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-xl overflow-hidden bg-white">
              <div className="modal-header border-bottom px-4 py-3 d-flex justify-content-between align-items-center">
                <h6 className="fw-bold text-dark mb-0">Customer Problem Photo (Full View)</h6>
                <button type="button" className="btn-close" onClick={() => setSelectedPreviewPhoto(null)}></button>
              </div>
              <div className="modal-body p-2 text-center bg-light">
                <img
                  src={selectedPreviewPhoto}
                  alt="Customer problem zoom preview"
                  className="img-fluid rounded-2"
                  style={{ maxHeight: 520, objectFit: 'contain' }}
                />
              </div>
              <div className="modal-footer border-top px-4 py-2.5 bg-light d-flex justify-content-end">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary btn-sm px-3 py-1.5 rounded-3" 
                  onClick={() => setSelectedPreviewPhoto(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
