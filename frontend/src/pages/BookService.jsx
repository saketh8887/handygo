import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, Clock, MapPin, Wrench, AlertCircle, CheckCircle2, 
  ArrowRight, ArrowLeft, ShieldCheck, DollarSign, Package, Image as ImageIcon 
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function BookService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [newAddress, setNewAddress] = useState({
    streetLine: '',
    city: 'Metropolis',
    state: 'State',
    postalCode: '10001',
    isDefault: true
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('09:00 - 11:00');
  const [problemDescription, setProblemDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const timeSlots = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '13:00 - 15:00',
    '15:00 - 17:00',
    '17:00 - 19:00',
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [servicesRes, addrRes] = await Promise.all([
        api.get('/services'),
        api.get('/customer/addresses'),
      ]);

      const sData = servicesRes.data.data || [];
      const aData = addrRes.data.data || [];
      setServices(sData);
      setAddresses(aData);

      if (aData.length > 0) {
        setSelectedAddressId(aData[0].id.toString());
      } else {
        setUseNewAddress(true);
      }

      if (preselectedServiceId) {
        setSelectedServiceId(preselectedServiceId);
      } else if (sData.length > 0) {
        setSelectedServiceId(sData[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load booking dependencies:', err);
      setError('Failed to load services or addresses. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id?.toString() === selectedServiceId?.toString());

  const handleNextStep = () => {
    setError('');
    if (step === 1 && !selectedServiceId) {
      setError('Please select a service before proceeding.');
      return;
    }
    if (step === 2) {
      if (useNewAddress && !newAddress.streetLine.trim()) {
        setError('Please enter your street address.');
        return;
      }
      if (!useNewAddress && !selectedAddressId) {
        setError('Please select a saved address.');
        return;
      }
      if (!scheduledDate) {
        setError('Please select an appointment date.');
        return;
      }
    }
    if (step === 3 && !problemDescription.trim()) {
      setError('Please describe the issue or problem to be fixed.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmitBooking = async () => {
    setSubmitting(true);
    setError('');
    try {
      let finalAddressId = selectedAddressId;

      // If customer entered a new address, save it first
      if (useNewAddress) {
        const addrRes = await api.post('/customer/addresses', newAddress);
        finalAddressId = addrRes.data.data.id;
      }

      const bookingPayload = {
        serviceId: parseInt(selectedServiceId, 10),
        addressId: parseInt(finalAddressId, 10),
        scheduledDate,
        scheduledTimeSlot,
        problemDescription,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
      };

      const res = await api.post('/bookings', bookingPayload);
      const newBooking = res.data.data;
      navigate(`/customer/bookings/${newBooking.id}?created=true`);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const msg = err.response?.data?.message || 'Failed to submit booking. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          {/* Header */}
          <div className="text-center mb-4">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-semibold mb-2">
              Automated Dispatch &amp; Readiness
            </span>
            <h2 className="fw-bold">Book a Handyman Service</h2>
            <p className="text-muted">Instant quotation with automated spare-parts logistics pre-allocation</p>
          </div>

          {/* Stepper Wizard Progress */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-body p-3">
              <div className="d-flex justify-content-around text-center">
                <div className={`step-item ${step >= 1 ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${step >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>1</div>
                  <div className="small d-none d-sm-block">Select Service</div>
                </div>
                <div className={`step-item ${step >= 2 ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${step >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>2</div>
                  <div className="small d-none d-sm-block">Date &amp; Address</div>
                </div>
                <div className={`step-item ${step >= 3 ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${step >= 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>3</div>
                  <div className="small d-none d-sm-block">Issue Details</div>
                </div>
                <div className={`step-item ${step >= 4 ? 'text-primary fw-bold' : 'text-muted'}`}>
                  <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1 ${step >= 4 ? 'bg-primary text-white' : 'bg-light text-muted'}`} style={{ width: 32, height: 32 }}>4</div>
                  <div className="small d-none d-sm-block">Review &amp; Confirm</div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
              <AlertCircle size={18} />
              <div>{error}</div>
            </div>
          )}

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Wrench className="text-primary" /> Step 1: Choose Required Service
              </h4>
              <p className="text-muted small mb-4">Select the repair or installation task. Standard materials will be automatically coordinated.</p>

              <div className="row g-3">
                {services.map((svc) => (
                  <div key={svc.id} className="col-md-6">
                    <div
                      className={`card h-100 p-3 border-2 rounded-3 cursor-pointer transition-all ${
                        selectedServiceId.toString() === svc.id.toString()
                          ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                          : 'border-light bg-light hover-shadow'
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedServiceId(svc.id.toString())}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <span className="badge bg-secondary mb-2">{svc.categoryName}</span>
                        <h5 className="fw-bold text-primary mb-0">${parseFloat(svc.basePrice).toFixed(2)}</h5>
                      </div>
                      <h5 className="fw-bold mb-1">{svc.name}</h5>
                      <p className="text-muted small mb-2">{svc.description}</p>
                      <div className="d-flex align-items-center gap-2 text-muted small mt-auto">
                        <Clock size={14} /> Est. duration: {svc.estimatedDurationMinutes} mins
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" onClick={handleNextStep}>
                  Next: Schedule &amp; Address <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Date & Address */}
          {step === 2 && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Calendar className="text-primary" /> Step 2: Schedule &amp; Location
              </h4>

              <div className="row g-4">
                {/* Date & Time */}
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-3">Preferred Date &amp; Time Window</h6>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Service Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={scheduledDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Time Slot</label>
                    <div className="d-flex flex-column gap-2">
                      {timeSlots.map((slot) => (
                        <label
                          key={slot}
                          className={`btn text-start d-flex align-items-center gap-2 p-2 border ${
                            scheduledTimeSlot === slot ? 'btn-primary' : 'btn-light'
                          }`}
                        >
                          <input
                            type="radio"
                            name="timeSlot"
                            className="d-none"
                            checked={scheduledTimeSlot === slot}
                            onChange={() => setScheduledTimeSlot(slot)}
                          />
                          <Clock size={16} />
                          <span>{slot}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address Selection */}
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-3">Service Address</h6>

                  {addresses.length > 0 && (
                    <div className="mb-3">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="addressOption"
                          id="savedAddrRadio"
                          checked={!useNewAddress}
                          onChange={() => setUseNewAddress(false)}
                        />
                        <label className="form-check-label fw-semibold" htmlFor="savedAddrRadio">
                          Use Saved Address
                        </label>
                      </div>

                      {!useNewAddress && (
                        <select
                          className="form-select mb-3"
                          value={selectedAddressId}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                        >
                          {addresses.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.streetLine}, {a.city}, {a.postalCode} {a.isDefault ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="addressOption"
                      id="newAddrRadio"
                      checked={useNewAddress}
                      onChange={() => setUseNewAddress(true)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="newAddrRadio">
                      Enter New Address
                    </label>
                  </div>

                  {useNewAddress && (
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="mb-2">
                        <label className="form-label small fw-semibold">Street Address</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. 742 Evergreen Terrace"
                          value={newAddress.streetLine}
                          onChange={(e) => setNewAddress({ ...newAddress, streetLine: e.target.value })}
                          required
                        />
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small fw-semibold">City</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold">Postal Code</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2" onClick={handlePrevStep}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" onClick={handleNextStep}>
                  Next: Problem Details <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Issue Details */}
          {step === 3 && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <AlertCircle className="text-primary" /> Step 3: Describe the Problem
              </h4>

              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Detailed Problem Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Please describe symptoms, unusual noises, leakage spots, or when the issue first occurred..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  required
                ></textarea>
                <div className="form-text">
                  Providing clear details helps the system assign a technician with the exact skill sets and pre-pack the correct parts.
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Photo Evidence URL (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><ImageIcon size={18} /></span>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/photo-of-damage.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                  />
                </div>
                <div className="form-text">Paste an image link showing the damaged unit, fixture, or work area.</div>
              </div>

              {/* Standard bill of materials display */}
              {selectedService?.materialRequirements?.length > 0 && (
                <div className="card bg-light border-0 p-3 mb-4 rounded-3">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                    <Package size={18} className="text-primary" /> Standard Parts Pre-Allocated for this Service
                  </h6>
                  <p className="small text-muted mb-2">
                    Our logistics engine checks regional warehouses to automatically reserve these parts for the assigned technician:
                  </p>
                  <ul className="list-unstyled mb-0 small">
                    {selectedService.materialRequirements.map((mat, i) => (
                      <li key={i} className="d-flex justify-content-between py-1 border-bottom">
                        <span><strong>{mat.itemName}</strong> (Qty: {mat.quantityRequired})</span>
                        <span className="badge bg-white text-dark border">Estimated ${parseFloat(mat.estimatedCost).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="d-flex justify-content-between mt-4">
                <button className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2" onClick={handlePrevStep}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button className="btn btn-primary px-4 py-2 d-flex align-items-center gap-2" onClick={handleNextStep}>
                  Next: Review Quotation <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && (
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h4 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <CheckCircle2 className="text-success" /> Step 4: Review &amp; Confirm Booking
              </h4>
              <p className="text-muted small mb-4">Please review the indicative quotation and schedule details before dispatching.</p>

              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-primary mb-3">Service &amp; Schedule Details</h6>
                    <p className="mb-1"><strong>Service:</strong> {selectedService?.name}</p>
                    <p className="mb-1"><strong>Category:</strong> {selectedService?.categoryName}</p>
                    <p className="mb-1"><strong>Date:</strong> {scheduledDate}</p>
                    <p className="mb-1"><strong>Time Slot:</strong> {scheduledTimeSlot}</p>
                    <p className="mb-0"><strong>Est. Duration:</strong> {selectedService?.estimatedDurationMinutes} mins</p>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-primary mb-3">Indicative Cost Breakdown</h6>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Base Service Fee:</span>
                      <strong>${parseFloat(selectedService?.basePrice || 0).toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span>Est. Materials:</span>
                      <strong>$0.00 (Invoiced upon completion)</strong>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Service Tax (10%):</span>
                      <strong>${(parseFloat(selectedService?.basePrice || 0) * 0.1).toFixed(2)}</strong>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fs-5 fw-bold text-success">
                      <span>Estimated Total:</span>
                      <span>${(parseFloat(selectedService?.basePrice || 0) * 1.1).toFixed(2)}</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">
                      *Payment is due only after satisfactory completion and verification by customer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card bg-success bg-opacity-10 border-success border-opacity-25 p-3 rounded-3 mb-4">
                <div className="d-flex gap-3 align-items-center">
                  <ShieldCheck size={28} className="text-success" />
                  <div>
                    <h6 className="fw-bold text-success mb-0">Job Readiness Guarantee</h6>
                    <p className="small text-muted mb-0">
                      Upon submission, our logistics engine assigns an authorized technician in your sector and pre-locks standard spare parts from local distribution hubs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-outline-secondary px-4 py-2 d-flex align-items-center gap-2" onClick={handlePrevStep} disabled={submitting}>
                  <ArrowLeft size={18} /> Back
                </button>
                <button className="btn btn-success px-5 py-2 fw-semibold d-flex align-items-center gap-2" onClick={handleSubmitBooking} disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Confirm &amp; Dispatch Job
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
