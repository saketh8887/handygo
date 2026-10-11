import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserCheck, Wrench, Mail, Lock, Phone, MapPin, Briefcase, DollarSign, AlertCircle, CheckCircle2, Check } from 'lucide-react';

export default function Register() {
  const [role, setRole] = useState('ROLE_CUSTOMER');
  const [categories, setCategories] = useState([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState(['Plumbing Works']);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    // Customer address fields
    streetLine: '',
    city: 'Metropolis',
    state: 'State',
    postalCode: '10001',
    // Handyman fields
    experienceYears: 5,
    hourlyRate: 45.0,
    serviceAreas: 'Downtown, North Zone, Central Metro',
    bio: 'Professional certified technician with 5+ years of diagnostic and repair experience.',
  });

  useEffect(() => {
    api.get('/categories')
      .then((res) => setCategories(res.data?.data || []))
      .catch((err) => console.warn('Could not load categories for registration:', err));
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload = {
        role,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        ...(role === 'ROLE_CUSTOMER'
          ? {
              streetLine: formData.streetLine,
              city: formData.city,
              state: formData.state,
              postalCode: formData.postalCode,
            }
          : {
              experienceYears: parseInt(formData.experienceYears, 10),
              hourlyRate: parseFloat(formData.hourlyRate),
              serviceAreas: formData.serviceAreas,
              bio: formData.bio,
            }),
      };

      const user = await register(payload);
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (role === 'ROLE_CUSTOMER') {
          navigate('/customer/bookings');
        } else {
          navigate('/handyman');
        }
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Failed to create account. Please check your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
                  <UserPlus size={32} />
                </div>
                <h3 className="fw-bold">Create an Account</h3>
                <p className="text-muted">Join HandyConnect as a customer or service technician</p>

                {/* Role Switcher Pill */}
                <div className="d-flex justify-content-center mt-3">
                  <div className="btn-group p-1 bg-light rounded-pill border" role="group">
                    <button
                      type="button"
                      className={`btn rounded-pill px-4 py-2 ${
                        role === 'ROLE_CUSTOMER' ? 'btn-primary shadow-sm' : 'btn-light text-muted'
                      }`}
                      onClick={() => setRole('ROLE_CUSTOMER')}
                    >
                      <UserCheck size={18} className="me-2" />
                      I Need Services (Customer)
                    </button>
                    <button
                      type="button"
                      className={`btn rounded-pill px-4 py-2 ${
                        role === 'ROLE_HANDYMAN' ? 'btn-primary shadow-sm' : 'btn-light text-muted'
                      }`}
                      onClick={() => setRole('ROLE_HANDYMAN')}
                    >
                      <Wrench size={18} className="me-2" />
                      I Offer Services (Handyman)
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                  <AlertCircle size={18} />
                  <div>{error}</div>
                </div>
              )}

              {success && (
                <div className="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
                  <CheckCircle2 size={18} />
                  <div>{success}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      placeholder="Jane Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      placeholder="+1 (555) 234-5678"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>

                  {/* Customer Address section */}
                  {role === 'ROLE_CUSTOMER' && (
                    <>
                      <div className="col-12 mt-4">
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Primary Service Address</h6>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Street Address</label>
                        <input
                          type="text"
                          className="form-control"
                          name="streetLine"
                          placeholder="123 Oak Avenue, Apt 4B"
                          value={formData.streetLine}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label fw-semibold">City</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">State / Province</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label fw-semibold">Postal Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Handyman professional profile section */}
                  {role === 'ROLE_HANDYMAN' && (
                    <>
                      <div className="col-12 mt-4">
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">Professional Qualifications</h6>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Years of Experience</label>
                        <input
                          type="number"
                          className="form-control"
                          name="experienceYears"
                          min="0"
                          max="40"
                          value={formData.experienceYears}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Hourly Rate ($/hr)</label>
                        <input
                          type="number"
                          step="0.5"
                          className="form-control"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label fw-semibold">Trade Specializations &amp; Service Categories</label>
                        <div className="d-flex flex-wrap gap-2">
                          {categories.map((cat) => {
                            const isSelected = selectedCategoryNames.includes(cat.name);
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                className={`btn btn-sm px-3 py-1.5 rounded-pill transition-all ${
                                  isSelected ? 'btn-primary text-white shadow-sm' : 'btn-light text-secondary border'
                                }`}
                                onClick={() => {
                                  if (isSelected) {
                                    if (selectedCategoryNames.length > 1) {
                                      setSelectedCategoryNames(selectedCategoryNames.filter((n) => n !== cat.name));
                                    }
                                  } else {
                                    setSelectedCategoryNames([...selectedCategoryNames, cat.name]);
                                  }
                                }}
                              >
                                {isSelected && <Check size={13} className="me-1" />}
                                {cat.name}
                              </button>
                            );
                          })}
                        </div>
                        <div className="form-text small text-muted mt-1">
                          Select one or more specialized categories you are qualified to handle.
                        </div>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Service Coverage Areas</label>
                        <input
                          type="text"
                          className="form-control"
                          name="serviceAreas"
                          placeholder="e.g. North County, Metro, South Suburbs"
                          value={formData.serviceAreas}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Professional Bio & Certifications</label>
                        <textarea
                          className="form-control"
                          name="bio"
                          rows="3"
                          value={formData.bio}
                          onChange={handleChange}
                          required
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-2">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Registering Account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} /> Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                <p className="text-muted mb-0 small">
                  Already registered?{' '}
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
