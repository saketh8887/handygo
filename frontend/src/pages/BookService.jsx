import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Calendar, Clock, MapPin, Wrench, AlertCircle, CheckCircle2, 
  ArrowRight, ArrowLeft, ShieldCheck, DollarSign, Package, 
  Check, Sparkles, Building2, User, Users, Camera, Eye,
  Zap, Hammer, Wind, Paintbrush, Star, Award, X, Info
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import ProblemPhotoUploader from '../components/ProblemPhotoUploader';

export default function BookService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [categoryHandymen, setCategoryHandymen] = useState([]);
  const [loadingHandymen, setLoadingHandymen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form selections
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [technicianMode, setTechnicianMode] = useState('AUTO'); // 'AUTO' or 'SPECIFIC'
  const [selectedHandymanId, setSelectedHandymanId] = useState('');
  const [inspectingHandyman, setInspectingHandyman] = useState(null);

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
  
  // Real problem photo files
  const [problemPhotos, setProblemPhotos] = useState([]);

  // Post-submission confirmed booking
  const [confirmedBooking, setConfirmedBooking] = useState(null);

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
      const [catsRes, servicesRes, addrRes] = await Promise.all([
        api.get('/categories'),
        api.get('/services'),
        api.get('/customer/addresses'),
      ]);

      const cData = catsRes.data?.data || [];
      const sData = servicesRes.data?.data || [];
      const aData = addrRes.data?.data || [];

      setCategories(cData);
      setServices(sData);
      setAddresses(aData);

      if (aData.length > 0) {
        setSelectedAddressId(aData[0].id.toString());
      } else {
        setUseNewAddress(true);
      }

      // If preselectedServiceId is provided, resolve category and service
      if (preselectedServiceId) {
        const foundSvc = sData.find(s => s.id?.toString() === preselectedServiceId.toString());
        if (foundSvc) {
          setSelectedCategoryId(foundSvc.categoryId);
          setSelectedServiceId(foundSvc.id.toString());
          loadCategoryHandymen(foundSvc.categoryId);
        }
      } else if (cData.length > 0) {
        setSelectedCategoryId(cData[0].id);
        loadCategoryHandymen(cData[0].id);
        const firstCategoryServices = sData.filter(s => s.categoryId === cData[0].id);
        if (firstCategoryServices.length > 0) {
          setSelectedServiceId(firstCategoryServices[0].id.toString());
        }
      }
    } catch (err) {
      console.error('Failed to load booking dependencies:', err);
      setError('Failed to load services or addresses. Please ensure you are logged in.');
      showToast('Please log in as a customer to create a booking.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryHandymen = async (categoryId) => {
    try {
      setLoadingHandymen(true);
      const res = await api.get(`/categories/${categoryId}/handymen`);
      const hData = res.data?.data || [];
      setCategoryHandymen(hData);
    } catch (err) {
      console.warn('Failed to load handymen for category:', err);
      setCategoryHandymen([]);
    } finally {
      setLoadingHandymen(false);
    }
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategoryId(cat.id);
    loadCategoryHandymen(cat.id);
    const categoryServices = services.filter(s => s.categoryId === cat.id);
    if (categoryServices.length > 0) {
      setSelectedServiceId(categoryServices[0].id.toString());
    } else {
      setSelectedServiceId('');
    }
    // Reset specific technician selection
    setSelectedHandymanId('');
    setTechnicianMode('AUTO');
  };

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const filteredServices = services.filter(s => s.categoryId === selectedCategoryId);
  const selectedService = services.find((s) => s.id?.toString() === selectedServiceId?.toString());
  const selectedHandyman = categoryHandymen.find(h => h.id?.toString() === selectedHandymanId?.toString());
  
  const baseRate = selectedService ? (selectedService.indicativeBasePrice || selectedService.basePrice || 0) : 0;
  const materialsEstimate = selectedService?.standardMaterials?.reduce((acc, m) => {
    const unitP = m.sellingPrice || m.unitPrice || 0;
    return acc + (unitP * (m.standardQuantity || 1));
  }, 0) || 0;

  const renderCategoryIcon = (iconName, size = 22, className = '') => {
    switch ((iconName || '').toLowerCase()) {
      case 'zap':
      case 'electrical':
        return <Zap size={size} className={className} />;
      case 'hammer':
      case 'carpentry':
        return <Hammer size={size} className={className} />;
      case 'wind':
      case 'hvac':
      case 'appliance':
        return <Wind size={size} className={className} />;
      case 'paintbrush':
      case 'painting':
        return <Paintbrush size={size} className={className} />;
      case 'tool':
      case 'general':
      case 'wrench':
      case 'plumbing':
      default:
        return <Wrench size={size} className={className} />;
    }
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!selectedCategoryId) {
        setError('Please select a service category to proceed.');
        showToast('Please choose a service category.', 'error');
        return;
      }
    }
    if (step === 2) {
      if (!selectedServiceId) {
        setError('Please select a service.');
        showToast('Please choose a service.', 'error');
        return;
      }
      if (technicianMode === 'SPECIFIC' && !selectedHandymanId) {
        setError('Please choose a technician or switch to Automatic Smart Assignment.');
        showToast('Please select a technician or use auto-dispatch.', 'warning');
        return;
      }
    }
    if (step === 3) {
      if (useNewAddress && !newAddress.streetLine.trim()) {
        setError('Please enter your street address.');
        showToast('Please enter your street address.', 'error');
        return;
      }
      if (!useNewAddress && !selectedAddressId) {
        setError('Please select a saved address.');
        showToast('Please select a saved address.', 'error');
        return;
      }
      if (!scheduledDate) {
        setError('Please select an appointment date.');
        showToast('Please select an appointment date.', 'error');
        return;
      }
      if (!problemDescription.trim()) {
        setError('Please describe the issue or problem to be fixed.');
        showToast('Please describe the problem details.', 'error');
        return;
      }
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

      if (useNewAddress) {
        const addrRes = await api.post('/customer/addresses', newAddress);
        finalAddressId = addrRes.data.data.id;
      }

      // 1. Upload captured/selected photo attachments if any
      let uploadedAttachmentIds = [];
      let firstAttachmentUrl = null;

      if (problemPhotos.length > 0) {
        try {
          const formData = new FormData();
          problemPhotos.forEach((item) => {
            formData.append('files', item.file);
          });

          const uploadRes = await api.post('/attachments/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          const attachmentsData = uploadRes.data?.data || [];
          uploadedAttachmentIds = attachmentsData.map((a) => a.id);
          if (attachmentsData.length > 0) {
            firstAttachmentUrl = attachmentsData[0].url;
          }
        } catch (uploadErr) {
          console.error('Attachment upload failed:', uploadErr);
          const uploadMsg = uploadErr.response?.data?.message || 'Failed to upload photo attachments. Please verify image sizes.';
          setError(uploadMsg);
          showToast(uploadMsg, 'error');
          setSubmitting(false);
          return;
        }
      }

      // 2. Submit booking with attached photo IDs & optional selected technician
      const bookingPayload = {
        serviceId: parseInt(selectedServiceId, 10),
        addressId: parseInt(finalAddressId, 10),
        scheduledDate,
        scheduledTimeSlot,
        problemDescription,
        attachmentIds: uploadedAttachmentIds,
        photoUrl: firstAttachmentUrl,
        selectedHandymanId: technicianMode === 'SPECIFIC' && selectedHandymanId ? parseInt(selectedHandymanId, 10) : null
      };

      const res = await api.post('/bookings', bookingPayload);
      const newBooking = res.data.data;
      setConfirmedBooking(newBooking);
      setStep(5);
      showToast('Booking submitted successfully! Evaluating logistics readiness...', 'success');
    } catch (err) {
      console.error('Booking submission failed:', err);
      const msg = err.response?.data?.message || 'Failed to submit booking. Please try again.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4">
        <Skeleton width="180px" height="20px" className="mb-4" />
        <div className="hc-card p-4 mx-auto max-w-lg" style={{ maxWidth: 760 }}>
          <Skeleton height="350px" />
        </div>
      </div>
    );
  }

  const stepsMeta = [
    { num: 1, label: '1. Choose Category' },
    { num: 2, label: '2. Service & Specialist' },
    { num: 3, label: '3. Date & Issue' },
    { num: 4, label: '4. Price & Readiness' },
  ];

  return (
    <div className="container py-4">
      <Breadcrumb items={[{ label: 'Book a Service' }]} />

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          {/* Header */}
          <div className="text-center mb-4">
            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-semibold mb-2" style={{ fontSize: '0.75rem' }}>
              INTELLIGENT APPOINTMENT BOOKING
            </span>
            <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Schedule a Certified Repair
            </h2>
            <p className="text-secondary small mb-0">
              Specialized technician matching with verified credentials and automated spare-parts readiness
            </p>
          </div>

          {/* Stepper Progress Bar (Only show if not on confirmation screen) */}
          {step <= 4 && (
            <div className="hc-card p-3 p-md-4 mb-4 border-0 shadow-sm">
              <div className="d-flex justify-content-between position-relative">
                {stepsMeta.map((s) => {
                  const isPassed = step > s.num;
                  const isCurrent = step === s.num;
                  return (
                    <div key={s.num} className="text-center flex-grow-1" style={{ zIndex: 1 }}>
                      <div
                        className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-1.5 transition-all ${
                          isPassed
                            ? 'bg-success text-white'
                            : isCurrent
                            ? 'bg-primary text-white shadow'
                            : 'bg-light text-secondary border'
                        }`}
                        style={{ 
                          width: 36, 
                          height: 36,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(37,99,235,0.18)' : 'none',
                          fontSize: '0.88rem',
                          fontWeight: 600
                        }}
                      >
                        {isPassed ? <Check size={17} /> : s.num}
                      </div>
                      <div className={`small fw-medium ${isCurrent ? 'text-primary' : isPassed ? 'text-dark' : 'text-secondary'} d-none d-sm-block`}>
                        {s.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 rounded-3 border-0 shadow-sm" role="alert">
              <AlertCircle size={18} />
              <div className="small fw-medium">{error}</div>
            </div>
          )}

          {/* STEP 1: CATEGORY SELECTION */}
          {step === 1 && (
            <div className="hc-card p-4 p-md-5 border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <Wrench className="text-primary" size={20} /> Select Specialized Trade Category
                </h5>
                <span className="badge bg-light text-secondary border px-2.5 py-1 small">
                  {categories.length} Specialized Teams
                </span>
              </div>
              <p className="text-secondary small mb-4">
                Each category is handled exclusively by verified trade professionals with certified skills.
              </p>

              <div className="row g-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <div key={cat.id} className="col-md-6 col-lg-4">
                      <div
                        className={`hc-card h-100 p-3.5 border transition-all position-relative ${
                          isSelected
                            ? 'border-primary bg-primary bg-opacity-5 shadow'
                            : 'bg-white hover-shadow'
                        }`}
                        style={{ 
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--hc-primary)' : 'var(--hc-border)',
                          transform: isSelected ? 'translateY(-2px)' : 'none'
                        }}
                        onClick={() => handleSelectCategory(cat)}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2.5">
                          <div className={`p-2 rounded-3 ${isSelected ? 'bg-primary text-white' : 'bg-light text-primary border'}`}>
                            {renderCategoryIcon(cat.iconName, 22)}
                          </div>
                          <span className={`badge ${isSelected ? 'bg-primary text-white' : 'bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25'}`} style={{ fontSize: '0.72rem' }}>
                            <Users size={11} className="me-1" />
                            {cat.qualifiedHandymenCount || 0} Specialists
                          </span>
                        </div>

                        <h6 className="fw-bold text-dark mb-1">{cat.name}</h6>
                        <p className="text-secondary small mb-2.5 line-clamp-2" style={{ fontSize: '0.8rem', minHeight: 38 }}>
                          {cat.description}
                        </p>

                        {/* Example services tags */}
                        {cat.exampleServices && cat.exampleServices.length > 0 && (
                          <div className="mb-2">
                            <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                              POPULAR SERVICES:
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                              {cat.exampleServices.slice(0, 2).map((ex, i) => (
                                <span key={i} className="badge bg-white text-dark border px-2 py-0.5 fw-normal" style={{ fontSize: '0.7rem' }}>
                                  {ex}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center pt-2 mt-auto border-top text-secondary small" style={{ fontSize: '0.75rem' }}>
                          <span>{cat.servicesCount || 0} Standard Services</span>
                          {isSelected && <span className="text-primary fw-bold d-flex align-items-center gap-1"><Check size={14} /> Selected</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                <button 
                  className="btn btn-primary px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2 fw-medium shadow-sm"
                  onClick={handleNextStep}
                >
                  <span>Continue: Choose Service &amp; Technician</span>
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SERVICE & TECHNICIAN SELECTION */}
          {step === 2 && (
            <div className="hc-card p-4 p-md-5 border-0 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <Sparkles className="text-primary" size={20} /> Choose Service &amp; Technician Mode
                </h5>
                <span className="badge bg-light text-primary border px-2.5 py-1 small">
                  Category: {selectedCategory?.name}
                </span>
              </div>
              <p className="text-secondary small mb-4">
                Select your specific repair requirement, then pick between AI-powered smart dispatch or choose your preferred qualified specialist.
              </p>

              {/* Sub-section A: Services under Category */}
              <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-1.5">
                <Wrench size={16} className="text-primary" /> 1. Select Repair Job:
              </h6>
              <div className="row g-3 mb-4">
                {filteredServices.length === 0 ? (
                  <div className="col-12 text-center py-4 bg-light rounded-3 border">
                    <p className="text-secondary small mb-0">No active services currently listed under this category.</p>
                  </div>
                ) : (
                  filteredServices.map((svc) => {
                    const isSelected = selectedServiceId?.toString() === svc.id?.toString();
                    const rate = svc.indicativeBasePrice || svc.basePrice || 0;
                    return (
                      <div key={svc.id} className="col-md-6">
                        <div
                          className={`hc-card h-100 p-3 border transition-all ${
                            isSelected
                              ? 'border-primary bg-primary bg-opacity-5 shadow-sm'
                              : 'bg-white'
                          }`}
                          style={{ 
                            cursor: 'pointer',
                            borderColor: isSelected ? 'var(--hc-primary)' : 'var(--hc-border)'
                          }}
                          onClick={() => setSelectedServiceId(svc.id.toString())}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-1.5">
                            <span className="badge bg-light text-primary border" style={{ fontSize: '0.72rem' }}>
                              {svc.code || 'SVC'}
                            </span>
                            <span className="fw-bold text-primary fs-6">
                              ${parseFloat(rate).toFixed(2)}
                            </span>
                          </div>
                          <h6 className="fw-bold text-dark mb-1">{svc.name}</h6>
                          <p className="text-secondary small mb-2 line-clamp-2" style={{ fontSize: '0.8rem' }}>
                            {svc.description}
                          </p>
                          <div className="d-flex align-items-center justify-content-between text-secondary small pt-1 border-top" style={{ fontSize: '0.75rem' }}>
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={13} className="text-primary" /> Est: {svc.estimatedDurationMinutes} mins
                            </span>
                            {isSelected && <span className="text-primary fw-bold"><Check size={14} className="me-1" />Selected</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Sub-section B: Technician Selection Mode */}
              <h6 className="fw-bold text-dark mb-2.5 d-flex align-items-center gap-1.5">
                <Users size={16} className="text-primary" /> 2. Technician Assignment Mode:
              </h6>
              
              <div className="row g-3 mb-4">
                {/* Option 1: Automatic Intelligent Dispatch */}
                <div className="col-md-6">
                  <div
                    className={`hc-card h-100 p-3.5 border transition-all ${
                      technicianMode === 'AUTO'
                        ? 'border-primary bg-primary bg-opacity-5 shadow-sm'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer', borderColor: technicianMode === 'AUTO' ? 'var(--hc-primary)' : 'var(--hc-border)' }}
                    onClick={() => {
                      setTechnicianMode('AUTO');
                      setSelectedHandymanId('');
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-primary text-white px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                        ⚡ RECOMMENDED
                      </span>
                      <input 
                        type="radio" 
                        name="techMode" 
                        className="form-check-input"
                        checked={technicianMode === 'AUTO'}
                        onChange={() => {
                          setTechnicianMode('AUTO');
                          setSelectedHandymanId('');
                        }}
                      />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">⚡ Automatically Assign Best Professional</h6>
                    <p className="text-secondary small mb-2" style={{ fontSize: '0.8rem' }}>
                      System scores verified skills, live proximity, queue capacity, and ratings to instantly dispatch the highest-rated available specialist.
                    </p>
                    <div className="d-flex align-items-center gap-2 text-success small fw-medium" style={{ fontSize: '0.75rem' }}>
                      <ShieldCheck size={14} /> Fastest response time &amp; 100% skill compatibility guaranteed
                    </div>
                  </div>
                </div>

                {/* Option 2: Choose Specific Specialist */}
                <div className="col-md-6">
                  <div
                    className={`hc-card h-100 p-3.5 border transition-all ${
                      technicianMode === 'SPECIFIC'
                        ? 'border-primary bg-primary bg-opacity-5 shadow-sm'
                        : 'bg-white'
                    }`}
                    style={{ cursor: 'pointer', borderColor: technicianMode === 'SPECIFIC' ? 'var(--hc-primary)' : 'var(--hc-border)' }}
                    onClick={() => setTechnicianMode('SPECIFIC')}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="badge bg-light text-secondary border px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                        DIRECT SELECTION
                      </span>
                      <input 
                        type="radio" 
                        name="techMode" 
                        className="form-check-input"
                        checked={technicianMode === 'SPECIFIC'}
                        onChange={() => setTechnicianMode('SPECIFIC')}
                      />
                    </div>
                    <h6 className="fw-bold text-dark mb-1">Pick Specific Qualified Specialist</h6>
                    <p className="text-secondary small mb-2" style={{ fontSize: '0.8rem' }}>
                      Browse verified technicians dedicated to {selectedCategory?.name}. Review customer ratings, hourly rates, and qualifications.
                    </p>
                    <div className="d-flex align-items-center gap-2 text-primary small fw-medium" style={{ fontSize: '0.75rem' }}>
                      <User size={14} /> {categoryHandymen.length} qualified specialists available in this trade
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-section C: List of Specific Qualified Handymen (when SPECIFIC mode is chosen) */}
              {technicianMode === 'SPECIFIC' && (
                <div className="p-3.5 bg-light rounded-3 border mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                      <ShieldCheck size={16} className="text-success" /> Qualified Specialists for {selectedCategory?.name}:
                    </h6>
                    <span className="badge bg-white text-secondary border small">
                      {categoryHandymen.length} Found
                    </span>
                  </div>

                  {loadingHandymen ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary mb-2" role="status" />
                      <div className="text-secondary small">Filtering qualified trade specialists...</div>
                    </div>
                  ) : categoryHandymen.length === 0 ? (
                    <div className="text-center py-4 bg-white rounded-3 border">
                      <AlertCircle size={24} className="text-warning mb-2" />
                      <div className="fw-semibold text-dark small">No verified technicians currently available for direct selection.</div>
                      <div className="text-secondary small mt-1">Please select "⚡ Automatically Assign Best Professional" so our dispatch center can route your request.</div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {categoryHandymen.map((hm) => {
                        const isChosen = selectedHandymanId?.toString() === hm.id?.toString();
                        return (
                          <div key={hm.id} className="col-md-6">
                            <div
                              className={`p-3 rounded-3 border transition-all bg-white ${
                                isChosen ? 'border-primary shadow-sm bg-primary bg-opacity-5' : ''
                              }`}
                              style={{ 
                                cursor: 'pointer',
                                borderColor: isChosen ? 'var(--hc-primary)' : 'var(--hc-border)'
                              }}
                              onClick={() => setSelectedHandymanId(hm.id.toString())}
                            >
                              <div className="d-flex align-items-start gap-3">
                                {hm.profilePhotoUrl ? (
                                  <img 
                                    src={hm.profilePhotoUrl} 
                                    alt={hm.fullName} 
                                    className="rounded-circle border object-fit-cover" 
                                    style={{ width: 48, height: 48 }} 
                                  />
                                ) : (
                                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-6" style={{ width: 48, height: 48 }}>
                                    {hm.fullName?.charAt(0) || 'H'}
                                  </div>
                                )}

                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <h6 className="fw-bold text-dark mb-0 small">{hm.fullName}</h6>
                                    <span className="fw-bold text-primary small">${parseFloat(hm.hourlyRate || 45).toFixed(2)}/hr</span>
                                  </div>

                                  <div className="d-flex flex-wrap align-items-center gap-1.5 mt-1">
                                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25" style={{ fontSize: '0.68rem' }}>
                                      <ShieldCheck size={11} className="me-1" />
                                      {hm.verificationStatus || 'VERIFIED'}
                                    </span>
                                    {hm.primaryTeamName && (
                                      <span className="badge bg-light text-secondary border" style={{ fontSize: '0.68rem' }}>
                                        {hm.primaryTeamName}
                                      </span>
                                    )}
                                  </div>

                                  <div className="d-flex align-items-center gap-3 text-secondary mt-2 small" style={{ fontSize: '0.74rem' }}>
                                    <span className="d-flex align-items-center gap-1 text-warning">
                                      <Star size={13} fill="currentColor" /> {parseFloat(hm.ratingAvg || 5.0).toFixed(1)} ({hm.ratingCount || 10})
                                    </span>
                                    <span>• {hm.experienceYears || 5} yrs exp</span>
                                    <span>• {hm.completedJobCount || 0} jobs done</span>
                                  </div>

                                  {/* Service areas */}
                                  {hm.serviceAreas && (
                                    <div className="text-secondary small mt-1 text-truncate" style={{ fontSize: '0.72rem' }}>
                                      <MapPin size={11} className="text-primary me-1" /> {hm.serviceAreas}
                                    </div>
                                  )}

                                  <div className="d-flex justify-content-between align-items-center mt-2.5 pt-2 border-top">
                                    <button
                                      type="button"
                                      className="btn btn-link p-0 text-primary small text-decoration-none d-flex align-items-center gap-1"
                                      style={{ fontSize: '0.74rem' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setInspectingHandyman(hm);
                                      }}
                                    >
                                      <Eye size={13} /> View Full Profile
                                    </button>
                                    <span className={`badge ${isChosen ? 'bg-primary text-white' : 'bg-light text-secondary border'}`} style={{ fontSize: '0.7rem' }}>
                                      {isChosen ? 'Selected' : 'Select'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <button className="btn btn-outline-secondary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={handlePrevStep}>
                  <ArrowLeft size={16} /> Back to Categories
                </button>
                <button className="btn btn-primary px-4 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm" onClick={handleNextStep}>
                  <span>Continue: Appointment Details</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DATE, ADDRESS & ISSUE DETAILS */}
          {step === 3 && (
            <div className="hc-card p-4 p-md-5 border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <Calendar className="text-primary" size={20} /> Appointment Window, Address &amp; Issue Details
              </h5>
              <p className="text-secondary small mb-4">
                Provide timing preferences, premises address, and document the repair symptoms with clear photos.
              </p>

              <div className="row g-4 mb-4">
                {/* Date & Time */}
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-3">Preferred Date &amp; Arrival Window</h6>
                  
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Appointment Date</label>
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
                    <label className="form-label small fw-semibold text-dark">Select Arrival Time Slot</label>
                    <div className="d-flex flex-column gap-2">
                      {timeSlots.map((slot) => (
                        <label
                          key={slot}
                          className={`btn text-start d-flex align-items-center justify-content-between p-2.5 border rounded-3 transition-all ${
                            scheduledTimeSlot === slot 
                              ? 'border-primary bg-primary bg-opacity-10 text-primary fw-medium' 
                              : 'bg-white text-dark'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="d-flex align-items-center gap-2 small">
                            <Clock size={15} />
                            <span>{slot}</span>
                          </div>
                          <input
                            type="radio"
                            name="timeSlot"
                            className="form-check-input mt-0"
                            checked={scheduledTimeSlot === slot}
                            onChange={() => setScheduledTimeSlot(slot)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address Selection */}
                <div className="col-md-6">
                  <h6 className="fw-bold text-dark mb-3">Service Location</h6>

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
                        <label className="form-check-label fw-semibold small text-dark" htmlFor="savedAddrRadio">
                          Use Saved Address
                        </label>
                      </div>

                      {!useNewAddress && (
                        <select
                          className="form-select form-select-sm mb-3"
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
                    <label className="form-check-label fw-semibold small text-dark" htmlFor="newAddrRadio">
                      Enter New Address
                    </label>
                  </div>

                  {useNewAddress && (
                    <div className="p-3 bg-light rounded-3 border">
                      <div className="mb-2">
                        <label className="form-label small fw-semibold text-dark">Street Address</label>
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
                          <label className="form-label small fw-semibold text-dark">City</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small fw-semibold text-dark">Postal Code</label>
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

              {/* Problem Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold small text-dark">
                  Detailed Symptoms &amp; Notes <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Describe when the issue began, leaks, strange sounds, electrical tripping, dimensions, or specific unit models..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  required
                ></textarea>
                <div className="form-text small text-secondary mt-1">
                  Accurate details enable our algorithms to verify technician skills and reserve required spare parts.
                </div>
              </div>

              {/* Camera Capture / Photo Uploader */}
              <div className="mb-4 p-3 bg-light rounded-3 border">
                <ProblemPhotoUploader
                  photos={problemPhotos}
                  onChange={setProblemPhotos}
                  maxPhotos={5}
                />
              </div>

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <button className="btn btn-outline-secondary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={handlePrevStep}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button className="btn btn-primary px-4 py-2 rounded-3 d-inline-flex align-items-center gap-1.5 fw-medium shadow-sm" onClick={handleNextStep}>
                  <span>Continue: Quotation &amp; Readiness</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: COST ESTIMATION & SPARE-PARTS READINESS REVIEW */}
          {step === 4 && (
            <div className="hc-card p-4 p-md-5 border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <CheckCircle2 className="text-success" size={20} /> Review Cost Estimate &amp; Supply Chain Readiness
              </h5>
              <p className="text-secondary small mb-4">
                Review your upfront estimate and autonomous spare-parts readiness check before confirming.
              </p>

              <div className="row g-4 mb-4">
                {/* Appointment & Specialist Summary */}
                <div className="col-md-6">
                  <div className="p-3.5 bg-light rounded-3 h-100 border">
                    <h6 className="fw-bold text-primary mb-2.5 small d-flex align-items-center gap-1.5">
                      <Calendar size={15} /> Appointment &amp; Technician Summary
                    </h6>
                    <div className="d-flex flex-column gap-1.5 text-secondary small">
                      <div><strong className="text-dark">Category:</strong> {selectedCategory?.name}</div>
                      <div><strong className="text-dark">Service:</strong> {selectedService?.name}</div>
                      <div><strong className="text-dark">Date:</strong> {scheduledDate}</div>
                      <div><strong className="text-dark">Window:</strong> {scheduledTimeSlot}</div>
                      <div><strong className="text-dark">Duration:</strong> {selectedService?.estimatedDurationMinutes} mins</div>
                      <div className="mt-1 pt-1 border-top">
                        <strong className="text-dark">Technician:</strong>{' '}
                        {technicianMode === 'SPECIFIC' && selectedHandyman ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 ms-1">
                            {selectedHandyman.fullName} (${parseFloat(selectedHandyman.hourlyRate || 45).toFixed(2)}/hr)
                          </span>
                        ) : (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 ms-1">
                            ⚡ AI Autonomous Dispatch (Best Qualified Match)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attached Problem Photos Review */}
                    <div className="mt-3 pt-2.5 border-top">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="fw-semibold text-dark small d-flex align-items-center gap-1">
                          <Camera size={14} className="text-primary" /> Photos Attached:
                        </span>
                        <span className="badge bg-white text-dark border small">
                          {problemPhotos.length} of 5 photos
                        </span>
                      </div>

                      {problemPhotos.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1.5 mt-1">
                          {problemPhotos.map((p) => (
                            <img
                              key={p.id}
                              src={p.previewUrl}
                              alt={p.name}
                              className="rounded-2 border"
                              style={{ width: 44, height: 44, objectFit: 'cover' }}
                              title={p.name}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-secondary small" style={{ fontSize: '0.74rem' }}>
                          No photos attached (optional)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cost Estimation */}
                <div className="col-md-6">
                  <div className="p-3.5 bg-light rounded-3 h-100 border">
                    <h6 className="fw-bold text-primary mb-2.5 small d-flex align-items-center gap-1.5">
                      <DollarSign size={15} /> Transparent Cost Estimation
                    </h6>
                    <div className="d-flex justify-content-between text-secondary small mb-1">
                      <span>Service Base Labor Rate:</span>
                      <strong className="text-dark">${parseFloat(baseRate).toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-secondary small mb-1">
                      <span>Estimated Standard Materials:</span>
                      <strong className="text-dark">${parseFloat(materialsEstimate).toFixed(2)}</strong>
                    </div>
                    <div className="d-flex justify-content-between text-secondary small mb-2">
                      <span>Service Tax (10%):</span>
                      <strong className="text-dark">${((parseFloat(baseRate) + parseFloat(materialsEstimate)) * 0.1).toFixed(2)}</strong>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold text-dark small">Estimated Total:</span>
                      <span className="fw-bold fs-5 text-primary">
                        ${((parseFloat(baseRate) + parseFloat(materialsEstimate)) * 1.1).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-muted mt-2" style={{ fontSize: '0.72rem' }}>
                      *Exact invoice settled upon completion based on verified labor and consumed materials.
                    </div>
                  </div>
                </div>
              </div>

              {/* Spare Parts & Supply Chain Readiness View */}
              <div className="p-3.5 bg-white rounded-3 border mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-bold text-dark small d-flex align-items-center gap-1.5">
                    <Package size={16} className="text-primary" /> Spare Parts &amp; Warehouse Inventory Readiness
                  </span>
                  {selectedService?.standardMaterials && selectedService.standardMaterials.length > 0 ? (
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small">
                      Standard Materials Mapped
                    </span>
                  ) : (
                    <span className="badge bg-warning bg-opacity-15 text-dark border border-warning small">
                      <AlertCircle size={11} className="me-1 text-warning" /> Inspection Required
                    </span>
                  )}
                </div>

                {selectedService?.standardMaterials && selectedService.standardMaterials.length > 0 ? (
                  <div>
                    <p className="text-secondary small mb-2" style={{ fontSize: '0.78rem' }}>
                      HandyConnect automatically verifies warehouse inventory across local hubs and reserves parts upon booking:
                    </p>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered align-middle mb-0" style={{ fontSize: '0.78rem' }}>
                        <thead className="table-light">
                          <tr>
                            <th>Part / Component</th>
                            <th>Qty</th>
                            <th>Est. Unit Price</th>
                            <th>Allocation Strategy</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedService.standardMaterials.map((mat, i) => (
                            <tr key={i}>
                              <td className="fw-medium text-dark">{mat.itemName || 'Standard Part'}</td>
                              <td>{mat.standardQuantity} {mat.unitOfMeasure}</td>
                              <td>${parseFloat(mat.sellingPrice || 15).toFixed(2)}</td>
                              <td>
                                <span className="badge bg-light text-primary border">
                                  Local Hub Reservation
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 bg-warning bg-opacity-10 rounded-2 border border-warning border-opacity-25 text-dark small" style={{ fontSize: '0.78rem' }}>
                    <strong>Diagnostic Job Note:</strong> This service has no preset standard bill of materials. The assigned technician will perform an on-site diagnostic inspection and order specific components from local inventory as needed.
                  </div>
                )}
              </div>

              {/* Job Readiness Guarantee Banner */}
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 mb-4 d-flex align-items-center gap-3">
                <ShieldCheck size={24} className="text-success flex-shrink-0" />
                <div>
                  <div className="fw-bold text-success small">HandyConnect Verified Dispatch Guarantee</div>
                  <div className="text-secondary small" style={{ fontSize: '0.76rem' }}>
                    Upon confirmation, our autonomous dispatch engine verifies technician qualification, locks the schedule window, and notifies the technician with your problem symptoms and photo documentation.
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                <button className="btn btn-outline-secondary px-3 py-2 rounded-3 d-inline-flex align-items-center gap-1.5" onClick={handlePrevStep} disabled={submitting}>
                  <ArrowLeft size={16} /> Back
                </button>
                <button 
                  className="btn btn-success px-4 py-2.5 rounded-3 fw-medium d-inline-flex align-items-center gap-2 shadow-sm"
                  onClick={handleSubmitBooking} 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                      <span>{problemPhotos.length > 0 ? 'Uploading Photos & Dispatching...' : 'Confirming & Dispatching...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      <span>Confirm &amp; Dispatch Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: BOOKING CONFIRMATION SCREEN */}
          {step === 5 && confirmedBooking && (
            <div className="hc-card p-4 p-md-5 border-0 shadow-sm text-center">
              <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                <CheckCircle2 size={44} />
              </div>
              <h3 className="fw-bold text-dark mb-1">Booking Confirmed!</h3>
              <p className="text-secondary small mb-4">
                Your appointment has been registered in HandyConnect's intelligent dispatch ledger.
              </p>

              <div className="p-4 bg-light rounded-3 border text-start mx-auto mb-4" style={{ maxWidth: 640 }}>
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <div>
                    <span className="text-muted small">Booking Reference</span>
                    <h5 className="fw-bold text-primary mb-0">{confirmedBooking.bookingReference}</h5>
                  </div>
                  <span className={`badge px-3 py-1.5 rounded-pill fw-semibold ${
                    confirmedBooking.status === 'ASSIGNED' ? 'bg-primary text-white' : 'bg-warning text-dark'
                  }`}>
                    {confirmedBooking.status || 'PENDING DISPATCH'}
                  </span>
                </div>

                <div className="row g-3 text-secondary small">
                  <div className="col-sm-6">
                    <strong className="text-dark">Service:</strong> {confirmedBooking.serviceName || selectedService?.name}
                  </div>
                  <div className="col-sm-6">
                    <strong className="text-dark">Category:</strong> {selectedCategory?.name}
                  </div>
                  <div className="col-sm-6">
                    <strong className="text-dark">Date:</strong> {confirmedBooking.scheduledDate || scheduledDate}
                  </div>
                  <div className="col-sm-6">
                    <strong className="text-dark">Time Slot:</strong> {confirmedBooking.scheduledTimeSlot || scheduledTimeSlot}
                  </div>
                  <div className="col-12">
                    <strong className="text-dark">Service Address:</strong> {confirmedBooking.addressText || (addresses.find(a => a.id.toString() === selectedAddressId)?.streetLine || newAddress.streetLine)}
                  </div>
                </div>

                {/* Assigned Specialist Details (if assigned) */}
                {confirmedBooking.assignedHandymanName ? (
                  <div className="mt-3 pt-3 border-top d-flex align-items-center gap-3 bg-white p-3 rounded-3 border">
                    <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-5 flex-shrink-0" style={{ width: 44, height: 44 }}>
                      {confirmedBooking.assignedHandymanName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-muted small" style={{ fontSize: '0.72rem' }}>ASSIGNED SPECIALIST</span>
                      <h6 className="fw-bold text-dark mb-0">{confirmedBooking.assignedHandymanName}</h6>
                      <div className="text-secondary small" style={{ fontSize: '0.75rem' }}>
                        {confirmedBooking.assignedHandymanPhone ? `Phone: ${confirmedBooking.assignedHandymanPhone}` : 'Contact verified in dispatch center'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-top text-secondary small">
                    <div className="d-flex align-items-center gap-2 text-primary fw-medium">
                      <Sparkles size={16} /> Autonomous dispatch queue review underway
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      A certified technician meeting mandatory trade skills will be confirmed shortly.
                    </div>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-center gap-3">
                <Link to={`/bookings/${confirmedBooking.id}`} className="btn btn-primary px-4 py-2 rounded-3 fw-medium d-inline-flex align-items-center gap-1.5 shadow-sm">
                  <Eye size={16} /> View Booking Details
                </Link>
                <Link to="/customer/bookings" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-medium">
                  My Bookings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Technician Profile Modal */}
      {inspectingHandyman && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-bottom pb-3">
                <div className="d-flex align-items-center gap-2.5">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: 42, height: 42 }}>
                    {inspectingHandyman.fullName?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold text-dark mb-0">{inspectingHandyman.fullName}</h6>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 small" style={{ fontSize: '0.68rem' }}>
                      <ShieldCheck size={11} className="me-1" />
                      {inspectingHandyman.verificationStatus || 'VERIFIED'}
                    </span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setInspectingHandyman(null)}></button>
              </div>

              <div className="modal-body p-4">
                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 border mb-3">
                  <div>
                    <span className="text-muted small">Hourly Rate</span>
                    <h5 className="fw-bold text-primary mb-0">${parseFloat(inspectingHandyman.hourlyRate || 45).toFixed(2)}/hr</h5>
                  </div>
                  <div className="text-end">
                    <span className="text-muted small">Customer Rating</span>
                    <div className="fw-bold text-warning d-flex align-items-center gap-1 justify-content-end">
                      <Star size={15} fill="currentColor" /> {parseFloat(inspectingHandyman.ratingAvg || 5.0).toFixed(1)} / 5.0
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold text-dark small mb-1">About &amp; Background</h6>
                  <p className="text-secondary small mb-0">
                    {inspectingHandyman.bio || 'Experienced trade specialist providing certified home and commercial repairs.'}
                  </p>
                </div>

                <div className="mb-3">
                  <h6 className="fw-semibold text-dark small mb-1">Coverage &amp; Experience</h6>
                  <div className="text-secondary small">
                    <div><strong>Experience:</strong> {inspectingHandyman.experienceYears || 5} years in trade</div>
                    <div><strong>Service Areas:</strong> {inspectingHandyman.serviceAreas || 'Metro service zone'}</div>
                    <div><strong>Department:</strong> {inspectingHandyman.primaryTeamName || selectedCategory?.name}</div>
                  </div>
                </div>

                {inspectingHandyman.skills && inspectingHandyman.skills.length > 0 && (
                  <div>
                    <h6 className="fw-semibold text-dark small mb-1.5">Verified Trade Skills</h6>
                    <div className="d-flex flex-wrap gap-1.5">
                      {inspectingHandyman.skills.map((s, idx) => (
                        <span key={idx} className="badge bg-light text-dark border px-2 py-1 small fw-normal">
                          <Check size={11} className="text-success me-1" />
                          {s.skillName} ({s.proficiencyLevel || 'Expert'})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-top pt-2">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setInspectingHandyman(null)}>
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary btn-sm px-3"
                  onClick={() => {
                    setSelectedHandymanId(inspectingHandyman.id.toString());
                    setTechnicianMode('SPECIFIC');
                    setInspectingHandyman(null);
                  }}
                >
                  Select this Specialist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
