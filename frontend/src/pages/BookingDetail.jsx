import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Clock, MapPin, Wrench, AlertCircle, CheckCircle2, 
  CreditCard, Star, FileText, ArrowLeft, ShieldAlert, ShieldCheck, 
  Package, Truck, Phone, User, RefreshCw, XCircle, ChevronRight,
  Layers, Check, Sparkles, AlertTriangle, Building2, UserCheck, Camera, Users
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const isCreatedJustNow = searchParams.get('created') === 'true';

  const [booking, setBooking] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState(null);
  const [selectedPreviewPhoto, setSelectedPreviewPhoto] = useState(null);

  // Modals state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('SIMULATED_CARD');
  const [processingPayment, setProcessingPayment] = useState(false);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintCategory, setComplaintCategory] = useState('QUALITY');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    fetchBookingAndReadiness();
    if (isCreatedJustNow) {
      showToast('Booking submitted successfully! Autonomous logistics engine has evaluated job readiness.', 'success');
    }
  }, [id]);

  const fetchBookingAndReadiness = async () => {
    try {
      setLoading(true);
      setError('');
      setErrorCode(null);
      const [bookingRes, readinessRes] = await Promise.allSettled([
        api.get(`/bookings/${id}`),
        api.get(`/bookings/${id}/readiness`),
      ]);

      if (bookingRes.status === 'fulfilled') {
        setBooking(bookingRes.value.data.data);
      } else {
        const status = bookingRes.reason?.response?.status || 500;
        const msg = bookingRes.reason?.response?.data?.message || 'Failed to load booking details';
        setErrorCode(status);
        setError(msg);
      }

      if (readinessRes.status === 'fulfilled') {
        setReadiness(readinessRes.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching booking detail:', err);
      setError('Could not retrieve booking details. Please try again.');
      showToast('Could not retrieve booking details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Are you sure you want to cancel this service booking?')) return;
    try {
      await api.patch(`/bookings/${id}/status`, {
        status: 'CANCELLED',
        notes: 'Cancelled by customer',
      });
      showToast('Booking has been cancelled.', 'info');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Cancellation failed:', err);
      const msg = err.response?.data?.message || 'Failed to cancel booking.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    try {
      const payload = {
        bookingId: booking.id,
        amount: booking.totalAmount || booking.estimatedBasePrice,
        paymentMethod,
        idempotencyKey: `PAY-${booking.id}-${Date.now()}`,
      };
      await api.post('/payments/process', payload);
      setShowPaymentModal(false);
      showToast(`Payment of $${parseFloat(payload.amount).toFixed(2)} completed successfully!`, 'success');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Payment failed:', err);
      const msg = err.response?.data?.message || 'Payment simulation failed.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        bookingId: booking.id,
        rating,
        comment: reviewComment,
      });
      setShowReviewModal(false);
      showToast('Thank you for rating your service experience!', 'success');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Review submission failed:', err);
      const msg = err.response?.data?.message || 'Failed to submit review.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setSubmittingComplaint(true);
    try {
      await api.post('/complaints', {
        bookingId: booking.id.toString(),
        category: complaintCategory,
        description: complaintDesc,
      });
      setShowComplaintModal(false);
      showToast('Grievance lodged. Our operations management team will investigate promptly.', 'info');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Complaint filing failed:', err);
      const msg = err.response?.data?.message || 'Failed to file complaint.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const workflowSteps = [
    { key: 'PENDING', label: 'Requested', icon: Clock, desc: 'Awaiting dispatch matching' },
    { key: 'ASSIGNED', label: 'Assigned', icon: UserCheck, desc: 'Technician allocated' },
    { key: 'ACCEPTED', label: 'Accepted', icon: Check, desc: 'Confirmed by pro' },
    { key: 'ON_THE_WAY', label: 'En Route', icon: Truck, desc: 'Travelling to location' },
    { key: 'ARRIVED', label: 'Arrived', icon: MapPin, desc: 'On-site preparation' },
    { key: 'IN_PROGRESS', label: 'In Progress', icon: Wrench, desc: 'Work under execution' },
    { key: 'COMPLETED', label: 'Completed', icon: ShieldCheck, desc: 'Finished & verified' },
  ];

  const getStepIndex = (status) => {
    return workflowSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="d-flex align-items-center gap-2 mb-4">
          <Skeleton width="180px" height="20px" />
        </div>
        <div className="hc-card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-6"><Skeleton width="60%" height="32px" /><Skeleton width="40%" height="18px" className="mt-2" /></div>
            <div className="col-md-6 d-flex justify-content-end gap-2"><Skeleton width="120px" height="38px" /></div>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-7"><Skeleton height="320px" /></div>
          <div className="col-lg-5"><Skeleton height="320px" /></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    const isAccessDenied = errorCode === 403;
    const isNotFound = errorCode === 404;

    const returnPath = 
      user?.role === 'ROLE_HANDYMAN' ? '/handyman' :
      user?.role === 'ROLE_ADMIN' ? '/admin/bookings' :
      '/customer/bookings';

    const returnLabel = 
      user?.role === 'ROLE_HANDYMAN' ? 'Back to Technician Workbench' :
      user?.role === 'ROLE_ADMIN' ? 'Back to Dispatch Board' :
      'Back to My Bookings';

    return (
      <div className="container py-5 text-center">
        <div className="hc-card p-5 max-w-md mx-auto" style={{ maxWidth: 520 }}>
          {isAccessDenied ? (
            <>
              <ShieldAlert size={52} className="text-warning mx-auto mb-3" />
              <h4 className="fw-bold mb-2 text-dark">Access Denied</h4>
              <p className="text-secondary small mb-4">
                You are not authorized to view booking #{id}. You may only access bookings where you are the booking customer, the assigned technician, or an administrator.
              </p>
            </>
          ) : isNotFound ? (
            <>
              <AlertCircle size={52} className="text-secondary mx-auto mb-3" />
              <h4 className="fw-bold mb-2 text-dark">Booking Not Found</h4>
              <p className="text-secondary small mb-4">
                No booking could be found with identifier or reference "#{id}". Please verify the booking reference.
              </p>
            </>
          ) : (
            <>
              <AlertTriangle size={52} className="text-danger mx-auto mb-3" />
              <h4 className="fw-bold mb-2 text-dark">Unable to Load Booking</h4>
              <p className="text-secondary small mb-4">
                {error || 'An unexpected error occurred while communicating with the service.'}
              </p>
              <button 
                onClick={fetchBookingAndReadiness} 
                className="btn btn-outline-primary btn-sm px-4 py-2 me-2"
              >
                Retry
              </button>
            </>
          )}

          <Link to={returnPath} className="btn btn-primary px-4 py-2">
            {returnLabel}
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(booking.status);
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="container py-4">
      {/* Top Breadcrumb */}
      <Breadcrumb
        items={[
          {
            label: user?.role === 'ROLE_HANDYMAN' ? 'Technician Workbench' : user?.role === 'ROLE_ADMIN' ? 'Dispatch Board' : 'My Bookings',
            path: user?.role === 'ROLE_HANDYMAN' ? '/handyman' : user?.role === 'ROLE_ADMIN' ? '/admin/bookings' : '/customer/bookings'
          },
          { label: `Booking #${booking.bookingNumber}` }
        ]}
      />

      {/* Header Banner */}
      <div className="hc-card p-4 mb-4 border-0 shadow-sm">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="badge bg-light text-primary font-monospace px-2.5 py-1.5 border" style={{ fontSize: '0.85rem' }}>
                #{booking.bookingNumber}
              </span>
              <StatusBadge status={booking.status} />
              {readiness?.readinessLevel === 'READY' && (
                <span className="hc-badge hc-badge-success d-inline-flex align-items-center gap-1">
                  <Sparkles size={12} /> Ready for Dispatch
                </span>
              )}
            </div>
            <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
              {booking.serviceName}
            </h2>
            <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
              <span className="d-inline-flex align-items-center gap-1">
                <Calendar size={14} /> Scheduled: {booking.scheduledDate} ({booking.scheduledTimeSlot})
              </span>
              <span>•</span>
              <span className="d-inline-flex align-items-center gap-1">
                <Clock size={14} /> Booked on {new Date(booking.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {['PENDING', 'ASSIGNED'].includes(booking.status) && (
              <button 
                className="btn btn-outline-danger btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5 rounded-3 fw-medium"
                onClick={handleCancelBooking}
              >
                <XCircle size={15} /> Cancel Booking
              </button>
            )}
            {booking.status === 'COMPLETED' && !booking.isPaid && (
              <button 
                className="btn btn-success btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5 rounded-3 fw-medium shadow-sm"
                onClick={() => setShowPaymentModal(true)}
              >
                <CreditCard size={15} /> Pay ${parseFloat(booking.totalAmount || booking.estimatedBasePrice).toFixed(2)}
              </button>
            )}
            {booking.status === 'COMPLETED' && (
              <button 
                className="btn btn-primary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5 rounded-3 fw-medium"
                onClick={() => setShowReviewModal(true)}
              >
                <Star size={15} /> Rate Handyman
              </button>
            )}
            <button 
              className="btn btn-outline-secondary btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5 rounded-3 fw-medium"
              onClick={() => setShowComplaintModal(true)}
            >
              <AlertCircle size={15} /> Support / Grievance
            </button>
          </div>
        </div>
      </div>

      {/* Progress Timeline Stepper */}
      {!isCancelled ? (
        <div className="hc-card p-4 mb-4 border-0 shadow-sm overflow-hidden">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Truck size={17} className="text-primary" /> Service Lifecycle &amp; Dispatch Tracker
              </h6>
              <p className="text-secondary small mb-0 mt-0.5">Real-time status synced with technician mobile terminal</p>
            </div>
            <span className="badge bg-primary bg-opacity-10 text-primary fw-medium px-2.5 py-1">
              Active Stage: {workflowSteps[Math.max(0, currentStepIdx)]?.label || booking.status}
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="position-relative pt-2 pb-2">
            <div className="d-none d-lg-block position-absolute" style={{
              top: '28px',
              left: '5%',
              right: '5%',
              height: '3px',
              backgroundColor: 'var(--hc-border)',
              zIndex: 0
            }}>
              <div 
                className="h-100 transition-all duration-300" 
                style={{ 
                  backgroundColor: 'var(--hc-primary)',
                  width: `${Math.min(100, (Math.max(0, currentStepIdx) / (workflowSteps.length - 1)) * 100)}%` 
                }} 
              />
            </div>

            <div className="row g-2 position-relative" style={{ zIndex: 1 }}>
              {workflowSteps.map((step, idx) => {
                const isPassed = currentStepIdx > idx;
                const isCurrent = currentStepIdx === idx;
                const StepIcon = step.icon;
                
                return (
                  <div key={step.key} className="col-12 col-sm-6 col-lg text-lg-center mb-3 mb-lg-0">
                    <div className="d-flex d-lg-block align-items-center gap-3">
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center transition-all ${
                          isPassed
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-primary text-white shadow'
                            : 'bg-white text-secondary border'
                        }`}
                        style={{ 
                          width: 40, 
                          height: 40,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.18)' : 'none',
                          flexShrink: 0
                        }}
                      >
                        {isPassed ? <Check size={18} /> : <StepIcon size={17} />}
                      </div>
                      <div className="mt-lg-2">
                        <div className={`fw-semibold small ${isCurrent ? 'text-primary' : isPassed ? 'text-dark' : 'text-secondary'}`}>
                          {step.label}
                        </div>
                        <div className="text-secondary d-none d-lg-block" style={{ fontSize: '0.72rem' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="hc-card p-4 mb-4 border-0 shadow-sm border-start border-4 border-danger">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-danger bg-opacity-10 text-danger p-3">
              <XCircle size={26} />
            </div>
            <div>
              <h5 className="fw-bold text-danger mb-1">Service Booking Cancelled</h5>
              <p className="text-secondary small mb-0">
                This job has been cancelled. Any pre-allocated parts have been released back into central warehouse inventory.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="row g-4">
        {/* Left Column: Job Details & Assigned Technician */}
        <div className="col-12 col-lg-7">
          {/* Service Specification */}
          <div className="hc-card p-4 mb-4 border-0 shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom flex-wrap gap-2">
              <h5 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
                <Wrench size={18} className="text-primary" /> Service Specification
              </h5>
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                {booking.serviceTeamName && (
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25" style={{ fontSize: '0.75rem' }}>
                    <Users size={12} className="me-1" />
                    {booking.serviceTeamName}
                  </span>
                )}
                <span className="badge bg-light text-secondary border">{booking.categoryName || booking.serviceCategory}</span>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <div className="small text-secondary mb-1">Service Type</div>
                <div className="fw-semibold text-dark">{booking.serviceName}</div>
              </div>
              <div className="col-sm-6">
                <div className="small text-secondary mb-1">Scheduled Slot</div>
                <div className="fw-semibold text-dark d-flex align-items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  {booking.scheduledDate} • {booking.scheduledTimeSlot}
                </div>
              </div>
              <div className="col-12">
                <div className="small text-secondary mb-1">Service Address</div>
                <div className="p-2.5 bg-light rounded-3 fw-medium text-dark d-flex align-items-start gap-2">
                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <span>{booking.customerAddress}</span>
                </div>
              </div>
              <div className="col-12">
                <div className="small text-secondary mb-1">Problem Description Reported</div>
                <div className="p-3 bg-light rounded-3 text-dark small lh-base" style={{ minHeight: '60px' }}>
                  {booking.problemDescription || 'No detailed notes provided during booking.'}
                </div>
              </div>

              {/* Required Technical Skills */}
              {booking.requiredSkills && booking.requiredSkills.length > 0 && (
                <div className="col-12">
                  <div className="small text-secondary mb-1">Required Trade Competencies</div>
                  <div className="d-flex flex-wrap gap-1.5">
                    {booking.requiredSkills.map((sk, idx) => (
                      <span key={idx} className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1" style={{ fontSize: '0.74rem' }}>
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Problem Photo Gallery */}
              {((booking.attachments && booking.attachments.length > 0) || booking.photoUrl) && (
                <div className="col-12">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <div className="small fw-semibold text-dark d-flex align-items-center gap-1.5">
                      <Camera size={15} className="text-primary" />
                      <span>Customer Problem Documentation</span>
                    </div>
                    <span className="badge bg-light text-secondary border small">
                      {booking.attachments?.length || 1} photo{booking.attachments?.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap gap-2.5">
                    {booking.attachments && booking.attachments.length > 0 ? (
                      booking.attachments.map((att, idx) => {
                        const token = localStorage.getItem('token');
                        const authUrl = att.url && !att.url.startsWith('http') && token 
                          ? `${att.url}?token=${encodeURIComponent(token)}` 
                          : att.url;
                        return (
                          <div 
                            key={att.id} 
                            className="border rounded-3 overflow-hidden shadow-sm position-relative transition-all"
                            style={{ width: 110, height: 110, cursor: 'pointer' }}
                            onClick={() => setSelectedPreviewPhoto(authUrl)}
                            title="Click to enlarge"
                          >
                            <img
                              src={authUrl}
                              alt={att.originalFilename || `Problem photo ${idx + 1}`}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                            <div 
                              className="position-absolute bottom-0 start-0 end-0 px-1 py-0.5 text-center text-white" 
                              style={{ background: 'rgba(15,23,42,0.7)', fontSize: '0.68rem' }}
                            >
                              Photo #{idx + 1}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div 
                        className="border rounded-3 p-1.5 bg-light d-inline-block"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const token = localStorage.getItem('token');
                          const authUrl = booking.photoUrl && !booking.photoUrl.startsWith('http') && token 
                            ? `${booking.photoUrl}?token=${encodeURIComponent(token)}` 
                            : booking.photoUrl;
                          setSelectedPreviewPhoto(authUrl);
                        }}
                      >
                        <img
                          src={
                            booking.photoUrl && !booking.photoUrl.startsWith('http') && localStorage.getItem('token')
                              ? `${booking.photoUrl}?token=${encodeURIComponent(localStorage.getItem('token'))}`
                              : booking.photoUrl
                          }
                          alt="Problem attachment"
                          className="img-fluid rounded-2"
                          style={{ maxHeight: 200, maxWidth: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="hc-card p-4 mb-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <User size={18} className="text-primary" /> Assigned Service Professional
            </h5>

            {booking.assignedHandymanName ? (
              <div>
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div 
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm overflow-hidden"
                      style={{ width: 50, height: 50, fontSize: '1.05rem' }}
                    >
                      {booking.assignedHandymanPhoto ? (
                        <img src={booking.assignedHandymanPhoto} alt={booking.assignedHandymanName} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        booking.assignedHandymanName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h6 className="fw-bold text-dark mb-0">{booking.assignedHandymanName}</h6>
                        <span className="hc-badge hc-badge-success" style={{ fontSize: '0.72rem' }}>
                          <ShieldCheck size={11} className="me-0.5" /> Verified Specialist
                        </span>
                      </div>
                      <div className="text-secondary small mt-0.5 d-flex align-items-center gap-3">
                        <span className="d-flex align-items-center gap-1">
                          <Phone size={13} className="text-primary" /> 
                          {booking.assignedHandymanPhone || '+1 (555) 492-3891'}
                        </span>
                        {booking.assignedHandymanRating && (
                          <span className="text-warning fw-semibold">
                            ★ {parseFloat(booking.assignedHandymanRating).toFixed(1)} Rating
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <a 
                    href={`tel:${booking.assignedHandymanPhone || '5550199'}`} 
                    className="btn btn-outline-primary btn-sm px-3 py-1.5 rounded-3 d-inline-flex align-items-center gap-1.5"
                  >
                    <Phone size={14} /> Call Technician
                  </a>
                </div>

                {/* Department & Specialization Badges */}
                <div className="p-2.5 bg-light rounded-3 d-flex flex-wrap align-items-center gap-2 border">
                  {(booking.assignedHandymanPrimaryTeam || (booking.assignedHandymanTeams && booking.assignedHandymanTeams.length > 0)) && (
                    <div className="d-flex align-items-center gap-1 me-2">
                      <span className="text-secondary small fw-medium">Department:</span>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1" style={{ fontSize: '0.72rem' }}>
                        <Users size={11} className="me-1" />
                        {booking.assignedHandymanPrimaryTeam || booking.assignedHandymanTeams[0]}
                      </span>
                    </div>
                  )}

                  {(booking.assignedHandymanSpecialization || (booking.assignedHandymanSpecializations && booking.assignedHandymanSpecializations.length > 0)) && (
                    <div className="d-flex align-items-center gap-1.5 flex-wrap">
                      <span className="text-secondary small fw-medium">Specialization:</span>
                      {booking.assignedHandymanSpecialization && (
                        <span className="badge bg-primary text-white px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                          {booking.assignedHandymanSpecialization} (Primary)
                        </span>
                      )}
                      {booking.assignedHandymanSpecializations?.filter(s => s !== booking.assignedHandymanSpecialization).map((spec, sIdx) => (
                        <span key={sIdx} className="badge bg-white text-secondary border px-2 py-1" style={{ fontSize: '0.7rem' }}>
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                <div className="rounded-circle bg-warning bg-opacity-15 p-2 text-warning flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <div className="fw-semibold text-dark small">Matching Certified Technician</div>
                  <div className="text-secondary small mt-0.5">
                    Our AI dispatch engine is selecting the highest-rated available specialist within your regional zone.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Readiness & Financials */}
        <div className="col-12 col-lg-5">
          {/* Autonomous Job Readiness & Material Allocation */}
          {readiness && (
            <div className="hc-card p-4 mb-4 border-0 shadow-sm border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <Package size={18} className="text-primary" />
                  <h6 className="fw-bold text-dark mb-0">Job Readiness Guarantee</h6>
                </div>
                <span
                  className={`badge px-2.5 py-1 ${
                    readiness.readinessLevel === 'READY'
                      ? 'bg-success text-white'
                      : readiness.readinessLevel === 'PARTIALLY_READY'
                      ? 'bg-warning text-dark'
                      : readiness.readinessLevel === 'AT_RISK'
                      ? 'bg-danger text-white'
                      : 'bg-secondary text-white'
                  }`}
                  style={{ fontSize: '0.75rem', fontWeight: 600 }}
                >
                  {readiness.readinessLevel?.replace('_', ' ')}
                </span>
              </div>

              <p className="text-secondary small mb-3">
                Pre-allocation checks ensure the technician arrives with compatible replacement parts on the first visit.
              </p>

              {readiness.recommendedLocation && (
                <div className="p-2.5 bg-light rounded-3 mb-3 border small">
                  <div className="d-flex align-items-center gap-1.5 fw-semibold text-dark mb-1">
                    <Building2 size={14} className="text-primary" />
                    <span>Allocated Warehouse Source:</span>
                  </div>
                  <div className="text-secondary ps-3">
                    <strong>{readiness.recommendedLocation.locationName}</strong> ({readiness.recommendedLocation.locationCode})
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Est. transit lead time: {readiness.recommendedLocation.estimatedTransitMinutes || 15} mins
                    </div>
                  </div>
                </div>
              )}

              {/* Material Allocation Details */}
              {readiness.materialEvaluations?.length > 0 && (
                <div className="mb-3">
                  <div className="small fw-semibold text-dark mb-2 d-flex align-items-center justify-content-between">
                    <span>Pre-Allocated Parts</span>
                    <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{readiness.materialEvaluations.length} items</span>
                  </div>
                  <div className="border rounded-3 divide-y bg-white">
                    {readiness.materialEvaluations.map((mat, i) => (
                      <div key={i} className="p-2.5 d-flex justify-content-between align-items-center border-bottom last:border-0">
                        <div>
                          <div className="small fw-medium text-dark">{mat.itemName}</div>
                          <div className="text-secondary" style={{ fontSize: '0.72rem' }}>Required: {mat.quantityRequired} units</div>
                        </div>
                        <span className={`badge ${mat.availableQuantity >= mat.quantityRequired ? 'bg-success bg-opacity-15 text-success' : 'bg-danger bg-opacity-15 text-danger'}`} style={{ fontSize: '0.72rem' }}>
                          {mat.availableQuantity >= mat.quantityRequired ? 'In Stock (Reserved)' : 'Shortage'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasons list */}
              {readiness.reasons?.length > 0 && (
                <div className="p-2.5 bg-light rounded-3 small">
                  <div className="fw-semibold text-dark mb-1" style={{ fontSize: '0.78rem' }}>Logistics Evaluation:</div>
                  <ul className="ps-3 mb-0 text-secondary" style={{ fontSize: '0.75rem' }}>
                    {readiness.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quotation & Invoice Card */}
          <div className="hc-card p-4 mb-4 border-0 shadow-sm">
            <h5 className="fw-bold mb-3 pb-2 border-bottom d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <FileText size={18} className="text-primary" /> Transparent Pricing
            </h5>

            <div className="d-flex justify-content-between py-2 border-bottom text-sm">
              <span className="text-secondary">Labor Base Rate:</span>
              <span className="fw-semibold text-dark">${parseFloat(booking.estimatedBasePrice || 0).toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom text-sm">
              <span className="text-secondary">Materials Consumed:</span>
              <span className="fw-semibold text-dark">${parseFloat(booking.materialsAmount || 0).toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between py-2 border-bottom text-sm">
              <span className="text-secondary">Tax &amp; Regulatory Fees (10%):</span>
              <span className="fw-semibold text-dark">
                ${((parseFloat(booking.estimatedBasePrice || 0) + parseFloat(booking.materialsAmount || 0)) * 0.1).toFixed(2)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 pb-2">
              <span className="fw-bold text-dark fs-6">Estimated Total:</span>
              <span className="fw-bold fs-4 text-primary">
                ${parseFloat(booking.totalAmount || (parseFloat(booking.estimatedBasePrice || 0) * 1.1)).toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 mt-2 bg-light rounded-3 d-flex justify-content-between align-items-center small">
              <span className="text-secondary">Settlement Status:</span>
              <span className={`badge px-2.5 py-1 ${booking.isPaid ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontWeight: 600 }}>
                {booking.isPaid ? 'PAID & SETTLED' : 'PAYMENT PENDING'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold">Complete Service Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handleProcessPayment}>
                <div className="modal-body p-4">
                  <div className="text-center p-3 bg-light rounded-3 mb-4">
                    <div className="small text-secondary mb-1">Invoice Amount Due</div>
                    <span className="display-6 fw-bold text-dark">
                      ${parseFloat(booking.totalAmount || booking.estimatedBasePrice).toFixed(2)}
                    </span>
                    <p className="text-secondary small mb-0 mt-1">Directly disbursed to verified technician</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Select Payment Method</label>
                    <div className="d-flex flex-column gap-2">
                      {[
                        { id: 'SIMULATED_CARD', label: 'Credit / Debit Card', icon: CreditCard },
                        { id: 'UPI', label: 'Instant UPI / QR Code', icon: Sparkles },
                        { id: 'NET_BANKING', label: 'Direct Bank Transfer', icon: Building2 },
                        { id: 'CASH', label: 'Cash on Completion', icon: Package }
                      ].map((m) => {
                        const Icon = m.icon;
                        return (
                          <label 
                            key={m.id} 
                            className={`btn text-start p-3 border rounded-3 d-flex align-items-center justify-content-between transition-all ${paymentMethod === m.id ? 'border-primary bg-primary bg-opacity-10 text-primary' : 'bg-white text-dark'}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex align-items-center gap-2.5">
                              <input
                                type="radio"
                                name="payMethod"
                                className="form-check-input mt-0"
                                checked={paymentMethod === m.id}
                                onChange={() => setPaymentMethod(m.id)}
                              />
                              <Icon size={17} />
                              <span className="fw-medium small">{m.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary px-3 py-2" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4 py-2 fw-medium shadow-sm" disabled={processingPayment}>
                    {processingPayment ? 'Authorizing Payment...' : 'Confirm Simulated Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {showReviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold">Rate Handyman Performance</h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitReview}>
                <div className="modal-body p-4">
                  <div className="text-center mb-4">
                    <div className="d-flex justify-content-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={32}
                          className={`cursor-pointer transition-all ${star <= rating ? 'text-warning fill-warning' : 'text-muted'}`}
                          style={{ cursor: 'pointer', fill: star <= rating ? '#ffc107' : 'none' }}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <span className="fw-semibold text-dark small">{rating} out of 5 Stars</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Service Experience Review</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share your thoughts on punctuality, repair cleanliness, and craftsmanship..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary px-3 py-2" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4 py-2 fw-medium" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Filing Modal */}
      {showComplaintModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <h5 className="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                  <AlertCircle size={20} /> File a Service Grievance
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowComplaintModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitComplaint}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Grievance Category</label>
                    <select
                      className="form-select"
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                    >
                      <option value="QUALITY">Repair Quality or Workmanship</option>
                      <option value="DELAY">Unpunctuality / Severe Delay</option>
                      <option value="BEHAVIOR">Unprofessional Behavior</option>
                      <option value="PRICING">Pricing or Material Discrepancy</option>
                      <option value="DAMAGE">Property Damage</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-dark">Describe the Incident</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Please provide full details so our operations managers can investigate and process remedies..."
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary px-3 py-2" onClick={() => setShowComplaintModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger px-4 py-2 fw-medium" disabled={submittingComplaint}>
                    {submittingComplaint ? 'Submitting...' : 'Submit Grievance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
                <h6 className="fw-bold text-dark mb-0">Problem Photo View</h6>
                <button type="button" className="btn-close" onClick={() => setSelectedPreviewPhoto(null)}></button>
              </div>
              <div className="modal-body p-2 text-center bg-light">
                <img
                  src={selectedPreviewPhoto}
                  alt="Problem zoom preview"
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
