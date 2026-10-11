import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, ShieldAlert, Wrench, Phone, Mail, CheckCircle2, 
  XCircle, AlertCircle, Eye, DollarSign, Star, Search, Filter, 
  Award, Briefcase, MapPin, Clock, Check, X, User, Power, Plus
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';

export default function AdminHandymen() {
  const { showToast } = useToast();
  const [handymen, setHandymen] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedHandyman, setSelectedHandyman] = useState(null);

  // Assign Skill Modal
  const [showAssignSkillModal, setShowAssignSkillModal] = useState(false);
  const [skillFormData, setSkillFormData] = useState({
    categoryId: '',
    skillId: '',
    skillName: '',
    proficiencyLevel: 'EXPERT',
    yearsExperience: 5,
    certificationDetails: 'Verified by Admin',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  useEffect(() => {
    fetchHandymenAndSpecializations();
  }, []);

  const fetchHandymenAndSpecializations = async () => {
    try {
      setLoading(true);
      const [hmRes, specRes, catRes, skillsRes] = await Promise.allSettled([
        api.get('/admin/handymen'),
        api.get('/specializations'),
        api.get('/categories'),
        api.get('/skills'),
      ]);

      if (hmRes.status === 'fulfilled') {
        setHandymen(hmRes.value.data.data || []);
      }
      if (specRes.status === 'fulfilled') {
        setSpecializations(specRes.value.data.data || []);
      }
      if (catRes.status === 'fulfilled') {
        const cData = catRes.value.data.data || [];
        setCategories(cData);
        if (cData.length > 0 && !skillFormData.categoryId) {
          setSkillFormData(prev => ({ ...prev, categoryId: cData[0].id.toString() }));
        }
      }
      if (skillsRes.status === 'fulfilled') {
        setAllSkills(skillsRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load workforce:', err);
      setError('Could not retrieve technician list.');
      showToast('Could not retrieve technician list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActiveStatus = async (id, currentStatus) => {
    try {
      const isCurrentlyActive = currentStatus !== 'INACTIVE';
      const newStatus = !isCurrentlyActive;
      await api.patch(`/admin/handymen/${id}/status`, { isActive: newStatus });
      showToast(`Technician account set to ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`, 'success');
      fetchHandymenAndSpecializations();
      if (selectedHandyman && selectedHandyman.id === id) {
        setSelectedHandyman((prev) => ({
          ...prev,
          activeStatus: newStatus ? 'ACTIVE' : 'INACTIVE',
        }));
      }
    } catch (err) {
      console.error('Failed to update technician status:', err);
      showToast('Failed to update account active status.', 'error');
    }
  };

  const handleAssignSkill = async (e) => {
    e.preventDefault();
    if (!selectedHandyman) return;
    try {
      await api.post(`/admin/handymen/${selectedHandyman.id}/skills`, {
        categoryId: skillFormData.categoryId ? parseInt(skillFormData.categoryId, 10) : null,
        skillId: skillFormData.skillId ? parseInt(skillFormData.skillId, 10) : null,
        skillName: skillFormData.skillName,
        proficiencyLevel: skillFormData.proficiencyLevel,
        yearsExperience: parseInt(skillFormData.yearsExperience, 10),
        certificationDetails: skillFormData.certificationDetails,
      });
      showToast('Verified trade skill assigned successfully!', 'success');
      setShowAssignSkillModal(false);
      fetchHandymenAndSpecializations();
      const hmRes = await api.get('/admin/handymen');
      const updatedList = hmRes.data.data || [];
      const fresh = updatedList.find((h) => h.id === selectedHandyman.id);
      if (fresh) setSelectedHandyman(fresh);
    } catch (err) {
      console.error('Failed to assign skill:', err);
      showToast('Failed to assign skill.', 'error');
    }
  };

  const handleVerify = async (id, approved) => {
    try {
      setError('');
      await api.post(`/admin/handymen/${id}/verify`, { approved });
      const msg = `Technician status updated to ${approved ? 'VERIFIED' : 'REJECTED'}.`;
      setSuccess(msg);
      showToast(msg, 'success');
      fetchHandymenAndSpecializations();
      if (selectedHandyman && selectedHandyman.id === id) {
        setSelectedHandyman((prev) => ({
          ...prev,
          verificationStatus: approved ? 'VERIFIED' : 'REJECTED',
          isVerified: approved,
        }));
      }
    } catch (err) {
      console.error('Verification failed:', err);
      const msg = err.response?.data?.message || 'Failed to update verification status.';
      setError(msg);
      showToast(msg, 'error');
    }
  };

  const handleVerifyCertification = async (certId, approved) => {
    try {
      await api.post(`/admin/certifications/${certId}/verify`, {
        approved,
        notes: approved ? 'Credential authenticated by compliance admin' : 'Rejected during audit',
      });
      showToast(`Certification ${approved ? 'approved' : 'rejected'}.`, 'success');
      // Refresh selected handyman's details
      const hmRes = await api.get('/admin/handymen');
      const updatedList = hmRes.data.data || [];
      setHandymen(updatedList);
      if (selectedHandyman) {
        const freshHm = updatedList.find(h => h.id === selectedHandyman.id);
        if (freshHm) setSelectedHandyman(freshHm);
      }
    } catch (err) {
      console.error('Cert verification failed:', err);
      showToast('Failed to verify certification.', 'error');
    }
  };

  const filteredHandymen = handymen.filter((hm) => {
    const matchesSearch =
      searchQuery === '' ||
      hm.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hm.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hm.serviceAreas?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hm.specializations?.some(s => s.specializationName?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      hm.skills?.some(s => s.skillName?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpec =
      specializationFilter === 'ALL' ||
      hm.specializations?.some(s => s.specializationName?.toLowerCase() === specializationFilter.toLowerCase() || s.specializationCode?.toLowerCase() === specializationFilter.toLowerCase());

    const matchesVerif =
      verificationFilter === 'ALL' ||
      (verificationFilter === 'VERIFIED' && (hm.isVerified || hm.verificationStatus === 'VERIFIED')) ||
      (verificationFilter === 'PENDING' && (hm.verificationStatus === 'PENDING' || (!hm.isVerified && hm.verificationStatus !== 'REJECTED'))) ||
      (verificationFilter === 'REJECTED' && hm.verificationStatus === 'REJECTED');

    const matchesAvail =
      availabilityFilter === 'ALL' ||
      hm.availabilityStatus === availabilityFilter;

    return matchesSearch && matchesSpec && matchesVerif && matchesAvail;
  });

  return (
    <div className="container py-4">
      <Breadcrumb
        items={[
          { label: 'Admin Command', path: '/admin' },
          { label: 'Workforce Compliance & Specializations' }
        ]}
      />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary bg-opacity-10 text-primary px-2.5 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.75rem' }}>
              WORKFORCE MANAGEMENT
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>
            Technician Directory &amp; Trade Specializations
          </h2>
          <p className="text-secondary small mb-0 mt-0.5">
            Audit licensed technicians, verify trade certifications, inspect workload limits, and manage assignments
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <CheckCircle2 size={16} />
          <div>{success}</div>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4 small rounded-3" role="alert">
          <AlertCircle size={16} />
          <div>{error}</div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="hc-card p-3 mb-4 border-0 shadow-sm">
        <div className="row g-2.5 align-items-center">
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <Search size={15} className="text-secondary position-absolute" style={{ left: 12, top: 10 }} />
              <input
                type="text"
                className="form-control form-control-sm ps-4 pe-3 py-2 rounded-3 border"
                placeholder="Search technician, skill, zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="col-6 col-md-3">
            <select
              className="form-select form-select-sm py-2 rounded-3"
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
            >
              <option value="ALL">All Specializations</option>
              {specializations.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm py-2 rounded-3"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm py-2 rounded-3"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="ALL">All Availabilities</option>
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="ON_BREAK">On Break</option>
              <option value="OFF_DUTY">Off Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Technicians List Table */}
      {loading ? (
        <div className="hc-card p-4">
          <Skeleton height="40px" className="mb-3" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" className="mb-2" />
          <Skeleton height="55px" />
        </div>
      ) : filteredHandymen.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No technicians match criteria"
          description="Try adjusting your specialization or verification status filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSpecializationFilter('ALL');
            setVerificationFilter('ALL');
            setAvailabilityFilter('ALL');
          }}
        />
      ) : (
        <div className="hc-card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small">
                <tr>
                  <th className="ps-4">Technician</th>
                  <th>Primary &amp; Trade Specializations</th>
                  <th>Hourly Rate &amp; Exp</th>
                  <th>Active Workload</th>
                  <th>Availability</th>
                  <th>Compliance Status</th>
                  <th>Account Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredHandymen.map((hm) => {
                  const primarySpec = hm.specializations?.find(s => s.isPrimary)?.specializationName || hm.specializations?.[0]?.specializationName;
                  const otherSpecs = hm.specializations?.filter(s => !s.isPrimary) || [];
                  const isVerified = hm.isVerified || hm.verificationStatus === 'VERIFIED';
                  const isPending = hm.verificationStatus === 'PENDING' || (!isVerified && hm.verificationStatus !== 'REJECTED');

                  return (
                    <tr key={hm.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center gap-2.5">
                          <div
                            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm flex-shrink-0"
                            style={{ width: 40, height: 40, fontSize: '0.85rem' }}
                          >
                            {hm.profilePhotoUrl ? (
                              <img src={hm.profilePhotoUrl} alt={hm.fullName} className="w-100 h-100 rounded-circle object-fit-cover" />
                            ) : (
                              hm.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{hm.fullName}</div>
                            <div className="text-secondary" style={{ fontSize: '0.72rem' }}>
                              ★ {parseFloat(hm.ratingAvg || 5.0).toFixed(1)} rating • {hm.completedJobCount || 0} completed jobs
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {hm.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        {primarySpec ? (
                          <div className="d-flex flex-wrap gap-1 align-items-center">
                            <span className="badge bg-primary text-white" style={{ fontSize: '0.72rem' }}>
                              {primarySpec} (Primary)
                            </span>
                            {otherSpecs.map((s, idx) => (
                              <span key={idx} className="badge bg-light text-secondary border" style={{ fontSize: '0.68rem' }}>
                                {s.specializationName}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">General Tradesperson</span>
                        )}
                      </td>

                      <td>
                        <div className="fw-semibold text-success">${parseFloat(hm.hourlyRate || 40).toFixed(2)}/hr</div>
                        <div className="text-secondary" style={{ fontSize: '0.72rem' }}>{hm.experienceYears || 0} yrs in trade</div>
                      </td>

                      <td>
                        <div style={{ maxWidth: 120 }}>
                          <div className="d-flex justify-content-between text-secondary" style={{ fontSize: '0.7rem' }}>
                            <span>Active Jobs</span>
                            <span className="fw-bold text-dark">0 / {hm.maxActiveWorkload || 3}</span>
                          </div>
                          <div className="progress mt-1" style={{ height: 6 }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: '0%' }}
                            ></div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`badge ${
                            hm.availabilityStatus === 'AVAILABLE'
                              ? 'bg-success bg-opacity-10 text-success border border-success'
                              : hm.availabilityStatus === 'BUSY'
                              ? 'bg-warning bg-opacity-10 text-warning border border-warning'
                              : 'bg-secondary bg-opacity-10 text-secondary border'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {hm.availabilityStatus || 'AVAILABLE'}
                        </span>
                      </td>

                      <td>
                        {isVerified ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <ShieldCheck size={11} /> Verified Pro
                          </span>
                        ) : isPending ? (
                          <span className="badge bg-warning bg-opacity-15 text-warning border border-warning d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <AlertCircle size={11} /> Pending Review
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                            <XCircle size={11} /> Rejected
                          </span>
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm px-2 py-0.5 rounded-pill d-inline-flex align-items-center gap-1 ${
                            hm.activeStatus !== 'INACTIVE'
                              ? 'btn-outline-success'
                              : 'btn-outline-secondary'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                          title={hm.activeStatus !== 'INACTIVE' ? 'Click to Deactivate' : 'Click to Activate'}
                          onClick={() => handleToggleActiveStatus(hm.id, hm.activeStatus)}
                        >
                          <Power size={11} />
                          {hm.activeStatus !== 'INACTIVE' ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="text-end pe-4">
                        <div className="d-flex justify-content-end gap-1.5">
                          <button
                            className="btn btn-outline-secondary btn-sm px-2 py-1 rounded-3 d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => setSelectedHandyman(hm)}
                          >
                            <Eye size={13} /> Details
                          </button>
                          {isVerified ? (
                            <button
                              className="btn btn-outline-danger btn-sm px-2 py-1 rounded-3"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleVerify(hm.id, false)}
                              title="Revoke Verification"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              className="btn btn-success btn-sm px-2 py-1 rounded-3"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleVerify(hm.id, true)}
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technician Profile Details Modal */}
      {selectedHandyman && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-bottom px-4 pt-4 pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
                    style={{ width: 48, height: 48, fontSize: '1rem' }}
                  >
                    {selectedHandyman.profilePhotoUrl ? (
                      <img src={selectedHandyman.profilePhotoUrl} alt={selectedHandyman.fullName} className="w-100 h-100 rounded-circle object-fit-cover" />
                    ) : (
                      selectedHandyman.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">{selectedHandyman.fullName}</h5>
                    <div className="text-secondary small">
                      {selectedHandyman.email} • {selectedHandyman.phone || 'Phone not set'}
                    </div>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setSelectedHandyman(null)}></button>
              </div>

              <div className="modal-body p-4 overflow-auto">
                {/* Stats strip */}
                <div className="row g-2 mb-4">
                  <div className="col-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="text-secondary small">Hourly Rate</div>
                      <div className="fs-5 fw-bold text-success">${parseFloat(selectedHandyman.hourlyRate || 40).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="text-secondary small">Experience</div>
                      <div className="fs-5 fw-bold text-dark">{selectedHandyman.experienceYears || 0} yrs</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="text-secondary small">Rating</div>
                      <div className="fs-5 fw-bold text-warning">★ {parseFloat(selectedHandyman.ratingAvg || 5.0).toFixed(1)}</div>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="p-3 bg-light rounded-3 text-center border">
                      <div className="text-secondary small">Max Workload</div>
                      <div className="fs-5 fw-bold text-primary">{selectedHandyman.maxActiveWorkload || 3} jobs</div>
                    </div>
                  </div>
                </div>

                {/* Specializations & Bio */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">Verified Specializations</h6>
                  {selectedHandyman.specializations && selectedHandyman.specializations.length > 0 ? (
                    <div className="d-flex flex-wrap gap-2">
                      {selectedHandyman.specializations.map((spec) => (
                        <span
                          key={spec.id}
                          className={`badge ${spec.isPrimary ? 'bg-primary text-white' : 'bg-light text-dark border'} px-3 py-1.5 rounded-pill`}
                        >
                          {spec.specializationName} {spec.isPrimary && '★ (Primary)'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small">No specializations registered.</p>
                  )}
                </div>

                {/* Registered Trade Skills */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-dark mb-0">Individual Trade Skills &amp; Proficiency</h6>
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm px-2 py-0.5 rounded-2 d-inline-flex align-items-center gap-1"
                      style={{ fontSize: '0.74rem' }}
                      onClick={() => setShowAssignSkillModal(true)}
                    >
                      <Plus size={12} /> Assign Verified Skill
                    </button>
                  </div>
                  {selectedHandyman.skills && selectedHandyman.skills.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {selectedHandyman.skills.map((s) => (
                        <div key={s.id} className="p-2.5 border rounded-3 d-flex justify-content-between align-items-center small">
                          <div>
                            <span className="fw-bold text-dark">{s.skillName}</span>
                            <span className="badge bg-secondary ms-2" style={{ fontSize: '0.68rem' }}>{s.proficiencyLevel}</span>
                            {s.isVerified && (
                              <span className="badge bg-success bg-opacity-15 text-success border border-success ms-1.5" style={{ fontSize: '0.68rem' }}>
                                <Check size={10} className="inline" /> Skill Verified
                              </span>
                            )}
                          </div>
                          <span className="text-muted">{s.yearsExperience || 1} yrs exp</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small">No individual trade skills recorded.</p>
                  )}
                </div>

                {/* Certifications & Trade Licenses */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                    <Award size={16} className="text-primary" />
                    Professional Licenses &amp; Trade Certifications
                  </h6>
                  {selectedHandyman.certifications && selectedHandyman.certifications.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {selectedHandyman.certifications.map((c) => (
                        <div key={c.id} className="p-3 border rounded-3 d-flex justify-content-between align-items-center small bg-white">
                          <div>
                            <div className="fw-bold text-dark">{c.certificationName}</div>
                            <div className="text-secondary" style={{ fontSize: '0.74rem' }}>
                              License: <span className="font-monospace text-dark">{c.licenseNumber || 'N/A'}</span> • Issued by: {c.issuingAuthority || 'Trade Board'}
                            </div>
                            {c.expiresAt && (
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                Expires: {c.expiresAt}
                              </div>
                            )}
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            {c.isVerified ? (
                              <span className="badge bg-success bg-opacity-15 text-success border border-success px-2 py-1">
                                <Check size={11} className="inline me-0.5" /> Authenticated
                              </span>
                            ) : (
                              <div className="d-flex gap-1">
                                <button
                                  className="btn btn-sm btn-success px-2 py-0.5"
                                  style={{ fontSize: '0.72rem' }}
                                  onClick={() => handleVerifyCertification(c.id, true)}
                                >
                                  Authenticate
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger px-2 py-0.5"
                                  style={{ fontSize: '0.72rem' }}
                                  onClick={() => handleVerifyCertification(c.id, false)}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted small">No formal trade licenses logged.</p>
                  )}
                </div>

                {/* Service Coverage Areas */}
                <div>
                  <h6 className="fw-bold text-dark mb-2">Authorized Coverage Zones</h6>
                  <div className="p-2.5 bg-light rounded-3 text-secondary small">
                    <MapPin size={13} className="text-primary me-1 inline" />
                    {selectedHandyman.serviceAreas || 'Central Metro District'}
                  </div>
                </div>
              </div>

              <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedHandyman(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Skill Modal */}
      {showAssignSkillModal && selectedHandyman && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15,23,42,0.7)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <form onSubmit={handleAssignSkill}>
                <div className="modal-header border-bottom px-4 py-3">
                  <h6 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                    <Award size={18} className="text-primary" /> Assign Verified Skill to {selectedHandyman.fullName}
                  </h6>
                  <button type="button" className="btn-close" onClick={() => setShowAssignSkillModal(false)}></button>
                </div>

                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Trade Category *</label>
                    <select
                      className="form-select form-select-sm"
                      value={skillFormData.categoryId}
                      onChange={(e) => setSkillFormData({ ...skillFormData, categoryId: e.target.value })}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Skill Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Copper Pipe Brazing & Soldering"
                      value={skillFormData.skillName}
                      onChange={(e) => setSkillFormData({ ...skillFormData, skillName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Proficiency Level</label>
                      <select
                        className="form-select form-select-sm"
                        value={skillFormData.proficiencyLevel}
                        onChange={(e) => setSkillFormData({ ...skillFormData, proficiencyLevel: e.target.value })}
                      >
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                        <option value="EXPERT">Expert</option>
                        <option value="MASTER">Master</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-dark">Years of Experience</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={skillFormData.yearsExperience}
                        onChange={(e) => setSkillFormData({ ...skillFormData, yearsExperience: e.target.value })}
                        min="1"
                        max="40"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-dark">Verification &amp; Certification Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Master Plumber License #MP-8823"
                      value={skillFormData.certificationDetails}
                      onChange={(e) => setSkillFormData({ ...skillFormData, certificationDetails: e.target.value })}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top px-4 py-3 bg-light rounded-bottom-4">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowAssignSkillModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm px-3 fw-medium">
                    Save Verified Skill
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
