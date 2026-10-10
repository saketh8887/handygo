import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, Wrench, AlertCircle, CheckCircle2, 
  CreditCard, Star, FileText, ArrowLeft, ShieldAlert, ShieldCheck, 
  Package, Truck, Phone, User, RefreshCw, XCircle
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isCreatedJustNow = searchParams.get('created') === 'true';

  const [booking, setBooking] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState(isCreatedJustNow ? 'Booking created successfully! Logistics engine evaluating readiness.' : '');

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
  }, [id]);

  const fetchBookingAndReadiness = async () => {
    try {
      setLoading(true);
      const [bookingRes, readinessRes] = await Promise.allSettled([
        api.get(`/bookings/${id}`),
        api.get(`/bookings/${id}/readiness`),
      ]);

      if (bookingRes.status === 'fulfilled') {
        setBooking(bookingRes.value.data.data);
      } else {
        throw new Error('Failed to load booking details');
      }

      if (readinessRes.status === 'fulfilled') {
        setReadiness(readinessRes.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching booking detail:', err);
      setError('Could not retrieve booking details. Please try again.');
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
      setActionSuccess('Booking has been cancelled.');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Cancellation failed:', err);
      setError(err.response?.data?.message || 'Failed to cancel booking.');
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
      setActionSuccess('Payment of $' + parseFloat(payload.amount).toFixed(2) + ' completed successfully!');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err.response?.data?.message || 'Payment simulation failed.');
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
      setActionSuccess('Thank you for rating your service experience!');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Review submission failed:', err);
      setError(err.response?.data?.message || 'Failed to submit review.');
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
      setActionSuccess('Complaint lodged. Our administrative operations team will investigate.');
      fetchBookingAndReadiness();
    } catch (err) {
      console.error('Complaint filing failed:', err);
      setError(err.response?.data?.message || 'Failed to file complaint.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const workflowSteps = [
    { key: 'PENDING', label: 'Pending Dispatch' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'ON_THE_WAY', label: 'On The Way' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const getStepIndex = (status) => {
    return workflowSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading details...</span>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold">Booking Not Found</h4>
        <Link to="/customer/bookings" className="btn btn-primary mt-3">Back to My Bookings</Link>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(booking.status);
  const isCancelled = booking.status === 'CANCELLED';

  return (
    <div className="container py-5">
      {/* Top Breadcrumb & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <Link to="/customer/bookings" className="btn btn-outline-secondary btn-sm p-2 rounded-circle">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h3 className="fw-bold mb-0">Booking #{booking.bookingNumber}</h3>
              <StatusBadge status={booking.status} />
            </div>
            <p className="text-muted small mb-0">Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {['PENDING', 'ASSIGNED'].includes(booking.status) && (
            <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={handleCancelBooking}>
              <XCircle size={16} /> Cancel Booking
            </button>
          )}
          {booking.status === 'COMPLETED' && !booking.isPaid && (
            <button className="btn btn-success d-flex align-items-center gap-2" onClick={() => setShowPaymentModal(true)}>
              <CreditCard size={18} /> Pay Now (${parseFloat(booking.totalAmount || booking.estimatedBasePrice).toFixed(2)})
            </button>
          )}
          {booking.status === 'COMPLETED' && (
            <button className="btn btn-outline-primary d-flex align-items-center gap-2" onClick={() => setShowReviewModal(true)}>
              <Star size={18} /> Rate Service
            </button>
          )}
          <button className="btn btn-outline-warning d-flex align-items-center gap-1" onClick={() => setShowComplaintModal(true)}>
            <AlertCircle size={16} /> File Complaint
          </button>
        </div>
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

      {/* Progress Timeline */}
      {!isCancelled && (
        <div className="card shadow-sm border-0 rounded-4 mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold text-muted text-uppercase mb-4">Live Dispatch &amp; Job Execution Tracker</h6>
            <div className="d-flex justify-content-between position-relative">
              {workflowSteps.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = booking.status === step.key;
                return (
                  <div key={step.key} className="text-center" style={{ flex: 1, zIndex: 1 }}>
                    <div
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm ${
                        isCurrent
                          ? 'bg-primary text-white ring ring-primary ring-opacity-50'
                          : isPassed
                          ? 'bg-success text-white'
                          : 'bg-light text-muted border'
                      }`}
                      style={{ width: 36, height: 36 }}
                    >
                      {isPassed ? <CheckCircle2 size={18} /> : idx + 1}
                    </div>
                    <div className={`small fw-semibold ${isCurrent ? 'text-primary' : isPassed ? 'text-dark' : 'text-muted'} d-none d-md-block`}>
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Left Column: Job Details & Assigned Technician */}
        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Wrench className="text-primary" /> Service Specification
            </h5>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="small text-muted">Service Name</div>
                <div className="fw-bold fs-6">{booking.serviceName}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Category</div>
                <div className="fw-bold fs-6">{booking.categoryName}</div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Scheduled Date &amp; Time</div>
                <div className="fw-bold fs-6">
                  {booking.scheduledDate} ({booking.scheduledTimeSlot})
                </div>
              </div>
              <div className="col-md-6">
                <div className="small text-muted">Service Location</div>
                <div className="fw-bold fs-6">{booking.customerAddress}</div>
              </div>
              <div className="col-12">
                <div className="small text-muted">Reported Problem Description</div>
                <div className="p-3 bg-light rounded-3 mt-1 text-dark">
                  {booking.problemDescription}
                </div>
              </div>
              {booking.photoUrl && (
                <div className="col-12">
                  <div className="small text-muted mb-2">Attached Problem Photo</div>
                  <img
                    src={booking.photoUrl}
                    alt="Problem attachment"
                    className="img-fluid rounded-3 border"
                    style={{ maxHeight: 200, objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Assigned Handyman Section */}
          <div className="card shadow-sm border-0 rounded-4 p-4 mb-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <User className="text-primary" /> Assigned Handyman
            </h5>
            {booking.assignedHandymanName ? (
              <div className="d-flex align-items-start gap-3">
                <div className="rounded-circle bg-primary bg-opacity-10 text-primary p-3">
                  <Wrench size={28} />
                </div>
                <div>
                  <h6 className="fw-bold mb-1">{booking.assignedHandymanName}</h6>
                  <p className="text-muted small mb-1">
                    <Phone size={14} className="me-1" /> {booking.assignedHandymanPhone || 'Contact details active upon arrival'}
                  </p>
                  <span className="badge bg-success bg-opacity-10 text-success">
                    Verified Professional Technician
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-light rounded-3 text-muted small d-flex align-items-center gap-2">
                <Clock size={18} className="text-warning" />
                <span>
                  Our dispatch operations team is matching the highest rated available technician in your area.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Job Readiness & Financials */}
        <div className="col-12 col-lg-5">
          {/* Deterministic Job Readiness & Material Coordination Card */}
          {readiness && (
            <div className="card shadow-sm border-0 rounded-4 p-4 mb-4 border-start border-4 border-primary">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0 d-flex align-items-center gap-2">
                  <Package className="text-primary" /> Job Readiness
                </h5>
                <span
                  className={`badge px-3 py-2 ${
                    readiness.readinessLevel === 'READY'
                      ? 'bg-success'
                      : readiness.readinessLevel === 'PARTIALLY_READY'
                      ? 'bg-warning text-dark'
                      : readiness.readinessLevel === 'AT_RISK'
                      ? 'bg-danger'
                      : 'bg-dark'
                  }`}
                >
                  {readiness.readinessLevel}
                </span>
              </div>

              <p className="text-muted small mb-3">
                Autonomous logistics evaluation of technician qualifications and regional warehouse spare parts.
              </p>

              {readiness.recommendedLocation && (
                <div className="p-2 bg-light rounded-3 mb-3 small">
                  <strong>Optimal Stock Source:</strong> {readiness.recommendedLocation.locationName} ({readiness.recommendedLocation.locationCode})
                  <br />
                  <span className="text-muted">Est. transit lead time: {readiness.recommendedLocation.estimatedTransitMinutes || 15} mins</span>
                </div>
              )}

              {/* Material Allocation Details */}
              {readiness.materialEvaluations?.length > 0 && (
                <div className="mb-3">
                  <div className="small fw-bold text-dark mb-1">Material Coordination Status:</div>
                  <ul className="list-unstyled small mb-0">
                    {readiness.materialEvaluations.map((mat, i) => (
                      <li key={i} className="py-1 border-bottom d-flex justify-content-between align-items-center">
                        <div>
                          <span>{mat.itemName}</span>
                          <span className="text-muted ms-2">(Req: {mat.quantityRequired})</span>
                        </div>
                        <span className={`badge ${mat.availableQuantity >= mat.quantityRequired ? 'bg-success' : 'bg-danger'}`}>
                          {mat.availableQuantity >= mat.quantityRequired ? 'In Stock' : 'Low Stock'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explainable Reasoning */}
              {readiness.reasons?.length > 0 && (
                <div className="p-2 bg-light rounded-2 small text-muted">
                  <strong>Logistics Assessment:</strong>
                  <ul className="ps-3 mb-0 mt-1">
                    {readiness.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Quotation & Invoice Card */}
          <div className="card shadow-sm border-0 rounded-4 p-4">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <FileText className="text-primary" /> Billing &amp; Invoice
            </h5>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Labor Base Price:</span>
              <strong>${parseFloat(booking.estimatedBasePrice || 0).toFixed(2)}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Materials Consumed:</span>
              <strong>${parseFloat(booking.materialsAmount || 0).toFixed(2)}</strong>
            </div>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tax &amp; Surcharges (10%):</span>
              <strong>
                ${((parseFloat(booking.estimatedBasePrice || 0) + parseFloat(booking.materialsAmount || 0)) * 0.1).toFixed(2)}
              </strong>
            </div>

            <hr className="my-2" />

            <div className="d-flex justify-content-between fs-5 fw-bold mb-3">
              <span>Total Price:</span>
              <span className="text-success">
                ${parseFloat(booking.totalAmount || (parseFloat(booking.estimatedBasePrice || 0) * 1.1)).toFixed(2)}
              </span>
            </div>

            <div className="p-2 bg-light rounded-3 d-flex justify-content-between align-items-center small">
              <span>Payment Status:</span>
              <span className={`badge ${booking.isPaid ? 'bg-success' : 'bg-warning text-dark'}`}>
                {booking.isPaid ? 'PAID' : 'PAYMENT DUE'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Simulation Modal */}
      {showPaymentModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Complete Service Payment</h5>
                <button type="button" className="btn-close" onClick={() => setShowPaymentModal(false)}></button>
              </div>
              <form onSubmit={handleProcessPayment}>
                <div className="modal-body p-4">
                  <div className="text-center mb-4">
                    <span className="display-6 fw-bold text-success">
                      ${parseFloat(booking.totalAmount || booking.estimatedBasePrice).toFixed(2)}
                    </span>
                    <p className="text-muted small">HandyConnect Simulated Payment Gateway</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Payment Method</label>
                    <div className="d-flex flex-column gap-2">
                      {['SIMULATED_CARD', 'UPI', 'NET_BANKING', 'CASH'].map((m) => (
                        <label key={m} className={`btn text-start p-3 border d-flex align-items-center gap-2 ${paymentMethod === m ? 'btn-primary' : 'btn-light'}`}>
                          <input
                            type="radio"
                            name="payMethod"
                            className="d-none"
                            checked={paymentMethod === m}
                            onChange={() => setPaymentMethod(m)}
                          />
                          <CreditCard size={18} />
                          <span>{m.replace('_', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success px-4" disabled={processingPayment}>
                    {processingPayment ? 'Processing...' : 'Confirm Simulated Payment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Rating & Review Modal */}
      {showReviewModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
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
                          className={`cursor-pointer ${star <= rating ? 'text-warning fill-warning' : 'text-muted'}`}
                          style={{ cursor: 'pointer', fill: star <= rating ? '#ffc107' : 'none' }}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                    <span className="fw-semibold">{rating} of 5 Stars</span>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Review &amp; Feedback</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Share your experience regarding punctuality, repair quality, and professional conduct..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowReviewModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submittingReview}>
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
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">File a Service Grievance</h5>
                <button type="button" className="btn-close" onClick={() => setShowComplaintModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitComplaint}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Grievance Category</label>
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
                    <label className="form-label fw-semibold">Describe the Incident</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="Please provide full details for our management review..."
                      value={complaintDesc}
                      onChange={(e) => setComplaintDesc(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowComplaintModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-danger px-4" disabled={submittingComplaint}>
                    {submittingComplaint ? 'Submitting...' : 'Submit Grievance'}
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
